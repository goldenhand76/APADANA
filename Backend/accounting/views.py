from actstream import action
from django.utils import translation
from rest_framework import generics, status, permissions, mixins
from accounting.serializers import AddSubUserSerializer, ListSubUserSerializer, UpdateSubUserSerializer
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from rest_framework.response import Response
from rest_framework.generics import ListAPIView, CreateAPIView
from django.utils.http import urlsafe_base64_encode
from django.contrib.sites.shortcuts import get_current_site
from authentication.tasks import send_verify_email, send_verify_sms
from accounting.permissions import IsAdminUser
from django.utils.encoding import smart_bytes
from actstream.actions import follow, unfollow
from accounting.serializers import MeSerializer
from django.template.loader import render_to_string
from django.utils.translation import gettext_lazy as _
from django.utils.html import strip_tags

User = get_user_model()


class MeView(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = User.objects.all()
    serializer_class = MeSerializer

    def get(self, request, *args, **kwargs):
        user = self.queryset.get(username=request.user.username)
        serializer = self.serializer_class(instance=user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, *args, **kwargs):
        user = self.queryset.get(username=request.user.username)
        serializer = self.serializer_class(instance=user, data=request.data, partial=True)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


class UpdateSubUserView(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated, IsAdminUser)
    queryset = User.objects.filter(deleted_at=None)
    serializer_class = UpdateSubUserSerializer
    lookup_field = 'pk'

    def patch(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)


class RetrieveSubUserView(mixins.RetrieveModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated, IsAdminUser)
    queryset = User.objects.filter(deleted_at=None)
    serializer_class = UpdateSubUserSerializer
    lookup_field = 'pk'

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)


class DestroySubUserView(mixins.DestroyModelMixin, generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated, IsAdminUser)
    serializer_class = UpdateSubUserSerializer
    queryset = User.objects.filter(deleted_at=None)
    lookup_field = 'pk'

    def delete(self, request, *args, **kwargs):
        user = User.objects.get(id=kwargs.get('pk'))
        for admin in User.objects.filter(is_admin=True, organization=self.request.user.organization):
            unfollow(admin, user)
        return self.destroy(request, *args, **kwargs)

    def perform_destroy(self, instance):
        action.send(sender=self.request.user, action_object=instance, target=self.request.user.organization, verb=_("Removed user"))
        instance.is_active = False
        instance.save()
        instance.delete()


class ListSubUser(ListAPIView):
    serializer_class = ListSubUserSerializer
    permission_classes = (permissions.IsAuthenticated, IsAdminUser)
    queryset = User.objects.filter(deleted_at=None)

    def get_queryset(self):
        queryset = self.queryset.filter(organization=self.request.user.organization)

        return queryset


class AddSubUser(generics.GenericAPIView):
    serializer_class = AddSubUserSerializer
    permission_classes = (permissions.IsAuthenticated, IsAdminUser)

    def post(self, request):
        translation.activate('fa')

        user = User.objects.filter(organization=self.request.user.organization, phone=request.data.get('phone', None))
        if user.exists():
            serializer = self.serializer_class(instance=user[0], data=request.data, partial=True)
            if serializer.is_valid(raise_exception=True):
                serializer.save(is_active=True, deleted_at=None)
        else:
            serializer = self.serializer_class(data=request.data)
            if serializer.is_valid(raise_exception=True):
                serializer.save(organization=self.request.user.organization, is_active=True, deleted_at=None)

        user = User.objects.get(organization=self.request.user.organization, phone=serializer.data['phone'])
        uidb64 = urlsafe_base64_encode(smart_bytes(user.id))
        token = PasswordResetTokenGenerator().make_token(user)

        link = f"https://viranique.com/Panel/ForgetPassword/{uidb64}/{token}"
        html_message = render_to_string("../templates/authentication.html", context={"link": link})
        plain_message = strip_tags(html_message)
        data = {'html_message': html_message,
                'plain_message': plain_message,
                'email_subject': 'Verify your email',
                'to_email': user.email}
        send_verify_email.delay(data)
        send_verify_sms.delay(user.phone, link)
        # action.send(sender=self.request.user, action_object=user, target=self.request.user.organization, verb=_("Added user"))
        for admin in User.objects.filter(is_admin=True, organization=self.request.user.organization):
            follow(admin, user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

