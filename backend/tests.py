import pytest
from unittest import mock
from asgiref.sync import async_to_sync
from channels.testing import WebsocketCommunicator
from channels.routing import URLRouter
from django.urls import path

from game.models import Game, Player, Entry
from game.consumers import GameConsumer

@pytest.mark.django_db
def test_game_delete():
    game = Game.objects.create(code=12345, mode='closest')
    game.save()
    player = Player.objects.create(game=game, name="test_user")
    player.save()
    entry = Entry.objects.create(
        id='1',
        game=game,
        name="test nft",
        image_url="https://cdn.artandlogic.com/wp-content/uploads/django.jpeg"
    )
    entry.save()

    game.delete()
    assert Game.objects.count() == 0
    assert Player.objects.count() == 0
    assert Entry.objects.count() == 0


@pytest.mark.asyncio
async def test_consumer_no_game():
    application = URLRouter([
        path('ws/room/<room_name>/<player>', GameConsumer.as_asgi()),
    ])
    communicator = WebsocketCommunicator(application, "/ws/room/non_existent_room/non_existent_player")
    connected, subprotocol = await communicator.connect()
    assert not connected
    await communicator.disconnect()
    