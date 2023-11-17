from django.urls import path
from .consumers import MyWebSocketConsumer
from .game import MyWebSocketConsumerGame

from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
# from myapp.consumers import MyWebSocketConsumer


websocket_urlpatterns = [
    path('ws/chat/', MyWebSocketConsumer.as_asgi()),
    path('ws/game/', MyWebSocketConsumerGame.as_asgi()),
]

application = ProtocolTypeRouter({
    'websocket': URLRouter(websocket_urlpatterns),
})
