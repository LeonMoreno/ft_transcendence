import json
from channels.generic.websocket import AsyncWebsocketConsumer

connected_users = set()
waiting_users = set()
waiting_channels = {}  # Maps user_id to channel_name
user_channels = {}  # Maps user_id to channel_name

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

        # Add user to the set of connected users and map user_id to channel_name
        connected_users.add(self.user_id)
        user_channels[self.user_id] = self.channel_name

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
        # Remove user from the set of connected users and waiting users
        connected_users.discard(self.user_id)
        if self.user_id in waiting_users:
            waiting_users.discard(self.user_id)
            del waiting_channels[self.user_id]

        # Remove the user from the user_channels mapping
        if self.user_id in user_channels:
            del user_channels[self.user_id]

        # Notify waiting users that a user has left
        await self.notify_waiting_users()

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
        
        if 'type' in text_data_json:
            event_type = text_data_json['type']
            message = text_data_json.get('message', '')
            user_id = text_data_json.get('user_id', '')
            user_name = text_data_json.get('user_name', '')
            dest_user_id = text_data_json.get('dest_user_id', '')
            tournament_id = text_data_json.get('tournament_id', '')
            tournament_name = text_data_json.get('tournament_name', '')

            if event_type == 'wait_matched':
                # Add user to the waiting list
                waiting_users.add(user_id)
                waiting_channels[user_id] = self.channel_name

                # Notify all waiting users
                await self.notify_waiting_users()

                # Notify the user that they are waiting for a match
                await self.send(text_data=json.dumps({
                    'type': 'wait_matched',
                    'message': 'You are now waiting for a match.',
                    'user_id': user_id,
                }))

            elif event_type == 'delete_matched' and len(matched_user_ids) == 2:
                # Remove matched users from the waiting list
                for matched_user_id in matched_user_ids:
                    waiting_users.discard(matched_user_id)
                    if matched_user_id in waiting_channels:
                        del waiting_channels[matched_user_id]

                # Notify all waiting users
                await self.notify_waiting_users()

                # Notify the matched users
                for matched_user_id in matched_user_ids:
                    if matched_user_id in waiting_channels:
                        await self.channel_layer.send(waiting_channels[matched_user_id], {
                            'type': 'send_matched_message',
                            'message': 'You have been matched and removed from the waiting list.',
                        })

            elif event_type == 'tournament_invite':
                # Send the tournament invitation to all users except the sender
                await self.send_tournament_invitation({
                    'type': 'send_tournament_invitation',
                    'message': message,
                    'tournament_name': tournament_name,
                    'user_id': user_id,
                    'user_name': user_name,
                    'dest_user_id': dest_user_id,
                    'tournament_id': tournament_id,
                    'sender_channel_name': self.channel_name,
                })
            else:
                # Send message to group
                await self.channel_layer.group_send(
                    self.group_name,
                    {
                        'type': event_type,
                        'message': message,
                        'user_id': user_id,
                        'user_name': user_name,
                        'dest_user_id': dest_user_id,
                        'sender_channel_name': self.channel_name,
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
    
    # rachel
    async def send_tournament_invitation(self, event):
        message = event['message']
        tournament_name = event['tournament_name']
        user_id = event['user_id']
        user_name = event['user_name']
        dest_user_id = event['dest_user_id']
        tournament_id = event['tournament_id']
        sender_channel_name = event['sender_channel_name']

        # Send message to all users except the sender
        for uid, channel_name in user_channels.items():
            if channel_name != sender_channel_name:
                await self.channel_layer.send(channel_name, {
                    'type': 'tournament_message',
                    'message': message,
                    'tournament_name': tournament_name,
                    'user_id': user_id,
                    'user_name': user_name,
                    'dest_user_id': dest_user_id,
                    'tournament_id': tournament_id,
                })

    async def tournament_message(self, event):
        message = event['message']
        tournament_name = event['tournament_name']
        user_id = event['user_id']
        user_name = event['user_name']
        dest_user_id = event['dest_user_id']
        tournament_id = event['tournament_id']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'tournament',
            'event': 'tournament_invite',
            'message': message,
            'tournament_name': tournament_name,
            'user_id': user_id,
            'user_name': user_name,
            'dest_user_id': dest_user_id,
            'tournament_id': tournament_id,
        }))


    async def update_waiting_list(self, event):
        waiting_ids = event['waiting_ids']

        # Send updated waiting list to WebSocket
        for user_id in waiting_ids:
            channel_name = waiting_channels.get(user_id)
            if channel_name:
                await self.channel_layer.send(channel_name, {
                    'type': 'send_waiting_list',
                    'waiting_ids': waiting_ids,
                })

    async def send_waiting_list(self, event):
        waiting_ids = event['waiting_ids']

        # Send updated waiting list to WebSocket
        await self.send(text_data=json.dumps({
            'event': 'update_waiting_list',
            'waiting_ids': waiting_ids,
        }))

    async def send_matched_message(self, event):
        message = event['message']

        # Send matched message to WebSocket
        await self.send(text_data=json.dumps({
            'event': 'delete_matched',
            'message': message,
        }))

    async def notify_waiting_users(self):
        # Send the updated waiting list only to waiting users
        waiting_ids = list(waiting_users)
        for user_id in waiting_ids:
            channel_name = waiting_channels.get(user_id)
            if channel_name:
                await self.channel_layer.send(channel_name, {
                    'type': 'send_waiting_list',
                    'waiting_ids': waiting_ids,
                })



# # globalwc/consumers.py

# import json
# from channels.generic.websocket import AsyncWebsocketConsumer

