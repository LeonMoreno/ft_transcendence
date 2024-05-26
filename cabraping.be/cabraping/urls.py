from django.urls import include, path
from rest_framework.routers import DefaultRouter
from users.views import UserViewSet, CurrentUserView, FriendRequestViewSet, MeViewSet, custom_login, custom_logout, check_user_status, check_user_exists
from game.views import GameViewSet
from tournament.views import TournamentViewSet, ParticipantViewSet, MatchViewSet
from django.contrib import admin
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from chat.views import ChannelListView, ChannelCreateView, UserChannelsView
from django.conf.urls import handler404
from cabraping.views import custom_404
from django.conf import settings
from django.conf.urls.static import static
from users.views import UserUpdate


router = DefaultRouter()
router.register(r"users", UserViewSet)
router.register(r"games", GameViewSet)
router.register(r"tournaments", TournamentViewSet)
router.register(r'participants', ParticipantViewSet)
router.register(r'matches', MatchViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', custom_login, name='custom_login'),
    path('api/logout/', custom_logout, name='custom_logout'),
    path("api/", include(router.urls)),
    path('channels/', ChannelListView.as_view(), name='channel-list'),
    path('channels/create/', ChannelCreateView.as_view(), name='channel-create'),
    path('user-channels/<int:user_id>/', UserChannelsView.as_view(), name='user-channels'),
    path('custom_404/', custom_404, name='custom_404'), # rachel debugging - remove
    #path("api/me/", MeViewSet.as_view(), name="my-profile"),
    # # path('api/me/', CurrentUserView.as_view(), name='current-user'),
    path("api/me/", MeViewSet.as_view(), name="my-profile"),
    path('api/me-full/', CurrentUserView.as_view(), name='current-user'),
    path('api/user/update/<int:pk>/', UserUpdate.as_view(), name='user-update'),

    path('api/users/<str:username>/exists/', check_user_exists, name='check_user_exists'),
    path('api/users/<str:username>/status/', check_user_status, name='check_user_status'),
   
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/friend_requests/me", FriendRequestViewSet.friend_request_me),
    path("api/friend_requests/", FriendRequestViewSet.friend_request_list),
    path("api/friend_requests/<int:pk>/", FriendRequestViewSet.friend_request_detail),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

handler404 = 'cabraping.views.custom_404'