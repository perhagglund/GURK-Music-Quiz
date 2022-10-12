from audioop import reverse
from enum import unique
from hashlib import new
from itertools import chain, count
import json
from logging import root
import random
from time import time
from turtle import delay, down, speed, up
from channels.db import DatabaseSyncToAsync, database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
import frontend.models
from frontend.models import Rooms, Users, Songs, Chat
import frontend.tasks as tasks
import time
import re

class lobbyConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'lobby_%s' % self.room_name
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
        options = {
            "LeaderJoined": self.leaderJoined,
            "PlayerJoined": self.playerJoined,
            "chatMessage": self.chatMessage,
            "checkboxChange": self.checkboxChange,
            "ImNewPlayer": self.ImNewPlayer,
            "selectRoundsChange": self.selectRoundsChange,
            "speedChange": self.speedChange,
            "startGame": self.startGame,
            "checkID": self.checkID
        }
        if contentType in options:
            await options[contentType]()
        else:
            print("ContentType not found lobbyConsumer")

    async def leaderJoined(self):
        if not await self.roomAlreadyExists():
            self.leader = True
            roomName = await self.createNewRoom()
            await self.save(roomName)
            self.nickname = self.text_data_json["nickname"]
            state = await self.getState()
            user = await self.createNewUser(state)
            if user:
                await self.save(user)
                newChat = await self.createNewChatMessage("Has joined the server", "joinMessage")
                await self.save(newChat)
                chat = await self.getRoomChat()
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "updatePlayers",
                        "content": "playerJoined",
                        "player": self.nickname,
                        "chat": chat
                    }
                )

    async def playerJoined(self):
        self.nickname = self.text_data_json["nickname"]
        state = await self.getState()
        user = await self.createNewUser(state)
        if user:
            await self.save(user)
            newChat = await self.createNewChatMessage("Has joined the server", "joinMessage")
            await self.save(newChat)
            chat = await self.getRoomChat()
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "updatePlayers",
                    "content": "playerJoined",
                    "player": self.nickname,
                    "chat": chat
                }
            )

    async def chatMessage(self):
        newChat = await self.createNewChatMessage(self.text_data_json["message"], "chatMessage")
        await self.save(newChat)
        chat = await self.getRoomChat()
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chatMessageGroup",
                "chat": chat
            }
        )        

    async def checkboxChange(self):
        if self.leader:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "checkboxChangeGroup",
                    "checkbox": self.text_data_json["checkbox"]
                }
            )
            await self.changeCheckbox(self.text_data_json["checkbox"])

    async def ImNewPlayer(self):
        attributes = await self.getRoomAttributes()
        await self.send(text_data=json.dumps({
            "ContentType": "updateAttributes",
            "reverse": attributes["reverse"],
            "speed": str(attributes["speed"]),
            "rounds": str(attributes["rounds"])
        }))

    async def selectRoundsChange(self):
        if self.leader:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "selectRoundsChangeGroup",
                    "rounds": self.text_data_json["rounds"]
                }
            )
            await self.changeRounds(self.text_data_json["rounds"])

    async def speedChange(self):
        if self.leader:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "speedChangeGroup",
                    "speed": self.text_data_json["speed"]
                }
            )
            await self.changeSpeed(self.text_data_json["speed"])

    async def startGame(self):
        if self.leader:
            await self.changeGameState()
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "startUserGame"
                }
            )

    async def checkID(self):
        id = self.text_data_json["id"]
        gameState = await self.getState()
        if gameState == "songSelection" or gameState == "game":
            idExists = await self.checkIfValidID(id)
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

    # End of receive message from WebSocket

    async def startUserGame(self, event):
        id = await self.assignRandomID()
        await self.send(text_data=json.dumps({
            "ContentType": "startGameUser",
            "id": str(id)
        }))

    def makeRandomID(self, length):
        result = ""
        characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        charactersLength = len(characters)
        for x in range(length):
            result += characters[random.randrange(0, charactersLength)]
        return str(result)
        

    async def speedChangeGroup(self, event):
        await self.send(text_data=json.dumps({
            "ContentType": "speedChange",
            "speed": event["speed"]
        }))

    async def checkboxChangeGroup(self, event):
        await self.send(text_data=json.dumps({
            "ContentType": "checkboxChange"
        }))

    async def selectRoundsChangeGroup(self, event):
        await self.send(text_data=json.dumps({
            "ContentType": "selectRoundsChange",
            "rounds": event["rounds"]
    }))

    async def chatMessageGroup(self, event):
        await self.send(text_data=json.dumps({
            "ContentType": "chatMessage",
            "chat": event["chat"],
        }))

    async def playerLeave(self):
        state = await self.getState()
        if state == "lobby":
            await self.deletePlayer()
            newChat = await self.createNewChatMessage("Has left the server", "leaveMessage")
            await self.save(newChat)
            chat = await self.getRoomChat()
            if self.leader:
                await self.leaderLeftInRoom()
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "updatePlayers",
                    "content": "playerLeave",
                    "player": self.nickname,
                    "chat": chat
                }
            )

    async def updatePlayers(self, event):
        await self.send(text_data=json.dumps({
            "ContentType": "updatePlayers",
            "content": event["content"],
            "player": event["player"],
            "chat": event["chat"]
        }))

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
        room = Rooms.objects.get(room_id=self.room_name)
        return Users(room=room,
                     nickname=self.nickname,
                     color=self.text_data_json["color"],
                     eyes=self.text_data_json["eyes"],
                     mouth=self.text_data_json["mouth"],
                     leader=False,
                     uniqueID="",
                     online=False,
                     chosenSongs = 0,
                     ready = False,
                     points = 0)

