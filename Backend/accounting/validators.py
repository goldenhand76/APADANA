from django.db.models import Q
from django.core.validators import ValidationError
from django.utils.translation import gettext_lazy as _
from authentication.models import User


def photo_validator(photo):
    if photo.size > 200000:
        raise ValidationError("سایز عکس ارسالی کمتر از 200KB باشد.")
    else:
        return photo


def create_username_validator(username):
    if not username.isalnum():
        raise ValidationError("مقدار این فیلد نباید خالی باشد.", code="null_username")

    if User.objects.filter(username=username, deleted_at=None).exists():
        raise ValidationError("این نام کاربری قبلا ثبت شده است،", code="username_exists")


def update_username_validator(username):
    if not username.isalnum():
        raise ValidationError("مقدار این فیلد نباید خالی باشد.", code="null_username")


def phone_validator(phone):
    if User.objects.filter(phone=phone, deleted_at=None).exists():
        raise ValidationError("این شماره تلفن قبلا برای این سرویس ثبت شده است.", code="existing_phone_number")
    if not phone.startswith('09'):
        raise ValidationError("شماره تلفن با 09 آغاز شود.", code="bad_phone")


def email_validator(email):
    if User.objects.filter(email=email, deleted_at=None).exists():
        raise ValidationError("قبلا اکانتی با این آدرس ایمیل ثبت شده است.", code="email_exists")
