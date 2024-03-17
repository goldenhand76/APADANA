''' Django notifications admin file '''
# -*- coding: utf-8 -*-
from django.contrib import admin
from notifications.base.admin import AbstractNotificationAdmin
from swapper import load_model
from notifications.models import NotificationManager

Notification = load_model('notifications', 'Notification')


class NotificationAdmin(AbstractNotificationAdmin):
    raw_id_fields = ('recipient',)
    list_display = ('recipient', 'actor',
                    'level', 'target', 'unread', 'public', 'verb')
    list_filter = ('level', 'unread', 'public', 'timestamp', 'recipient')

    def get_queryset(self, request):
        qs = super(NotificationAdmin, self).get_queryset(request)
        return qs.prefetch_related('actor')


admin.site.register(Notification, NotificationAdmin)
admin.site.register(NotificationManager)
