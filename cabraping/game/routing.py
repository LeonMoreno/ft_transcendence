# chat/routing.py
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/game/$', consumers.MyWebSocketConsumerGame.as_asgi()),
]


# from django.urls import path
# from ..chat.consumers import MyWebSocketConsumer, MyWebSocketConsumerGame

# websocket_urlpatterns = [
#     path('ws/chat/', MyWebSocketConsumer.as_asgi()),
#     path('ws/game/', MyWebSocketConsumerGame.as_asgi()),
# ]
