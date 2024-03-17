from django.urls import path
from .views import RegisterView, VerifyEmail, LoginAPIView, LogoutAPIView, PasswordTokenCheckAPI, \
    RequestPasswordResetEmail, SetNewPasswordAPIView, ChangePasswordView, PhoneLoginGenerateCodeAPIView, \
    PhoneLoginAPIView
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

urlpatterns = [
    # path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginAPIView.as_view(), name='login'),
    path('phone-login/', PhoneLoginGenerateCodeAPIView.as_view(), name='phone-login'),
    path('code-login/', PhoneLoginAPIView.as_view(), name='code-login'),
    path('logout/', LogoutAPIView.as_view(), name='logout'),

    path('email-verify/<uidb64>/<token>/', VerifyEmail.as_view(), name='email-verify'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('request-reset-email/', RequestPasswordResetEmail.as_view(), name="request-reset-email"),
    path('panel/ForgetPassword/<uidb64>/<token>/', PasswordTokenCheckAPI.as_view(), name='password-reset-confirm'),
    path('password-reset-complete', SetNewPasswordAPIView.as_view(), name='password-reset-complete'),

    path('change-password/', ChangePasswordView.as_view(), name="change-password"),

]
