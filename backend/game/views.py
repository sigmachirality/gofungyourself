import json, random
from django.shortcuts import render
from django.http import JsonResponse, HttpResponseNotFound, HttpResponseServerError
from django.views.decorators.csrf import csrf_exempt
from .models import Game, Entry
import requests

@csrf_exempt
def create_game(request):
    if request.method != 'POST':
        return HttpResponseNotFound("GET called on POST route")
    # try:
    content = json.loads(request.body)
    game_mode = content['mode']
    game_code = random.randint(10000, 100000)
    while Game.objects.filter(pk=game_code).exists():
       game_code = random.randint(10000, 100000)

    game = Game.objects.create(code=game_code, mode=game_mode)
    game.save()

    offset = random.randint(100, 10000)
    data = requests.get(f"https://api.opensea.io/api/v1/assets?order_by=sale_count&offset={ offset }&limit=20").json()['assets']
    for nft in data:
        if ('last_sale' in nft):
            entry = Entry.objects.create(
                id=nft['id'],
                image_url=nft['image_url'],
                name=nft['name'], 
                price=nft['last_sale']['payment_token']['usd_price'],
                game=game
            )
            entry.save()
    
    return JsonResponse({ 'code': game_code })
    # except Exception as e:
    #     print("wtf")
    #     return HttpResponseServerError(str(e))

@csrf_exempt
def check_game(request, code):
    if Game.objects.filter(pk=int(self.code)).exists():
        return JsonResponse({
            'exists': True
        })
    return JsonResponse({
        'exists': False
    })