#   Database functions lobby client

    @database_sync_to_async
    def createNewRoom(self):
        return Rooms(room_id=self.room_name, rounds=5, reverse=True, speed=1, state="lobby")

    @database_sync_to_async
    def roomAlreadyExists(self):
        return Rooms.objects.filter(room_id=self.room_name).exists()

    @database_sync_to_async
    def save(self, entity):
        return entity.save()

    @database_sync_to_async
    def DBAssignNewLeader(self):
        room = Rooms.objects.get(room_id=self.room_name)
        user = Users.objects.all().filter(room=room).first()
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
        room = Rooms.objects.get(room_id=self.room_name)
        userList = Users.objects.all().filter(room=room).values("nickname")
        return list(userList)

    @database_sync_to_async
    def createNewUser(self, state):
        if state == "lobby":
            if self.leader:
                room = Rooms.objects.get(room_id=self.room_name)
                return Users(room=room,
                             nickname=self.text_data_json["nickname"],
                             color=self.text_data_json["color"],
                             eyes=self.text_data_json["eyes"],
                             mouth=self.text_data_json["mouth"],
                             leader=True,
                             uniqueID="",
                             online=False,
                             chosenSongs= 0,
                             ready=False,
                             points=0)
            else:
                room = Rooms.objects.get(room_id=self.room_name)
                userList = list(Users.objects.all().filter(room=room).values("nickname"))
                self.nickname = self.howManyUserWithSameName(userList, self.nickname, 0)
                return self.createNormalPlayer()

    @database_sync_to_async
    def deletePlayer(self):
        room = Rooms.objects.get(room_id=self.room_name)
        user = Users.objects.get(nickname=self.nickname, room=room)
        user.delete()

    @database_sync_to_async
    def deleteRoom(self):
        room = Rooms.objects.get(room_id=self.room_name)
        room.delete()

    @database_sync_to_async
    def getState(self):
        return Rooms.objects.get(room_id=self.room_name).state

    @database_sync_to_async
    def changeSpeed(self, speed):
        room = Rooms.objects.get(room_id=self.room_name)
        room.speed = speed
        room.save()

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

    @database_sync_to_async
    def assignRandomID(self):
        room = Rooms.objects.get(room_id=self.room_name)
        user = Users.objects.get(nickname=self.nickname, room=room)
        user.uniqueID = self.makeRandomID(16)
        user.save()
        return user.uniqueID

    @database_sync_to_async
    def checkIfValidID(self, id):
        room = Rooms.objects.get(room_id=self.room_name)
        return frontend.models.Users.objects.filter(uniqueID=id, room=room).exists()

    @database_sync_to_async
    def changeGameState(self):
        room = Rooms.objects.get(room_id=self.room_name)
        room.state = "songSelection"
        room.save()

    @database_sync_to_async
    def createNewChatMessage(self, message, type):
        room = Rooms.objects.get(room_id=self.room_name)
        return Chat(
            room=room,
            sender=self.nickname,
            message=message,
            type = type,
            time = "geytime"
        )

    @database_sync_to_async
    def getRoomChat(self):
        room = Rooms.objects.get(room_id=self.room_name)
        chat = list(Chat.objects.all().filter(room=room).values("id", "type", "room", "message", "sender", "time"))
        return chat


