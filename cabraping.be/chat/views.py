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
    def post(self, request, *args, **kwargs):
        serializer = ChannelCreateSerializer(data=request.data)
        print("\n ->")
        print(serializer.is_valid())
        if serializer.is_valid():
            name = serializer.validated_data.get('name')
            members = serializer.validated_data.get('members')

            print("-->")
            print(Channel.objects.filter(members__in=members).exists())
            print("name:", name)
            print("members:", members)
            print(Channel)
            # Channel.objects.filter(name=name, members__in=members).exists()
            if Channel.objects.filter(members__in=members).exists() == False:
                print("***> error")
                return Response({"error": "A channel with this name and members already exists."}, status=status.HTTP_400_BAD_REQUEST)

            print("---> Pase el if :")
            serializer.save()
            print("---> Create :", name)
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
        return Channel.objects.filter(members__id=user_id)