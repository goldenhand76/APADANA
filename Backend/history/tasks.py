import re
from pytz import timezone
import influxdb_client
import logging
from Angizeh_2 import influx_client
import pandas as pd
from celery import shared_task
from django.core.cache import cache

from device.models import Sensor

logger = logging.getLogger('django')


# @shared_task(name="chart")
def influx_query(sensor_list, duration_from, duration_to, timestamp):
    responses = []
    client = influx_client.connection()
    for pk in sensor_list:
        sensor = Sensor.objects.filter(pk=pk)
        if sensor.exists():
            sensor = sensor.first()
            topic = sensor.value_topic
            if len(topic.split("/")) == 6:
                owner, gate, node, type = re.findall("/angizeh/(.*)/(.*)/(.*)/(.*)", topic)[0]
                mean_query = f'''
                            from(bucket:"mqtt.angizehco.com") 
                            |> range(start: {duration_from.strftime('%Y-%m-%dT%H:%M:%SZ')}, stop: {duration_to.strftime('%Y-%m-%dT%H:%M:%SZ')}) 
                            |> filter(fn: (r) => r["_measurement"] == "{type}")
                            |> filter(fn: (r) => r["owner"] == "{owner}")
                            |> filter(fn: (r) => r["gateway"] == "{gate}")
                            |> filter(fn: (r) => r["node"] == "{node}")
                            |> aggregateWindow(every: {timestamp}, fn: mean, createEmpty: false)
                            |> yield(name: "mean_value")\n'''
            elif len(topic.split("/")) == 5:
                part_no, gate, type = re.findall("/angizeh/(.*)/(.*)/(.*)", topic)[0]
                mean_query = f"""
                            from(bucket:"mqtt.angizehco.com")\n
                            |> range(start: {duration_from.strftime('%Y-%m-%dT%H:%M:%SZ')}, stop: {duration_to.strftime('%Y-%m-%dT%H:%M:%SZ')}) 
                            |> filter(fn: (r) => r["_measurement"] == "{type}")
                            |> filter(fn: (r) => r["part_number"] == "{part_no}")
                            |> filter(fn: (r) => r["gateway"] == "{gate}")
                            |> aggregateWindow(every: {timestamp}, fn: mean, createEmpty: false)
                            |> yield(name: "mean_value")\n"""
            else:
                return []
            duration_from = duration_from.astimezone(timezone('UTC'))
            duration_to = duration_to.astimezone(timezone('UTC'))
            # min_query = f'''
            #             from(bucket:"mqtt.angizehco.com")
            #             |> range(start: {duration_from.strftime('%Y-%m-%dT%H:%M:%SZ')}, stop: {duration_to.strftime('%Y-%m-%dT%H:%M:%SZ')})
            #             |> filter(fn: (r) => r["_measurement"] == "{type}")
            #             |> filter(fn: (r) => r["owner"] == "{owner}")
            #             |> filter(fn: (r) => r["gateway"] == "{gate}")
            #             |> filter(fn: (r) => r["node"] == "{node}")
            #             |> aggregateWindow(every: {timestamp}, fn: min, createEmpty: false)
            #             |> yield(name: "min")\n'''
            # max_query = f'''
            #             from(bucket:"mqtt.angizehco.com")
            #             |> range(start: {duration_from.strftime('%Y-%m-%dT%H:%M:%SZ')}, stop: {duration_to.strftime('%Y-%m-%dT%H:%M:%SZ')})
            #             |> filter(fn: (r) => r["_measurement"] == "{type}")
            #             |> filter(fn: (r) => r["owner"] == "{owner}")
            #             |> filter(fn: (r) => r["gateway"] == "{gate}")
            #             |> filter(fn: (r) => r["node"] == "{node}")
            #             |> aggregateWindow(every: {timestamp}, fn: max, createEmpty: false)
            #             |> yield(name: "max")\n'''
            query_api = client.query_api()
            results = query_api.query_data_frame(mean_query)
            logger.debug(results)
            if isinstance(results, list):
                for i in range(len(results)):
                    results[i] = results[i][["_time", "_value"]].rename(columns={"_time": "time", "_value": results[i]["result"][0]})
                    results[i] = results[i].set_index('time').tz_convert("Asia/Tehran").reset_index().sort_values('time')
                    if i > 0:
                        results[i] = pd.merge_asof(results[i-1], results[i], on="time",)
                records = results[-1].to_dict(orient='records')
                responses.append({sensor[0].id: records})
            elif not results.empty:
                results = results[["_time", "_value"]].rename(columns={"_time": "time", "_value": results["result"][0]})
                results = results.set_index('time').tz_convert("Asia/Tehran").reset_index().sort_values('time')
                records = results.to_dict(orient='records')
                responses.append({sensor.id: records})
            else:
                responses.append({sensor.id: []})
    return responses
