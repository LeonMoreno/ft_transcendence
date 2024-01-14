from rest_framework.generics import ListAPIView
from .models import Channel
from .serializers import ChannelSerializer

class ChannelListView(ListAPIView):
    queryset = Channel.objects.all()
    serializer_class = ChannelSerializer
