from django.contrib import admin
from django.db import models, transaction
from django.db.models import F, Max
from monitoring.models import Tile, Tab, SimpleFunction


class TabAdmin(admin.ModelAdmin):
    list_display = ('title', 'field')
    list_filter = ('field',)

    def save_model(self, request, obj, form, change):
        qs = Tab.objects.all()
        if not change:
            with transaction.atomic():
                results = qs.filter(field=obj.field).aggregate(Max('order'))
                current_order = results['order__max']
                if current_order is None:
                    current_order = 0
                else:
                    if obj.order > len(qs.filter(field=obj.field)):
                        raise KeyError
                value = current_order + 1
            obj.order = value
            return super(TabAdmin, self).save_model(request, obj, form, change)
        else:
            tab = qs.get(id=obj.id)

            if obj.order != tab.order:
                if obj.order > len(qs.filter(field=obj.field)):
                    raise KeyError
                with transaction.atomic():
                    if tab.order > obj.order:
                        qs.filter(field=obj.field, order__lt=tab.order, order__gte=obj.order).exclude(pk=obj.pk).update(
                            order=F('order') + 1)
                    else:
                        qs.filter(field=obj.field, order__lte=obj.order, order__gt=tab.order).exclude(pk=obj.pk).update(
                            order=F('order') - 1)

            if obj.field != tab.field:
                qs.filter(field=tab.field, order__gt=obj.order).exclude(pk=obj.pk).update(order=F('order') - 1)
                with transaction.atomic():
                    results = qs.filter(field=obj.field).aggregate(Max('order'))
                    current_order = results['order__max']
                    if current_order is None:
                        current_order = 0
                    value = current_order + 1
                obj.order = value

            return super(TabAdmin, self).save_model(request, obj, form, change)

    def delete_model(self, request, obj):
        with transaction.atomic():
            Tab.objects.filter(order__gt=obj.order).exclude(pk=obj.pk).update(order=F('order') - 1)
        return super(TabAdmin, self).delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        for plan in queryset:
            Tab.objects.filter(order__gt=plan.order).exclude(pk=plan.pk).update(order=F('order') - 1)
        return super(TabAdmin, self).delete_queryset(request, queryset)


class TileAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'sensor_type', 'sensor', 'timeRange', 'interval', 'tab', 'size')
    list_filter = ('tab',)


admin.site.register(Tile, TileAdmin)
admin.site.register(Tab, TabAdmin)
admin.site.register(SimpleFunction)
