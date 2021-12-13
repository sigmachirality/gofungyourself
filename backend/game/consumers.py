import json
from channels.generic.websocket import WebsocketConsumer

class GameConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
        self.send(text_data=json.dumps({
            'message': "HELLO!"
        }))

    def disconnect(self, close_code):
        pass

    def receive(self, *, text_data):
        # Case on type and handle accordingly
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        self.send(text_data=json.dumps({
            'message': message
        }))
