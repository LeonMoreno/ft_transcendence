import json
import asyncio
import math

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer


class Game:
    def __init__(self, game_id):
        self.game_id = game_id
        self.left_paddle_x = 5  # Define the left paddle's x-coordinate
        self.left_paddle_y = 50
        self.right_paddle_x = 94  # Define the right paddle's x-coordinate
        self.right_paddle_y = 50
        self.ball_x = 50
        self.ball_y = 50
        angle = math.radians(35)  # Convert 30 degrees to radians
        self.ball_dx = math.cos(angle) * 0.5  # Adjust speed here
        self.ball_dy = math.sin(angle) * 0.5  # Adjust speed here
        self.left_score = 0
        self.right_score = 0
        self.winner = None
        self.players = {"left": None, "right": None}  # Track players
        self.loop_running = False  # Flag to indicate if the game loop is running

    def detect_collisions(self):
        # Check collision with left paddle
        if (
            self.ball_x <= self.left_paddle_x + 0.2  # Adjust collision margin
            and abs(self.left_paddle_y - self.ball_y) <= 10
        ):
            self.ball_x = (
                self.left_paddle_x + 1
            )  # Prevent ball from going inside paddle
            self.ball_dx *= -1

        # Check collision with right paddle
        if (
            self.ball_x >= self.right_paddle_x - 1  # Adjust collision margin
            and abs(self.right_paddle_y - self.ball_y) <= 10
        ):
            self.ball_x = (
                self.right_paddle_x - 1
            )  # Prevent ball from going inside paddle
            self.ball_dx *= -1

        # Check collision with top and bottom walls
        if self.ball_y <= 4 or self.ball_y >= 94:
            self.ball_dy *= -1

    def update_state(self):
        self.ball_x += self.ball_dx
        self.ball_y += self.ball_dy

        # Check and handle ball collisions with the paddles
        self.detect_collisions()

        # Handle boundary collisions with the field/canvas
        if self.ball_y <= 0 or self.ball_y >= 100:
            self.ball_dy *= -1

        # Handle scoring
        if self.ball_x <= 0:
            self.right_score += 1
            self.ball_x = 50
            self.ball_y = 50
        elif self.ball_x >= 100:
            self.left_score += 1
            self.ball_x = 50
            self.ball_y = 50

        # Check for winner
        if self.left_score == 3:
            self.winner = "left"
        elif self.right_score == 3:
            self.winner = "right"

    def move_paddle(self, side, dy):
        if side == "left":
            self.left_paddle_y += dy
        elif side == "right":
            self.right_paddle_y += dy

        # Ensure paddles stay within bounds
        self.left_paddle_y = max(0, min(self.left_paddle_y, 100))
        self.right_paddle_y = max(0, min(self.right_paddle_y, 100))

    def get_state(self):
        return {
            "left_paddle_y": self.left_paddle_y,
            "right_paddle_y": self.right_paddle_y,
            "ball_x": self.ball_x,
            "ball_y": self.ball_y,
            "left_score": self.left_score,
            "right_score": self.right_score,
            "winner": self.winner,
        }


class GameConsumer(AsyncWebsocketConsumer):
    games = {}  # temporary games list being played as a cache

    async def connect(self):
        self.game_id = self.scope["url_route"]["kwargs"]["game_id"]
        self.game_group_name = f"game_{self.game_id}"

        # Game loop for computation
        if self.game_id not in self.games:
            self.games[self.game_id] = Game(self.game_id)

        # Join game group for communication/connection on WebSocket
        await self.channel_layer.group_add(self.game_group_name, self.channel_name)

        await self.accept()

        print(f"Channel Name: {self.channel_name}")

        # Assign player to left or right paddle
        game = self.games[self.game_id]
        if game.players["left"] is None:
            game.players["left"] = self.channel_name
        elif game.players["right"] is None:
            game.players["right"] = self.channel_name

        # Notify the game group that a player joined
        await self.channel_layer.group_send(
            self.game_group_name,
            {
                "type": "game_state_message",
                "sender_channel_name": self.channel_name,
                "message": "A player joined the game",
            },
        )

        # Check if both players have joined
        if game.players["left"] and game.players["right"] and not game.loop_running:
            # Notify players that the game is starting
            game.loop_running = True  # Mark the game loop as running
            await self.channel_layer.group_send(
                self.game_group_name,
                {
                    "type": "game_state_message",
                    "message": "Both players have joined. The game is starting!",
                },
            )
            # Start the game loop
            asyncio.create_task(self.game_loop(self.game_id))

    async def disconnect(self, close_code):
        # Leave game group
        await self.channel_layer.group_discard(self.game_group_name, self.channel_name)

        # Pause the game / Remove the player from the game
        game = self.games[self.game_id]
        if game.players["left"] == self.channel_name:
            game.players["left"] = None
        elif game.players["right"] == self.channel_name:
            game.players["right"] = None

    # Receive message from WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        game = self.games[self.game_id]

        if "paddle_move" in data:
            if data["paddle_move"] == "up":
                game.move_paddle(data["side"], -5)  # y coordinate
            elif data["paddle_move"] == "down":
                game.move_paddle(data["side"], 5)

        state = game.get_state()

        await self.channel_layer.group_send(
            self.game_group_name,
            {
                "type": "game_state_message",
                "message": state,
            },
        )

    # Receive message from game group
    async def game_state_message(self, event):
        message = event["message"]

        # Send message to WebSocket
        await self.send(
            text_data=json.dumps(
                {
                    "message": message,
                }
            )
        )

    @staticmethod
    async def game_loop(game_id):
        game = GameConsumer.games.get(game_id)  # Not from database

        while True:
            await asyncio.sleep(1 / 60)  # 60 FPS

            if game.winner:
                state = game.get_state()
                channel_layer = get_channel_layer()
                await channel_layer.group_send(
                    f"game_{game_id}",
                    {"type": "game_state_message", "message": state},
                )
                break

            if game:
                game.update_state()
                state = game.get_state()
                channel_layer = get_channel_layer()
                await channel_layer.group_send(
                    f"game_{game_id}",
                    {"type": "game_state_message", "message": state},
                )