# Lobby Client ^^^^^^
# ----------------------------------------------------------------------------------------------------------------------
# ----------------------------------------------------------------------------------------------------------------------
# ----------------------------------------------------------------------------------------------------------------------
# Selection Client vvvvvvv


class selectionConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'selection_%s' % self.room_name
        # Join room group
        self.nickname = ""
        self.leader = False
        self.id = ""
        self.downloaded = False
        self.finnishedSongs = []
        self.numberOfSongs = 0
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
        options = {
            "checkID": self.checkID,
            "getOnlineStatusGroup": self.getOnlineStatusGroup,
            "getMaxLength": self.getMaxLength,
            "addSong": self.addSong,
            "removeSong": self.removeSong,
            "startGame" : self.startGame,
            "changeReady": self.changeReady,
        }
        if contentType in options:
            await options[contentType]()
        else:
            print("ContentType not found in selectionConsumer")

    async def checkID(self):
        IDCheck = await self.checkIfValidID()
        if IDCheck["idExists"]:
            playerinfo = IDCheck["playerInfo"][0]
            self.nickname = playerinfo["nickname"]
            self.id = playerinfo["uniqueID"]
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

    async def getOnlineStatusGroup(self):
        await self.sendOnlineStatus()

    async def getMaxLength(self):
        maxLength = await self.getMaxSongs()
        await self.send(text_data=json.dumps({
            "ContentType": "maxSongsLength",
            "maxLength": maxLength,
        }))

    async def addSong(self):
        await self.addSongToDB(self.text_data_json)
        await self.send(text_data=json.dumps({
            "ContentType": "addSong",
            "song": self.text_data_json["song"],
        }))
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'sendSongStatus',
            })
        if self.leader:
            user = await self.getUserData()
            if user["chosenSongs"] == await self.getMaxSongs():
                await self.changeReady()

    async def removeSong(self):
        state = await self.getState()
        if state == "songSelection":
            await self.removeSongFromDB(self.text_data_json)
            await self.send(text_data=json.dumps({
                "ContentType": "removeSong",
                "song": self.text_data_json["song"],
            }))
            await self.updateReadyStatus(False)
            await self.send(text_data=json.dumps({
                "ContentType": "changeReady",
                "ready": False,
            }))
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'sendSongStatus',
                })

    async def startGame(self):
        if self.leader:
            userList = await self.getRoomStatus()
            maxSongs = await self.getMaxSongs()
            state = await self.getState()
            allMax = True
            allReady = True
            for user in userList:
                if not user["ready"]:
                    allReady = False
                    break
                if not user["chosenSongs"] == maxSongs:
                    allMax = False
                    break
            if allMax and state == "songSelection" and allReady:
                songList = await self.getSongs()
                await self.downloadSongs(songList)
                await self.changeGameState("loading")
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "setGameLoading"
                    }
                )
            elif not state == "songSelection":
                await self.send(text_data=json.dumps({
                    "ContentType": "startGameDenied",
                    "reason": "game already started",
                }))
            elif not allMax:
                await self.send(text_data=json.dumps({
                    "ContentType": "startGameDenied",
                    "reason": "not all songs chosen"
                }))
            elif not allReady:
                await self.send(text_data=json.dumps({
                    "ContentType": "startGameDenied",
                    "reason": "not all players ready"
                }))
        else:
            await self.send(text_data=json.dumps({
                "ContentType": "startGameDenied",
                "reason": "only leader can start game"
            }))

    async def changeReady(self):
        state = await self.getState()
        user = await self.getUserData()
        if user["ready"] and not self.leader and state == "songSelection":
            await self.updateReadyStatus(False)
            await self.send(text_data=json.dumps({
                "ContentType": "changeReady",
                "ready": False,
            }))
        elif not state == "songSelection":
            await self.send(text_data=json.dumps({
                "ContentType": "changeReadyDenied",
                "reason": "game already started"
            }))
        else:
            if user["chosenSongs"] == await self.getMaxSongs():
                await self.updateReadyStatus(True)
                await self.send(text_data=json.dumps({
                    "ContentType": "changeReady",
                    "ready": True,
                }))
            else:
                await self.send(text_data=json.dumps({
                    "ContentType": "changeReadyDenied",
                    "reason": "Not all songs chosen"
                }))
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'sendSongStatus',
            })

    # End of Receive message from WebSocket
    
    async def downloadSongs(self, songList): 
        songOptions = await self.getSongOptions()
        for song in songList:
            finnishedSong = tasks.downloadSongs.delay(song, self.room_group_name, songOptions, self.room_name)
            self.numberOfSongs = len(songList)
        
    async def setGameLoading(self, event):
        await self.send(text_data=json.dumps({
            "ContentType": "loadingGame"
        }))

    async def finnishedSongGroup(self, event):
        if self.leader:
            self.finnishedSongs.append(event["song"])
            if len(self.finnishedSongs) == self.numberOfSongs:
                await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "startGameGroup",
                    "songList": self.finnishedSongs
                }
            )

    async def loadingGameGroup(self, event):
        await self.send(text_data=json.dumps({
            "ContentType": "updateLoadingPercent",
        }))

    async def startGameGroup(self, event):
        if self.leader:
            for song in event["songList"]:
                await self.applyRandomId(song)

        await self.allUsersOffline()
        await self.send(text_data=json.dumps({
            "ContentType": "startGameGroup",
            "songList": event["songList"],
        }))
    
    async def updatePlayerStatus(self, event):
        userData = await self.getUserData()
        if userData["leader"]:
            self.leader = True
            await self.send(text_data=json.dumps({
                "ContentType": "setLeader",
                "leader": True,
            }))
        await self.send(text_data=json.dumps({
            "ContentType": "updatePlayerStatus",
            "userList": event["userList"]
        }))

    async def playerLeave(self):
        await self.updateOnline(False)
        await self.sendOnlineStatus()

    async def sendOnlineStatus(self):
        userList = await self.getRoomStatus()
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "updatePlayerStatus",
                "userList": userList
            }
        )

    async def sendSongStatus(self, event):
        userList = await self.getRoomStatus()
        await self.send(text_data=json.dumps({
            "ContentType": "updateSongs",
            "userList": userList
        }))

    async def downloadCompleted(self, event, type="downloadCompleted"):
        await self.send(text_data=json.dumps({
            "ContentType": "downloadCompleted",
        }))

    # Database Functions Game Client
    
    @database_sync_to_async
    def applyRandomId(self, songdata):
        song = Songs.objects.get(room_id=self.room_name, song_id=songdata["song_id"])
        filename = "/static/processedSongs/" + songdata["randomId"] + ".mp3"
        song.filelocation = filename
        song.save()

    @database_sync_to_async
    def changeGameState(self, state):
        room = Rooms.objects.get(room_id=self.room_name)
        room.state = state
        room.save()

    @database_sync_to_async
    def getRoomStatus(self):
        #get online status of all players in current room
        room = Rooms.objects.get(room_id=self.room_name)
        userList = Users.objects.all().filter(room=room).values()
        return list(userList)

    @database_sync_to_async
    def updateOnline(self, status):
        room = Rooms.objects.get(room_id=self.room_name)
        user = Users.objects.get(nickname=self.nickname, room=room)
        user.online = status
        user.save()

    @database_sync_to_async
    def checkIfValidID(self):
        room = Rooms.objects.get(room_id=self.room_name)
        idExists = Users.objects.filter(room=room , uniqueID=self.text_data_json["id"]).exists()
        playerInfo = Users.objects.filter(room=room, uniqueID=self.text_data_json["id"]).values()
        return {
            "idExists": idExists,
            "playerInfo": list(playerInfo)
        }
    
    @database_sync_to_async
    def getMaxSongs(self):
        return list(Rooms.objects.all().filter(room_id=self.room_name).values("rounds"))[0]["rounds"]

    @database_sync_to_async
    def addSongToDB(self, data):
        duration = data["song"]["duration"]
        duraStr = duration.split(":")
        duration = int(duraStr[0]) * 60 + int(duraStr[1])
        room = Rooms.objects.get(room_id=self.room_name)
        user = Users.objects.get(room=room, nickname=self.nickname)
        song = Songs(
            room_id=self.room_name,
            song_id=data["song"]["id"],
            artist=data["song"]["artist"],
            title=data["song"]["title"],
            album=data["song"]["album"],
            duration=duration,
            user=user,
            filelocation="")
        song.save()
        songsCount = Songs.objects.all().filter(user=user).count()
        user.chosenSongs = songsCount
        user.save()

    @database_sync_to_async
    def removeSongFromDB(self, data):
        room = Rooms.objects.get(room_id=self.room_name)
        user = Users.objects.get(room=room, nickname=self.nickname)
        song = Songs.objects.get(user=user, song_id=data["song"]["id"])
        song.delete()
        songsCount = Songs.objects.all().filter(user=user).count()
        user.chosenSongs = songsCount
        user.save()
    
    @database_sync_to_async
    def getState(self):
        return Rooms.objects.get(room_id=self.room_name).state

    @database_sync_to_async
    def getSongs(self):
        songs = Songs.objects.all().filter(room_id=self.room_name).values()
        return list(songs)

    @database_sync_to_async
    def getUserData(self):
        room = Rooms.objects.get(room_id=self.room_name)
        user = Users.objects.get(room=room, uniqueID=self.id)
        return user.__dict__

    @database_sync_to_async
    def updateReadyStatus(self, status):
        room = Rooms.objects.get(room_id=self.room_name)
        user = Users.objects.get(room=room, uniqueID=self.id)
        user.ready = status
        user.save()

    @database_sync_to_async
    def allUsersOffline(self):
        room = Rooms.objects.get(room_id=self.room_name)
        users = Users.objects.all().filter(room=room)
        for user in users:
            user.online = False
            user.save()
            
    @database_sync_to_async
    def getSongOptions(self):
        room = Rooms.objects.get(room_id=self.room_name).__dict__
        roomSpeed = str(room["speed"])
        roomReversed = str(room["reverse"])
        return {
            "speed": str(roomSpeed),
            "reverse": str(roomReversed)
        }

