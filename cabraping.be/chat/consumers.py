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
            'sender_channel_name': self.channel_name,  # Añadir el nombre del canal del emisor
        }
        )

    async def chat_message(self, event):
        # Extraer la información del evento
        message = event['message']
        username = event['UserName']
        channel_name = event['channel']

        # Enviar mensaje al WebSocket solo si el nombre de usuario no coincide con el emisor
        if self.channel_name != event.get('sender_channel_name', None):
            await self.send(text_data=json.dumps({
                'message': message,
                'UserName': username,
                'channel': channel_name,
            }))
    # async def chat_message(self, event):
    #     message = event['message']
    #     name = event['UserName']
    #     chanel_name = event['channel']


    #     # Enviar mensaje al WebSocket
    #     await self.send(text_data=json.dumps({
    #         'message': message,
    #         'UserName': name,
    #         'channel': chanel_name,
    #     }))

# class MyWebSocketConsumerChat(AsyncWebsocketConsumer):
# 	async def connect(self):
# 		await self.channel_layer.group_add("chat", self.channel_name)
# 		await self.accept()

# 	async def disconnect(self, close_code):
# 		await self.channel_layer.group_discard("chat", self.channel_name)

# 	async def receive(self, text_data):
# 		try:
# 				text_data_json = json.loads(text_data)
# 				print("-> text_data_json : {}".format(text_data_json))
# 				print("-> username: {}".format(text_data_json['UserName']))
# 				message = text_data_json.get('message')
# 				print("-> message : {}".format(message))
# 				if message:
# 						# Envía el mensaje a todos menos al remitente
# 						await self.channel_layer.group_send(
# 								"chat",
# 								{
# 										"type": "chat_message",
# 										"message": message,
# 										"sender_channel_name": self.channel_name,
# 										"UserName": text_data_json['UserName'],
# 								}
# 						)
# 		except json.JSONDecodeError:
# 			print("Error 🤖")
# 			print(json.JSONDecodeError)
# 			# Manejar el error o ignorarlo
# 			pass

# 	# Handler for messages from the group
# 	async def chat_message(self, event):
# 		message = event['message']
# 		sender_channel_name = event['sender_channel_name']

# 		print("--> event")
# 		print(event)
# 		print("--> event")
# 		print(event)

# 			# Send the message to WebSocket if the user is not the sender
# 		if self.channel_name != sender_channel_name:
# 				await self.send(text_data=json.dumps({
# 						'message': event
# 		}))
