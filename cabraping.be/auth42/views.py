
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.shortcuts import render, redirect
from django.http import JsonResponse
import requests, os, json, requests
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
from django.conf import settings


load_dotenv()

UID = os.getenv("UID")
SECRET = os.getenv("SECRET")

@api_view(['GET'])
def get_config(request):
    # Define the environment variables you want to expose
    config = {
        'UID': UID,
        'SECRET': SECRET,
        # Add more variables as needed
    }
    
    return JsonResponse(config)

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
        return JsonResponse({'error': 'Failed to retrieve access token', 'details': str(e)}, status=500)

    response_data = response.json()
    access_token = response_data.get('access_token')

    if not access_token:
        return JsonResponse({'error': 'Failed to retrieve access token', 'details': response_data}, status=400)

    try:
        user_info_response = requests.get('https://api.intra.42.fr/v2/me', headers={
            'Authorization': f'Bearer {access_token}'
        })
        user_info_response.raise_for_status()
    except requests.RequestException as e:
        return JsonResponse({'error': 'Failed to retrieve user info', 'details': str(e)}, status=500)

    user_info = user_info_response.json()

    username = user_info.get("email")
    ftId = user_info.get("id")
    first_name = user_info.get("first_name")
    last_name = user_info.get("last_name")
    avatar_image_url = user_info.get("image_url")  # Verify this key
    email = user_info.get("email")
    password = str(ftId)  # Using ftId as the password for example purposes

    if not ftId or not username:
        return JsonResponse({'error': 'Incomplete user info from Auth42'}, status=400)

    user_data = {
        'username': username,
        'email': email,
        'password': password,
        'firstName': first_name,
        'lastName': last_name,
        'avatarImageURL': avatar_image_url
    }

    # Make a POST request to create the user in the Django backend
    try:
        user_create_response = requests.post(
            'http://127.0.0.1:8000/api/users/',
            headers={'Content-Type': 'application/json'},
            data=json.dumps(user_data)
        )
        user_create_response.raise_for_status()
    except requests.RequestException as e:
        print(f"User creation failed: {e}")   

    token_data = {
        "username": username,
        "password": password
    }

    try:
        token_response = requests.post(
            'http://127.0.0.1:8000/api/token/',
            json=token_data
        )
        token_response.raise_for_status()
    except requests.RequestException as e:
        return JsonResponse({'error': 'Failed to retrieve JWT tokens', 'details': str(e)}, status=500)
    

    token_response_data = token_response.json()
    access_token = token_response_data.get('access')

    frontend_redirect_url = f"http://localhost:8080?access_token={access_token}"
    return redirect(frontend_redirect_url)
