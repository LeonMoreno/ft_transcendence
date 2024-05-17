
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
from django.contrib.auth import login, get_user_model

load_dotenv()

UID = os.getenv("UID")
SECRET = os.getenv("SECRET")


logger = logging.getLogger(__name__)

User = get_user_model()


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
def callback1(request):
    authorization_code = request.GET.get('code')
    if not authorization_code:
        return JsonResponse({'error': 'No authorization code provided'}, status=400)

    token_url = "https://api.intra.42.fr/oauth/token"
    redirect_uri = "http://localhost:8000/callback/"  # Frontend redirect URI
    client_id = UID
    client_secret = SECRET

    data = {
        'grant_type': 'authorization_code',
        'client_id': client_id,
        'client_secret': client_secret,
        'code': authorization_code,
        'redirect_uri': redirect_uri,
    }

    response = requests.post(token_url, data=data)
    response_data = response.json()
    access_token = response_data.get('access_token')

    logger.debug(f'Token exchange response: {response_data}')
    if response.status_code != 200:
        logger.error('Failed to retrieve access token', extra={'response_data': response_data})
        return JsonResponse({
            'error': 'Failed to retrieve access token',
            'response_data': response_data
    }, status=response.status_code)
    if not access_token:
        return JsonResponse({'error': 'Failed to retrieve access token'}, status=400)

    # Use access token to fetch user information
    user_info_response = requests.get('https://api.intra.42.fr/v2/me', headers={
        'Authorization': f'Bearer {access_token}'
    })
    user_info = user_info_response.json()

    nickname = user_info["login"]
    ftId = user_info["id"]
    firstName = user_info["first_name"]
    lastName = user_info["last_name"]
    avatarImageURL = user_info["image"]
    email = user_info["email"]

    user, created = User.objects.get_or_create(ftId=ftId, defaults={'nickname': nickname, 'email': email})
    if not created:
        user.nickname = nickname
        user.ftId = ftId
        user.firstName = firstName
        user.lastName = lastName
        user.avatarImageURL = avatarImageURL
        user.email = email
        user.save()

    # Here, handle user login or registration using the user_info
    # Example (pseudo-code, adjust based on your User model and authentication system):
    login(request, user)
    logger.debug(f'User info: {user_info}')

    # For debugging purposes, return the user_info JSON response directly
    #return JsonResponse(user_info)
    # Redirect to frontend with user information (or a token to identify the user)
    frontend_redirect_url = f"http://localhost:8080"
    return redirect(frontend_redirect_url)

@csrf_exempt
def callback(request):
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
    ftId = user_info.get("id")
    firstName = user_info.get("first_name")
    lastName = user_info.get("last_name")
    avatarImageURL = user_info.get("image_url")  # Check the exact key for the image URL
    email = user_info.get("email")

    if not ftId or not nickname:
        return JsonResponse({'error': 'Incomplete user info from Auth42'}, status=400)

    user, created = User.objects.get_or_create(ftId=ftId, defaults={
        'username': nickname,
        'email': email,
        'first_name': firstName,
        'last_name': lastName,
        'avatarImageURL': avatarImageURL,
    })

    if not created:
        user.nickname = nickname
        user.first_name = firstName
        user.last_name = lastName
        user.avatarImageURL = avatarImageURL
        user.email = email
        user.save()

    login(request, user)
    logger.debug(f'User info: {user_info}')

    frontend_redirect_url = "http://localhost:8080"
    return redirect(frontend_redirect_url)