# Selection Client ^^^^^^
# ----------------------------------------------------------------------------------------------------------------------
# ----------------------------------------------------------------------------------------------------------------------
# ----------------------------------------------------------------------------------------------------------------------
# Game Client vvvvvvv


class gameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'game_%s' % self.room_name
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        self.nickname = ""
        self.leader = False
        self.id = ""
        self.downloaded = False
        self.room = {
            "state": "game",
            "rounds": 0,
            "currentRound": 0,
            "reverse": False,
            "speed": 0,
        }
        self.songList = []
        self.currentSong = 0
        self.roundDone = False
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        self.text_data_json = json.loads(text_data)
        contentType = self.text_data_json["ContentType"]
        options = {
            "checkID": self.checkID,
            "joinRoom": self.joinRoom,
            "gameStart": self.gameStart,
            "guessClick": self.guessClick,
            "guessSubmit": self.guessSubmit,
            "getSong": self.getSong,
            "nextSong": self.nextSong,
        }
        if contentType in options:
            await options[contentType]()
        else:
            print("unknown contentType in gameConsumer")
    # Receive message from room group

    async def checkID(self):
        IDCheck = await self.checkIfValidID()
        if IDCheck["idExists"]:
            playerinfo = IDCheck["playerInfo"][0]
            self.nickname = playerinfo["nickname"]
            self.id = playerinfo["uniqueID"]
            if playerinfo["leader"]:
                self.leader = True
                await self.send(text_data=json.dumps({
                    "ContentType": "youAreLeader",
                    "leader": True
                }))
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

    async def joinRoom(self):
        room = await self.updateSelfRoom()
        roomUsers = await self.getUserData()
        userlist = await self.getRoomOnlineStatus()
        everyoneOnline = True
        for user in userlist:
            if not user["online"]:
                everyoneOnline = False
                break
        if everyoneOnline:
            await self.updateRoomState("game")
            tasks.startCountDown.delay(self.room_group_name)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "usersOnline",
                }
            )
        await self.send(text_data=json.dumps({
            "ContentType": "RoomData",
            "roomReverse": room["reverse"],
            "roomRounds": float(room["rounds"]),
            "roomSpeed": float(room["speed"]),
            "roomUsers": roomUsers,
        }))

    async def guessClick(self):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "guessClickGroup",
                "nickname": self.nickname,
            }
        )

    async def guessSubmit(self):
        song = await self.cleanUpSongName()
        if await self.mostOfStringCorrect(song, self.text_data_json["guess"]):
            await self.addAPoint()
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "guessSubmitCorrectSongNameGroup",
                    "nickname": self.nickname,
                }
            )
        else:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "guessSubmitIncorrectSongNameGroup",
                    "nickname": self.nickname,
                    "guess": self.text_data_json["guess"],
                }
            )

    async def getSong(self):
        if self.leader:
            song = await self.getSongData()
            songLeader = await self.getSongLeader(song["user_id"])
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "getSongGroup",
                    "song": song,
                    "songLeader": songLeader,
                }
            )
    async def nextSong(self):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "updateCurrentRound",
                "currentRound": self.currentSong + 1,
            }
        )

    # End of receive
    async def nextSongStartGroup(self, event):
        if self.currentSong == len(self.songList):
            highestScore = await self.getHighestScore()
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "gameEndGroup",
                    "highestScore": highestScore,
                }
            )
        else:
            song = await self.getNextSong()
            songLeader = await self.getSongLeader(song["user_id"])
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "getSongGroup",
                    "song": song,
                    "songLeader": songLeader,
                }
            )

    async def gameEndGroup(self, event):
        await self.send(text_data=json.dumps({
            "ContentType": "gameEnd",
            "winner": event["highestScore"]
        }))

    async def nextSongGroup(self, event):
        song = event["song"]
        songLeader = event["songLeader"]
        await self.send(text_data=json.dumps({
            "ContentType": "songData",
            "song": song,
            "songLeader": songLeader,
        }))

    async def updateCurrentRound(self, event):
        self.currentSong = event["currentRound"]
        if self.leader:
            await self.nextSongStartGroup(event)

    async def guessClickGroup(self, event):
        if not event["nickname"] == self.nickname:
            await self.send(text_data=json.dumps({
                "ContentType": "guessClick",
                "nickname": event["nickname"],
            }))
        else:
            await self.send(text_data=json.dumps({
                "ContentType": "youGuessed"
            }))

    async def guessSubmitCorrectSongNameGroup(self, event):
        if not event["nickname"] == self.nickname:
            await self.send(text_data=json.dumps({
                "ContentType": "guessSubmitCorrectSongName",
                "nickname": event["nickname"],
            }))
        else:
            await self.send(text_data=json.dumps({
                "ContentType": "youGuessedCorrectSongName"
            }))

    async def guessSubmitIncorrectSongNameGroup(self, event):
        if not event["nickname"] == self.nickname:
            await self.send(text_data=json.dumps({
                "ContentType": "guessSubmitIncorrectSongName",
                "nickname": event["nickname"],
                "guess": event["guess"]
            }))
        else:
            await self.send(text_data=json.dumps({
                "ContentType": "youGuessedIncorrectSongName",
                "guess": event["guess"]
            }))

    async def gameStart(self, event):
        await self.updateRoomState("game")
        self.songList = await self.getSongList()
        if self.leader:
            await self.shuffleSongList()
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "sendSongListGroup",
                    "songList": self.songList,
                }
            )
        await self.send(text_data=json.dumps({
            "ContentType": "gameStart",
        }))

    async def sendSongListGroup(self, event):
        self.songList = event["songList"]

    async def startCountDownGroup(self, event):
        await self.send(text_data=json.dumps({
            "ContentType": "startCountDown",
        }))

    async def countDownGroup(self, event):
        await self.send(text_data=json.dumps({
            "ContentType": "countDown",
            "count": event["count"],
        }))

    async def updateSelfRoom(self):
        room = await self.getRoomData()
        self.room = {
            "state": "game",
            "rounds": room["rounds"],
            "currentRound": 0,
            "reverse": room["reverse"],
            "speed": float(room["speed"]),
        }
        return room

    async def usersOnline(self, event):
        self.room["state"] = "ready"
        await self.send(text_data=json.dumps({
            "ContentType": "usersOnline"
        }))

    async def guessSubmitGroup(self, event):
        await self.send(text_data=json.dumps({
            "ContentType": "guessSubmit",
            "nickname": event["nickname"],
            "guess": event["guess"],
        }))

    async def shuffleSongList(self):
        random.shuffle(self.songList)
    
    async def getSongData(self):
        self.roundDone = False
        song = self.songList[self.currentSong]
        return song

    async def getNextSong(self):
        song = self.songList[self.currentSong]
        return song

    async def getCurrentSong(self):
        return self.songList[self.currentSong]

    async def cleanUpSongName(self):
        song = await self.getCurrentSong()
        song["title"] = song["title"].lower()
        # remove everything between parentheses in string
        song["title"] = re.sub(r'\([^)]*\)', '', song["title"])
        # remove featuring from song name
        song["title"] = re.sub(r'featuring*', '', song["title"])
        song["title"] = re.sub(r'feat.*', '', song["title"])
        song["title"] = re.sub(r'ft.*', '', song["title"])
        return song

    async def mostOfStringCorrect(self, song, guess):
        song = song["title"]
        guess = guess.lower()
        correctWords = 0
        for word in guess:
            if word in song:
                correctWords += 1
        # if 80% of the words are correct, return true
        if correctWords / len(song) >= 0.8:
            return True
        else:
            return False

    async def getSongGroup(self, event):
        if self.id == event["songLeader"]:
            await self.send(text_data=json.dumps({
                "ContentType": "yourSong",
                "song": event["song"],
                "songLeader": True,
            }))
        else:
            await self.send(text_data=json.dumps({
                "ContentType": "songData",
                "song": event["song"],
                "songLeader": False
            }))

    # Database Functions

    @database_sync_to_async
    def addAPoint(self):
        room = Rooms.objects.get(room_id=self.room_name)
        user = Users.objects.get(room=room, nickname=self.nickname)
        user.points += 1
        user.save()

    @database_sync_to_async
    def getHighestScore(self):
        room = Rooms.objects.get(room_id=self.room_name)
        users = list(Users.objects.filter(room=room))
        highestScore = 0
        for user in users:
            if user.points > highestScore:
                highestScore = user.points
        user = list(Users.objects.filter(room=room, points=highestScore))
        return user

    @database_sync_to_async
    def checkIfValidID(self):
        room = Rooms.objects.get(room_id=self.room_name)
        idExists = Users.objects.filter(room=room , uniqueID=self.text_data_json["id"]).exists()
        playerInfo = Users.objects.filter(room=room, uniqueID=self.text_data_json["id"]).values()
        return {
            "idExists": idExists,
            "playerInfo": list(playerInfo)
        }

    @database_sync_to_async
    def updateOnline(self, status):
        room = Rooms.objects.get(room_id=self.room_name)
        user = Users.objects.get(nickname=self.nickname, room=room)
        user.online = status
        user.save()

    @database_sync_to_async
    def getRoomData(self):
        room = Rooms.objects.get(room_id=self.room_name)
        return room.__dict__

    @database_sync_to_async
    def getUserData(self):
        room = Rooms.objects.get(room_id=self.room_name)
        user = list(Users.objects.all().filter(room=room).values())
        return user

    @database_sync_to_async
    def getSongList(self):
        songs = Songs.objects.all().filter(room_id=self.room_name).values()
        return list(songs)

    @database_sync_to_async
    def getRoomOnlineStatus(self):
        room = Rooms.objects.get(room_id=self.room_name)
        userlist = list(Users.objects.all().filter(room=room).values("online"))
        return userlist

    @database_sync_to_async
    def updateRoomState(self, state):
        room = Rooms.objects.get(room_id=self.room_name)
        room.state = state
        room.save()

    @database_sync_to_async
    def getSongLeader(self, songUser):
        room = Rooms.objects.get(room_id=self.room_name)
        songLeader = str(Users.objects.get(room=room, id=songUser).uniqueID)
        return songLeader
