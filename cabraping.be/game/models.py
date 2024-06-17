from django.db import models
from users.models import CustomUser


class Game(models.Model):
    playMode = models.IntegerField(null=True, blank=True)

    invitationStatus = models.CharField(max_length=50)

    inviter = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="games_as_inviter"
    )
    invitee = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="games_as_invitee"
    )

    inviterScore = models.IntegerField(null=True, blank=True)
    inviteeScore = models.IntegerField(null=True, blank=True)

    winner = models.ForeignKey(
        CustomUser,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="won_games",
    )

    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Game {self.id}"