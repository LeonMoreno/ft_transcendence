from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Tournament, Match, Participant
from .serializers import TournamentSerializer, ParticipantSerializer, MatchSerializer
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.db.models import Count
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from users.models import CustomUser

class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['post'])
    def start_tournament(self, request, pk=None):
        tournament = self.get_object()
        participants = list(tournament.participants.all())
        
        if len(participants) != 4:
            return Response({'error': 'Tournament must have exactly 4 participants.'}, status=400)

        # Create a round-robin schedule
        matches = [
            (participants[i], participants[j])
            for i in range(len(participants))
            for j in range(i + 1, len(participants))
        ]

        for match in matches:
            Match.objects.create(tournament=tournament, participant1=match[0], participant2=match[1])

        return Response({'message': 'Round-robin phase started.'})

    def progress_tournament(self, tournament):
        matches = Match.objects.filter(tournament=tournament)
        completed_matches = matches.filter(winner__isnull=False)
        
        if completed_matches.count() == 6:  # All round-robin matches are completed
            participant_wins = Participant.objects.filter(
                tournament=tournament
            ).annotate(
                wins=Count('match_winner')
            ).order_by('-wins')

            semifinalists = list(participant_wins)[:4]
            semifinal1 = Match.objects.create(tournament=tournament, participant1=semifinalists[0], participant2=semifinalists[3])
            semifinal2 = Match.objects.create(tournament=tournament, participant1=semifinalists[1], participant2=semifinalists[2])
            tournament.status = 'Semifinals'
            tournament.save()
        
        elif completed_matches.count() == 8:  # Semifinals are completed
            semifinal_winners = [
                match.winner for match in completed_matches.order_by('-id')[:2]
            ]
            final_match = Match.objects.create(tournament=tournament, participant1=semifinal_winners[0], participant2=semifinal_winners[1])
            tournament.status = 'Finals'
            tournament.save()
        
        elif completed_matches.count() == 9:  # Final match completed
            final_match = completed_matches.latest('id')
            tournament.champion = final_match.winner
            tournament.status = 'Completed'
            tournament.save()
            self.present_trophy(final_match.winner)

    @action(detail=True, methods=['post'], url_path='update-match')
    def update_match(self, request, pk=None):
        match_id = request.data.get('match_id')
        winner_id = request.data.get('winner_id')
        match = get_object_or_404(Match, pk=match_id)
        winner = get_object_or_404(Participant, pk=winner_id)
        match.winner = winner
        match.save()
        self.progress_tournament(match.tournament)
        return Response({'message': f'Match {match_id} updated with winner.'})

    @action(detail=True, methods=['GET'], url_path='status')
    def get_status(self, request, pk=None):
        tournament = self.get_object()
        return Response({'status': tournament.status})

    @action(detail=True, methods=['GET'], url_path='results')
    def tournament_results(self, request, pk=None):
        tournament = self.get_object()
        if tournament.champion:
            return Response({'winner': {'name': tournament.champion.username}})
        return Response({'message': 'No winner declared yet'}, status=status.HTTP_404_NOT_FOUND)

    def present_trophy(self, winner_participant):
        winner_user = winner_participant.user
        winner_user.trophies += 1
        winner_user.has_chevre_verte_award = True
        winner_user.save()

class ParticipantViewSet(viewsets.ModelViewSet):
    queryset = Participant.objects.all()
    serializer_class = ParticipantSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        tournament_id = request.data.get('tournament')
        tournament = get_object_or_404(Tournament, pk=tournament_id)
        if tournament.participants.count() >= 4:
            return Response({'error': 'Tournament already has 4 participants.'}, status=status.HTTP_400_BAD_REQUEST)
        
        return super(ParticipantViewSet, self).create(request, *args, **kwargs)

    @action(detail=True, methods=['post'], url_path='invite-participant')
    def invite_participant(self, request, pk=None):
        participant = self.get_object()
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'chat_{participant.user.id}',
            {
                'type': 'send_tournament_invitation',
                'tournament_name': participant.tournament.name
            }
        )
        participant.received_invite = True
        participant.save()
        return Response({'message': f'Invitation sent successfully to {participant.user.username} for {participant.tournament.name}'})

class MatchViewSet(viewsets.ModelViewSet):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
