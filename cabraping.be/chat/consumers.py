import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer

class MyWebSocketConsumerChat(AsyncWebsocketConsumer):
    async def connect(self):
        #self.room_name = self.scope['url_route']['kwargs']['room_name']  # Obtener el nombre del canal de la URL
        #self.room_group_name = f'chat_{self.room_name}'

        # Unirse al grupo de chat del canal
       # await self.channel_layer.group_add(self.room_group_name, self.channel_name)
       # await self.accept()

        #using the below to allow for tournament invites:
        self.user_id = self.scope['url_route']['kwargs'].get('user_id')
        self.room_name = self.scope['url_route']['kwargs'].get('room_name')

        if self.user_id:
            self.room_group_name = f'user_{self.user_id}'
        elif self.room_name:
            self.room_group_name = f'chat_{self.room_name}'

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Dejar el grupo de chat del canal
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    #updated this to allow for tournament invites:
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type')
        message = text_data_json['message']
        #channel_name = text_data_json['channel']
        username = text_data_json.get('UserName', 'Anonymous')  # Obtener el nombre de usuario

        print(f"\n Message from user [{username}]: [{message}]")

    #added the below for tournament invites:
        if message_type == 'tournament_invitation' and self.user_id:
            await self.send_tournament_invitation(text_data_json)
        elif message_type == 'chat_message' and self.room_name:
            await self.handle_chat_message(message, username, text_data_json['channel'])

        # Imprimir el mensaje y el nombre del usuario en la terminal del backend
        #print(f"\n Message from user [{username}] channel_name [{channel_name}] and message [{message}]")
    
    async def handle_chat_message(self, event):
        message = event['message']
        username = event['UserName']
        channel_name = event['channel']

        if self.channel_name != event.get('sender_channel_name', None):
            await self.send(text_data=json.dumps({
                'message': message,
                'UserName': username,
                'channel': channel_name,
            }))

        # Enviar el mensaje y el nombre del usuario a todos en el grupo del canal
       # await self.channel_layer.group_send(
       #     self.room_group_name,
       #     {
       #     'type': 'chat_message',
       #     'message': message,
       #     'UserName': username,
       #     'channel': channel_name,
       #     'sender_channel_name': self.channel_name,  # Añadir el nombre del canal del emisor
       # }
       # )

#    async def chat_message(self, event):
 #       # Extraer la información del evento
 #       message = event['message']
  #      username = event['UserName']
   #     channel_name = event['channel']

    #    # Enviar mensaje al WebSocket solo si el nombre de usuario no coincide con el emisor
     #   if self.channel_name != event.get('sender_channel_name', None):
      #      await self.send(text_data=json.dumps({
       #         'message': message,
        #        'UserName': username,
         #       'channel': channel_name,
          #  }))

    async def send_tournament_invitation(self, event):
        await self.send(text_data=json.dumps({
            'type': 'tournament_invitation',
            'tournament_name': event['tournament_name'],
            'message': f"You are invited to join the tournament {event['tournament_name']}. Are you ready to compete for the prestigious Chèvre Verte Award?"
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