# connected_users = set()
# waiting_users = set()
# waiting_channels = {}  # Maps user_id to channel_name

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

#         # Send the list of connected users to all users
#         await self.channel_layer.group_send(
#             self.group_name,
#             {
#                 'type': 'update_user_list',
#                 'user_ids': list(connected_users),
#             }
#         )

#         # Notify all users that a new user has connected
#         await self.channel_layer.group_send(
#             self.group_name,
#             {
#                 'type': 'user_connected',
#                 'user_id': self.user_id,
#             }
#         )

#     async def disconnect(self, close_code):
#         # Remove user from the set of connected users and waiting users
#         connected_users.discard(self.user_id)
#         if self.user_id in waiting_users:
#             waiting_users.discard(self.user_id)
#             del waiting_channels[self.user_id]

#             # Notify waiting users that a user has left
#             await self.notify_waiting_users()

#         # Notify all users that a user has disconnected
#         await self.channel_layer.group_send(
#             self.group_name,
#             {
#                 'type': 'user_disconnected',
#                 'user_id': self.user_id,
#             }
#         )

#         # Send the updated list of connected users to all users
#         await self.channel_layer.group_send(
#             self.group_name,
#             {
#                 'type': 'update_user_list',
#                 'user_ids': list(connected_users),
#             }
#         )

#         # Leave notifications group
#         await self.channel_layer.group_discard(
#             self.group_name,
#             self.channel_name
#         )

#     async def receive(self, text_data):
#         text_data_json = json.loads(text_data)
        
#         # Check for the presence of required keys
#         if 'type' in text_data_json:
#             event_type = text_data_json['type']
#             message = text_data_json.get('message', '')
#             user_id = text_data_json.get('user_id', '')
#             user_name = text_data_json.get('user_name', '')
#             dest_user_id = text_data_json.get('dest_user_id', '')
#             matched_user_ids = text_data_json.get('matched_user_ids', [])

#             if event_type == 'wait_matched':
#                 # Add user to the waiting list
#                 waiting_users.add(user_id)
#                 waiting_channels[user_id] = self.channel_name

#                 # Notify all waiting users
#                 await self.notify_waiting_users()

#                 # Notify the user that they are waiting for a match
#                 await self.send(text_data=json.dumps({
#                     'type': 'wait_matched',
#                     'message': 'You are now waiting for a match.',
#                     'user_id': user_id,
#                 }))

#             elif event_type == 'delete_matched' and len(matched_user_ids) == 2:
#                 # Remove matched users from the waiting list
#                 for matched_user_id in matched_user_ids:
#                     waiting_users.discard(matched_user_id)
#                     if matched_user_id in waiting_channels:
#                         del waiting_channels[matched_user_id]

#                 # Notify all waiting users
#                 await self.notify_waiting_users()

#                 # Notify the matched users
#                 for matched_user_id in matched_user_ids:
#                     if matched_user_id in waiting_channels:
#                         await self.channel_layer.send(waiting_channels[matched_user_id], {
#                             'type': 'send_matched_message',
#                             'message': 'You have been matched and removed from the waiting list.',
#                         })

#             else:
#                 # Send message to group
#                 await self.channel_layer.group_send(
#                     self.group_name,
#                     {
#                         'type': event_type,
#                         'message': message,
#                         'user_id': user_id,
#                         'user_name': user_name,
#                         'dest_user_id': dest_user_id,
#                         'sender_channel_name': self.channel_name,  # Add the sender's channel name
#                     }
#                 )

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

#     async def update_user_list(self, event):
#         user_ids = event['user_ids']

#         # Send updated user list to WebSocket
#         await self.send(text_data=json.dumps({
#             'event': 'update_user_list',
#             'user_ids': user_ids,
#         }))
    
#     # rachel
#     async def send_tournament_invitation(self, event):
#         message = event['message']
#         tournament_name = event['tournament_name']
#         user_id = event['user_id']
#         user_name = event['user_name']
#         dest_user_id = event['dest_user_id']

#         # Send message to WebSocket
#         await self.send(text_data=json.dumps({
#             'type': 'tournament',
#             'event': 'tournament_invite',
#             'message': message,
#             'tournament_name': tournament_name,
#             'user_id': user_id,
#             'user_name': user_name,
#             'dest_user_id': dest_user_id,
#             'tournament_id': event['tournament_id']
#         }))


#     async def update_waiting_list(self, event):
#         waiting_ids = event['waiting_ids']

#         # Send updated waiting list to WebSocket
#         for user_id in waiting_ids:
#             channel_name = waiting_channels.get(user_id)
#             if channel_name:
#                 await self.channel_layer.send(channel_name, {
#                     'type': 'send_waiting_list',
#                     'waiting_ids': waiting_ids,
#                 })

#     async def send_waiting_list(self, event):
#         waiting_ids = event['waiting_ids']

#         # Send updated waiting list to WebSocket
#         await self.send(text_data=json.dumps({
#             'event': 'update_waiting_list',
#             'waiting_ids': waiting_ids,
#         }))

#     async def send_matched_message(self, event):
#         message = event['message']

#         # Send matched message to WebSocket
#         await self.send(text_data=json.dumps({
#             'event': 'delete_matched',
#             'message': message,
#         }))

#     async def notify_waiting_users(self):
#         # Send the updated waiting list only to waiting users
#         waiting_ids = list(waiting_users)
#         for user_id in waiting_ids:
#             channel_name = waiting_channels.get(user_id)
#             if channel_name:
#                 await self.channel_layer.send(channel_name, {
#                     'type': 'send_waiting_list',
#                     'waiting_ids': waiting_ids,
#                 })
