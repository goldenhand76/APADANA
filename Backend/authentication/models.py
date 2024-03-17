from datetime import timedelta

from django.db import models
from django.contrib.auth.models import (AbstractBaseUser, BaseUserManager, PermissionsMixin)
from django.core.validators import FileExtensionValidator
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.conf import settings
from softdelete.models import SoftDeleteObject
import random
import string, random


def key_generator():
    random_char = ''.join(random.choices(string.ascii_uppercase + string.digits + string.ascii_lowercase, k=8))
    return random_char


class UserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if username is None:
            raise TypeError("User should have an username")
        user = self.model(username=username, **extra_fields)

        user.organization = extra_fields.get('organization')
        if password is None:
            password = key_generator()
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, username, email, password, **extra_fields):
        if username is None:
            raise TypeError("User should have an username.")
        if email is None:
            raise TypeError("User should have an email")
        user = self.model(username=username, email=self.normalize_email(email), **extra_fields)
        user.set_password(password)
        user.phone = '09391927031'
        user.organization = None
        user.is_admin = True
        user.is_active = True
        user.is_superuser = True
        user.is_staff = True
        user.is_verified = True
        user.save()
        return user

    def get_by_natural_key(self, username):
        return self.get(username__iexact=username)


AUTOMATION_CHOICES = (('manual', 'manual'), ('automatic', 'automatic'), ('smart', 'smart'))


class Organization(models.Model):
    name = models.CharField(max_length=64, unique=True)
    automation = models.CharField(choices=AUTOMATION_CHOICES, null=True, max_length=16)
    algorithm = models.CharField(choices=(("FORWARD", "FORWARD"), ("BACKWARD", "BACKWARD")), null=True, max_length=8)
    max_users = models.IntegerField(default=5)
    max_tabs = models.IntegerField(default=5)
    max_tiles_per_tab = models.IntegerField(default=10)
    email = models.BooleanField(default=False)
    message = models.BooleanField(default=False)
    telegram = models.BooleanField(default=False)
    push_notification = models.BooleanField(default=False)
    notification_interval = models.IntegerField(default=1800)
    cash = models.IntegerField(default=100000)
    sms_price = models.IntegerField(default=510)

    class Meta:
        db_table = "organization"

    def __str__(self):
        return self.name


class OrganizationNotification(models.Model):
    organization = models.OneToOneField(Organization, on_delete=models.CASCADE, blank=True, null=True)
    email = models.BooleanField(default=False)
    message = models.BooleanField(default=False)
    telegram = models.BooleanField(default=False)

    class Meta:
        db_table = "organization_notification"

    def __str__(self):
        return f'{self.organization.name}'


def user_directory_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    return 'user_{0}/profile/{1}'.format(instance.id, filename)


class User(SoftDeleteObject, AbstractBaseUser, PermissionsMixin):
    photo = models.FileField(upload_to=user_directory_path, null=True, blank=True, validators=[FileExtensionValidator(['png', 'jpeg', 'gif', 'jpg'])])

    name = models.CharField(max_length=32, blank=True, null=True)
    last_name = models.CharField(max_length=32, blank=True, null=True)

    username = models.CharField(max_length=255, unique=True, db_index=True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='users', null=True)

    email = models.EmailField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=13)

    address = models.TextField(max_length=150, default='')

    is_superuser = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)

    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    can_monitor = models.BooleanField(blank=True, default=False)
    can_control = models.BooleanField(blank=True, default=False)

    objects = UserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', ]

    class Meta:
        db_table = "user"
        unique_together = ('organization', 'phone')

    def __str__(self):
        return self.username

    def tokens(self):
        refresh = RefreshToken.for_user(self)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        }


class Code(models.Model):
    number = models.CharField(max_length=6, blank=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.number)

    def save(self, *args, **kwargs):
        number_list = [x for x in range(10)]
        code_items = []
        for i in range(6):
            num = random.choice(number_list)
            code_items.append(num)
        code_string = "".join(str(item) for item in code_items)
        self.number = code_string
        super().save(*args, **kwargs)


class LoggedInUser(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, related_name='logged_in_user', on_delete=models.CASCADE)
    last_login = models.DateTimeField(default=timezone.now)
    is_online = models.BooleanField(default=False)
    channel_name = models.CharField(max_length=256, blank=True, null=True)
