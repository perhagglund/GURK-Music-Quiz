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
        if self.leader:
            await self.playerLeave()
        elif not self.leader:
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
        elif contentType == "PlayerJoined":
            self.nickname = self.text_data_json["nickname"]
            user = await self.createNewUser()
            await self.save(user)

    @database_sync_to_async
    def playerLeave(self):
        user = Users.objects.get(nickname=self.nickname, room_id=self.room_name)
        user.delete()
        if self.leader:
            self.leaderLeftInRoom()

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

    #
    # def deleteRoom(self):
    #    room = Rooms.objects.get(room_id=self.room_name)
    #    room.delete()
    #    print("deleted", self.room_name)
    #
    # def leaderLeftInRoom(self):
    #    try:
    #        userList = Users.objects.all().filter(room_id=self.room_name)
    #    except frontend.models.Users.DoesNotExist as e:
    #        print("Hello")
    #        self.deleteRoom()
    #        print("Room deleted", self.room_name)
    #    else:
    #        self.assignNewLeader()
    #
    #
    # def assignNewLeader(self):
    #    user = Users.objects.all().filter(room_id=self.room_name).first()
    #    user.leader = True
    #    user.save()
    #
    @database_sync_to_async
    def save(self, entity):
        return entity.save()
