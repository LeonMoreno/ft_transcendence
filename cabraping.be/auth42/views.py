
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
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

@api_view(['GET'])
@csrf_exempt
def callback(request):
    authorization_code = request.GET.get('code')
    if not authorization_code:
        return Response({'error': 'No authorization code provided'}, status=status.HTTP_400_BAD_REQUEST)

    token_url = "https://api.intra.42.fr/oauth/token"
    redirect_uri = f"{get_backend_url(request)}/api/callback/"
    client_id = UID
    client_secret = SECRET


    logger.error(token_url)
    logger.error(client_id)
    logger.error(client_secret)
    logger.error(redirect_uri)
    data = {
        'grant_type': 'authorization_code',
        'client_id': client_id,
        'client_secret': client_secret,
        'code': authorization_code,
        'redirect_uri': redirect_uri,
    }

    logger.error(data)
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

    logger.error(user_data)
    try:
        user_create_response = requests.post(
            f'{get_backend_url(request)}/api/users/',
            headers={'Content-Type': 'application/json'},
            json=user_data
        )
        user_create_response.raise_for_status()
    except requests.RequestException as e:
        return Response({'error': 'User creation failed', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    token_data = {
        "username": email,
        "password": password
    }

    try:
        token_response = requests.post(
            f'{get_backend_url(request)}/api/token/',
            json=token_data
        )
        token_response.raise_for_status()
    except requests.RequestException as e:
        return Response({'error': 'Failed to retrieve JWT tokens', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    token_response_data = token_response.json()
    access_token = token_response_data.get('access')
    refresh_token = token_response_data.get('refresh')

    frontend_redirect_url = f"{get_backend_url(request)}?access_token={access_token}&refresh_token={refresh_token}"

    return redirect(frontend_redirect_url)




