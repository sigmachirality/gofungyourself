from django.db import models
from django.utils.translation import gettext_lazy as _

# Create your models here.
class Game(models.Model):
    code = models.IntegerField(primary_key=True)
    
    class Mode(models.TextChoices):
        CLOSEST = 'CL', _('closest')
        EXACT = 'EX', _('exact')
        BUBBLE = 'BL', _('bubblegum')
        SENIOR = 'ME', _('meme')

    mode = models.CharField(
        max_length = 2,
        choices=Mode.choices,
        default=Mode.CLOSEST
    )

    started = models.BooleanField(default=False)

class Player(models.Model):
    name = models.CharField(max_length=32)
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    score = models.IntegerField(default=0)

class Entry(models.Model):
    token = models.CharField(max_length=32)
    contract_address = models.CharField(max_length=32) 
