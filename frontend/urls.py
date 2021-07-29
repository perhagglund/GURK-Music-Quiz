from django.contrib import admin
from django.urls import path
from .views import index, lobby

urlpatterns = [
    path('', index),
    path('<str:room_name>/', lobby, name="lobby")
]