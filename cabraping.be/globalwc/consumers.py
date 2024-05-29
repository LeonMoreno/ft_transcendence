# globalwc/consumers.py

import json
from channels.generic.websocket import AsyncWebsocketConsumer

connected_users = set()

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.group_name = 'notifications'
        
        # Join notifications group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        # Accept the WebSocket connection
        await self.accept()

        # Add user to the set of connected users
        connected_users.add(self.user_id)

        # Send the list of connected users to all users
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'update_user_list',
                'user_ids': list(connected_users),
            }
        )

        # Notify all users that a new user has connected
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'user_connected',
                'user_id': self.user_id,
            }
        )

    async def disconnect(self, close_code):
        # Remove user from the set of connected users
        connected_users.discard(self.user_id)

        # Notify all users that a user has disconnected
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'user_disconnected',
                'user_id': self.user_id,
            }
        )

        # Send the updated list of connected users to all users
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'update_user_list',
                'user_ids': list(connected_users),
            }
        )

        # Leave notifications group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        event_type = text_data_json['type']
        message = text_data_json['message']
        user_id = text_data_json['user_id']
        user_name = text_data_json['user_name']
        dest_user_id = text_data_json['dest_user_id']

        # Send message to group
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': event_type,
                'message': message,
                'user_id': user_id,
                'user_name': user_name,
                'dest_user_id': dest_user_id,
                'sender_channel_name': self.channel_name,  # Add the sender's channel name
            }
        )

    async def notify(self, event):
        if self.channel_name != event['sender_channel_name']:
            message = event['message']
            user_id = event['user_id']
            user_name = event['user_name']
            dest_user_id = event['dest_user_id']

            # Send message to WebSocket
            await self.send(text_data=json.dumps({
                'event': 'notify',
                'message': message,
                'user_id': user_id,
                'user_name': user_name,
                'dest_user_id': dest_user_id,
            }))

    async def channel_created(self, event):
        if self.channel_name != event['sender_channel_name']:
            message = event['message']
            user_id = event['user_id']
            user_name = event['user_name']
            dest_user_id = event['dest_user_id']

            # Send message to WebSocket
            await self.send(text_data=json.dumps({
                'event': 'channel_created',
                'message': message,
                'user_id': user_id,
                'user_name': user_name,
                'dest_user_id': dest_user_id,
            }))

    async def game_invite(self, event):
        if self.channel_name != event['sender_channel_name']:
            message = event['message']
            user_id = event['user_id']
            user_name = event['user_name']
            dest_user_id = event['dest_user_id']

            # Send message to WebSocket
            await self.send(text_data=json.dumps({
                'event': 'game_invite',
                'message': message,
                'user_id': user_id,
                'user_name': user_name,
                'dest_user_id': dest_user_id,
            }))

    async def accepted_game(self, event):
        if self.channel_name != event['sender_channel_name']:
            message = event['message']
            user_id = event['user_id']
            user_name = event['user_name']
            dest_user_id = event['dest_user_id']

            # Send message to WebSocket
            await self.send(text_data=json.dumps({
                'event': 'accepted_game',
                'message': message,
                'user_id': user_id,
                'user_name': user_name,
                'dest_user_id': dest_user_id,
            }))

    async def user_connected(self, event):
        user_id = event['user_id']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'event': 'user_connected',
            'user_id': user_id,
        }))

    async def user_disconnected(self, event):
        user_id = event['user_id']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'event': 'user_disconnected',
            'user_id': user_id,
        }))

    async def update_user_list(self, event):
        user_ids = event['user_ids']

        # Send updated user list to WebSocket
        await self.send(text_data=json.dumps({
            'event': 'update_user_list',
            'user_ids': user_ids,
        }))


# # globalwc/consumers.py

# import json
# from channels.generic.websocket import AsyncWebsocketConsumer

# connected_users = set()

# class NotificationConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         self.user_id = self.scope['url_route']['kwargs']['user_id']
#         self.group_name = 'notifications'

#         # Join notifications group
#         await self.channel_layer.group_add(
#             self.group_name,
#             self.channel_name
#         )

