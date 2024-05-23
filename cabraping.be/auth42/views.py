
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.shortcuts import render, redirect
from django.http import JsonResponse
import requests
from dotenv import load_dotenv
import os
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
import logging
from users.models import CustomUser, FriendRequest
from users.serializers import (
    UserSerializer,
    UserDataSerializer,
    MeDataSerializer,
    FriendRequestDataSerializer,
    FriendRequestSerializer,
)
from django.contrib.auth.models import User
from rest_framework_simplejwt.views import TokenObtainPairView

load_dotenv()

UID = os.getenv("UID")
SECRET = os.getenv("SECRET")


logger = logging.getLogger(__name__)

@api_view(['GET'])
def get_config(request):
    # Define the environment variables you want to expose
    config = {
        'UID': UID,
        'SECRET': SECRET,
        # Add more variables as needed
    }
    
    return JsonResponse(config)



#  Create a url will return the access autorisation_code
def redirect42(request):
    api_url =   'https://api.intra.42.fr/oauth/authorize' + \
                '?client_id=' + UID + \
                '&redirect_uri=' + "http%3A%2F%2Flocalhost%3A8080" + \
                '&response_type=code'
    return (redirect(api_url))

#  Create a url will return the access token link
def get_access_token(request, authorization_code):
    url   = "https://api.intra.42.fr/oauth/token"
                
    client_id     = UID
    client_secret = SECRET
    
    data          = '?grant_type=authorization_code' + \
                    '&client_id=' + client_id + \
                    '&client_secret=' + client_secret + \
                    '&code=' + authorization_code + \
                    '&redirect_uri=' + "http%3A%2F%2Flocalhost%3A8080"
            
    return (url + data)

    
#  Create a url will return the public data of the user from the api
def get_api_data():
    url = "https://api.intra.42.fr/v2/me/"
    return (url)

@csrf_exempt
def callback2(request):
    authorization_code = request.GET.get('code')
    if not authorization_code:
        return JsonResponse({'error': 'No authorization code provided'}, status=400)

    token_url = "https://api.intra.42.fr/oauth/token"
    redirect_uri = "http://localhost:8000/callback/"  # Frontend redirect URI
    client_id = UID  # Use your settings variable
    client_secret = SECRET  # Use your settings variable

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
        logger.error(f"Token request failed: {e}")
        return JsonResponse({'error': 'Failed to retrieve access token', 'details': str(e)}, status=500)

    response_data = response.json()
    access_token = response_data.get('access_token')

    logger.debug(f'Token exchange response: {response_data}')
    if not access_token:
        return JsonResponse({'error': 'Failed to retrieve access token', 'details': response_data}, status=400)

    try:
        user_info_response = requests.get('https://api.intra.42.fr/v2/me', headers={
            'Authorization': f'Bearer {access_token}'
        })
        user_info_response.raise_for_status()
    except requests.RequestException as e:
        logger.error(f"User info request failed: {e}")
        return JsonResponse({'error': 'Failed to retrieve user info', 'details': str(e)}, status=500)

    user_info = user_info_response.json()

    nickname = user_info.get("login")
    Id = user_info.get("id")
    password = user_info("id")
    firstName = user_info.get("first_name")
    lastName = user_info.get("last_name")
    avatarImageURL = user_info.get("image_url")  # Check the exact key for the image URL
    email = user_info.get("email")

    if not Id or not nickname:
        return JsonResponse({'error': 'Incomplete user info from Auth42'}, status=400)

    user_data = {
        'Id': Id,
        'username': nickname,
        'email': email,
        'password': password
    }

    serializer = UserSerializer(data=user_data)
    if serializer.is_valid():
        serializer.save()
        print("User created successfully")
    else:
        print("User creation failed:", serializer.errors)
    logger.debug(f'User info: {user_info}')

    TokenObtainPairView(nickname, password)
    frontend_redirect_url = "http://localhost:8080"
    return redirect(frontend_redirect_url)
    # For debugging purposes, return the user_info JSON response directly
    #return JsonResponse(user_info)

import json
from django.conf import settings
from django.contrib.auth import authenticate, login
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.tokens import RefreshToken
import requests
import logging
from users.models import CustomUser
from users.serializers import UserSerializer

logger = logging.getLogger(__name__)

@csrf_exempt
def callback(request):
    authorization_code = request.GET.get('code')
    if not authorization_code:
        return JsonResponse({'error': 'No authorization code provided'}, status=400)

    token_url = "https://api.intra.42.fr/oauth/token"
    redirect_uri = "http://localhost:8000/callback/"  # Backend redirect URI
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
        logger.error(f"Token request failed: {e}")
        return JsonResponse({'error': 'Failed to retrieve access token', 'details': str(e)}, status=500)

    response_data = response.json()
    access_token = response_data.get('access_token')

    #logger.debug(f'Token exchange response: {response_data}')
    if not access_token:
        return JsonResponse({'error': 'Failed to retrieve access token', 'details': response_data}, status=400)

    try:
        user_info_response = requests.get('https://api.intra.42.fr/v2/me', headers={
            'Authorization': f'Bearer {access_token}'
        })
        user_info_response.raise_for_status()
    except requests.RequestException as e:
        logger.error(f"User info request failed: {e}")
        return JsonResponse({'error': 'Failed to retrieve user info', 'details': str(e)}, status=500)

    user_info = user_info_response.json()

    username = user_info.get("login")
    ftId = user_info.get("id")
    first_name = user_info.get("first_name")
    last_name = user_info.get("last_name")
    avatar_image_url = user_info.get("image_url")  # Verify this key
    email = user_info.get("email")
    password = str(ftId)  # Using ftId as the password for example purposes

    #logger.debug(f'User info received: {user_info}')

    if not ftId or not username:
        return JsonResponse({'error': 'Incomplete user info from Auth42'}, status=400)

    user, created = CustomUser.objects.get_or_create(
        username=username,
        defaults={
            'email': email,
            'ftId': ftId,
            'firstName': first_name,
            'lastName': last_name,
            'avatarImageURL': avatar_image_url,
            'password': CustomUser.objects.make_random_password()  # Set a temporary password
        }
    )

    if created:
        user.set_password(password)  # Set the real password
        user.save()
        logger.debug(f'User {username} created successfully.')
    else:
        user.email = email
        user.ftId = ftId
        user.firstName = first_name
        user.lastName = last_name
        user.avatarImageURL = avatar_image_url
        user.set_password(password)  # Update password if needed
        user.save()
        logger.debug(f'User {username} updated successfully.')

    # Authenticate the user using username and password
    user = authenticate(username=username, password=password)
    if user is not None:
        login(request, user)
        logger.debug(f'User {username} authenticated successfully.')
    else:
        logger.error(f'Authentication failed for user: {username}')
        return JsonResponse({'error': 'Authentication failed'}, status=401)

    # Generate JWT tokens for the user
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    logger.debug(f'JWT tokens generated for user: {username}')

    # Redirect to the frontend with the tokens
    frontend_redirect_url = f"http://localhost:8080?access_token={access_token}&refresh_token={refresh_token}"
    return redirect(frontend_redirect_url)
    # For debugging purposes, return the user_info JSON response directly
    #return JsonResponse(user_info)
