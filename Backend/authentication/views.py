from datetime import timedelta
from django.utils import timezone
import requests
from actstream.actions import follow
import logging
from django.contrib import auth
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from rest_framework import generics, status, views, permissions
from .serializers import RegisterSerializer, LoginSerializer, LogoutSerializer, EmailVerificationSerializer, \
    ResetPasswordEmailRequestSerializer, SetNewPasswordSerializer, ChangePasswordSerializer, PhoneLoginSerializer, \
    PhoneCodeSerializer
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Code
from .renderers import UserRenderer
from rest_framework.reverse import reverse
from django.contrib.auth import login
from .tasks import send_verify_email, send_verify_sms, send_register_email
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import smart_str, smart_bytes, DjangoUnicodeDecodeError
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.contrib.sites.shortcuts import get_current_site
from django.urls import reverse
from django.db.models import Q
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.authentication import SessionAuthentication, BasicAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return


logger = logging.getLogger('django.request')


class RegisterView(generics.GenericAPIView):
    serializer_class = RegisterSerializer
    renderer_classes = (UserRenderer,)

    def post(self, request):
        user = request.data
        serializer = self.serializer_class(data=user)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        user_data = serializer.data

        user = User.objects.get(email=user_data['email'])

        token = RefreshToken.for_user(user).access_token

        current_site = get_current_site(request).domain
        relativeLink = reverse('email-verify')

        absurl = 'http://' + current_site + relativeLink + "?token=" + str(token)
        email_body = 'Hi ' + user.username + ' Use link below to verify your email \n' + absurl
        data = {'email_body': email_body,
                'email_subject': 'Verify your email',
                'to_email': [user.email]}
        send_register_email.delay(data)
        return Response(user_data, status=status.HTTP_201_CREATED)


class VerifyEmail(views.APIView):
    serializer_class = EmailVerificationSerializer

    def post(self, request, **kwargs):
        logger.debug(request.data)
        # token = request.POST.get('token')
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid(raise_exception=True):
            return Response("Account Verified Successfully", status.HTTP_200_OK)


class LoginAPIView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (CsrfExemptSessionAuthentication, BasicAuthentication)
    queryset = User.objects.filter(deleted_at=None)

    def post(self, request):
        # ip = Util.get_client_ip(request)
        # location = Util.get_client_location(ip)
        username = request.data.get('username')
        organization = request.data.get('organization', None)
        qs = self.queryset.filter(Q(username__iexact=username) | Q(email__iexact=username) | Q(phone__iexact=username))
        if len(qs) >= 2:
            if organization:
                user = qs.filter(organization__name=organization)
                if user.exists():
                    user = user.first()
                    serializer = self.serializer_class(instance=user, data=request.data)
                    serializer.is_valid(raise_exception=True)
                    login(request, user, backend='django.contrib.auth.backends.ModelBackend')
                    return Response(serializer.data)
                raise AuthenticationFailed("Invalid credentials, try again!")
            else:
                orgs = [i[0] for i in qs.values_list('organization__name')]
                return Response({"Warning": "more Than Two Company exists.", "organizations": orgs})
        elif qs.exists():
            user = qs.first()
            serializer = self.serializer_class(instance=user, data=request.data)
            serializer.is_valid(raise_exception=True)
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            return Response(serializer.data)
        raise AuthenticationFailed("Invalid credentials, try again!")


class PhoneLoginGenerateCodeAPIView(generics.GenericAPIView):
    serializer_class = PhoneLoginSerializer
    permission_classes = (permissions.AllowAny,)
    queryset = User.objects.filter(deleted_at=None)

    def post(self, request):
        username = request.data.get('phone')
        qs = self.queryset.filter(Q(username__iexact=username) | Q(email__iexact=username) | Q(phone__iexact=username))
        if qs.exists():
            user = qs.first()
            code, created = Code.objects.get_or_create(user=user)
            code.save()
            data = {'from': '50004001927031', 'to': [user.phone], 'text': code.number, 'udh': ''}
            response = requests.post('https://console.melipayamak.com/api/send/advanced/fe0dc37dac1c4ebebde2f5a49a54b5e2', json=data)
            return Response({"to": [data["to"][0][:4] + "***" + data["to"][0][7:]]})
        raise AuthenticationFailed("Invalid credentials, try again!")


class PhoneLoginAPIView(generics.GenericAPIView):
    serializer_class = PhoneCodeSerializer
    permission_classes = (permissions.AllowAny,)
    queryset = Code.objects.all()

    def post(self, request):
        number = request.data.get('number')
        qs = self.queryset.filter(number=number)
        within_60_seconds = timezone.now() - timedelta(seconds=120)
        if qs.exists():
            qs = qs.filter(Q(updated_at__range=(within_60_seconds, timezone.now())))
            if qs.exists():
                code = qs.first()
                login(request, code.user, backend='django.contrib.auth.backends.ModelBackend')
                serializer = LoginSerializer(instance=code.user)
                return Response(serializer.data)
        raise AuthenticationFailed("Invalid credentials, try again!")


class RequestPasswordResetEmail(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = ResetPasswordEmailRequestSerializer
    authentication_classes = (CsrfExemptSessionAuthentication, BasicAuthentication)

    def post(self, request):
        username = request.data.get('username')
        qs = User.objects.filter(deleted_at=None)
        qs = qs.filter(Q(username__iexact=username) | Q(email__iexact=username))
        if qs.exists():
            user = qs[0]
            uidb64 = urlsafe_base64_encode(smart_bytes(user.id))
            token = PasswordResetTokenGenerator().make_token(user)

            link = f"https://viranique.com/Panel/ForgetPassword/{uidb64}/{token}"
            html_message = render_to_string("../templates/forget password.html", context={"link": link})
            plain_message = strip_tags(html_message)
            data = {'html_message': html_message,
                    'plain_message': plain_message,
                    'email_subject': 'Verify your email',
                    'to_email': user.email}
            send_verify_email.delay(data)
            send_verify_sms.delay(user.phone, link)

            return Response({'success': 'We have sent you a link to reset your password'})
        return Response(status=status.HTTP_404_NOT_FOUND)


class PasswordTokenCheckAPI(generics.GenericAPIView):
    serializer_class = SetNewPasswordSerializer

    def get(self, request, uidb64, token):
        try:
            id = smart_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(id=id)

            if not PasswordResetTokenGenerator().check_token(user, token):
                return Response({'error': 'Token is not valid'}, status=status.HTTP_401_UNAUTHORIZED)

            return Response({'success': True, 'message': 'Credential Valid', 'uidb64': uidb64, 'token': token},
                            status=status.HTTP_200_OK)

        except DjangoUnicodeDecodeError as identifier:
            if not PasswordResetTokenGenerator().check_token(user):
                return Response({'error': 'Token is not valid'}, status=status.HTTP_401_UNAUTHORIZED)


class SetNewPasswordAPIView(generics.GenericAPIView):
    serializer_class = SetNewPasswordSerializer

    def patch(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({'success': True, 'message': 'Password Reset Success'}, status=status.HTTP_200_OK)


class ChangePasswordView(generics.GenericAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated, ]

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_password = request.data['new_password']
        user = User.objects.get(username=request.data['username'])
        if user.check_password(request.data['password']):
            user.set_password(new_password)
            user.save()
            return Response({'success': 'password successfully changed'}, status=status.HTTP_200_OK)
        return Response({'failure': 'old password was not correctly set'}, status=status.HTTP_200_OK)


class LogoutAPIView(generics.GenericAPIView):
    serializer_class = LogoutSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        auth.logout(request)
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        auth.logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)
