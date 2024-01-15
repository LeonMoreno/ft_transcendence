from rest_framework import serializers
from .models import Channel, CustomUser
from django.contrib.auth import get_user_model



class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'firstName', 'lastName']  # Ajusta los campos según necesites

class ChannelSerializer(serializers.ModelSerializer):
    owner = CustomUserSerializer(read_only=True)
    admins = CustomUserSerializer(read_only=True, many=True)
    members = CustomUserSerializer(read_only=True, many=True)

    class Meta:
        model = Channel
        fields = ['id', 'name', 'owner', 'admins', 'members', 'status', 'password', 'createdAt', 'updatedAt']
        # fields = ['id', 'name' 'owner', 'admins', 'members', 'createdAt', 'updatedAt']

User = get_user_model()

class ChannelCreateSerializer(serializers.ModelSerializer):

    owner = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.all())
    admins = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.all(), many=True)
    members = serializers.SlugRelatedField(slug_field='username', queryset=User.objects.all(), many=True)

    class Meta:
        model = Channel
        fields = ['owner', 'name', 'admins', 'members', 'status', 'password']

    def validate(self, data):
        # if data['owner'] in data['members']:
            # raise serializers.ValidationError("El dueño no puede ser un participante.")
        if len(data['members']) < 1:
            raise serializers.ValidationError("Debe haber al menos un participante.")
        if data['status'] == 'private' and 'password' not in data:
            raise serializers.ValidationError("Se requiere una contraseña para los canales privados.")
        return data