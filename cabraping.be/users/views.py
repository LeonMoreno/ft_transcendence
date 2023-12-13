from rest_framework import viewsets
from .models import CustomUser, FriendRequest
from .serializers import UserSerializer, FriendRequestSerializer
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser


class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer


class FriendRequestViewSet(viewsets.ModelViewSet):
    # queryset = FriendRequest.objects.all()
    # serializer_class = FriendRequestSerializer

    @csrf_exempt
    def friend_request_list(request):
        if request.method == "GET":  # ✅
            friend_requests = FriendRequest.objects.all()
            serializer = FriendRequestSerializer(friend_requests, many=True)
            return JsonResponse(serializer.data, safe=False)

        elif request.method == "POST":  # ✅
            data = JSONParser().parse(request)  # from Request Body as JSON
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

        if request.method == "GET":  # ✅
            serializer = FriendRequestSerializer(friend_request)
            return JsonResponse(serializer.data)

        elif request.method == "PUT":
            data = JSONParser().parse(request)
            serializer = FriendRequestSerializer(friend_request, data=data)
            if serializer.is_valid():
                serializer.save()
                return JsonResponse(serializer.data)
            return JsonResponse(serializer.errors, status=400)

        elif request.method == "DELETE":
            friend_request.delete()
            return HttpResponse(status=204)
