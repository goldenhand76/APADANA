from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from django.core.exceptions import ValidationError
from authentication.models import User, Organization, LoggedInUser, OrganizationNotification, Code

from rest_framework_simplejwt import token_blacklist


class UserCreationForm(forms.ModelForm):
    """A form for creating new users. Includes all the required
    fields, plus a repeated password."""
    password1 = forms.CharField(label='Password', widget=forms.PasswordInput)
    password2 = forms.CharField(label='Password confirmation', widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ('username', 'email', 'organization')

    def clean_password2(self):
        # Check that the two password entries match
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise ValidationError("Passwords don't match")
        return password2

    def save(self, commit=True):
        # Save the provided password in hashed format
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user


class UserChangeForm(forms.ModelForm):
    """A form for updating users. Includes all the fields on
    the user, but replaces the password field with admin's
    disabled password hash display field.
    """
    password = ReadOnlyPasswordHashField()

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'is_admin', 'is_staff', 'is_active', 'is_verified')


class UserAdmin(BaseUserAdmin):
    # The forms to add and change user instances
    form = UserChangeForm
    add_form = UserCreationForm

    # The fields to be used in displaying the User model.
    # These override the definitions on the base UserAdmin
    # that reference specific fields on auth.User.
    list_display = ('username', 'organization', 'email', 'is_staff', 'deleted_at')
    list_filter = ('is_staff',)
    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        ('Personal info', {'fields': ('photo', 'name', 'last_name', 'phone', 'organization',)}),
        ('Permissions', {'fields': ('is_admin', 'is_staff', 'is_verified', 'is_active', 'groups', 'user_permissions',
                                    'can_monitor', 'can_control')}),
    )
    # add_fieldsets is not a standard ModelAdmin attribute. UserAdmin
    # overrides get_fieldsets to use this attribute when creating a user.
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'phone', 'organization', 'password1', 'password2'),
        }),
    )
    search_fields = ('email',)
    ordering = ('email',)
    filter_horizontal = ()


class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('name', 'id', 'max_users', 'cash')


class CodeAdmin(admin.ModelAdmin):
    list_display = ('number', 'user', 'updated_at')


class OrganizationNotificationAdmin(admin.ModelAdmin):
    list_display = ('organization',)


class LoggedInUserAdmin(admin.ModelAdmin):
    list_filter = ('is_online',)
    list_display = ("user", "is_online")


admin.site.register(User, UserAdmin)
admin.site.register(Code, CodeAdmin)
admin.site.register(LoggedInUser, LoggedInUserAdmin)
admin.site.register(Organization, OrganizationAdmin)

admin.site.register(OrganizationNotification, OrganizationNotificationAdmin)


class OutstandingTokenAdmin(token_blacklist.admin.OutstandingTokenAdmin):

    def has_delete_permission(self, *args, **kwargs):
        return True


admin.site.unregister(token_blacklist.models.OutstandingToken)
admin.site.register(token_blacklist.models.OutstandingToken, OutstandingTokenAdmin)
