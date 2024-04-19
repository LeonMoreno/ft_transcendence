# from django.urls import include, path
# from rest_framework.routers import DefaultRouter
# # from users.views import UserViewSet
# from users.views import UserViewSet, FriendRequestViewSet, MeViewSet

# from game.views import GameViewSet

# from django.contrib import admin
# from django.urls import path
# from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView



# router = DefaultRouter()
# router.register(r"users", UserViewSet)
# router.register(r"games", GameViewSet)

# urlpatterns = [
#     path('admin/', admin.site.urls),
#     # ... tus otras URLs
#     path('api/', include(router.urls)),
#     # path('api/token/', jwt_views.TokenObtainPairView.as_view(), name='token_obtain_pair'),
#     # path('api/token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
#     # path("api/", include(router.urls)),
#     path("api/me/", MeViewSet.as_view(), name="my-profile"),
#     path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
#     path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
#     path("api/friend_requests/me", FriendRequestViewSet.friend_request_me),
#     path("api/friend_requests/", FriendRequestViewSet.friend_request_list),
#     path("api/friend_requests/<int:pk>/", FriendRequestViewSet.friend_request_detail),
# ]


from django.urls import include, path
from rest_framework.routers import DefaultRouter
from users.views import UserViewSet, FriendRequestViewSet, MeViewSet
from game.views import GameViewSet
from tournament.views import TournamentViewSet, ParticipantViewSet, MatchViewSet

from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


router = DefaultRouter()
router.register(r"users", UserViewSet)
router.register(r"games", GameViewSet)
router.register(r"tournaments", TournamentViewSet)
router.register(r'participants', ParticipantViewSet)
router.register(r'matches', MatchViewSet)


from django.urls import path
from chat.views import ChannelListView, ChannelCreateView, UserChannelsView

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("api/", include(router.urls)),

    path('channels/', ChannelListView.as_view(), name='channel-list'),
    path('channels/create/', ChannelCreateView.as_view(), name='channel-create'),
    path('user-channels/<int:user_id>/', UserChannelsView.as_view(), name='user-channels'),

    path("api/me/", MeViewSet.as_view(), name="my-profile"),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/friend_requests/me", FriendRequestViewSet.friend_request_me),
    path("api/friend_requests/", FriendRequestViewSet.friend_request_list),
    path("api/friend_requests/<int:pk>/", FriendRequestViewSet.friend_request_detail),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)