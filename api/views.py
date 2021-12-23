from django.db.models import query
from django.shortcuts import render
from django.http import JsonResponse
from frontend.models import Rooms, Users
import json
from ytmusicapi.ytmusic import YTMusic


# Create your views here.

def getEveryRoomName(request):
    response_data = {"Room_name": list(Rooms.objects.all().values("room_id"))}
    return JsonResponse(response_data, safe=False)


def doesRoomExist(request, room_name):
    roomNameList = list(Rooms.objects.all().values("room_id"))
    for x in roomNameList:
        if room_name == x["room_id"]:
            return JsonResponse({"exists": True})
    return JsonResponse({"exists": False})


def updateRoomPlayers(request, room_name):
    data = Users.objects.all().filter(room_id=room_name).values()
    response = {"data": list(data)}
    return JsonResponse(response)

def isRoomInGame(request, room_name):
    room = Rooms.objects.get(room_id=room_name)
    return JsonResponse({"inGame": room.state == "game"})

def searchSong(request, query):
    yt = YTMusic()
    result = yt.search(query, filter='songs', ignore_spelling=True, limit=5)
    resultList = ({
        "id": x["videoId"],
        "title": x["title"], 
        "artist": ", ".join((x["name"] for x in x["artists"])),
        "album": x["album"]["name"],
        "duration": x["duration"],
        } for x in result)
    if result:
        return JsonResponse(
            {
                "statusCode": 200,
                "status": "Success",
                "result": list(resultList)[:5]
            })
    else:
        return JsonResponse(
            {
                "statusCode": 404,
                "status": "No results found."
            })