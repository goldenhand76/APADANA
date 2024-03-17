import pint
import pint_pandas

from Angizeh_2 import influx_client
import pandas as pd
import re
import logging

logger = logging.getLogger('django')
ureg = pint.UnitRegistry()
ureg.Unit.default_format = "~P"
pint_pandas.PintType.ureg.default_format = "~P"


def influx_gauge_query(tile, topic):
    # Get parameters from topic and create query
    client = influx_client.connection()
    if len(topic.split("/")) == 6:
        owner, gate, node, type = re.findall("/angizeh/(.*)/(.*)/(.*)/(.*)", topic)[0]
        query = f"""
            from(bucket:"mqtt.angizehco.com")\n
              |> range(start: -1h)
              |> filter(fn: (r) => r["_measurement"] == "{type}")
              |> filter(fn: (r) => r["owner"] == "{owner}")
              |> filter(fn: (r) => r["gateway"] == "{gate}")
              |> filter(fn: (r) => r["node"] == "{node}")
              |> keep(columns: ["_time", "_value"])
              |> last()
            """
    elif len(topic.split("/")) == 5:
        part_no, gate, type = re.findall("/angizeh/(.*)/(.*)/(.*)", topic)[0]
        query = f"""
            from(bucket:"mqtt.angizehco.com")\n
              |> range(start: -1h)
              |> filter(fn: (r) => r["_measurement"] == "{type}")
              |> filter(fn: (r) => r["part_number"] == "{part_no}")
              |> filter(fn: (r) => r["gateway"] == "{gate}")
              |> keep(columns: ["_time", "_value"])
              |> last()
            """
    else:
        return []
    query_api = client.query_api()
    try:
        result = query_api.query_data_frame(query)[0]
    except KeyError:
        result = query_api.query_data_frame(query)
    precision_dict = {
        "1": 0,
        "0.1": 1
    }
    precision = precision_dict.get(tile.precision, '0.1')
    if not result.empty:
        if tile.sensor.type.default_unit not in ["%", None]:
            unit = tile.sensor.type.default_unit
        else:
            unit = 1
        df = pd.DataFrame({
            "time": result["_time"],
            "value": pd.Series(result["_value"], dtype=f"pint[{unit}]"),
        })
        if tile.unit != tile.sensor.type.default_unit:
            df['value'] = df['value'].pint.to(f"{tile.unit}")
        df = df.pint.dequantify()
        df.columns = [c[0] for c in df.columns]
        df = df.set_index('time').tz_localize("UTC").tz_convert("Asia/Tehran").reset_index()
        df['value'] = round(df['value'], precision)
        df = df.to_dict(orient='records')
        return df
    else:
        return []


def influx_graph_query(tile, topic):
    # Get parameters from topic and create query
    client = influx_client.connection()
    if len(topic.split("/")) == 6:
        owner, gate, node, type = re.findall("/angizeh/(.*)/(.*)/(.*)/(.*)", topic)[0]
        filter = f"""
        |> filter(fn: (r) => r["_measurement"] == "{type}")
        |> filter(fn: (r) => r["owner"] == "{owner}")
        |> filter(fn: (r) => r["gateway"] == "{gate}")
        |> filter(fn: (r) => r["node"] == "{node}")
        |> keep(columns: ["_time", "_value"])
        """
    elif len(topic.split("/")) == 5:
        part_no, gate, type = re.findall("/angizeh/(.*)/(.*)/(.*)", topic)[0]
        filter = f"""
        |> filter(fn: (r) => r["_measurement"] == "{type}")
        |> filter(fn: (r) => r["part_number"] == "{part_no}")
        |> filter(fn: (r) => r["gateway"] == "{gate}")
        |> keep(columns: ["_time", "_value"])
        """
    else:
        return []

    bucket = """import "timezone"\n
         option location = timezone.location(name: "Asia/Tehran")\n
         from(bucket:"mqtt.angizehco.com")\n"""
    # Set time range in influx query
    range_dict = {
        '5m': f"""  |> range(start: -5m)""",
        '30m': f""" |> range(start: -30m)""",
        '1h': f"""  |> range(start: -1h)""",
        '6h': f"""  |> range(start: -6h)""",
        '1d': f"""  |> range(start: -1d)""",
    }
    range = range_dict.get(tile.timeRange, '5m')

    # Set time stamp in influx query
    time_stamp_dic = {
        '5m': f"""|> aggregateWindow(every: 10s, fn: mean, createEmpty: false)\n""",
        '30m': f"""|> aggregateWindow(every: 30s, fn: mean, createEmpty: false)\n""",
        '1h': f"""|> aggregateWindow(every: 1m, fn: mean, createEmpty: false)\n""",
        '6h': f"""|> aggregateWindow(every: 6m, fn: mean, createEmpty: false)\n""",
        '1d': f"""|> aggregateWindow(every: 10m, fn: mean, createEmpty: false)\n""",
    }
    time_stamp = time_stamp_dic.get(tile.timeRange, '5m')
    fill = """|> fill(column: "_value", usePrevious: true)"""
    query = bucket + range + filter + time_stamp + fill
    query_api = client.query_api()
    result = query_api.query_data_frame(query)
    precision_dict = {"1": 0, "0.1": 1}
    precision = precision_dict.get(tile.precision, '0.1')
    if not result.empty:
        if tile.sensor.type.default_unit not in ["%", None]:
            unit = tile.sensor.type.default_unit
        else:
            unit = 1
        df = pd.DataFrame({
            "time": result["_time"],
            "value": pd.Series(result["_value"], dtype=f"pint[{unit}]"),
        })
        if tile.unit != tile.sensor.type.default_unit:
            df['value'] = df['value'].pint.to(f"{tile.unit}")
        df = df.pint.dequantify()
        df.columns = [c[0] for c in df.columns]
        df = df.set_index('time').tz_localize("UTC").tz_convert("Asia/Tehran").reset_index()
        df['value'] = round(df['value'], precision)
        df = df.to_dict(orient='records')
        return df
    else:
        return []


