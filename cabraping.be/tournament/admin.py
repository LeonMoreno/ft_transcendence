from django.contrib import admin
from .models import Tournament, Participant, Match

# Register your models here.

#display customization example:

#class TournamentAdmin(admin.ModelAdmin):
#    list_display = ('name', 'created_at')
#    search_fields = ('name',)

admin.site.register(Tournament)
admin.site.register(Participant)
admin.site.register(Match)