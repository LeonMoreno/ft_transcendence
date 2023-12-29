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
    @action(detail=True, methods=["put"])
    def accept_game(self, request, pk=None):
        game = self.get_object()

        # FIXME
        # user_id = get_user_id(request)
        # if request.user == game.invitee.id

        # Check if the user making the request is the invitee
        # Might have to modify using token later
        # Or ignore the permission, which can be done by anyone
        # if request.user == game.invitee:
        # Accept the game, update the invitation status
        game.invitationStatus = "ACCEPTED"
        game.save()
        serializer = self.get_serializer(game)
        return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(
            {"error": "You are not the invitee of this game."},
            status=status.HTTP_403_FORBIDDEN,
        )

    @action(detail=True, methods=["put"])
    def reject_game(self, request, pk=None):
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

    # Add more custom actions or overrides for other CRUD operations as needed
