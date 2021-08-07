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
        text_data_json = json.loads(text_data)
        contentType = text_data_json["ContentType"]
        if contentType == "LeaderJoined":
            roomName = await self.createNewRoom()
            await self.save(roomName)
            user = await self.createNewUser(text_data_json, leader=True)
            await self.save(user)
            self.nickname = text_data_json["nickname"]
            self.leader = True
        elif contentType == "PlayerJoined":
            user = await self.createNewUser(text_data_json, leader=False)
            await self.save(user)
            self.nickname = text_data_json["nickname"]
            self.leader = False

    @database_sync_to_async
    def createNewRoom(self):
        return Rooms(room_id=self.room_name)

    @database_sync_to_async
    def createNewUser(self, text_data_json, leader):
        return Users(room_id=self.room_name,
                     nickname=text_data_json["nickname"],
                     color=text_data_json["color"],
                     eyes=text_data_json["eyes"],
                     mouth=text_data_json["mouth"],
                     leader=leader)

    def deleteRoom(self):
        room = Rooms.objects.get(room_id=self.room_name)
        room.delete()
        print("deleted", self.room_name)

    def leaderLeftInRoom(self):
        try:
            userList = list(Users.objects.get(room_id=self.room_name))
        except frontend.models.Users.DoesNotExist as e:
            print("Hello")
            self.deleteRoom()
            print("Room deleted", self.room_name)
        else:
            self.assignNewLeader()

    @database_sync_to_async
    def playerLeave(self):
        user = Users.objects.get(nickname=self.nickname, room_id=self.room_name)
        user.delete()
        if self.leader:
            self.leaderLeftInRoom()

    def assignNewLeader(self):
        user = Users.objects.get(room_id=self.room_name)
        user[0].leader = True
        user.save()

    @database_sync_to_async
    def save(self, entity):
        return entity.save()
