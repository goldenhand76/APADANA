from django.core.validators import ValidationError
from django.utils.translation import gettext_lazy as _
from automation.models import ManualTile
import logging

logger= logging.getLogger('django')


def actuator_duplication_validator(actuator):
    if ManualTile.objects.filter(actuator=actuator).filter(deleted_at=None).exists():
        raise ValidationError("این عملگر قبلا انتخاب شده است.", code="duplicate_manual_actuator")
