# Generated by Django 4.1 on 2024-02-14 01:09

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='channel',
            name='admins',
        ),
    ]
