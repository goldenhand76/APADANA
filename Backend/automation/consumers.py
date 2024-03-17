import json
import logging
from rest_framework_simplejwt.tokens import AccessToken
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework_simplejwt.exceptions import TokenError
from authentication.models import User
from channels.db import database_sync_to_async
from automation.models import ManualTile
logger = logging.getLogger('django')


class AutomationConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.user = None
        self.group_name = "Automation"
        self.organization = None

    async def connect(self):
        try:
            await database_sync_to_async(self.get_user)(token=self.scope["url_route"]["kwargs"]["token"])
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
        except TokenError:
            await self.close()

    async def disconnect(self, close_code):
        if self.user:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def update_manual_status(self, event):
        logger.debug("Update Manual status web socket send")
        if self.organization.id == event["organization_id"]:
            plan = event["plan"]
            plan["status"] = event["status"]
            await self.send(json.dumps(plan))

    async def update_automatic_status(self, event):
        logger.debug("Update Automatic status web socket send")
        if self.organization.id == event["organization_id"]:
            plan = event["plan"]
            plan["status"] = event["status"]
            await self.send(json.dumps(plan))

    def get_user(self, token):
        user = AccessToken(token)
        self.user = User.objects.prefetch_related('organization').get(id=user["user_id"])
        self.organization = self.user.organization
