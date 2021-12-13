from django.contrib import admin
from django.urls import path
from .views import create_game, check_game

urlpatterns = [
    path("create_game", create_game),
    path("check_game/<int:code>", check_game),
]
