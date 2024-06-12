
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import render, redirect
from django.http import JsonResponse
import requests, os, json
from dotenv import load_dotenv
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from users.models import CustomUser, FriendRequest
from users.serializers import (
    UserSerializer,
    UserDataSerializer,
    MeDataSerializer,
    FriendRequestDataSerializer,
    FriendRequestSerializer,
)
from django.contrib.auth.models import User
import logging

logger = logging.getLogger(__name__)

load_dotenv()

UID = os.getenv("UID")
SECRET = os.getenv("SECRET")
PW42 = os.getenv("PASSWORD_42")



def generate_jwt_for_user(user):
    refresh = RefreshToken.for_user(user)
    access_token = refresh.access_token

    return {
        'refresh': str(refresh),
        'access': str(access_token),
    }

def get_backend_url(request):
    host = request.get_host()
    return f"https://{host}"

@api_view(['GET'])
def get_config(request):
    # Define the environment variables you want to expose
    config = {
        'UID': UID,
        'SECRET': SECRET,
        # Add more variables as needed
    }
    return JsonResponse(config)

@api_view(['GET', 'POST'])
@csrf_exempt
def callback(request):
    authorization_code = request.GET.get('code')
    if not authorization_code:
        return Response({'error': 'No authorization code provided'}, status=status.HTTP_400_BAD_REQUEST)

    token_url = "https://api.intra.42.fr/oauth/token"
    redirect_uri = f"{get_backend_url(request)}/api/callback/"
    client_id = UID
    client_secret = SECRET

    data = {
        'grant_type': 'authorization_code',
        'client_id': client_id,
        'client_secret': client_secret,
        'code': authorization_code,
        'redirect_uri': redirect_uri,
    }

    try:
        response = requests.post(token_url, data=data)
        response.raise_for_status()
    except requests.RequestException as e:
        return Response({'error': 'Failed to retrieve access token1', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    response_data = response.json()
    access_token = response_data.get('access_token')

    if not access_token:
        return Response({'error': 'Failed to retrieve access token2', 'details': response_data}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user_info_response = requests.get('https://api.intra.42.fr/v2/me', headers={
            'Authorization': f'Bearer {access_token}'
        })
        user_info_response.raise_for_status()
    except requests.RequestException as e:
        return Response({'error': 'Failed to retrieve user info', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    user_info = user_info_response.json()
    username = user_info.get("login")
    ftId = user_info.get("id")
    first_name = user_info.get("first_name")
    last_name = user_info.get("last_name")
    avatar_image_url = user_info.get("image", {}).get("link")
    email = user_info.get("email")
    password = PW42

    if not ftId or not username:
        return Response("Error: Incomplete data from Auth42", status=status.HTTP_400_BAD_REQUEST)

    user_data = {
        "username": username,
        "email": email,
        "password": password,
        "first_name": first_name,
        "last_name": last_name,
        "avatarImageURL": avatar_image_url,
    }
    user = 0
    try:
        user = CustomUser.objects.get(email=email)
        # User already exists, do not create a new one
        logger.error(f'User already exists: {user}')
    except CustomUser.DoesNotExist:
        # User does not exist, create a new one
        logger.error('User does not exist, creating a new one...')

    serializer = UserSerializer(data=user_data)
    if serializer.is_valid():
        user = serializer.save()
        print("User created successfully")
    else:
        if user == 0:
            return redirect(f"{get_backend_url(request)}?creation_fail")

    if user != 0:
        token_response_data = generate_jwt_for_user(user)
        access_token = token_response_data.get('access')
        refresh_token = token_response_data.get('refresh')
        frontend_redirect_url = f"{get_backend_url(request)}?access_token={access_token}&refresh_token={refresh_token}"
        return redirect(frontend_redirect_url)

    return redirect(f"{get_backend_url(request)}")




