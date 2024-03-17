from django.apps import AppConfig


class DeviceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'device'

    def ready(self):
        import device.signals
        from actstream import registry
        registry.register(self.get_model('Sensor'))
        registry.register(self.get_model('Actuator'))