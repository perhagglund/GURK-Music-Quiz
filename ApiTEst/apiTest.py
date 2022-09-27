import youtube_dl
import threading

songIds = ["YVkUvmDQ3HY", "_Yhyp-_hX2s", "7tBBw-8mM2o", "Xs1wozR8OmE", "GP0mB6btU3I"]

def downloadSong(songId):
    video_url = "https://www.youtube.com/watch?v="+ songId
    video_info = youtube_dl.YoutubeDL().extract_info(
        url = video_url,download=False
    )
    filename = "C:\\Users\\a3bei\\Desktop\\Projects\\GURK_Music_Quiz\\frontend\\testFiles\\" + songId + ".mp3"
    options={
        'format':'bestaudio/best',
        'keepvideo':False,
        'outtmpl':filename,
    }
    with youtube_dl.YoutubeDL(options) as ydl:
        ydl.download([video_info['webpage_url']])


