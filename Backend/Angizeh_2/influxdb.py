from influxdb_client import InfluxDBClient
import logging


class InfluxClient:
    def __init__(self):
        self.client = InfluxDBClient(
            url='http://mqtt.angizehco.com:8086',
            token='BrsUiyZJgaQM2obrWj4kH4roMRaJq15k8rojtrjfkPNei0c6L5GZw9tjylwv660e8R5c3-JU8lEaAW3FHSQJtQ==',
            org='angizeh',
            timeout=30_000
        )

    def connection(self):
        if self.client.ping():
            return self.client
        else:
            self.__init__()
            return self.client
