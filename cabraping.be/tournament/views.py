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
    @transaction.atomic
    def start_tournament(self, request, pk=None):
        tournament = self.get_object()
        participants = list(tournament.participants.all())
        
        if len(participants) != 4:
            return Response({'error': 'Tournament must have exactly 4 participants.'}, status=400)

        semifinal1 = Match.objects.create(tournament=tournament, participant1=participants[0], participant2=participants[1])
        semifinal2 = Match.objects.create(tournament=tournament, participant1=participants[2], participant2=participants[3])
        tournament.status = 'in_progress'
        tournament.save()

        # rachel - call Jonathan's remote player module here

        return Response({'message': 'Tournament started. Semifinals are set up.'})


    def progress_tournament(self, tournament):
        matches = Match.objects.filter(tournament=tournament)
        completed_matches = matches.filter(winner__isnull=False)
        
        if completed_matches.count() == 2:
            participant_wins = Participant.objects.filter(
                tournament=tournament
            ).annotate(
                wins=Count('match_winner')
            ).order_by('-wins')

            finalists = list(participant_wins)[:4]
            final = Match.objects.create(tournament=tournament, participant1=finalists[0], participant2=finalists[1])
            tournament.status = 'Final'
            tournament.save()
        
        elif completed_matches.count() == 3:
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
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        data = request.data
        creator = request.user  # Assuming the user is authenticated
        tournament = Tournament.objects.create(name=data['name'])
        participant = Participant.objects.create(user=creator, tournament=tournament, received_invite=True, accepted_invite=True)  # Create a participant
        tournament.tournament_participants.add(participant)  # Add the participant to the tournament
        tournament.save()  # Save the tournament after adding the participant
        serializer = self.get_serializer(tournament)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ParticipantViewSet(viewsets.ModelViewSet):
    queryset = Participant.objects.all()
    serializer_class = ParticipantSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        tournament_id = request.data.get('tournament')
        tournament = get_object_or_404(Tournament, pk=tournament_id)
        if tournament.participants.count() >= 4:
            return Response({'error': 'Tournament already has 4 participants.'}, status=status.HTTP_400_BAD_REQUEST)
        
        participant = Participant.objects.create(user=request.user, tournament=tournament)
        serializer = self.get_serializer(participant)
        return Response({'id': participant.id, **serializer.data}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='invite')
    def invite_participant(self, request, pk=None):
        participant = self.get_object()
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'tournament_{participant.tournament.id}',
            {
                'type': 'send_update',
                'participants': ParticipantSerializer(participant.tournament.tournament_participants.all(), many=True).data
            }
        )
        async_to_sync(channel_layer.group_send)(
            f'user_{participant.myUser.id}', 
            {
                'type': 'send_tournament_invitation',
                'tournament_name': participant.tournament.name,
                'message': f"You have been invited to join the tournament {participant.tournament.name}! Do you think you have what it takes to win the prestigious Chèvre Verte Award?",
                'user_id': participant.myUser.id,
                'user_name': participant.user.username,
                'dest_user_id': request.myUser.id,
                'tournament_id': participant.tournament.id
            }
        )
        participant.received_invite = True
        participant.save()
        return Response({'message': f'Invitation successfully sent to {participant.user.username} for {participant.tournament.name}'})

    #@action(detail=False, methods=['GET'], url_path='status')
    #def get_participants_status(self, request):
    #    tournament_id = request.query_params.get('tournament_id')
    #    participants = self.queryset.filter(tournament_id=tournament_id)
    #    serializer = self.get_serializer(participants, many=True)
    #    return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def status(self, request):
        tournament_id = request.query_params.get('tournament_id')
        if not tournament_id:
            return Response({'error': 'Tournament ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            tournament = Tournament.objects.get(id=tournament_id)
        except Tournament.DoesNotExist:
            return Response({'error': 'Tournament not found'}, status=status.HTTP_404_NOT_FOUND)

        participants = Participant.objects.filter(tournament=tournament)
        data = [{'id': p.id, 'accepted_invite': p.accepted_invite} for p in participants]
        return Response(data)

    @action(detail=True, methods=['PATCH'], url_path='update-status')
    def update_status(self, request, pk=None):
        participant = self.get_object()
        status = request.data.get('status')
        if status:
            participant.status = status
            participant.save()
            return Response({'message': 'Status updated successfully'})
        return Response({'error': 'Status not provided'}, status=400)


class MatchViewSet(viewsets.ModelViewSet):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
