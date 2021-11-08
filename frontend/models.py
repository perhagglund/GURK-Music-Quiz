from django.db import models


# Create your models here.
class Rooms(models.Model):
    room_id = models.CharField(max_length=16, primary_key=True)
    reverse = models.BooleanField()
    speed = models.DecimalField(max_digits=4, decimal_places=2)
    rounds = models.IntegerField()
    state = models.CharField(max_length=10)

    def __str__(self):
        return self.room_id


class Users(models.Model):
    room_id = models.CharField(max_length=16)
    nickname = models.CharField(max_length=255)
    color = models.IntegerField()
    eyes = models.IntegerField()
    mouth = models.IntegerField()
    leader = models.BooleanField()
    uniqueID = models.CharField(max_length=16)
    online = models.BooleanField()
