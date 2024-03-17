import React, {useState, useEffect, useLayoutEffect} from "react";
import * as am5radar from "@amcharts/amcharts5/radar";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

const GaugeHumidity = (props) => {

    const [series1, setSeries1] = useState();
    const [series2, setSeries2] = useState();
    const [yAxis, setYAxis] = useState();

    useLayoutEffect(() => {

        const root = am5.Root.new(props?.id, {
            useSafeResolution: false
        });
        root.setThemes([
            am5themes_Animated.new(root)
        ]);

        let chart = root.container.children.push(am5radar.RadarChart.new(root, {
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
            minGridDistance: 50
        });

        xRenderer.labels.template.setAll({
            radius: 10
        });

        xRenderer.grid.template.setAll({
            forceHidden: true
        });

        let xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
            renderer: xRenderer,
            min: 0,
            max: 100,
            strictMinMax: true,
            numberFormat: "#'%'",
            visible: false,
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

        let yAxisObj = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
            categoryField: "category",
            renderer: yRenderer
        }));


        let seriesObj1 = chart.series.push(am5radar.RadarColumnSeries.new(root, {
            xAxis: xAxis,
            yAxis: yAxisObj,
            clustered: false,
            valueXField: "full",
            categoryYField: "category",
            fill: root.interfaceColors.get("alternativeBackground")
        }));

        seriesObj1.columns.template.setAll({
            width: am5.p100,
            fillOpacity: 0.08,
            strokeOpacity: 0,
            cornerRadius: 20
        });

        let seriesObj2 = chart.series.push(am5radar.RadarColumnSeries.new(root, {
            xAxis: xAxis,
            yAxis: yAxisObj,
            clustered: false,
            valueXField: "value",
            categoryYField: "category",
            colors: am5.color("#23D7FF")
        }));

        seriesObj2.columns.template.setAll({
            width: am5.p100,
            strokeOpacity: 0,
            tooltipText: "{category}: {valueX}%",
            cornerRadius: 20,
            fill:am5.color("#73A6D8"),
            templateField: "columnSettings"
        });


        seriesObj1.appear(1000);
        seriesObj2.appear(1000);
        chart.appear(1000, 100);

        setYAxis(yAxisObj)
        setSeries1(seriesObj1)
        setSeries2(seriesObj2)
    }, [])

    useEffect(() => {
        let data = [{
            category: "",
            value: +props?.value,
            full: 100,
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

export default GaugeHumidity;