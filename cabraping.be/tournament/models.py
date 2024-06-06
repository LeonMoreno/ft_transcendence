from django.db import models
from users.models import CustomUser
from django.contrib.auth import get_user_model

User = get_user_model()

class Tournament(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    )
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    participants = models.ManyToManyField(User, related_name='tournaments')
    champion = models.ForeignKey(CustomUser, related_name='won_tournaments', null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return self.name

class Participant(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    tournament = models.ForeignKey(Tournament, related_name='tournament_participants', on_delete=models.CASCADE)
    received_invite = models.BooleanField(default=False)
    accepted_invite = models.BooleanField(default=False)

class Match(models.Model):
    tournament = models.ForeignKey(Tournament, related_name='matches', on_delete=models.CASCADE)
    participant1 = models.ForeignKey(Participant, related_name='matches_as_participant1', null=True, on_delete=models.SET_NULL)
    participant2 = models.ForeignKey(Participant, related_name='matches_as_participant2', null=True, on_delete=models.SET_NULL)
    winner = models.ForeignKey(Participant, related_name='won_matches', null=True, blank=True, on_delete=models.SET_NULL)
    next_match = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='previous_matches')
