from django.contrib import admin
from django.db import transaction
from django.db.models import F, Max
from automation.models import ManualTile, AutomaticTile, SmartTile


class ManualTileAdmin(admin.ModelAdmin):
    list_display = ('title', 'field', 'actuator', 'deleted_at', 'order')
    list_filter = ('field', 'deleted_at', 'actuator')

    def save_model(self, request, obj, form, change):
        qs = ManualTile.objects.all()
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
            return super(ManualTileAdmin, self).save_model(request, obj, form, change)
        else:
            manual_tile = qs.get(id=obj.id)

            if obj.order != manual_tile.order:
                if obj.order > len(qs.filter(field=obj.field)):
                    raise KeyError
                with transaction.atomic():
                    if manual_tile.order > obj.order:
                        qs.filter(field=obj.field, order__lt=manual_tile.order, order__gte=obj.order).exclude(
                            pk=obj.pk).update(order=F('order') + 1)
                    else:
                        qs.filter(field=obj.field, order__lte=obj.order, order__gt=manual_tile.order).exclude(
                            pk=obj.pk).update(order=F('order') - 1)

            if obj.field != manual_tile.field:
                qs.filter(field=manual_tile.field, order__gt=obj.order).exclude(pk=obj.pk).update(order=F('order') - 1)
                with transaction.atomic():
                    results = qs.filter(field=obj.field).aggregate(Max('order'))
                    current_order = results['order__max']
                    if current_order is None:
                        current_order = 0
                    value = current_order + 1
                obj.order = value

            return super(ManualTileAdmin, self).save_model(request, obj, form, change)

    def delete_model(self, request, obj):
        with transaction.atomic():
            ManualTile.objects.filter(order__gt=obj.order).exclude(pk=obj.pk).update(order=F('order') - 1)
        return super(ManualTileAdmin, self).delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        for plan in queryset:
            ManualTile.objects.filter(order__gt=plan.order).exclude(pk=plan.pk).update(order=F('order') - 1)
        return super(ManualTileAdmin, self).delete_queryset(request, queryset)


class AutomaticTileAdmin(admin.ModelAdmin):
    list_display = ('title', 'order', 'field')
    list_filter = ('field',)

    def save_model(self, request, obj, form, change):
        qs = AutomaticTile.objects.all()
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
            return super(AutomaticTileAdmin, self).save_model(request, obj, form, change)
        else:
            automatic_tile = qs.get(id=obj.id)

            if obj.order != automatic_tile.order:
                if obj.order > len(qs.filter(field=obj.field)):
                    raise KeyError
                with transaction.atomic():
                    if automatic_tile.order > obj.order:
                        qs.filter(field=obj.field, order__lt=automatic_tile.order, order__gte=obj.order).exclude(
                            pk=obj.pk).update(order=F('order') + 1)
                    else:
                        qs.filter(field=obj.field, order__lte=obj.order, order__gt=automatic_tile.order).exclude(
                            pk=obj.pk).update(order=F('order') - 1)

            if obj.field != automatic_tile.field:
                qs.filter(field=automatic_tile.field, order__gt=obj.order).exclude(pk=obj.pk).update(
                    order=F('order') - 1)
                with transaction.atomic():
                    results = qs.filter(field=obj.field).aggregate(Max('order'))
                    current_order = results['order__max']
                    if current_order is None:
                        current_order = 0
                    value = current_order + 1
                obj.order = value

            return super(AutomaticTileAdmin, self).save_model(request, obj, form, change)

    def delete_model(self, request, obj):
        with transaction.atomic():
            AutomaticTile.objects.filter(order__gt=obj.order).exclude(pk=obj.pk).update(order=F('order') - 1)
        return super(AutomaticTileAdmin, self).delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        for plan in queryset:
            AutomaticTile.objects.filter(order__gt=plan.order).exclude(pk=plan.pk).update(order=F('order') - 1)
        return super(AutomaticTileAdmin, self).delete_queryset(request, queryset)


class SmartTileAdmin(admin.ModelAdmin):
    list_display = ('organization', 'path', 'active')
    list_filter = ('organization', 'active')


# class ConditionAdmin(admin.ModelAdmin):
#     list_display = ('automatictile', 'sensor', 'status')
#     list_filter = ('sensor', 'status')


admin.site.register(ManualTile, ManualTileAdmin)
admin.site.register(AutomaticTile, AutomaticTileAdmin)
admin.site.register(SmartTile, SmartTileAdmin)
# admin.site.register(Condition, ConditionAdmin)
