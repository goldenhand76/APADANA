import React, {useEffect, useLayoutEffect} from 'react';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import moment from "moment-jalaali";

let root, chart, xAxis, yAxis, series;

const ChartView = ({values, colors, interval}) => {

    function createAxisAndSeries(chartData, index) {

        series = chart.series.push(
            am5xy.LineSeries.new(root, {
                calculateAggregates: true,
                xAxis: xAxis,
                stroke : colors[index],
                yAxis: yAxis,
                valueYField: "value",
                categoryXField: "date",
                tooltip: am5.Tooltip.new(root, {
                    labelText: "hhhh"
                })
            })
        );


        series.bullets.push(function () {
            let graphics = am5.Circle.new(root, {
                strokeWidth: 2,
                radius: 3,
                stroke: colors[index],
            });
            return am5.Bullet.new(root, {
                sprite: graphics
            });
        });

        chart.set("cursor", am5xy.XYCursor.new(root, {
            xAxis: xAxis,
            yAxis: yAxis,
            snapToSeries: [series]
        }));

        series.appear(1000);
        xAxis.data.setAll(chartData)
        series.data.setAll(chartData);
    }

    useLayoutEffect(() => {

        root = am5.Root.new("chart");

        root.setThemes([
            am5themes_Animated.new(root)
        ]);

        chart = root.container.children.push(
            am5xy.XYChart.new(root, {
                focusable: true,
                panX: true,
                panY: true,
                wheelX: "panX",
                wheelY: "zoomX",
                pinchZoomX: true
            })
        );

        const xAxisRenderer = am5xy.AxisRendererX.new(root, {});

        xAxisRenderer.labels.template.setAll({
            rotation: -45,
            paddingRight: -150,
            paddingLeft: 0,
            centerX: 0
        });

        xAxis = chart.xAxes.push(
            am5xy.CategoryAxis.new(root, {
                categoryField: "date",
                stroke : "#7a73de",
                renderer: xAxisRenderer,
                tooltip: am5.Tooltip.new(root, {
                    labelText: "hi"
                }),
                minZoomCount: 5,
                maxZoomCount: 13,
                maxDeviation: 0.2,
            })
        );

        yAxis = chart.yAxes.push(
            am5xy.ValueAxis.new(root, {
                extraMax: 0.1,
                extraMin: 0.1,
                renderer: am5xy.AxisRendererY.new(root, {opposite: false}),
                tooltip: am5.Tooltip.new(root, {
                    labelText: "hhh30"
                })
            })
        );


        chart.appear(1000, 100);

    }, [])

    const removeAxis = () => {
        am5.array.each(xAxis.series, function(series) {
            chart.series.removeValue(series);
        });
        chart.yAxes.removeValue(xAxis);

        while(chart.series.length) {
            chart.series.removeIndex(0).dispose();
        }
    }

    useEffect(() => {
        removeAxis();
        values.map((item,index) => {
            let datas = []
            Object.values(item).map(el => {
                el.map(row => {
                    const data = {
                        date: moment(row.time).format(interval),
                        value: +row.mean_value
                    }
                    datas.push(data)
                })
            })
            createAxisAndSeries(datas,index);
        })

    }, [values])

    return (
        <div className="history-chart" id="chart"/>
    );
}

export default ChartView;