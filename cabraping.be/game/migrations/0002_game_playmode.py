# Generated by Django 4.2.7 on 2024-06-13 19:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='game',
            name='playMode',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
