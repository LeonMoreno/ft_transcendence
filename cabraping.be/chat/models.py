import uuid
from django.conf import settings
from django.db import models
from users.models import CustomUser

# Create your models here.

class Channel(models.Model):
    id = models.CharField(max_length=255, primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='owned_channels', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    ownerId = models.CharField(max_length=255)
    status = models.CharField(max_length=255)
    hash = models.CharField(max_length=255, null=True, blank=True)
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='channels')