#         # Accept the WebSocket connection
#         await self.accept()

#         # Add user to the set of connected users
#         connected_users.add(self.user_id)

#         # Send the list of connected users to the new user
#         await self.send(text_data=json.dumps({
#             'event': 'current_users',
#             'user_ids': list(connected_users),
#         }))

#         # Notify all users that a new user has connected
#         await self.channel_layer.group_send(
#             self.group_name,
#             {
#                 'type': 'user_connected',
#                 'user_id': self.user_id,
#             }
#         )

#     async def disconnect(self, close_code):
#         # Remove user from the set of connected users
#         connected_users.discard(self.user_id)

#         # Notify all users that a user has disconnected
#         await self.channel_layer.group_send(
#             self.group_name,
#             {
#                 'type': 'user_disconnected',
#                 'user_id': self.user_id,
#             }
#         )

#         # Leave notifications group
#         await self.channel_layer.group_discard(
#             self.group_name,
#             self.channel_name
#         )

#     async def receive(self, text_data):
#         text_data_json = json.loads(text_data)
#         event_type = text_data_json['type']
#         message = text_data_json['message']
#         user_id = text_data_json['user_id']
#         user_name = text_data_json['user_name']
#         dest_user_id = text_data_json['dest_user_id']

#         # Send message to group
#         await self.channel_layer.group_send(
#             self.group_name,
#             {
#                 'type': event_type,
#                 'message': message,
#                 'user_id': user_id,
#                 'user_name': user_name,
#                 'dest_user_id': dest_user_id,
#                 'sender_channel_name': self.channel_name,  # Add the sender's channel name
#             }
#         )

#     async def notify(self, event):
#         if self.channel_name != event['sender_channel_name']:
#             message = event['message']
#             user_id = event['user_id']
#             user_name = event['user_name']
#             dest_user_id = event['dest_user_id']

#             # Send message to WebSocket
#             await self.send(text_data=json.dumps({
#                 'event': 'notify',
#                 'message': message,
#                 'user_id': user_id,
#                 'user_name': user_name,
#                 'dest_user_id': dest_user_id,
#             }))

#     async def channel_created(self, event):
#         if self.channel_name != event['sender_channel_name']:
#             message = event['message']
#             user_id = event['user_id']
#             user_name = event['user_name']
#             dest_user_id = event['dest_user_id']

#             # Send message to WebSocket
#             await self.send(text_data=json.dumps({
#                 'event': 'channel_created',
#                 'message': message,
#                 'user_id': user_id,
#                 'user_name': user_name,
#                 'dest_user_id': dest_user_id,
#             }))

#     async def game_invite(self, event):
#         if self.channel_name != event['sender_channel_name']:
#             message = event['message']
#             user_id = event['user_id']
#             user_name = event['user_name']
#             dest_user_id = event['dest_user_id']

#             # Send message to WebSocket
#             await self.send(text_data=json.dumps({
#                 'event': 'game_invite',
#                 'message': message,
#                 'user_id': user_id,
#                 'user_name': user_name,
#                 'dest_user_id': dest_user_id,
#             }))

#     async def accepted_game(self, event):
#         if self.channel_name != event['sender_channel_name']:
#             message = event['message']
#             user_id = event['user_id']
#             user_name = event['user_name']
#             dest_user_id = event['dest_user_id']

#             # Send message to WebSocket
#             await self.send(text_data=json.dumps({
#                 'event': 'accepted_game',
#                 'message': message,
#                 'user_id': user_id,
#                 'user_name': user_name,
#                 'dest_user_id': dest_user_id,
#             }))

#     async def user_connected(self, event):
#         user_id = event['user_id']

#         # Send message to WebSocket
#         await self.send(text_data=json.dumps({
#             'event': 'user_connected',
#             'user_id': user_id,
#         }))

#     async def user_disconnected(self, event):
#         user_id = event['user_id']

#         # Send message to WebSocket
#         await self.send(text_data=json.dumps({
#             'event': 'user_disconnected',
#             'user_id': user_id,
#         }))

