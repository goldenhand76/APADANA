from django.apps import AppConfig


class AutomationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'automation'

    def ready(self):
        import automation.signals
        from actstream import registry
        registry.register(self.get_model('ManualTile'))
        registry.register(self.get_model('AutomaticTile'))
