from django.urls import include, path
from rest_framework.routers import DefaultRouter
from users.views import FriendRequestViewSet, UserViewSet
from game.views import GameViewSet

from django.urls import path
from rest_framework_simplejwt import views as jwt_views


router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r"games", GameViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path("api/friend_requests/me", FriendRequestViewSet.friend_request_me),
    path("api/friend_requests/", FriendRequestViewSet.friend_request_list),
    path("api/friend_requests/<int:pk>/", FriendRequestViewSet.friend_request_detail),
    path('api/token/', jwt_views.TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
]
