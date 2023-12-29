from django.db import models
from django.contrib.auth.models import AbstractUser
# from django.utils.translation import ugettext_lazy as _
from django.utils.translation import gettext_lazy as _
from django.utils import timezone


# class User(AbstractUser):
class CustomUser(AbstractUser):
    # Los campos adicionales basados en el esquema
    ftId = models.CharField(max_length=100, blank=True, null=True)
    nickname = models.CharField(max_length=100, blank=True)
    firstName = models.CharField(_('first name'), max_length=150, blank=True)
    lastName = models.CharField(_('last name'), max_length=150, blank=True)
    avatarImageURL = models.URLField(blank=True, null=True)
    status = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(_('email address'), unique=True)
    # Suponiendo que hay un modelo Channel y un modelo Game relacionado
    # channelsAsOwner = models.ManyToManyField('Channel', related_name='owned_by')
    # channelsAsMember = models.ManyToManyField('Channel', related_name='member')
    # channelsAsAdmin = models.ManyToManyField('Channel', related_name='administered_by')
    # games = models.ManyToManyField('Game', related_name='games')
    # gamesAsInviter = models.ManyToManyField('Game', related_name='invitations_sent')
    # gamesAsInvitee = models.ManyToManyField('Game', related_name='invitations_received')
    # gamesAsWinner = models.ManyToManyField('Game', related_name='won_games')
    updatedAt = models.DateTimeField(auto_now=True)
    createdAt = models.DateTimeField(auto_now_add=True, default=timezone.now)

    def __str__(self):
        return self.username
    
    def games_as_inviter(self):
        return self.gamesAsInviter.all()

    def games_as_invitee(self):
        return self.gamesAsInvitee.all()


class FriendRequest(models.Model):
    from_user = models.ForeignKey(
        CustomUser, related_name="from_user", on_delete=models.CASCADE 
    )
    to_user = models.ForeignKey(
        CustomUser, related_name="to_user", on_delete=models.CASCADE
    )