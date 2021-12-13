from django.db import models
from django.utils.translation import gettext_lazy as _

# Create your models here.
class Game(models.Model):
    code = models.IntegerField(primary_key=True)
    
    class Mode(models.TextChoices):
        CLOSEST = 'CL', _('closest')
        EXACT = 'EX', _('exact')
        BUBBLE = 'BL', _('bubblegum')
        MEME = 'ME', _('meme')

    mode = models.CharField(
        max_length = 2,
        choices=Mode.choices,
        default=Mode.CLOSEST
    )

    rounds = models.IntegerField(default=10)
    started = models.BooleanField(default=False)


class Player(models.Model):
    name = models.CharField(max_length=32)
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    score = models.IntegerField(default=0)
    guess = models.FloatField(default=0)


class Entry(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    id = models.CharField(max_length=128, primary_key=True)
    name = models.CharField(max_length=128) 
    image_url = models.CharField(max_length=256)
    price = models.CharField(max_length=128, default=0)
    graded = models.BooleanField(default=False)
