
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

load_dotenv()

img = "https://i.pinimg.com/736x/22/d8/71/22d8716223532ec51ea7b0ea471bbe67.jpg"

UID = os.getenv("UID")
SECRET = os.getenv("SECRET")
PW42 = os.getenv("PASSWORD_42")

# Helper function to get backend URL dynamically


def get_backend_url(request):
    scheme = request.scheme
    host = request.get_host()  # Get the full hostname
    return f"{scheme}://{host}"
    # return f"{scheme}://{host}:{port}"

def get_frontend_url(request):
    scheme = request.scheme
    host = request.get_host()  # Get the full hostname
    return f"{scheme}://{host}"

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
    redirect_uri =  f"{get_backend_url(request)}/api/callback/"  # Backend redirect URI
    client_id = UID
    client_secret = SECRET

    print(redirect_uri)
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

    username = user_info.get("login")
    ftId = user_info.get("id")
    first_name = user_info.get("first_name")
    last_name = user_info.get("last_name")
    avatar_image_url = user_info.get("image", {}).get("link")
    email = user_info.get("email")
    password = PW42  # Using ftId as the password for example purposes

    if not ftId or not username:
        return JsonResponse({'error': 'Incomplete user info from Auth42'}, status=400)

    user_data = {
        "username": username,
        "email": email,
        "password": password,
        "first_name": first_name,
        "last_name": last_name,
        "avatarImageURL": avatar_image_url,
    }

    # Make a POST request to create the user in the Django backend
    try:
        user_create_response = requests.post(
             f'{get_backend_url(request)}/api/users/',
            headers={'Content-Type': 'application/json'},
            json=user_data
        )
        user_create_response.raise_for_status()
    except requests.RequestException as e:
        print(f"User creation failed: {e}")   

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
        return JsonResponse({'error': 'Failed to retrieve JWT tokens', 'details': str(e)}, status=500)

    token_response_data = token_response.json()
    access_token = token_response_data.get('access')
    refresh_token = token_response_data.get('refresh')

    
    # For debugging purposes, return the user_info JSON response directly
    #return JsonResponse(user_info)
    # Redirect to the frontend with the tokens
    # frontend_redirect_url = f"http://localhost:8080?access_token={access_token}&refresh_token={refresh_token}&username={username}"
    frontend_redirect_url = f"{get_backend_url(request)}?access_token={access_token}&refresh_token={refresh_token}"

    return redirect(frontend_redirect_url)


