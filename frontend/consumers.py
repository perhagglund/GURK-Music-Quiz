import json
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

import frontend.models
from frontend.models import Rooms, Users


class gameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name
        # Join room group
        self.nickname = ""
        self.leader = False
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        await self.playerLeave()

    # Receive message from WebSocket
    async def receive(self, text_data):
        self.text_data_json = json.loads(text_data)
        contentType = self.text_data_json["ContentType"]
        if contentType == "LeaderJoined":
            self.leader = True
            roomName = await self.createNewRoom()
            await self.save(roomName)
            self.nickname = self.text_data_json["nickname"]
            user = await self.createNewUser()
            await self.save(user)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "updatePlayers",
                    "content": "playerJoined",
                    "player": self.nickname
                }
            )
        elif contentType == "PlayerJoined":
            self.nickname = self.text_data_json["nickname"]
            user = await self.createNewUser()
            await self.save(user)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "updatePlayers",
                    "content": "playerJoined",
                    "player": self.nickname
                }
            )
        elif contentType == "chatMessage":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chatMessage",
                    "message": self.text_data_json["message"],
                    "player": self.nickname
                }
            )

    async def chatMessage(self, event):
        print(event["player"], "has sent message", event["message"])
        await self.send(text_data=json.dumps({
            "ContentType": "chatMessage",
            "message": event["message"],
            "player": event["player"]
        }))

    async def playerLeave(self):
        await self.deletePlayer()
        if self.leader:
            await self.leaderLeftInRoom()
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "updatePlayers",
                "content": "playerLeave",
                "player": self.nickname
            }
        )

    async def updatePlayers(self, event):
        await self.send(text_data=json.dumps({
            "ContentType": "updatePlayers",
            "content": event["content"],
            "player": event["player"]
        }))

    @database_sync_to_async
    def deletePlayer(self):
        user = Users.objects.get(nickname=self.nickname, room_id=self.room_name)
        user.delete()

    @database_sync_to_async
    def deleteRoom(self):
        room = Rooms.objects.get(room_id=self.room_name)
        room.delete()

    async def assignNewLeader(self):
        user = await self.DBAssignNewLeader()
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "NewLeader",
                "room_id": self.room_name,
                "NewLeader": user.nickname
            }
        )

    async def NewLeader(self, event):
        if event["NewLeader"] == self.nickname:
            self.leader = True
            await self.send(text_data=json.dumps({
                "ContentType": "NewLeader",
                "room_id": event["room_id"],
                "NewLeader": self.nickname
            }))

    @database_sync_to_async
    def DBAssignNewLeader(self):
        user = Users.objects.all().filter(room_id=self.room_name).first()
        user.leader = True
        user.save()
        return user

    async def leaderLeftInRoom(self):
        userList = await self.assignUserList()
        if len(userList) == 0:
            await self.deleteRoom()
        else:
            await self.assignNewLeader()

    @database_sync_to_async
    def assignUserList(self):
        userList = Users.objects.all().filter(room_id=self.room_name).values("nickname")
        return list(userList)

    @database_sync_to_async
    def createNewUser(self):
        if self.leader:
            return Users(room_id=self.room_name,
                         nickname=self.text_data_json["nickname"],
                         color=self.text_data_json["color"],
                         eyes=self.text_data_json["eyes"],
                         mouth=self.text_data_json["mouth"],
                         leader=True)
        else:
            userList = Users.objects.all().filter(room_id=self.room_name).values("nickname")
            userListStr = " ".join([str(x["nickname"]) for x in userList])
            if self.nickname in userListStr:
                count = userListStr.count(self.nickname)
                self.nickname += f"({count})"
            return self.createNormalPlayer()

    def createNormalPlayer(self):
        return Users(room_id=self.room_name,
                     nickname=self.nickname,
                     color=self.text_data_json["color"],
                     eyes=self.text_data_json["eyes"],
                     mouth=self.text_data_json["mouth"],
                     leader=False)

    @database_sync_to_async
    def createNewRoom(self):
        return Rooms(room_id=self.room_name)

    @database_sync_to_async
    def save(self, entity):
        return entity.save()
