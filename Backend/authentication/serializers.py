from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from django.contrib import auth
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.contrib.auth import get_user_model
from authentication.models import Organization, Code
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_str, smart_bytes
from authentication.validators import password_validator, phone_validator, username_validator, credential_validator
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(max_length=68,
                                     label=("Password"),
                                     style={'input_type': 'password'},
                                     trim_whitespace=False,
                                     min_length=6,
                                     validators=[password_validator],
                                     write_only=True)
    phone = serializers.CharField(max_length=11, min_length=11, validators=[phone_validator])

    class Meta:
        model = User
        fields = ['name', 'last_name', 'email', 'username', 'password', 'phone', 'company']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class EmailVerificationSerializer(serializers.Serializer):
    token = serializers.CharField(min_length=1, max_length=555)
    uidb64 = serializers.CharField(min_length=1, max_length=68)
    password = serializers.CharField(max_length=68,
                                     label="Password",
                                     style={'input_type': 'password'},
                                     trim_whitespace=False,
                                     min_length=6,
                                     validators=[password_validator],
                                     write_only=True)

    class Meta:
        fields = ['password', 'token', 'uidb64']

    def validate(self, attrs):
        uidb64 = attrs.get('uidb64', '')
        token = attrs.get('token', '')
        password = attrs.get('password', '')

        try:
            id = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(id=id)
            if not PasswordResetTokenGenerator().check_token(user, token):
                raise AuthenticationFailed('The reset link is invalid', 401)
            user.is_verified = True
            user.set_password(password)
            user.save()
        except Exception as e:
            raise AuthenticationFailed('The reset link is invalid', 401)
        return super().validate(attrs)


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = '__all__'


class LoginSerializer(serializers.ModelSerializer):
    username = serializers.CharField(max_length=255, min_length=3, required=True)
    password = serializers.CharField(max_length=68,
                                     label=("Password"),
                                     style={'input_type': 'password'},
                                     trim_whitespace=False,
                                     min_length=6,
                                     write_only=True)
    organization = OrganizationSerializer(read_only=True)
    uidb64 = serializers.SerializerMethodField()
    tokens = serializers.SerializerMethodField()

    def get_tokens(self, user):
        return {
            'refresh': user.tokens()['refresh'],
            'access': user.tokens()['access']
        }

    def get_uidb64(self, user):
        return urlsafe_base64_encode(smart_bytes(user.id))

    class Meta:
        model = User
        read_only_fields = (
            'profile', 'name', 'last_name', 'email', 'phone', 'address', 'tokens', 'organization', 'is_admin',
            'is_staff', 'is_verified', 'is_active', 'created_at', 'updated_at', 'can_monitor', 'can_control',
            'last_login')
        fields = "__all__"
        validators = [credential_validator]


class PhoneLoginSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(max_length=11, min_length=11, required=True)

    class Meta:
        model = User
        fields = ("phone",)


class PhoneCodeSerializer(serializers.ModelSerializer):
    number = serializers.CharField(max_length=5, min_length=5, required=True)

    class Meta:
        model = Code
        fields = ("number",)


class ResetPasswordEmailRequestSerializer(serializers.Serializer):
    username = serializers.EmailField(max_length=255, min_length=3, required=True)
    redirect_url = serializers.CharField(max_length=500, required=False)

    class Meta:
        fields = ['username']


class ChangePasswordSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=255, min_length=3)
    password = serializers.CharField(max_length=68,
                                     label=("Password"),
                                     style={'input_type': 'password'},
                                     trim_whitespace=False,
                                     min_length=6,
                                     write_only=True)

    new_password = serializers.CharField(max_length=68,
                                         label=("new_password"),
                                         style={'input_type': 'password'},
                                         trim_whitespace=False,
                                         min_length=6,
                                         write_only=True)

    class Meta:
        validators = [credential_validator]


class SetNewPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(min_length=6, max_length=68, write_only=True)
    token = serializers.CharField(min_length=1, write_only=True)
    uidb64 = serializers.CharField(min_length=1, max_length=68, write_only=True)

    class Meta:
        fields = ['password', 'token', 'uidb64']

    def validate(self, attrs):
        try:
            password = attrs.get('password')
            token = attrs.get('token')
            uidb64 = attrs.get('uidb64')
            id = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(id=id)
            if not PasswordResetTokenGenerator().check_token(user, token):
                raise AuthenticationFailed('The reset link is invalid', 401)
            user.set_password(password)
            user.save()

        except Exception as e:
            raise AuthenticationFailed('The reset link is invalid', 401)

        return super().validate(attrs)


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()
    default_error_messages = {
        'bad_token': ('Token is expired or invalid')
    }

    def validate(self, attrs):
        self.token = attrs['refresh']
        return attrs

    def save(self, **kwargs):
        try:
            RefreshToken(self.token).blacklist()
        except TokenError:
            self.fail('bad_token')
