import json
from os import stat
import random

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

import frontend.models
from frontend.models import Rooms, Users


class lobbyConsumer(AsyncWebsocketConsumer):
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
            print("Leader joined")
            self.leader = True
            print(self.leader)
            roomName = await self.createNewRoom()
            print("New Room Created 2")
            await self.save(roomName)
            print("Saved Room")
            self.nickname = self.text_data_json["nickname"]
            print(self.nickname)
            user = await self.createNewUser()
            print("New User Created")
            await self.save(user)
            print("Saved User")
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "updatePlayers",
                    "content": "playerJoined",
                    "player": self.nickname
                }
            )
            print("Sent message to group")
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
        elif contentType == "checkboxChange":
            if self.leader:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "checkboxChange",
                        "checkbox": self.text_data_json["checkbox"]
                    }
                )
            await self.changeCheckbox(self.text_data_json["checkbox"])
        elif contentType == "ImNewPlayer":
            attributes = await self.getRoomAttributes()
            await self.send(text_data=json.dumps({
                "ContentType": "updateAttributes",
                "reverse": attributes["reverse"],
                "speed": str(attributes["speed"]),
                "rounds": str(attributes["rounds"])
            }))
        elif contentType == "selectRoundsChange":
            if self.leader:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "selectRoundsChange",
                        "rounds": self.text_data_json["rounds"]
                    }
                )
                await self.changeRounds(self.text_data_json["rounds"])
        elif contentType == "speedChange":
            if self.leader:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "speedChange",
                        "speed": self.text_data_json["speed"]
                    }
                )
                await self.changeSpeed(self.text_data_json["speed"])
        elif contentType == "startGame":
            if self.leader:
                print("startGame")
                await self.changeGameState()
                print("Changed state")
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "startGame"
                    }
                )

    @database_sync_to_async
    def changeGameState(self):
        room = Rooms.objects.get(room_id=self.room_name)
        room.state = "game"
        room.save()
        print("Game Started", room.room_id, room.state)

    async def startGame(self, event):
        print("Start game 2")
        id = await self.assignRandomID()
        print("Assigned id")
        await self.send(text_data=json.dumps({
            "ContentType": "startGameUser",
            "id": str(id)
        }))

    @database_sync_to_async
    def assignRandomID(self):
        user = Users.objects.get(nickname=self.nickname, room_id=self.room_name)
        user.uniqueID = self.makeRandomID(16)
        user.save()
        return user.uniqueID

    def makeRandomID(self, length):
        result = ""
        characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        charactersLength = len(characters)
        for x in range(length):
            result += characters[random.randrange(0, charactersLength)]
        return str(result)
        

    async def speedChange(self, event):
        await self.send(text_data=json.dumps({
            "ContentType": "speedChange",
            "speed": event["speed"]
        }))

    @database_sync_to_async
    def changeSpeed(self, speed):
        room = Rooms.objects.get(room_id=self.room_name)
        room.speed = speed
        room.save()

    async def selectRoundsChange(self, event):
        await self.send(text_data=json.dumps({
            "ContentType": "selectRoundsChange",
            "rounds": event["rounds"]
        }))

    @database_sync_to_async
    def changeRounds(self, rounds):
        room = Rooms.objects.get(room_id=self.room_name)
        room.rounds = rounds
        room.save()

    @database_sync_to_async
    def getRoomAttributes(self):
        room = Rooms.objects.get(room_id=self.room_name)
        return {
            "reverse": room.reverse,
            "speed": room.speed,
            "rounds": room.rounds
        }

    @database_sync_to_async
    def changeCheckbox(self, reverse):
        room = Rooms.objects.get(room_id=self.room_name)
        room.reverse = reverse
        room.save()

    async def checkboxChange(self, event):
        await self.send(text_data=json.dumps({
            "ContentType": "checkboxChange"
        }))

    async def chatMessage(self, event):
        await self.send(text_data=json.dumps({
            "ContentType": "chatMessage",
            "message": event["message"],
            "player": event["player"]
        }))

    async def playerLeave(self):
        state = await self.getState()
        print(state)
        if state == "lobby":
            print(state, "Lobby Game")
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

    @database_sync_to_async
    def getState(self):
        return Rooms.objects.get(room_id=self.room_name).state

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
                         leader=True,
                         uniqueID="",
                         online=False)
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
                     leader=False,
                     uniqueID="",
                     online=False)

    @database_sync_to_async
    def createNewRoom(self):
        print("New Room Created")
        return Rooms(room_id=self.room_name, rounds=5, reverse=True, speed=1, state="lobby")

    @database_sync_to_async
    def save(self, entity):
        return entity.save()
    

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
        if contentType == "checkID":
            IDCheck = await self.checkID()
            if IDCheck["idExists"]:
                playerinfo = IDCheck["playerInfo"][0]
                self.nickname = playerinfo["nickname"]
                await self.updateOnline(True)
                await self.send(text_data=json.dumps({
                    "ContentType": "Accepted",
                    "idExists": True,
                    "nickname": self.nickname,
                }))
            else:
                await self.send(text_data=json.dumps({
                    "ContentType": "Denied"
                }))
        elif contentType == "getOnlineStatusGroup":
            await self.sendOnlineStatus()
        

    async def updatePlayerStatus(self, event):
        await self.send(text_data=json.dumps({
            "ContentType": "updatePlayerStatus",
            "userList": event["userList"]
        }))

    async def playerLeave(self):
        await self.updateOnline(False)
        await self.sendOnlineStatus()

    async def sendOnlineStatus(self):
        userList = await self.getOnlineStatusGroup()
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "updatePlayerStatus",
                "userList": userList
            }
        )
    @database_sync_to_async
    def getOnlineStatusGroup(self):
        #get online status of all players in current room
        userList = Users.objects.all().filter(room_id=self.room_name).values("nickname", "online", "uniqueID")
        print(userList)
        return list(userList)

    @database_sync_to_async
    def updateOnline(self, status):
        user = Users.objects.get(nickname=self.nickname, room_id=self.room_name)
        user.online = status
        user.save()

    @database_sync_to_async
    def checkID(self):
        idExists = True #Users.objects.filter(room_id=self.room_name, uniqueID=self.text_data_json["id"]).exists()
        playerInfo = Users.objects.filter(room_id=self.room_name, uniqueID=self.text_data_json["id"]).values()
        return {
            "idExists": idExists,
            "playerInfo": list(playerInfo)
        }
    


