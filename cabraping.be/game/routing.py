# chat/routing.py
from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/game/<int:game_id>/', consumers.GameConsumer.as_asgi()),
]


# from django.urls import path
# from ..chat.consumers import MyWebSocketConsumer, MyWebSocketConsumerGame

# websocket_urlpatterns = [
#     path('ws/chat/', MyWebSocketConsumer.as_asgi()),
#     path('ws/game/', MyWebSocketConsumerGame.as_asgi()),
# ]