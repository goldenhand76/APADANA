from django.db.models.signals import post_save
from automation.tasks import send_manual_command
from django.dispatch import receiver
from automation.models import AutomaticTile, ManualTile
import logging

logger = logging.getLogger('django')


@receiver(post_save, sender=ManualTile)
def manual_actuator_update(sender, instance, **kwargs):
    if instance.active:
        instance.actuator.set_value = 1.0
    else:
        instance.actuator.set_value = 0.0
    logger.debug('Actuator Saved')
    instance.actuator.save()
