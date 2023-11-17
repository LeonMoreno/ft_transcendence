import json
from channels.generic.websocket import AsyncWebsocketConsumer

class MyWebSocketConsumerGame(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("game", self.channel_name)
        await self.accept()
        await self.channel_layer.group_send(
            "game",
            {
                "type": "game_state_message",
                "message": "Hello from the server",
                "sender_channel_name": self.channel_name
            }
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("game", self.channel_name)

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            print("-> text_data_json : {}".format(text_data_json))
            if text_data_json:
                await self.channel_layer.group_send(
                    "game",
                    {
                        "type": "game_state_message",
                        "message": text_data_json,
                        "sender_channel_name": self.channel_name
                    }
                )
        except json.JSONDecodeError:
            print("Error 🤖")
            print(json.JSONDecodeError)
            pass

    async def game_state_message(self, event):
        message = event['message']
        sender_channel_name = event['sender_channel_name']

        if self.channel_name != sender_channel_name:
            await self.send(text_data=json.dumps({
                'message': message
            }))
