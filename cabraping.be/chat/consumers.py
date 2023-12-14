import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer

class MyWebSocketConsumerChat(AsyncWebsocketConsumer):
	async def connect(self):
		await self.channel_layer.group_add("chat", self.channel_name)
		await self.accept()

	async def disconnect(self, close_code):
		await self.channel_layer.group_discard("chat", self.channel_name)

	async def receive(self, text_data):
		try:
				text_data_json = json.loads(text_data)
				print("-> text_data_json : {}".format(text_data_json))
				print("-> username: {}".format(text_data_json['UserName']))
				message = text_data_json.get('message')
				print("-> message : {}".format(message))
				if message:
						# Envía el mensaje a todos menos al remitente
						await self.channel_layer.group_send(
								"chat",
								{
										"type": "chat_message",
										"message": message,
										"sender_channel_name": self.channel_name,
										"UserName": text_data_json['UserName'],
								}
						)
		except json.JSONDecodeError:
			print("Error 🤖")
			print(json.JSONDecodeError)
			# Manejar el error o ignorarlo
			pass

	# Handler for messages from the group
	async def chat_message(self, event):
		message = event['message']
		sender_channel_name = event['sender_channel_name']

		print("--> event")
		print(event)
		print("--> event")
		print(event)

			# Send the message to WebSocket if the user is not the sender
		if self.channel_name != sender_channel_name:
				await self.send(text_data=json.dumps({
						'message': event
		}))
