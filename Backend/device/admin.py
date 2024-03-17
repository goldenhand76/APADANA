from django.contrib import admin
from device.models import Sensor, Actuator, Type
from django_better_admin_arrayfield.admin.mixins import DynamicArrayMixin


class TypeAdmin(admin.ModelAdmin, DynamicArrayMixin):
    list_display = ('title', 'max', 'min', 'default_unit', 'units')


class SensorAdmin(admin.ModelAdmin):
    list_display = ('part_number', 'type', 'is_online', 'is_connected', 'value_topic', 'value', 'previous_value',
                    'updated_at', 'organization')
    list_filter = ('part_number', 'type', 'organization')


class ActuatorAdmin(admin.ModelAdmin):
    list_display = ('part_number', 'is_online', 'value_topic', 'value', 'previous_value', 'updated_at', 'organization')
    list_filter = ('part_number', 'organization')


admin.site.register(Actuator, ActuatorAdmin)
admin.site.register(Sensor, SensorAdmin)
admin.site.register(Type, TypeAdmin)

# Register your models here.
