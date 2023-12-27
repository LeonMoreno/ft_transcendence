from rest_framework import viewsets
from .models import CustomUser, FriendRequest
from .serializers import (
    UserSerializer,
    FriendRequestSerializer,
    FriendRequestRelationSerializer,
)
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from rest_framework_simplejwt.tokens import AccessToken


class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer


class FriendRequestViewSet(viewsets.ModelViewSet):
    # queryset = FriendRequest.objects.all()
    # serializer_class = FriendRequestSerializer

    @csrf_exempt
    def friend_request_me(request):
        authorization_header = request.headers.get("Authorization", "").split()
        jwt = authorization_header[1]
        access_token = AccessToken(jwt)
        user_id = access_token["user_id"]

        if request.method == "GET":
            my_friend_requests = FriendRequest.objects.filter(
                to_user=user_id
            ).select_related()
            serializer = FriendRequestRelationSerializer(my_friend_requests, many=True)
            return JsonResponse(serializer.data, safe=False)

    @csrf_exempt
    def friend_request_list(request):
        if request.method == "GET":
            friend_requests = FriendRequest.objects.select_related()
            serializer = FriendRequestRelationSerializer(friend_requests, many=True)
            return JsonResponse(serializer.data, safe=False)

        elif request.method == "POST":
            authorization_header = request.headers.get("Authorization", "").split()
            jwt = authorization_header[1]
            access_token = AccessToken(jwt)
            user_id = access_token["user_id"]

            data = JSONParser().parse(request)
            data["from_user"] = user_id

            serializer = FriendRequestSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return JsonResponse(serializer.data, status=201)
            return JsonResponse(serializer.errors, status=400)

    @csrf_exempt
    def friend_request_detail(request, pk):
        """
        Retrieve, update or delete a code Friend Request.
        """
        try:
            friend_request = FriendRequest.objects.get(pk=pk)
        except friend_request.DoesNotExist:
            return HttpResponse(status=404)

        if request.method == "GET":
            serializer = FriendRequestRelationSerializer(friend_request)
            return JsonResponse(serializer.data)

        elif request.method == "PUT":
            serializer = FriendRequestSerializer(friend_request)

            data = JSONParser().parse(request)
            intent = data["intent"]
            if intent == "confirm":
                print(intent)
                # from_user and to_user are befriended
                # delete the friendRequest
                # serializer = FriendRequestSerializer(friend_request, data=data)
                return JsonResponse(serializer.data, status=200)

        elif request.method == "DELETE":
            friend_request.delete()
            return HttpResponse(status=204)