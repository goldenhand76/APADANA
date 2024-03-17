from django.core.validators import ValidationError
from django.db.models import Q
from rest_framework.exceptions import AuthenticationFailed
from django.utils.translation import gettext_lazy as _
from django.contrib import auth
from authentication.models import User


def username_validator(username):
    if not username.isalnum():
        raise ValidationError("نام کاربری نمیتواند حاوی فضای خالی باشد.", code="bad_username")


def phone_validator(phone):
    if not phone.startswith('09'):
        raise ValidationError("شماره تلفن با 09 آغاز شود.", code="bad_phone")


def password_validator(password):
    if not any(char.isdigit() for char in password):
        raise ValidationError("گذرواژه باید شامل حداقل یک عدد باشد.", code="numeric_required")
    if not any(char.isalpha() for char in password):
        raise ValidationError("گذرواژه باید شامل حداقل یک حرف باشد.", code="alphabetic_required")


def credential_validator(form):
    qs = User.objects.filter(Q(username__iexact=form["username"]) | Q(email__iexact=form["username"]) | Q(phone__iexact=form["username"]))
    user = auth.authenticate(username=qs.first().username, password=form["password"])

    if not qs.exists():
        raise AuthenticationFailed()
    if not user:
        raise AuthenticationFailed()
    if not user.is_active:
        raise AuthenticationFailed("اکانت شما به صورت موقت از دسنرسی خارج شده است. لطفا با پشتیبانی تماس بگیرید.", code="disabled_account")
    if not user.is_verified:
        raise AuthenticationFailed("اکانت شما در انتظار تاییدیه ایمیل یا شماره همراه می باشد.", code="not_verified_account")
        # TODO put link to resend the email
