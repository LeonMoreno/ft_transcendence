# global/routing.py

from django.urls import path
from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/notifications/(?P<user_id>\w+)/$', consumers.NotificationConsumer.as_asgi()),

]


# websocket_urlpatterns = [
#     path('ws/notifications/', consumers.NotificationConsumer.as_asgi()),
# ]
