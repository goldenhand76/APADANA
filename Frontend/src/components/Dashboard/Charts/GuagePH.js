import React, {useEffect, useLayoutEffect, useState} from "react";
import * as am5radar from "@amcharts/amcharts5/radar";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import {XAxis} from "react-jsx-highcharts";

let axisDataItem
let bandsData = [
    {
        color: "#ef5156",
        lowScore: 0,
        highScore: 1.555
    }, {
        color: "#fc994e",
        lowScore: 1.556,
        highScore: 3.111
    }, {
        color: "#f3e83e",
        lowScore: 3.1111,
        highScore: 4.666
    }, {
        color: "#c5da61",
        lowScore: 4.666,
        highScore: 6.221
    }, {
        color: "#65bd6c",
        lowScore: 6.221,
        highScore: 7.776
    }, {
        color: "#43c8c7",
        lowScore: 7.776,
        highScore: 9.331
    }, {
        color: "#73a6d8",
        lowScore: 9.331,
        highScore: 10.886
    }, {
        color: "#687db6",
        lowScore: 10.886,
        highScore: 12.441
    }, {
        color: "#645999",
        lowScore: 12.441,
        highScore: 14
    }
];
// let xAxis;
const GaugePH = (props) => {


    const [series1, setSeries1] = useState();
    const [xAxis, setXAxis] = useState(null);
    const [yAxis, setYAxis] = useState();

    useLayoutEffect(() => {

        let root = am5.Root.new(props?.id);

        root.setThemes([
            am5themes_Animated.new(root)
        ]);

        let chart = root.container.children.push(am5radar.RadarChart.new(root, {
            panX: false,
            panY: false,
            startAngle: 180,
            endAngle: 360
        }));

        let axisRenderer = am5radar.AxisRendererCircular.new(root, {
            innerRadius: -7
        });

        axisRenderer.grid.template.setAll({
            stroke: root.interfaceColors.get("background"),
            visible: false,
            strokeOpacity: 0.8
        });

        let objXAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
            maxDeviation: 0,
            min: 0,
            max: 14,
            strictMinMax: true,
            renderer: axisRenderer,
        }));

        objXAxis.get("renderer").labels.template.setAll({
            opacity: 0
        })

        axisDataItem = objXAxis.makeDataItem({});

        let bullet = axisDataItem.set("bullet", am5xy.AxisBullet.new(root, {
            sprite: am5radar.ClockHand.new(root, {
                // radius: am5.percent(90),
                topWidth: 3,
                bottomWidth: 10,
                radius: am5.percent(85),
                innerRadius: 0,
            })
        }));


        bullet.get("sprite").hand.setAll({
            fill: am5.color('#7782a4'),
            strokeWidth: 0,
            fillOpacity: 1,
        });

        bullet.get("sprite").pin.setAll({
            fill: am5.color("#EDEFF1"),
            strokeWidth: 0,
            fillOpacity: 1,
        });

        objXAxis.createAxisRange(axisDataItem);

        chart.bulletsContainer.set("mask", undefined);

        am5.array.each(bandsData, function (data) {
            let axisRange = objXAxis.createAxisRange(objXAxis.makeDataItem({}));

            axisRange.setAll({
                value: data.lowScore,
                endValue: data.highScore
            });

            axisRange.get("axisFill").setAll({
                visible: true,
                fill: am5.color(data.color),
                fillOpacity: 0.8
            });
        });

        setXAxis(objXAxis);

        chart.appear(1000, 100);
    }, [])

    useEffect(() => {
        axisDataItem.animate({
            key: "value",
            to: +props?.value,
            duration: 500,
            easing: am5.ease.out(am5.ease.cubic)
        });
        if (xAxis) {
            xAxis.createAxisRange(axisDataItem)
        }

    }, [props?.value])
    return (
        <>
            <div className="col-7 position-relative chart-holder p-0" id={props?.id}>
                {/*<span className="number-gauge-humidity font-size-md">{props?.value}</span>*/}
            </div>
        </>
    )
}

export default GaugePH;