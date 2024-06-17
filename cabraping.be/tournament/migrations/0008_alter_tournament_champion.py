# Generated by Django 4.2.13 on 2024-06-10 07:47

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('tournament', '0007_alter_tournament_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tournament',
            name='champion',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='championships', to=settings.AUTH_USER_MODEL),
        ),
    ]
