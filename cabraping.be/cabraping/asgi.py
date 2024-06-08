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
from tournament.routing import websocket_urlpatterns as tournament_websocket_urlpatterns # rachel - check if needed, given the two lines below
from globalwc.routing import websocket_urlpatterns as globalwc_websocket_urlpatterns
from users.routing import websocket_urlpatterns as users_websocket_urlpatterns

# from globalwc.middleware import JWTAuthMiddleware  # Import the custom middleware
from cabraping.middleware import JWTAuthMiddlewareStack  # Import the custom middleware
from channels.auth import AuthMiddlewareStack

import globalwc.routing


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cabraping.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket":
        JWTAuthMiddlewareStack(
            URLRouter(
            chat_websocket_urlpatterns +
            game_websocket_urlpatterns +
            tournament_websocket_urlpatterns + # rachel - check if needed, given the two lines below
            users_websocket_urlpatterns +
            globalwc_websocket_urlpatterns
            )
    ),
})