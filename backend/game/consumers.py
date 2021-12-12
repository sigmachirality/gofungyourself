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

    def recieve(self, *, text_data):
        # Case on type and handle accordingly
        print("bruh")
        print("bruh", text_data)
        text_data_json = json.loads(text_data)
        print(text_data_json)
        message = text_data_json['message']

        self.send(text_data=json.dumps({
            'message': message
        }))
