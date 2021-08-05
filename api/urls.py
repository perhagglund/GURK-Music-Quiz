from django.urls import path
from . import views

urlpatterns = [
    path('getEveryRoomName/', views.getEveryRoomName),
    path('doesRoomExist/<str:room_name>/', views.doesRoomExist),
]
