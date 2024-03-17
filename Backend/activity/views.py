from rest_framework import permissions
from activity.serializers import ActionSerializer
from actstream.models import Action
from rest_framework.generics import ListAPIView
from actstream.models import user_stream
from django.contrib.contenttypes.models import ContentType
from datetime import datetime
import logging

logger = logging.getLogger('django')


class ActivityStreamListView(ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = Action.objects.all()
    serializer_class = ActionSerializer

    def get_queryset(self):
        timestamp = self.request.query_params.get('timestamp', None)
        user_ids = self.request.query_params.get('user_ids', None)
        action_content_type_id = self.request.query_params.get('action_content_type_id', None)
        action_object_ids = self.request.query_params.get('action_object_ids', None)

        qs = user_stream(self.request.user, with_user_activity=True).order_by('-timestamp')
        # qs = user_stream(self.request.user, with_user_activity=True).order_by('-timestamp')
        if user_ids:
            ctype = ContentType.objects.get(model='user')
            ids = [int(x) for x in user_ids.split(',')]
            qs = qs.filter(actor_content_type=ctype, actor_object_id__in=ids)

        if action_content_type_id:
            ctype = ContentType.objects.get(id=action_content_type_id)
            qs = qs.filter(action_object_content_type=ctype)
            if action_object_ids:
                ids = [int(x) for x in action_object_ids.split(',')]
                qs = qs.filter(action_object_object_id__in=ids)

        if timestamp:
            timestamp = datetime.strptime(timestamp, '%Y-%m-%d')
            filtered_count = qs.filter(timestamp__lte=timestamp.date()).count()
            total_count = qs.count()
            page = int((total_count - filtered_count)/10)
            if self.request.query_params.get('page', None) is None:
                self.request.query_params._mutable = True
                self.request.query_params['page'] = page
                self.request.query_params._mutable = False

        return qs
