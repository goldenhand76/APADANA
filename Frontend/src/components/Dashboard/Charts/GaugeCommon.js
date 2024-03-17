import React, {useEffect, useLayoutEffect, useState} from "react";
import * as am5radar from "@amcharts/amcharts5/radar";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

let chart;
const GaugeCommon = (props) => {

    const [yAxis, setYAxis] = useState(null);
    const [series1, setSeries1] = useState();
    const [series2, setSeries2] = useState();

    useLayoutEffect(() => {

        const root = am5.Root.new(props?.id, {
            useSafeResolution: false
        });
        root.setThemes([
            am5themes_Animated.new(root)
        ]);

        chart = root.container.children.push(am5radar.RadarChart.new(root, {
            panX: false,
            panY: false,
            wheelX: "panX",
            wheelY: "panX",
            innerRadius: am5.percent(82),
            startAngle: 180,
            endAngle: 360
        }));

        let cursor = chart.set("cursor", am5radar.RadarCursor.new(root, {
            behavior: "zoomX"
        }));

        cursor.lineY.set("visible", false);


        let xRenderer = am5radar.AxisRendererCircular.new(root, {
            minGridDistance: 30
        });

        xRenderer.labels.template.setAll({
            radius: -20
        });

        xRenderer.grid.template.setAll({
            forceHidden: true
        });

        let xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
            renderer: xRenderer,
            min: 0,
            max: 2000,
            strictMinMax: true,
            numberFormat: "#",
            visible: false,
            fontSize: 10,
            tooltip: am5.Tooltip.new(root, {})
        }));


        let yRenderer = am5radar.AxisRendererRadial.new(root, {
            minGridDistance: 20
        });

        yRenderer.labels.template.setAll({
            centerX: am5.p100,
            fontWeight: "500",
            fontSize: 18,
            templateField: "columnSettings"
        });

        yRenderer.grid.template.setAll({
            forceHidden: true
        });

        let yAxisDataItemObj = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
            categoryField: "category",
            renderer: yRenderer
        }));


        let series1Obj = chart.series.push(am5radar.RadarColumnSeries.new(root, {
            xAxis: xAxis,
            yAxis: yAxisDataItemObj,
            clustered: false,
            valueXField: "full",
            categoryYField: "category",
            fill: root.interfaceColors.get("alternativeBackground")
        }));

        series1Obj.columns.template.setAll({
            width: am5.p100,
            fillOpacity: 0.08,
            strokeOpacity: 0,
            cornerRadius: 20
        });


        let series2Obj = chart.series.push(am5radar.RadarColumnSeries.new(root, {
            xAxis: xAxis,
            yAxis: yAxisDataItemObj,
            clustered: false,
            valueXField: "value",
            categoryYField: "category",
            colors: am5.color("#1AD329")
        }));

        series2Obj.columns.template.setAll({
            width: am5.p100,
            strokeOpacity: 0,
            tooltipText: "{category}: {valueX}%",
            cornerRadius: 20,
            fill:am5.color("#73A6D8"),
            templateField: "columnSettings"
        });


        series1Obj.appear(1000);
        series2Obj.appear(1000);
        chart.appear(1000, 100);

        setYAxis(yAxisDataItemObj)
        setSeries1(series1Obj)
        setSeries2(series2Obj)

    }, [])

    useEffect(() => {
        let data = [{
            category: "",
            value: +props?.value,
            full: 2000,
            columnSettings: {
                fill: chart.get("colors").getIndex(3)
            }
        }];
        yAxis && yAxis.data.setAll(data);
        series1 && series1.data.setAll(data);
        series2 && series2.data.setAll(data);
    }, [props])

    return (
        <>
            <div className="col-7 position-relative chart-holder p-0" id={props?.id}>
                <span className="number-gauge-humidity font-size-md">{props?.value}</span>
            </div>
        </>
    )
}

export default GaugeCommon;