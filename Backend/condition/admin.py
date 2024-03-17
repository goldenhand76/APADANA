from django.contrib import admin
from condition.models import Continues, Binary, Schedule


# class ContinuesAdmin(admin.ModelAdmin):
#     list_display = ('sensor', 'operator', 'set_point')
#
#
# class BinaryAdmin(admin.ModelAdmin):
#     list_display = ('sensor', 'operator')

#
# class ScheduleAdmin(admin.ModelAdmin):
#     list_display = ('operator', 'set_time')


admin.site.register(Continues)
admin.site.register(Binary)
admin.site.register(Schedule)
