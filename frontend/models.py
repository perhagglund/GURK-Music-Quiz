from pyexpat import model
from django.db import models


# Create your models here.
class Rooms(models.Model):
    room_id = models.CharField(max_length=16, primary_key=True)
    reverse = models.BooleanField()
    speed = models.DecimalField(max_digits=4, decimal_places=2)
    rounds = models.IntegerField()
    state = models.CharField(max_length=24, default='lobby')

    def __str__(self):
        return self.room_id


class Users(models.Model):
    id = models.IntegerField(primary_key=True)
    room = models.ForeignKey(Rooms, on_delete=models.CASCADE)
    nickname = models.CharField(max_length=255)
    color = models.IntegerField()
    eyes = models.IntegerField()
    mouth = models.IntegerField()
    leader = models.BooleanField()
    uniqueID = models.CharField(max_length=16)
    online = models.BooleanField()
    chosenSongs = models.IntegerField()
    ready = models.BooleanField()

class Songs(models.Model):
    room_id = models.CharField(max_length=16)
    song_id = models.CharField(max_length=16)
    artist = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    album = models.CharField(max_length=255)
    duration = models.IntegerField()
    user = models.ForeignKey(Users, on_delete=models.CASCADE)
    filelocation = models.CharField(max_length=255)

class Chat(models.Model):
    id = models.IntegerField(primary_key=True)
    type = models.CharField(max_length=16)
    room = models.ForeignKey(Rooms, on_delete=models.CASCADE)
    message = models.CharField(max_length=255)
    sender = models.CharField(max_length=255)
    time = models.CharField(max_length=255)
    