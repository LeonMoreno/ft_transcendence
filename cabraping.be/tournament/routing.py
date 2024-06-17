# tournament/routing.py
from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/tournament/<int:tournament_id>/', consumers.TournamentConsumer.as_asgi()),
]
