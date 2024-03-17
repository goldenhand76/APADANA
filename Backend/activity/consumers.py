import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework_simplejwt.exceptions import TokenError
from authentication.models import LoggedInUser
from authentication.models import User
from rest_framework_simplejwt.tokens import AccessToken
from actstream.models import following


class ActivityConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.user = None
        self.group_name = "Activity"

    async def connect(self):
        try:
            self.user = await database_sync_to_async(self.get_user)(token=self.scope["url_route"]["kwargs"]["token"])
            await database_sync_to_async(self.user_logged_in)(self.channel_name, user=self.user)
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
        except TokenError:
            await self.close()

    async def disconnect(self, close_code):
        if self.user:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            await database_sync_to_async(self.user_logged_out)(user=self.user)

    async def update_activities(self, event):
        if await database_sync_to_async(self.is_following)(actor_id=event["sender_id"]):
            await self.send(text_data=json.dumps({"update": event["update"]}))

    def get_user(self, token=None, id=None):
        if token:
            user = AccessToken(token)
            return User.objects.prefetch_related('organization').get(id=user["user_id"])
        elif id:
            return User.objects.get(id=id)

    def is_following(self, actor_id):
        actor = self.get_user(id=actor_id)
        return actor in following(self.user)

    def user_logged_in(self, channel_name, user):
        LoggedInUser.objects.filter(user=user).update(channel_name=channel_name, is_online=True)

    def user_logged_out(self, user):
        LoggedInUser.objects.filter(user=user).update(is_online=False)
