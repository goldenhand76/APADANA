from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.validators import (
    EmailValidator, MaxLengthValidator, MaxValueValidator, MinLengthValidator,
    MinValueValidator, ProhibitNullCharactersValidator, RegexValidator,
    URLValidator, ip_address_validators, ValidationError
)
from accounting.validators import update_username_validator, create_username_validator, phone_validator, email_validator, photo_validator
import logging
import random
import string

logger = logging.getLogger('django')
User = get_user_model()


def key_generator():
    random_char = ''.join(random.choices(string.ascii_uppercase + string.digits + string.ascii_lowercase, k=16))
    return random_char


class MeSerializer(serializers.ModelSerializer):
    photo = serializers.FileField(validators=[photo_validator])

    class Meta:
        model = User
        fields = ['name', 'last_name', 'phone', 'email', 'username', 'photo', 'address', 'is_admin', 'can_monitor', 'can_control']

    def validate(self, attrs):
        return attrs


class UpdateSubUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=False, validators=[update_username_validator])
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(required=False, validators=[phone_validator])

    class Meta:
        model = User
        fields = ['name', 'last_name', 'username', 'email', 'phone', 'is_admin', 'can_monitor', 'can_control']


class ListSubUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'last_name', 'username', 'is_admin', 'is_verified', 'is_active', 'can_monitor',
                  'can_control']


class AddSubUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(validators=[create_username_validator])
    email = serializers.EmailField(validators=[email_validator], required=False)
    name = serializers.CharField(max_length=32, allow_null=True, allow_blank=True)
    last_name = serializers.CharField(max_length=32, allow_null=True, allow_blank=True)
    phone = serializers.CharField(max_length=11, min_length=11, validators=[phone_validator])

    class Meta:
        model = User
        fields = ['name', 'last_name', 'email', 'username', 'phone', 'is_admin', 'can_monitor', 'can_control']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        user.set_password(key_generator())
        user.save()
        return user
