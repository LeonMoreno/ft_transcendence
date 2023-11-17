# chat/routing.py
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/chat/$', consumers.MyWebSocketConsumerChat.as_asgi()),
    re_path(r'ws/game/$', consumers.MyWebSocketConsumerGame.as_asgi()),
]