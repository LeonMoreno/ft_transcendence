# users/routing.py
from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/users/<int:user_id>/', consumers.UsersConsumer.as_asgi()),
]