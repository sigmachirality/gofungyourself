import json, random
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from .models import Game, Player

class GameConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.player_name = self.scope['url_route']['kwargs']['player']
        self.room_group_name = 'game_%s' % self.room_name

        try:
            if not Game.objects.filter(pk=int(self.room_name)).exists():
                self.close()
            self.game = Game.objects.filter(pk=int(self.room_name)).first()
            if not Player.objects.filter(
                name=self.player_name,
                game=self.game
            ).exists():
                self.player = Player.objects.create(
                    name=self.player_name,
                    game=self.game,
                    score=0
                )
            else:
                self.player = Player.objects.filter(
                    name=self.player_name,
                    game=self.game
                ).first()
            self.player.save()

        except ValueError:
            self.close()

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'users_update'
            }
        )

        self.accept()
        self.send(text_data=json.dumps({
            'type': 'state',
            'users': list(self.game.player_set.values("name", "score")),
            'started': bool(self.game.started)
        }))


    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )
        if not self.game.started:
            self.player.delete()
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'users_update'
                }
            )
            if not Player.objects.filter(game=self.game).exists():
                self.game.delete()


    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json['type']

        if message_type == 'message':
            message_type = text_data_json['type']
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'player': self.player_name
                }
            )
        elif message_type == 'start':
            self.game.started = True
            self.game.save()
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'start_game',
                }
            )


    def chat_message(self, event):
        message = event['message']
        player = event['player']
        self.send(text_data=json.dumps({
            'type': 'message',
            'message': message,
            'sender': player
        }))


    def users_update(self, _):
        self.send(text_data=json.dumps({
            'type': 'user',
            'users': list(self.game.player_set.values("name", "score"))
        }))


    def start_game(self, _):
        self.send(text_data=json.dumps({
            'type': 'start'
        }))
