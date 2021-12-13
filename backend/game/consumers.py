import json, random, math
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from django.forms.models import model_to_dict
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
            message = text_data_json['message']
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
                    'type': 'get_question',
                    'question': 0
                }
            )
        elif message_type == 'guess':
            guess = text_data_json['guess']
            self.player.guess = guess
            self.player.save()
            self.send(text_data=json.dumps({
                'type': 'confirm'
            }))
        elif message_type == 'result':
            question_num = text_data_json['question']
            for i, q in enumerate(self.game.entry_set.all()):
                if i == (question_num - 1):
                    question = q
                    break
            if not question.graded:
                print("grading", question_num)
                if self.game.mode == 'closest':
                    delta = abs(self.player.guess - round(float(question.price)))
                    current_min = self.player
                    for player in list(self.game.player_set.all()):
                        print(question_num, player.name, player.guess, player.score)
                        current_delta = abs(player.guess - round(float(question.price)))
                        if current_delta < delta:
                            delta = current_delta
                            current_min = player
                    current_min.score = current_min.score + 1
                    current_min.save()
                elif self.game.mode == 'bubble':
                    delta = round(float(question.price)) - self.player.guess
                    current_min = self.player
                    for player in list(self.game.player_set.all()):
                        current_delta = round(float(question.price)) - player.guess
                        if (current_delta < delta and current_delta > 0) or delta < 0:
                            delta = current_delta
                            current_min = player
                    if delta > 0:
                        current_min.score = current_min.score + 1
                        current_min.save()
                elif self.game.mode == 'exact':
                    if round(self.player.guess, 2) == round(float(question.price), 2):
                        self.player.score = self.player.score + 1
                        self.player.save()
                
                question.graded = True
                question.save()
                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name,
                    {
                        'type': 'get_question',
                        'question': question_num
                    }
                )

            self.users_update("")




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


    def get_question(self, event):
        self.player.guess = 0
        self.player.save()
        question = int(event['question'])
        if question >= self.game.rounds:
            self.send(text_data=json.dumps({
                'type': 'end',
            }))
        self.send(text_data=json.dumps({
            'type': 'question',
            'question': model_to_dict(list(self.game.entry_set.all())[question])
        }))
