from time import sleep
from celery import shared_task
from django.core.mail import send_mail
import os
from asgiref.sync import async_to_sync



@shared_task
def sleepy(songList):
    for song in songList:
        if not os.path.isfile("./songfiles" + song["song"] + ".mp3"):
            print("Downloading song: " + song["song"])
    print("Done sleeping")

@shared_task
def downloadSongs(songList, room_group_name):
    from channels.layers import get_channel_layer
    print(room_group_name)
    for song in songList:
        if not os.path.isfile("./songfiles/" + song["song_id"] + ".mp3"):
            print("Downloading song: " + song["title"])
    channel_layer = get_channel_layer()
    print(channel_layer)
    async_to_sync(channel_layer.group_send)(
        room_group_name,
        {
            'type': 'startGameGroup',
        })
    print("Done sleeping")