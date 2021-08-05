from django.shortcuts import render
from django.http import JsonResponse
from frontend.models import Rooms
import json


# Create your views here.

def getEveryRoomName(request):
    response_data = {"Room_name": list(Rooms.objects.all().values("room_id"))}
    return JsonResponse(response_data, safe=False)


def doesRoomExist(request, room_name):
    print(room_name)
    roomNameList = list(Rooms.objects.all().values("room_id"))
    for x in roomNameList:
        if room_name == x["room_id"]:
            return JsonResponse({"exists": True})
    return JsonResponse({"exists": False})
