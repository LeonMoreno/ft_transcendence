from rest_framework import viewsets
from .models import CustomUser, FriendRequest
from .serializers import (
    UserSerializer,
    FriendRequestDataSerializer,
    FriendRequestSerializer,
)
from rest_framework.decorators import action
from game.serializers import GameSerializer
from rest_framework.response import Response
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from rest_framework_simplejwt.tokens import AccessToken


class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

    @action(detail=True, methods=["get"])
    def games_as_inviter(self, request, pk=None):
        user = self.get_object()
        inviter_games = user.games_as_inviter.all()
        serializer = GameSerializer(inviter_games, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def games_as_invitee(self, request, pk=None):
        user = self.get_object()
        invitee_games = user.games_as_invitee.all()
        serializer = GameSerializer(invitee_games, many=True)
        return Response(serializer.data)


class FriendRequestViewSet(viewsets.ModelViewSet):
    # queryset = FriendRequest.objects.all()
    # serializer_class = FriendRequestSerializer

    @csrf_exempt
    def friend_request_me(request):
        authorization_header = request.headers.get("Authorization", "").split()
        jwt = authorization_header[1]
        access_token = AccessToken(jwt)
        user_id = access_token["user_id"]
        # user_id = get_user_id(request)

        if request.method == "GET":
            my_friend_requests = FriendRequest.objects.filter(
                to_user=user_id
            ).select_related()
            serializer = FriendRequestSerializer(my_friend_requests, many=True)
            return JsonResponse(serializer.data, safe=False)

    @csrf_exempt
    def friend_request_list(request):
        if request.method == "GET":
            friend_requests = FriendRequest.objects.select_related()
            serializer = FriendRequestSerializer(friend_requests, many=True)
            return JsonResponse(serializer.data, safe=False)

        elif request.method == "POST":
            authorization_header = request.headers.get("Authorization", "").split()
            jwt = authorization_header[1]
            access_token = AccessToken(jwt)
            user_id = access_token["user_id"]

            data = JSONParser().parse(request)
            data["from_user"] = user_id

            serializer = FriendRequestDataSerializer(data=data)
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
            serializer = FriendRequestSerializer(friend_request)
            return JsonResponse(serializer.data)

        elif request.method == "PUT":
            serializer = FriendRequestDataSerializer(friend_request)

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