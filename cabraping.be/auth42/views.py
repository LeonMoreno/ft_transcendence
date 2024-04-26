# Example usage:
UID = "u-s4t2ud-42ac1836e7066a999c4a59ecc775ff92cabdf600ea8123ee418ebc32e4a41739"
SECRET = "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"
TOKEN_URL = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-42ac1836e7066a999c4a59ecc775ff92cabdf600ea8123ee418ebc32e4a41739&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2F&response_type=code'

HTTP_PROTOCOL = 'https://'
APP42_DOMAIN = 'api.intra.42.fr'
APP42_AUTH = '/oauth2/auth'
APP42_OAUTH_REDIRECT = "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-42ac1836e7066a999c4a59ecc775ff92cabdf600ea8123ee418ebc32e4a41739&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2F&response_type=code"

from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from django.shortcuts import render
from django.shortcuts import redirect


#  Create a url will return the access autorisation_code
def api_view(request):
    api_url =   'https://api.intra.42.fr/oauth/authorize' + \
                '?client_id=' + "u-s4t2ud-42ac1836e7066a999c4a59ecc775ff92cabdf600ea8123ee418ebc32e4a41739" + \
                '&redirect_uri=' + "https://localhost:8080" + \
                '&response_type=code'

    return redirect(api_url)

#  Create a url will return the access token link
def get_access_token(autorization_code):
    url   = HTTP_PROTOCOL + \
            APP42_DOMAIN + \
            "/oauth/token"
                
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
    url = HTTP_PROTOCOL + \
          APP42_DOMAIN + \
          "/v2/me/"
    return (url)