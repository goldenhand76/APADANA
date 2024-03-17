import React, {useState, useEffect, useLayoutEffect} from "react";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5 from "@amcharts/amcharts5/index";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

let xAxis;
const GraphTemperature = (props) => {

    const [rootEl, setRootEl] = useState(null);
    const [series, setSeries] = useState(null);

    const getTimeUnit = (interval) => {
        let charPattern = /[a-zA-Z]/g;
        let letters = interval.match(charPattern);
        switch (letters[0]) {
            case "s":
                return "second";
            case "m":
                return "minute";
            case "h":
                return "hour";
            case "d":
                return "day";
            default:
                return "hour"
        }
    }

    const getCount = (interval) => {
        let numberPattern = /[0-9]/g;
        let digits = interval.match(numberPattern);
        return parseInt(digits.join(""))
    }

    useLayoutEffect(() => {
        let root = am5.Root.new(props?.id, {
            useSafeResolution: false
        });
        root.setThemes([
            am5themes_Animated.new(root)
        ]);

        let chart = root.container.children.push(am5xy.XYChart.new(root, {
            panX: true,
            panY: true,
            wheelX: "panX",
            wheelY: "zoomX",
            pinchZoomX: true
        }));

        let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
            behavior: "none"
        }));
        cursor.lineY.set("visible", false);

        const xAxisRenderer = am5xy.AxisRendererX.new(root, {});

        xAxisRenderer.labels.template.setAll({
            centerX: 0,
            pan: "zoom"
        });

        xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
            maxDeviation: 0.1,
            baseInterval: {
                timeUnit: getTimeUnit(props?.interval), count: getCount(props?.interval)
            },
            start: 0,
            renderer: xAxisRenderer,
            tooltip: am5.Tooltip.new(root, {
                labelText: "hi"
            }),
            endValue: new Date().getTime(),
            minZoomCount: 0,
            maxZoomCount: 0,
        }));


        xAxis.get("dateFormats")["day"] = "HH:mm";
        xAxis.get("dateFormats")["hour"] = "HH:mm";
        xAxis.get("dateFormats")["minute"] = "HH:mm";
        xAxis.get("dateFormats")["second"] = "HH:mm:ss";
        xAxis.get("periodChangeDateFormats")["day"] = "HH:mm";
        xAxis.get("periodChangeDateFormats")["hour"] = "HH:mm";
        xAxis.get("periodChangeDateFormats")["minute"] = "HH:mm";
        xAxis.get("periodChangeDateFormats")["second"] = "HH:mm:ss";

        let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
            maxDeviation: 0.1,
            renderer: am5xy.AxisRendererY.new(root, {
                pan: "zoom"
            }),
        }));


        let seriesObj = chart.series.push(am5xy.SmoothedXLineSeries.new(root, {
            name: "Series",
            xAxis: xAxis,
            yAxis: yAxis,
            valueYField: "value",
            valueXField: "date",
            fill: props.va ? am5.color("rgba(200, 200, 200, 0)") : am5.color("#67b7dc"),
            stroke: props.fakeData ? am5.color("rgba(200, 200, 200, 0)") : am5.color("#8bc8e5"),
        }));

        seriesObj.fills.template.setAll({
            visible: true,
            fillOpacity: props.fakeData ? 0 : 0.2
        });


        seriesObj.appear(1000);
        chart.appear(1000, 100);

        setRootEl(root);
        setSeries(seriesObj);
    }, [])

    useEffect(() => {
        const datas = [];
        props?.value.map(item => {
            const data = {
                date: new Date(item.time).getTime(),
                value: +item.value
            }
            datas.push(data)
        });

        if(series && rootEl) {
            series.fills.template.setAll({
                fill: props.fakeData ? am5.color("rgba(200, 200, 200, 0)") : am5.color("#67b7dc"),
                stroke: props.fakeData ? am5.color("rgba(200, 200, 200, 0)") : am5.color("#8bc8e5"),
                fillOpacity: props.fakeData ? 0 : 0.2,
            });

            series.bullets.clear();
            series.bullets.push(function () {
                return am5.Bullet.new(rootEl, {
                    sprite: am5.Circle.new(rootEl, {
                        radius: props.fakeData ? 0 : 3,
                        stroke: rootEl.interfaceColors.get("background"),
                        strokeWidth: 1,
                        fill: series.get("fill")
                    })
                });
            });
            series.data.setAll(datas);
        }

    }, [props])

    return (
        <div className="col-12 chart-holder graph" id={props?.id}/>
    )
}

export default GraphTemperature