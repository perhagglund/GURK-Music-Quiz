from celery import shared_task
import os
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import time
import youtube_dl
from frontend.models import Songs
import random
import string

async def sendBackMessage(room_group_name, songList): 
    channel_layer = get_channel_layer()
    await channel_layer.group_send(
        room_group_name,
        {
            'type': 'startGameGroup',
            'songList': songList,
        })

# define a new id to the downloaded songs in the database
def defineSongId(room_id):
    randomId = room_id + "_" + randomSongId(8)
    return randomId

def randomSongId(length):
    # get all ascii letters and digits
    lettersAndDigits = string.ascii_letters + string.digits
    result_str = ''.join(random.choice(lettersAndDigits) for i in range(length))
    print("Random string of length", length, "is:", result_str)
    return result_str

def downloadSong(songId):
    video_url = "https://www.youtube.com/watch?v="+ songId
    video_info = youtube_dl.YoutubeDL().extract_info(
        url = video_url,download=False
    )
    filename = "songs/" + songId + ".mp3"
    options={
        'format':'bestaudio/best',
        'keepvideo':False,
        'outtmpl':"./frontend/static/"+filename,
    }
    with youtube_dl.YoutubeDL(options) as ydl:
        ydl.download([video_info['webpage_url']])
    return filename

@shared_task
def downloadSongs(songList, room_group_name):
    finnishedSongs = []
    for song in songList:
        filename = downloadSong(song["song_id"])
        randomId = defineSongId(room_group_name)
        finnishedSongs.append({
            "filename": filename,
            "randomId": randomId,
            "song_id": song["song_id"]
        })
    async_to_sync(sendBackMessage)(room_group_name, finnishedSongs)