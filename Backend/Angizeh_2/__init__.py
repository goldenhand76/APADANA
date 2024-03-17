# from django.utils import translation

from .celeryapp import app as celery_app
from .influxdb import InfluxClient
# translation.activate('fa')
influx_client = InfluxClient()
