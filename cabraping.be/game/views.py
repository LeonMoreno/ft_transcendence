from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from .models import Game
from .serializers import GameSerializer

# Create your views here.

class GameViewSet(viewsets.ModelViewSet):
    queryset = Game.objects.all()
    serializer_class = GameSerializer

    # Delete all games
    @action(detail=False, methods=["delete"])
    def delete_all(self, request):
        self.get_queryset().delete()
        return Response(status=204)

    # Accept game as the invitee
    # /api/games/:gameId/accept_game/`
    @action(detail=True, methods=["put"])
    def accept_game(self, request, pk=None):
        game = self.get_object()
        # Check if the user making the request is the invitee
        if request.user == game.invitee:
            game.invitationStatus = "ACCEPTED"
            game.save()
            serializer = self.get_serializer(game)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(
            {"error": "You are not the invitee of this game."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # /api/games/:gameId/reject_game/`
    @action(detail=True, methods=["put"])
    def reject_game(self, request):
        game = self.get_object()

        if request.user == game.invitee:
            game.invitationStatus = "REJECTED"
            game.save()
            serializer = self.get_serializer(game)
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(
            {"error": "You are not the invitee of this game."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # /api/games/:gameId/finish_game/`
    @action(detail=True, methods=["put"])
    def finish_game(self, request, pk=None):
        game = self.get_object()

        # Check if the user making the request is part of the game
        if request.user in [game.inviter, game.invitee]:
            data = request.data
            # Update the game with the provided data
            game.invitationStatus = "FINISHED"
            game.winner_id = data.get("winnerId", game.winner_id)
            game.inviterScore = data.get("inviterScore", game.inviterScore)
            game.inviteeScore = data.get("inviteeScore", game.inviteeScore)
            game.save()
            serializer = self.get_serializer(game)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(
            {"error": "You are not a participant of this game."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Add more custom actions or overrides for other CRUD operations as needed