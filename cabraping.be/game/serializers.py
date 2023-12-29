from rest_framework import serializers
from .models import Game
from users.models import CustomUser
from users.serializers import UserDataSerializer


class GameSerializer(serializers.ModelSerializer):
    invitationStatus = serializers.CharField(default="PENDING")
    inviter = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())
    invitee = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(), required=False, allow_null=True
    )
    winner = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = Game
        fields = "__all__"

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["inviter"] = UserDataSerializer(instance.inviter).data
        representation["invitee"] = UserDataSerializer(instance.invitee).data
        representation["winner"] = UserDataSerializer(instance.winner).data
        return representation