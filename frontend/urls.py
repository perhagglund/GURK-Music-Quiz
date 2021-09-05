from django.contrib import admin
from django.urls import path
from .views import index, lobby, joinGame, game

urlpatterns = [
    path('', index),
    path('<str:room_name>/', lobby, name="lobby"),
    path('<str:room_name>/joinGame', joinGame, name="joinGame"),
    path('<str:room_name>/game', game, name="game")
]
