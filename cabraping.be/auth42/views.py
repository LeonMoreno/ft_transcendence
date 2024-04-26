from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from django.shortcuts import render
from django.shortcuts import redirect
import os

UID = os.getenv('UID')
SECRET = os.getenv('SECRET')

#  Create a url will return the access autorisation_code
def api_view(request):
    api_url =   'https://api.intra.42.fr/oauth/authorize' + \
                '?client_id=' + UID + \
                '&redirect_uri=' + "https://localhost:8080" + \
                '&response_type=code'

    return redirect(api_url)

#  Create a url will return the access token link
def get_access_token(autorization_code):
    url   = "https://api.intra.42.fr/oauth/token"
                
    client_id     = UID
    client_secret = SECRET
    
    data          = '?grant_type=authorization_code' + \
                    '&client_id=' + client_id + \
                    '&client_secret=' + client_secret + \
                    '&code=' + autorization_code + \
                    '&redirect_uri=' + "https://localhost:8080/"
            
    return (url + data)
    
#  Create a url will return the public data of the user from the api
def get_api_data():
    url = "https://api.intra.42.fr/v2/me/"
    return (url)