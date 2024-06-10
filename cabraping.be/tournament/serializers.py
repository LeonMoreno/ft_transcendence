from rest_framework import serializers
from .models import Tournament, Participant, Match
from users.serializers import CustomUserSerializer
from users.models import CustomUser

class ParticipantSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer()

    class Meta:
        model = Participant
        fields = ['id', 'user', 'tournament', 'received_invite', 'accepted_invite']

class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = '__all__'

class TournamentSerializer(serializers.ModelSerializer):
    participants = ParticipantSerializer(source='tournament_participants', many=True, read_only=True)
    matches = MatchSerializer(many=True, read_only=True)

    class Meta:
        model = Tournament
        fields = '__all__'
