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
