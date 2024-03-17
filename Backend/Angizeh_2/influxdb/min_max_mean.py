from influxdb_client import InfluxDBClient
import pandas as pd 

client = InfluxDBClient(
            url='http://smart.angizehco.com:8086',
            token='eDtNrp3b3iBeJeJ6mwwj6jquL3JFuBwb4O0d11nF3YXYGWopWbBvRavG6gHl3ECpsQJpAVU7FSIj7kOvqZalVg==',
            org='angizeh',
            timeout=30_000
        )

query = """
from(bucket: "mqtt.angizehco.com")
  |> range(start: -5d)
  |> filter(fn: (r) => r["_measurement"] == "Temperature")
  |> aggregateWindow(every: 1h, fn: mean, createEmpty: false)
  |> keep(columns: ["_time", "_value"])
  |> yield(name: "mean")

from(bucket: "mqtt.angizehco.com")
  |> range(start: -5d)
  |> filter(fn: (r) => r["_measurement"] == "Temperature")
  |> aggregateWindow(every: 1h, fn: max, createEmpty: false)
  |> keep(columns: ["_time", "_value"])
  |> yield(name: "max")

from(bucket: "mqtt.angizehco.com")
  |> range(start: -5d)
  |> filter(fn: (r) => r["_measurement"] == "Temperature")
  |> aggregateWindow(every: 1h, fn: min, createEmpty: false)
  |> keep(columns: ["_time", "_value"])
  |> yield(name: "min")

"""
query_api = client.query_api()
results = query_api.query_data_frame(query)
for i in range(len(results)):
    results[i] = results[i][["_time", "_value"]].rename(columns={"_value": results[i]["result"][0]})
    results[i] = results[i].set_index('_time').tz_convert("Asia/Tehran").reset_index().sort_values('_time')
    if i != 0:
        results[i] = pd.merge_asof(results[i-1], results[i], on="_time",)

print(results[-1])
client.close()
