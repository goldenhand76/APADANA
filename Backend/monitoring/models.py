from django.db import transaction
from django.db.models import F, Max
from authentication.models import Organization
from device.models import Sensor, Type
from django.db import models
from monitoring.tasks import influx_query, influx_gauge_query, influx_graph_query
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


class SimpleFunction(models.Model):
    name = models.CharField(max_length=200)

    def __str__(self):
        return self.name


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
            if int(new_order) > len(qs.filter(field=obj.field)):
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


class Tab(models.Model):
    title = models.CharField(max_length=24)
    is_favorite = models.BooleanField(default=False)

    field = models.ForeignKey(Organization, on_delete=models.CASCADE)
    location = models.JSONField(blank=True, null=True)

    order = models.IntegerField(default=1)
    index_together = ('field', 'order')
    objects = StepManager()

    class Meta:
        ordering = ('field', 'order')
        db_table = "tab"

    def save(self, *args, **kwargs):
        if self.is_favorite:
            try:
                temp = Tab.objects.get(is_favorite=True)
                if self != temp:
                    temp.is_favorite = False
                    temp.save()
            except Tab.DoesNotExist:
                pass
        super(Tab, self).save(*args, **kwargs)


TIME_RANGES = (('5m', '5m'), ('30m', '30m'), ('1h', '1h'), ('6h', '6h'), ('1d', '1d'),)
BLOCK_SIZES = (('small', 'small'), ('medium', 'medium'), ('large', 'large'))
BLOCK_TYPES = (('Graph', 'Graph'), ('Gauge', 'Gauge'),)
PRECISIONS = (("1", "1"), ("0.1", "0.1"))


class Tile(models.Model):
    sensor_type = models.ForeignKey(Type, on_delete=models.CASCADE)
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE)
    title = models.CharField(max_length=24, error_messages={'max_length': "طول فیلد حداکثر 24 کارکتر باشد"})

    size = models.CharField(choices=BLOCK_SIZES, max_length=8)

    type = models.CharField(choices=BLOCK_TYPES, max_length=8)
    unit = models.CharField(max_length=8)
    precision = models.CharField(choices=PRECISIONS, max_length=8)
    timeRange = models.CharField(choices=TIME_RANGES, max_length=8, blank=True, null=True)
    interval = models.CharField(max_length=8, blank=True, null=True)
    tab = models.ForeignKey(Tab, on_delete=models.CASCADE)

    status = models.JSONField(null=True)

    class Meta:
        db_table = "tile"

    def save(self, **kwargs):
        interval_dict = {'5m': '10s', '30m': '30s', '1h': '1m', '6h': '6m', '1d': '10m'}
        interval = interval_dict.get(self.timeRange, '5m')
        self.interval = interval
        super().save(**kwargs)

    @property
    def data(self):
        return influx_query(self, self.sensor.value_topic)

    @property
    def gauge(self):
        return influx_gauge_query(self, self.sensor.value_topic)

    @property
    def graph(self):
        return influx_graph_query(self, self.sensor.value_topic)

    @classmethod
    def delete_tiles_related_to_sensor(cls, sensor):
        cls.objects.filter(sensor=sensor).delete()