import json
from channels.generic.websocket import AsyncWebsocketConsumer


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
        JSONdata = json.loads(text_data)
        contentType = JSONdata["Content-Type"]
        if contentType == "Joined":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "playerJoined",
                    "name": JSONdata["name"],
                    "color": JSONdata["color"],
                    "eyes": JSONdata["eyes"],
                    "mouth": JSONdata["mouth"]
                }
            )

    async def playerJoined(self, event):
        await self.send(text_data=json.dumps({
            "ContentType": "PlayerJoined",
            "name": event["name"],
            "color": event["color"],
            "eyes": event["eyes"],
            "mouth": event["mouth"]
        }))
