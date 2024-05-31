import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer

class UsersConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.user_group_name = f'user_{self.user_id}'

        await self.channel_layer.group_add(
            self.user_group_name,
            self.channel_name
        )

        await self.accept()
        await self.channel_layer.group_send(
            self.user_group_name,
            {
                "type": "user_notification_message",
                "message": "Connected to user notification",
                "status": "CONNECTED",
                "user_id": self.user_id,
                "sender_channel_name": self.channel_name
            }
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.user_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            data_json = json.loads(text_data)
            if data_json:
                await self.channel_layer.group_send(
                    self.user_group_name,
                    {
                        "type": "user_notification_message",
                        "message": data_json,
                        "sender_channel_name": self.channel_name
                    }
                )
        except json.JSONDecodeError:
            print("Error 🤖")
            print(json.JSONDecodeError)
            pass

    async def user_notification_message(self, event):
        message = event['message']
        status = event.get('status', None)
        user_id = event.get('user_id', None)
        game_id = event.get('game_id', None)

        await self.send(text_data=json.dumps({
            'message': message,
            'status': status,
            'user_id': user_id,
            'game_id': game_id
        }))