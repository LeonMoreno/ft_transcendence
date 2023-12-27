"""cabraping URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

# from django.urls import include, path
# from rest_framework.routers import DefaultRouter
# from users.views import UserViewSet

# router = DefaultRouter()
# router.register(r'users', UserViewSet)

# urlpatterns = [
#     # ... tus otras URLs
#     path('api/', include(router.urls)),
# ]
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from users.views import FriendRequestViewSet, UserViewSet

from django.urls import path
from rest_framework_simplejwt import views as jwt_views


router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    # ... tus otras URLs
    path('api/', include(router.urls)),
    path("api/friend_requests/me", FriendRequestViewSet.friend_request_me),
    path("api/friend_requests/", FriendRequestViewSet.friend_request_list),
    path("api/friend_requests/<int:pk>/", FriendRequestViewSet.friend_request_detail),
    path('api/token/', jwt_views.TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
]
