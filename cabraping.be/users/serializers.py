from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import FriendRequest

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class UserDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "friends"]


class MeDataSerializer(serializers.ModelSerializer):
    friends = UserDataSerializer(many=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "friends"]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["friends"] = UserDataSerializer(instance.friends, many=True).data
        return representation


class FriendRequestSerializer(serializers.ModelSerializer):
    from_user = UserSerializer()
    to_user = UserSerializer()

    class Meta:
        model = FriendRequest
        fields = ["id", "from_user", "to_user"]


class FriendRequestDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = FriendRequest
        fields = ["id", "from_user", "to_user"]
