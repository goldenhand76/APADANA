from rest_framework.exceptions import PermissionDenied
from django.utils.translation import gettext_lazy as _
from monitoring.models import Tab, Tile
from django.core.validators import ValidationError


def max_tab_validator(organization):
    if Tab.objects.filter(field=organization).count() >= organization.max_tabs:
        raise PermissionDenied("سرویس شما قابلیت ایجاد بیشتر از %s تب را ندارد. با پشتیبانی تماس بگیرید." % organization.max_tabs)


def max_tile_validator(tab_id, organization):
    if Tile.objects.filter(tab_id=tab_id).count() >= organization.max_tiles_per_tab:
        raise PermissionDenied("سرویس شما قابلیت ایجاد بیشتر از %s تایل در هر تب را ندارد. با پشتیبانی تماس بگیرید." % organization.max_tiles_per_tab)

def max_character_validator(title):
    if len(title) > 24:
        raise ValidationError("طول فیلد حداکثر 24 کارکتر باشد")
