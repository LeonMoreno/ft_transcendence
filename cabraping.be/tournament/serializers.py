from rest_framework import serializers
from .models import Tournament, Participant, Match
# from .models import Tournament, Match, Participant, Final

class ParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participant
        fields = '__all__'

class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = '__all__'

class TournamentSerializer(serializers.ModelSerializer):
    matches = MatchSerializer(many=True, read_only=True)

    class Meta:
        model = Tournament
        fields = '__all__'

#alternative:
#class FinalSerializer(serializers.ModelSerializer):
#    tournament = TournamentSerializer(many=False, read_only=True)

#    class Meta:
#        model = Final
#        fields = '__all__'