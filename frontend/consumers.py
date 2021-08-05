import json
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
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

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        contentType = text_data_json["ContentType"]
        if contentType == "LeaderJoined":
            roomName = await self.createNewRoom()
            await self.saveRoom(roomName)
            user = await self.createNewUser(text_data_json, Leader=True)
            await self.saveUser(user)
        elif contentType == "PlayerJoined":
            user = await self.createNewUser(text_data_json, Leader=False)
            await self.saveUser(user)

    @database_sync_to_async
    def createNewRoom(self):
        return Rooms(room_id=self.room_name)

    @database_sync_to_async
    def saveRoom(self, roomName):
        return roomName.save()

    @database_sync_to_async
    def createNewUser(self, text_data_json, Leader):
        return Users(room_id=self.room_name,
                     nickname=text_data_json["nickname"],
                     color=int(text_data_json["color"]),
                     eyes=int(text_data_json["eyes"]),
                     mouth=int(text_data_json["mouth"]),
                     leader=Leader)

    @database_sync_to_async
    def saveUser(self, user):
        return user.save()
