from Angizeh_2.views import favicon
from django.contrib import admin
# from two_factor.admin import AdminSiteOTPRequired
from django.urls import include, path
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
# from two_factor.urls import urlpatterns as tf_urls

schema_view = get_schema_view(
    openapi.Info(
        title="Angizeh",
        default_version='v2',
        description="Test description",
        terms_of_service="https://www.ourapp.com/policies/terms/",
        contact=openapi.Contact(email="contact@angizeh.local"),
        license=openapi.License(name="Test License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

# admin.site.__class__ = AdminSiteOTPRequired

urlpatterns = [
    path('api/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('admin/', admin.site.urls),
    # path('jet/', include('jet.urls', 'jet')),  # Django JET URLS
    # path('jet/dashboard/', include('jet.dashboard.urls', 'jet-dashboard')),  # Django JET monitoring URLS
    # path('', include(tf_urls)),
    path('api/auth/', include('authentication.urls'), name='auth'),
    path('api/settings/', include('settings.urls'), name='settings'),
    path('api/device/', include('device.urls'), name='device'),
    path('api/history/', include('history.urls'), name='history'),
    path('api/dashboard/', include('monitoring.urls'), name='monitoring'),
    path('api/accounting/', include('accounting.urls'), name='accounting'),
    path('api/automation/', include('automation.urls'), name='automation'),
    path('api/notification/', include('notifications.urls'), name='notifications'),
    path('api/activity/', include('activity.urls'), name='activity'),

    path('__debug__/', include('debug_toolbar.urls')),
    path("favicon.ico", favicon)
]