def influx_query(tile, topic):
    # Get parameters from topic and create query
    client = influx_client.connection()
    owner, gate, node, type = re.findall("/angizeh/(.*)/(.*)/(.*)/(.*)", topic)[0]
    bucket = """from(bucket:"mqtt.angizehco.com")\n"""

    if tile.type == "Gauge":
        query = f"""
        from(bucket:"mqtt.angizehco.com")\n
          |> range(start: -1h)
          |> filter(fn: (r) => r["_measurement"] == "{type}")
          |> filter(fn: (r) => r["owner"] == "{owner}")
          |> filter(fn: (r) => r["gateway"] == "{gate}")
          |> filter(fn: (r) => r["node"] == "{node}")
          |> keep(columns: ["_time", "_value"])
          |> last()
        """

    else:
        # Set time range in influx query
        range_dict = {
            '5m': f"""  |> range(start: -5m)""",
            '30m': f""" |> range(start: -30m)""",
            '1h': f"""  |> range(start: -1h)""",
            '6h': f"""  |> range(start: -6h)""",
            '1d': f"""  |> range(start: -1d)""",
        }
        range = range_dict.get(tile.timeRange, '5m')

        filter = f"""
        |> filter(fn: (r) => r["_measurement"] == "{type}")
        |> filter(fn: (r) => r["owner"] == "{owner}")
        |> filter(fn: (r) => r["gateway"] == "{gate}")
        |> filter(fn: (r) => r["node"] == "{node}")
        """

        # Set time stamp in influx query
        time_stamp_dic = {
            '5m': f"""|> aggregateWindow(every: 10s, fn: mean, createEmpty: false)\n""",
            '30m': f"""|> aggregateWindow(every: 30s, fn: mean, createEmpty: false)\n""",
            '1h': f"""|> aggregateWindow(every: 1m, fn: mean, createEmpty: false)\n""",
            '6h': f"""|> aggregateWindow(every: 6m, fn: mean, createEmpty: false)\n""",
            '1d': f"""|> aggregateWindow(every: 10m, fn: mean, createEmpty: false)\n""",
        }
        time_stamp = time_stamp_dic.get(tile.timeRange, '5m')
        fill = """|> fill(column: "_value", usePrevious: true)"""
        query = bucket + range + filter + time_stamp + fill

    query_api = client.query_api()
    result = query_api.query_data_frame(query)
    precision_dict = {
        "1": 0,
        "0.1": 1
    }
    precision = precision_dict.get(tile.precision, '0.1')
    if not result.empty:
        df = result[['_time', '_value']]
        df = df.rename(columns={"_time": "time", '_value': 'value'})
        df = df.fillna(method='bfill')
        df = df.dropna()
        df['value'] = round(df['value'], precision)
        df = df.set_index('time').tz_convert("Asia/Tehran").reset_index()
        df["time"] = df["time"].map(str)
        df = df.to_dict(orient='records')
        return df
    else:
        return []
