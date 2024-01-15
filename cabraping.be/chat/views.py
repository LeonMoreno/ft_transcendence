from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from .models import Channel

from .serializers import ChannelSerializer, ChannelCreateSerializer


class ChannelListView(ListAPIView):
    queryset = Channel.objects.all()
    serializer_class = ChannelSerializer

class ChannelCreateView(APIView):
    def post(self, request):
        serializer = ChannelCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserChannelsView(ListAPIView):
    serializer_class = ChannelSerializer

    def get_queryset(self):
        """
        This view should return a list of all channels
        for the user as determined by the userID portion of the URL.
        """
        user_id = self.kwargs['user_id']
        # return Channel.objects.filter(members__id=user_id) | Channel.objects.filter(admins__id=user_id) | Channel.objects.filter(owner__id=user_id)
        return Channel.objects.filter(members__id=user_id)