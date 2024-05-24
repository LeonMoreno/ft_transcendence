import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer

class MyWebSocketConsumerChat(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']  # Obtener el nombre del canal de la URL
        self.room_group_name = f'chat_{self.room_name}'

        # Unirse al grupo de chat del canal
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Dejar el grupo de chat del canal
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        channel_name = text_data_json['channel']
        username = text_data_json.get('UserName', 'Anónimo')  # Obtener el nombre de usuario
        user_details = text_data_json['userDetails']


        # Imprimir el mensaje y el nombre del usuario en la terminal del backend
        print(f"\n Message from user [{username}] channel_name [{channel_name}] and message [{message}]")

        # Enviar el mensaje y el nombre del usuario a todos en el grupo del canal
        await self.channel_layer.group_send(
            self.room_group_name,
            {
            'type': 'chat_message',
            'message': message,
            'UserName': username,
            'channel': channel_name,
            'sender_channel_name': self.channel_name,  # Añadir el nombre del canal del emisor,
            'userDetails': user_details,
        }
        )

    async def chat_message(self, event):
        # Extraer la información del evento
        message = event['message']
        username = event['UserName']
        channel_name = event['channel']
        user_details = event['userDetails']

        # Enviar mensaje al WebSocket solo si el nombre de usuario no coincide con el emisor
        if self.channel_name != event.get('sender_channel_name', None):
            await self.send(text_data=json.dumps({
                'message': message,
                'UserName': username,
                'channel': channel_name,
                'userDetails': user_details,
            }))
