"""
ASGI config for cabraping project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.1/howto/deployment/asgi/
"""

# import os
# from channels.routing import ProtocolTypeRouter, URLRouter
# from django.core.asgi import get_asgi_application

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cabraping.settings')

# application = ProtocolTypeRouter({
#     "http": get_asgi_application(),
#     # Puedes agregar rutas de websocket aquí
# })

# myproject/asgi.py
import os
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from chat.routing import websocket_urlpatterns as chat_websocket_urlpatterns
from game.routing import websocket_urlpatterns as game_websocket_urlpatterns
from globalwc.routing import websocket_urlpatterns as globalwc_websocket_urlpatterns
from users.routing import websocket_urlpatterns as users_websocket_urlpatterns

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cabraping.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            chat_websocket_urlpatterns +
            game_websocket_urlpatterns +
            users_websocket_urlpatterns +
            globalwc_websocket_urlpatterns
        )
    ),
})