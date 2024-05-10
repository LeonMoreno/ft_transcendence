
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.shortcuts import render, redirect
from django.http import JsonResponse
import requests
from dotenv import load_dotenv
import os

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


def reset_homepage(request):
        
    authorization_code = request.GET.get('code', None)
    if (authorization_code):
        token_code = requests.post(get_access_token(authorization_code), timeout=10)
        access_token = token_code.json()['access_token']
        headers = {'Authorization': 'Bearer ' + access_token}
        url = get_api_data()
        #This request is to get the user data
        user_data = requests.get(url, headers=headers, timeout=10)
    
    return render(request, 'master.html')