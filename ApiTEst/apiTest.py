import youtube_dl

songId = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

video_url = "https://www.youtube.com/watch?v="+ songId
video_info = youtube_dl.YoutubeDL().extract_info(
    url = video_url,download=False
)
filename = "C:\\Users\\a3bei\\Desktop\\Projects\\GURK_Music_Quiz\\frontend\\songfiles\\" + songId + ".mp3"
options={
    'format':'bestaudio/best',
    'keepvideo':False,
    'outtmpl':filename,
}
with youtube_dl.YoutubeDL(options) as ydl:
    ydl.download([video_info['webpage_url']])
print("Download complete... {}".format(filename))