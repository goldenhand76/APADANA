from influxdb_client import InfluxDBClient
from influxdb_client.client.warnings import MissingPivotFunction
import warnings

import logging
from django.conf import settings

class InfluxClient:
    def __init__(self):
        self.client = InfluxDBClient(
            url=settings.INFLUXDB_HOST,
            token=settings.INFLUXDB_TOKEN,
            org=settings.INFLUXDB_ORG,
            timeout=30_000
        )
        warnings.simplefilter("ignore", MissingPivotFunction)

    def connection(self):
        if self.client.ping():
            return self.client
        else:
            self.__init__()
            return self.client
