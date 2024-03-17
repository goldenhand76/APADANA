from django.db import models
from device.models import Sensor
from datetime import datetime, timedelta
import logging
from django.utils import timezone

logger = logging.getLogger('django')


# TODO Search for staticmethod, classmethod, property


class Continues(models.Model):
    operator = models.CharField(choices=(('LT', 'Lower Than'), ("HT", "Higher Than"), ("EQ", "Equal To")), max_length=2)
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE)
    set_point = models.FloatField(blank=True, null=True)
    checked = models.BooleanField(default=False)

    @property
    def perform_check(self):
        if self.operator == 'LT':
            return float(self.sensor.value) < self.set_point
        elif self.operator == 'HT':
            return float(self.sensor.value) > self.set_point
        elif self.operator == 'EQ':
            return float(self.sensor.value) == self.set_point
        else:
            return False


class Binary(models.Model):
    operator = models.CharField(choices=(("ON", "ON"), ("OFF", "OFF"), ("SWITCH", "SWITCH"),), max_length=6)
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE)
    checked = models.BooleanField(default=False)

    @property
    def perform_check(self):
        if self.operator == 'ON':
            return float(self.sensor.value) == 1
        elif self.operator == 'OFF':
            return float(self.sensor.value) == 0
        elif self.operator == 'SWITCH':
            return float(self.sensor.value) == float(self.sensor.previous_value)
        else:
            return False


class DateTimeManager(models.Manager):
    def get_items(self):
        return self.all().annotate(
                last_diff=models.ExpressionWrapper(models.F('set_time') - models.F('last_update'), models.DateTimeField()),
                now_diff=models.ExpressionWrapper(models.F('set_time') - timezone.now(), models.DateTimeField()))


class Schedule(models.Model):
    operator = models.CharField(
        choices=(("ONCE", "ONCE"), ("HOURLY", "Hourly"), ("DAILY", "Daily"), ("WEEKLY", "Weekly"),
                 ("MONTHLY", "Monthly"), ("SEASONALLY", "Seasonally"), ("YEARLY", "Yearly")), max_length=16)
    set_time = models.DateTimeField()
    last_update = models.DateTimeField(null=True, blank=True)
    checked = models.BooleanField(default=False)

    objects = DateTimeManager()

    # @property
    # def perform_check(self):  # TODO Add checked timer to tasks.
    #     if not self.checked:
    #         if self.operator == 'ONCE':
    #             return 0 < (self.update_time - self.set_time).seconds < 60
    #
    #         elif self.operator == 'HOURLY':
    #             return 0 < (self.update_time - self.set_time + timedelta(hours=1)).seconds < 60
    #
    #         elif self.operator == 'DAILY':
    #             return 0 < (self.update_time - self.set_time + timedelta(days=1)).seconds < 60
    #
    #         elif self.operator == 'WEEKLY':
    #             return 0 < (self.update_time - self.set_time + timedelta(days=7)).seconds < 60
    #
    #         elif self.operator == 'MONTHLY':
    #             return 0 < (self.update_time - self.set_time + timedelta(days=30)).seconds < 60
    #
    #         elif self.operator == 'SEASONALLY':
    #             return 0 < (self.update_time - self.set_time + timedelta(days=90)).seconds < 60
    #
    #         elif self.operator == 'YEARLY':
    #             return 0 < (self.update_time - self.set_time + timedelta(days=365)).seconds < 60
    #         else:
    #             return False
    #     else:
    #         return False
