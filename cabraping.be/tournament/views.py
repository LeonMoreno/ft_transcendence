from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from .models import Tournament, Match, Participant
from .serializers import TournamentSerializer, ParticipantSerializer, MatchSerializer
from rest_framework.permissions import IsAuthenticated
from users.models import CustomUser
from django.db import transaction

class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['post'])
    def start_tournament(self, request, pk=None):
        tournament = self.get_object()
        participants = list(tournament.participants.all())
        
        if len(participants) == 4:
            Match.objects.create(tournament=tournament, participant1=participants[0], participant2=participants[1])
            Match.objects.create(tournament=tournament, participant1=participants[2], participant2=participants[3])
            return Response({'message': 'Tournament started.'})
        else:
            return Response({'error': 'Tournament must have exactly 4 participants.'}, status=400)

    @action(detail=True, methods=['post'], url_path='update-match')
    def update_match(self, request, pk=None):
        match_id = request.data.get('match_id')
        winner_id = request.data.get('winner_id')
        match = get_object_or_404(Match, pk=match_id, tournament_id=pk)
        winner = get_object_or_404(Participant, pk=winner_id, tournament_id=pk)
        match.winner = winner
        match.save()
        
        #automatically progresses the tournament after updating a match:
        self._progress_tournament(match.tournament)
        return Response({'message': f'Match {match_id} updated with winner.'})

    def _progress_tournament(self, tournament):
        matches = Match.objects.filter(tournament=tournament)
        completed_matches = matches.filter(winner__isnull=False)
        
        if len(completed_matches) == 2 and matches.count() == 2:
            #creates the final match:
            winners = [match.winner for match in completed_matches]
            Match.objects.create(tournament=tournament, participant1=winners[0], participant2=winners[1])
        elif len(completed_matches) == 3:
            final_match = completed_matches.latest('id')
            tournament.champion = final_match.winner 
            tournament.status = 'completed'  
            tournament.save()

            self._present_trophy(final_match.winner)

    def _present_trophy(self, winner_participant):
        winner_user = winner_participant.user
        winner_user.trophies += 1
        winner_user.has_chevre_verte_award = True
        winner_user.save()
        return Response({'message': f"Congratulations {winner_user.nickname}, you've won the Chèvre Verte Award!"})


class UserTrophyAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, nickname, format=None):
        user = CustomUser.objects.get(nickname=nickname)
        return Response({'nickname': user.nickname, 'has_chevre_verte_award': user.has_chevre_verte_award})

class ParticipantViewSet(viewsets.ModelViewSet):
    queryset = Participant.objects.all()
    serializer_class = ParticipantSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        tournament_id = request.data.get('tournament')
        if not tournament_id:
            return Response({'error': 'Tournament ID must be provided.'}, status=status.HTTP_400_BAD_REQUEST)
        
        tournament = get_object_or_404(Tournament, pk=tournament_id)
        participant_count = tournament.participants.count()
        
        if participant_count >= 4:
            return Response({'error': 'Tournament already has 4 participants.'}, status=status.HTTP_400_BAD_REQUEST)
        
        response = super(ParticipantViewSet, self).create(request, *args, **kwargs)
        participant = self.get_object()
        send_invitation_email(participant)  # use method that Jonathan will implement for game invitation
        return response

    @action(detail=True, methods=['post'], url_path='accept-invitation')
    def accept_invitation(self, request, pk=None): # maybe also use Jonathan's method?
        participant = self.get_object()
        participant.invitation_accepted = True
        participant.save()
        return Response({'message': 'Invitation accepted.'})

class MatchViewSet(viewsets.ModelViewSet):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer

#gpt's suggestions to optimize it:

#from django.shortcuts import get_object_or_404
#from rest_framework import viewsets, status
#from rest_framework.decorators import action
#from rest_framework.permissions import IsAuthenticated, IsAdminUser
#from rest_framework.response import Response
#from django.core.exceptions import PermissionDenied
#from django.db.models import Q
#from .models import Tournament, Match, Participant
#from .serializers import TournamentSerializer, MatchSerializer, ParticipantSerializer
#import logging

# Set up logging
#logger = logging.getLogger(__name__)

#class TournamentViewSet(viewsets.ModelViewSet):
#    queryset = Tournament.objects.all()
#    serializer_class = TournamentSerializer
#    permission_classes = [IsAuthenticated]

#    def get_permissions(self):
#        """
#        Instance-level permissions. Allows only organizers or admins to start and update tournaments.
#        """
#        if self.action in ['start_tournament', 'update_match']:
#            self.permission_classes = [IsAdminUser]  # Adjust as needed for organizers
#        return super(TournamentViewSet, self).get_permissions()

#    @action(detail=True, methods=['post'])
#    def start_tournament(self, request, pk=None):
#        tournament = self.get_object()
#        participants = tournament.participants.all()
#        if participants.count() != 4:
#            return Response({'error': 'Tournament must have exactly 4 participants.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Tournament logic here

#        return Response({'message': 'Tournament started successfully.'})

#    @action(detail=True, methods=['post'], url_path='update-match')
#    def update_match(self, request, pk=None):
        # Match update logic here
        
#        return Response({'message': 'Match updated successfully.'})

#    def _progress_tournament(self, tournament):
        # Tournament progression logic here

#    def _present_trophy(self, winner):
        # Trophy presentation logic here

# Other viewsets...
