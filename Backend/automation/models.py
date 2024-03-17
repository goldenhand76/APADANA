from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models, transaction
from authentication.models import Organization
from condition.models import Continues, Binary, Schedule
from device.models import Sensor, Actuator, Type
from model_utils import FieldTracker
from django.db.models import F, Max, UniqueConstraint, Q
from notifications.models import NotificationManager
from softdelete.models import SoftDeleteObject

TRIGGER = (('OFF', 'OFF'), ('ON', 'ON'), ('SWITCH', 'SWITCH'))
TYPE = (("automatic", "automatic"), ("manual", "manual"))


class StepManager(models.Manager):

    def create(self, **kwargs):
        instance = self.model(**kwargs)
        with transaction.atomic():
            results = self.filter(field=instance.field).aggregate(Max('order'))
            current_order = results['order__max']
            if current_order is None:
                current_order = 0

            value = current_order + 1
            instance.order = value
            instance.save()

            return instance

    def move(self, obj, new_order):
        qs = self.get_queryset().filter(field=obj.field)

        with transaction.atomic():
            if obj.order > len(qs.filter(field=obj.field)):
                raise KeyError

            if obj.order > int(new_order):
                qs.filter(order__lt=obj.order, order__gte=new_order).exclude(pk=obj.pk).update(order=F('order') + 1)
            else:
                qs.filter(order__lte=new_order, order__gt=obj.order).exclude(pk=obj.pk, ).update(order=F('order') - 1)

            obj.order = new_order
            obj.save()

    def delete(self, obj):
        qs = self.get_queryset().filter(field=obj.field)
        with transaction.atomic():
            qs.filter(order__gt=obj.order, ).exclude(pk=obj.pk).update(order=F('order') - 1)
            obj.delete()


TYPE = (('regulation', 'regulation'), ('schedule', 'schedule'))
DELAY_TYPES = (('1m', '1m'), ('5m', '5m'), ('30m', '30m'), ('1h', '1h'))


class ManualTile(SoftDeleteObject, models.Model):
    actuator = models.ForeignKey(Actuator, on_delete=models.CASCADE, blank=True, null=True)
    actuator_value = models.FloatField(blank=True, null=True, choices=((0.0, 'off'), (1.0, 'on')))

    title = models.CharField(max_length=24, default="")

    field = models.ForeignKey(Organization, on_delete=models.CASCADE)
    order = models.IntegerField(default=1)
    index_together = ('field', 'order')
    objects = StepManager()

    active = models.BooleanField(default=False)
    lock = models.BooleanField(default=False)
    status = models.CharField(max_length=8, choices=(
    ('WAITING', 'WAITING'), ('STARTED', 'STARTED'), ('RETRYING', 'RETRYING'), ('SUCCEED', 'SUCCEED'),
    ('FAILED', 'FAILED')), default='WAITING')
    tracker = FieldTracker()

    class Meta:
        ordering = ('field', 'order')
        db_table = "manual_tile"

    def __str__(self):
        return f"{self.title}"

    def save(self, **kwargs):
        self.actuator_value = Actuator.objects.get(id=self.actuator_id).value
        super().save(**kwargs)

    def delete(self, *args, **kwargs):
        self.actuator.manual_selected = False
        self.actuator.save()
        super().delete(*args, **kwargs)

    @property
    def condition(self):
        if self.active:
            return "ON"
        else:
            return "OFF"


class AutomaticTile(SoftDeleteObject, models.Model):
    type = models.CharField(choices=TYPE, max_length=16)
    title = models.CharField(max_length=24, unique=True)
    actuator = models.ForeignKey(Actuator, on_delete=models.CASCADE, null=True, blank=True)
    actuator_value = models.FloatField(blank=True, null=True, choices=((0.0, 'off'), (1.0, 'on')))
    condition_content_type = models.ForeignKey(to=ContentType,
                                               limit_choices_to={"model__in": ("continues", "binary", "schedule")},
                                               on_delete=models.CASCADE, blank=True, null=True)
    condition_object_id = models.PositiveIntegerField(null=True, blank=True)
    condition_object = GenericForeignKey('condition_content_type', 'condition_object_id')

    delay_status = models.BooleanField(default=False)
    delay = models.CharField(max_length=3, blank=True, null=True)

    output = models.CharField(choices=(("ON", "ON"), ("OFF", "OFF"), ("SWITCH", "SWITCH")), default="ON", max_length=8)

    field = models.ForeignKey(Organization, on_delete=models.CASCADE)
    order = models.IntegerField(default=1)

    index_together = ('field', 'order')
    objects = StepManager()
    active = models.BooleanField(default=False)
    lock = models.BooleanField(default=False)
    status = models.CharField(max_length=8, choices=(
    ('WAITING', 'WAITING'), ('STARTED', 'STARTED'), ('RETRYING', 'RETRYING'), ('SUCCEED', 'SUCCEED'),
    ('FAILED', 'FAILED')), default='WAITING')
    tracker = FieldTracker()

    class Meta:
        ordering = ('field', 'order')
        db_table = "automatic_tile"

    def __str__(self):
        return f"{self.title}"

    def save(self, **kwargs):
        self.actuator_value = Actuator.objects.get(id=self.actuator_id).value
        super().save(**kwargs)

    def delete(self, *args, **kwargs):
        if self.condition_content_type.model == "continues":
            Continues.objects.filter(id=self.condition_object_id).delete()
        elif self.condition_content_type.model == "binary":
            Binary.objects.filter(id=self.condition_object_id).delete()
        elif self.condition_content_type.model == "schedule":
            Schedule.objects.filter(id=self.condition_object_id).delete()
        self.actuator.automatic_selected = False
        self.actuator.save()
        super().delete(*args, **kwargs)


class SmartTile(SoftDeleteObject, models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, blank=True, null=True)
    title = models.CharField(max_length=64, unique=True, default='')
    path = models.FilePathField(unique=True, path="/var/www/Angizeh_2/Smart_Plans/", blank=True, null=True)
    active = models.BooleanField(default=False)

    tracker = FieldTracker()

    class Meta:
        db_table = "smart_tile"
