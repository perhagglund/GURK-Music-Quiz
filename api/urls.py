from django.urls import path
from . import views

urlpatterns = [
    path('getEveryRoomName/', views.getEveryRoomName),
    path('doesRoomExist/<str:room_name>/', views.doesRoomExist),
    path('updateRoomPlayers/<str:room_name>/', views.updateRoomPlayers),
    path('isRoomInGame/<str:room_name>/', views.isRoomInGame)
]
