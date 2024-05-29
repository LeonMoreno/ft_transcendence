import json
from rest_framework_simplejwt.tokens import AccessToken
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.game_group_name = f'game_{self.game_id}'

        # Join game group
        await self.channel_layer.group_add(
            self.game_group_name,
            self.channel_name
        )

        # Get the user ID
        # data_json = json.loads(text_data)
        # user_id = data_json.user_id
        # print(f"User ID: {user_id}")

        await self.accept()
        await self.channel_layer.group_send(
            self.game_group_name,
            {
                "type": "game_state_message",
                "sender_channel_name": self.channel_name,
                "message": "A player joined the game",
                # "user_id": user_id
            }
        )

    async def disconnect(self, close_code):
        # Leave game group
        await self.channel_layer.group_discard(
            self.game_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        try:
            data_json = json.loads(text_data)
            if data_json:
                await self.channel_layer.group_send(
                    self.game_group_name,
                    {
                        "type": "game_state_message",
                        "message": data_json,
                        "sender_channel_name": self.channel_name
                    }
                )
        except json.JSONDecodeError:
            print("Error 🤖")
            print(json.JSONDecodeError)
            pass

    # Receive message from game group
    async def game_state_message(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))