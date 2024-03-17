from django.apps import AppConfig


class AuthenticationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'authentication'

    def ready(self):
        import authentication.signals
        from actstream import registry
        registry.register(self.get_model('User'))
        registry.register(self.get_model('Organization'))
