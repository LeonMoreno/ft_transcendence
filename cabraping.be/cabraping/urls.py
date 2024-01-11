from django.urls import include, path
from rest_framework.routers import DefaultRouter
from users.views import UserViewSet, FriendRequestViewSet, MeViewSet
from game.views import GameViewSet

from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


router = DefaultRouter()
router.register(r"users", UserViewSet)
router.register(r"games", GameViewSet)

urlpatterns = [
    path("api/", include(router.urls)),
    path("api/me/", MeViewSet.as_view(), name="my-profile"),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/friend_requests/me", FriendRequestViewSet.friend_request_me),
    path("api/friend_requests/", FriendRequestViewSet.friend_request_list),
    path("api/friend_requests/<int:pk>/", FriendRequestViewSet.friend_request_detail),
]
