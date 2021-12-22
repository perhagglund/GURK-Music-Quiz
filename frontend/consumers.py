import json
from os import stat
import random
from collections import Counter
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
            if not await self.roomAlreadyExists():
                self.leader = True
                roomName = await self.createNewRoom()
                await self.save(roomName)
                self.nickname = self.text_data_json["nickname"]
                state = await self.getState()
                user = await self.createNewUser(state)
                if user:
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
            state = await self.getState()
            user = await self.createNewUser(state)
            if user:
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
                await self.changeGameState()
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "startGame"
                    }
                )
        elif contentType == "checkID":
            id = self.text_data_json["id"]
            if await self.getState() == "game":
                idExists = await self.checkID(id)
                await self.send(text_data=json.dumps({
                    "ContentType": "checkIDResponse",
                    "id": id,
                    "idExists": idExists,
                    "gameState": True
                }))
            else:
                await self.send(text_data=json.dumps({
                    "ContentType": "checkIDResponse",
                    "id": id,
                    "gameState": False
                }))

    @database_sync_to_async
    def checkID(self, id):
        return frontend.models.Users.objects.filter(uniqueID=id, room_id=self.room_name).exists()

    @database_sync_to_async
    def changeGameState(self):
        room = Rooms.objects.get(room_id=self.room_name)
        room.state = "game"
        room.save()

    async def startGame(self, event):
        id = await self.assignRandomID()
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
        if state == "lobby":
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
    def createNewUser(self, state):
        if state == "lobby":
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
                userList = list(Users.objects.all().filter(room_id=self.room_name).values("nickname"))
                self.nickname = self.howManyUserWithSameName(userList, self.nickname, 0)
                return self.createNormalPlayer()

    def howManyUserWithSameName(self, userList, name, count):
        checkName = name + f"({count})"
        if count == 0:
            checkName = name
        if userList:
            for i in userList:
                if i["nickname"] == checkName:
                    count += 1
                    return self.howManyUserWithSameName(userList, name, count)
            return checkName
        return name

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
        return Rooms(room_id=self.room_name, rounds=5, reverse=True, speed=1, state="lobby")

    @database_sync_to_async
    def roomAlreadyExists(self):
        return Rooms.objects.filter(room_id=self.room_name).exists()

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
        elif contentType == "getMaxLength":
            maxLength = await self.getMaxSongs()
            await self.send(text_data=json.dumps({
                "ContentType": "maxSongsLength",
                "maxLength": maxLength,
            }))

    @database_sync_to_async
    def getMaxSongs(self):
        return list(Rooms.objects.all().filter(room_id=self.room_name).values("rounds"))[0]["rounds"]

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
        return list(userList)

    @database_sync_to_async
    def updateOnline(self, status):
        user = Users.objects.get(nickname=self.nickname, room_id=self.room_name)
        user.online = status
        user.save()

    @database_sync_to_async
    def checkID(self):
        idExists = Users.objects.filter(room_id=self.room_name, uniqueID=self.text_data_json["id"]).exists()
        playerInfo = Users.objects.filter(room_id=self.room_name, uniqueID=self.text_data_json["id"]).values()
        return {
            "idExists": idExists,
            "playerInfo": list(playerInfo)
        }
    


