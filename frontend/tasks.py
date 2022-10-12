import time
from celery import shared_task
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import youtube_dl
import random
import string
import frontend.processes as processes
from sys import platform
from yt_dlp import YoutubeDL

async def sendBackFinnishedSongs(room_group_name, song): 
    channel_layer = get_channel_layer()
    await channel_layer.group_send(
        room_group_name,
        {
            'type': 'finnishedSongGroup',
            'song': song,
        })

# define a new id to the downloaded songs in the database
def defineSongId(room_id):
    randomId = room_id + "_" + randomSongId(8)
    return randomId

def randomSongId(length):
    # get all ascii letters and digits
    lettersAndDigits = string.ascii_letters + string.digits
    result_str = ''.join(random.choice(lettersAndDigits) for i in range(length))
    return result_str

def downloadSong(songId):
    # define the song path
    filename = "songs/" + songId + ".mp3"
    # define the song url
    songUrl = "https://www.youtube.com/watch?v=" + songId
    # define the song options
    songOptions = {
        'format': 'bestaudio/best',
        'outtmpl': "./frontend/static/"+filename,
        'default_search': 'auto',
        "keepvideo": False,
    }
    # download the song
    with YoutubeDL(songOptions) as ydl:
        ydl.download([songUrl])
    # return the song id
    return filename
#def downloadSong(songId):
#    try:
#        video_url = "https://www.youtube.com/watch?v="+ songId
#        video_info = youtube_dl.YoutubeDL().extract_info(
#            url = video_url,download=False
#        )
#        filename = "songs/" + songId + ".mp3"
#        options={
#            'format':'bestaudio/best',
#            'keepvideo':False,
#            'outtmpl':"./frontend/static/"+filename,
#        }
#        with youtube_dl.YoutubeDL(options) as ydl:
#            ydl.download([video_info['webpage_url']])
#    except:
#        filename = downloadSong(songId)
#    return filename

@shared_task
def downloadSongs(song, room_group_name, songOptions, room_name):
    randomId = defineSongId(room_group_name)
    filename = downloadSong(song["song_id"])
    outputFile = "processedSongs/" + randomId + ".mp3"
    if platform == "Linux" or platform == "linux" or platform == "linux2" or platform == "darwin":
        processes.process(filename, outputFile, songOptions, room_name)
        filename = outputFile
    elif platform == "win32" or platform == "win64" or platform == "cygwin" or platform == "msys":
        processes.processWindows(filename, outputFile, room_name) 
        filename = outputFile
        print("You are on windows, cant process songs, hajoo mulli")
    song["filename"] = filename
    song["randomId"] = randomId
    async_to_sync(sendBackFinnishedSongs)(room_group_name, song)
    


async def sendBackStartCount(room_group_name): 
    channel_layer = get_channel_layer()
    await channel_layer.group_send(
        room_group_name,
        {
            'type': 'startCountDownGroup',
        })

async def sendBackCountDown(room_group_name, count): 
    channel_layer = get_channel_layer()
    await channel_layer.group_send(
        room_group_name,
        {
            'type': 'countDownGroup',
            'count': count,
        })

async def sendBackStartGame(room_group_name): 
    channel_layer = get_channel_layer()
    print("sending start game")
    await channel_layer.group_send(
        room_group_name,
        {
            'type': 'gameStart',
        })

@shared_task
def startCountDown(room_group_name):
    async_to_sync(sendBackStartCount)(room_group_name)
    for i in range(4, -1, -1):
        async_to_sync(sendBackCountDown)(room_group_name, i)
        time.sleep(1)
        print(i)
        if i == 0:
            async_to_sync(sendBackStartGame)(room_group_name)
