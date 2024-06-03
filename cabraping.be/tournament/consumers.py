import json
from channels.generic.websocket import AsyncWebsocketConsumer

class TournamentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.tournament_id = self.scope['url_route']['kwargs']['tournament_id']
        self.group_name = f'tournament_{self.tournament_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        event = data.get('event')
        
        # Route the message based on the event type
        if event == 'game_invite':
            await self.handle_game_invite(data)
        elif event == 'accepted_invite':
            await self.handle_accepted_invite(data)
        elif event == 'rejected_invite':
            await self.handle_rejected_invite(data)
        # Add other event handlers as needed

    async def handle_game_invite(self, data):
        # Handle the game invite event
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'game_invite',
                'message': data['message'],
                'user_name': data['user_name'],
                'tournament_name': data['tournament_name'],
                'event': 'game_invite'
            }
        )

    async def handle_accepted_invite(self, data):
        # Handle the accepted invite event
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'accepted_invite',
                'message': data['message'],
                'user_name': data['user_name'],
                'event': 'accepted_invite'
            }
        )

    async def handle_rejected_invite(self, data):
        # Handle the rejected invite event
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'rejected_invite',
                'message': data['message'],
                'user_name': data['user_name'],
                'event': 'rejected_invite'
            }
        )

    # Event handler functions that send messages to WebSocket clients
    async def game_invite(self, event):
        await self.send(text_data=json.dumps(event))

    async def accepted_invite(self, event):
        await self.send(text_data=json.dumps(event))

    async def rejected_invite(self, event):
        await self.send(text_data=json.dumps(event))

    # Receive message from tournament group
    async def tournament_message(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))

    async def send_update(self, event):
        participants = event['participants']
        await self.send(text_data=json.dumps({
            'participants': participants
        }))