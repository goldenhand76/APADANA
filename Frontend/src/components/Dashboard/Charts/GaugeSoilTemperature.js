import React, {useEffect, useLayoutEffect, useState} from "react";
import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5radar from "@amcharts/amcharts5/radar";
import * as am5xy from "@amcharts/amcharts5/xy";

const GaugeSoilTemperature = (props) => {

    const [axisDataItem, setAxisDataItem] = useState(null);

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
            startAngle: 180,
            endAngle: 360,
        }));


        let axisRenderer = am5radar.AxisRendererCircular.new(root, {
            innerRadius: -6,
            strokeWidth: 6,
            strokeOpacity: 0
        });

        axisRenderer.labels.template.set("forceHidden", true);
        axisRenderer.grid.template.set("forceHidden", true);

        let xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
            maxDeviation: 0,
            min: 0,
            max: 50,
            strictMinMax: true,
            renderer: axisRenderer
        }));



        // add section gauge
        let firstSectionDataItem = xAxis.makeDataItem({});
        firstSectionDataItem.set("value", 0);
        firstSectionDataItem.set("endValue", 10);
        xAxis.createAxisRange(firstSectionDataItem);
        firstSectionDataItem.get("axisFill").setAll({visible:true, fillOpacity:1, fill: am5.color("#CEC9BF")});

        let secondSectionDataItem = xAxis.makeDataItem({});
        secondSectionDataItem.set("value", 10);
        secondSectionDataItem.set("endValue", 16);
        xAxis.createAxisRange(secondSectionDataItem);
        secondSectionDataItem.get("axisFill").setAll({visible:true, fillOpacity:1, fill: am5.color("#73A6D8")});

        let thirdSectionDataItem = xAxis.makeDataItem({});
        thirdSectionDataItem.set("value", 16);
        thirdSectionDataItem.set("endValue", 22.5);
        xAxis.createAxisRange(thirdSectionDataItem);
        thirdSectionDataItem.get("axisFill").setAll({visible:true, fillOpacity:1, fill:am5.color("#19D228")});

        let fourthSectionDataItem = xAxis.makeDataItem({});
        fourthSectionDataItem.set("value", 22.5);
        fourthSectionDataItem.set("endValue", 37.5);
        xAxis.createAxisRange(fourthSectionDataItem);
        fourthSectionDataItem.get("axisFill").setAll({visible:true, fillOpacity:1, fill:am5.color("#FA7116")});

        let fifthSectionDataItem = xAxis.makeDataItem({});
        fifthSectionDataItem.set("value", 37.5);
        fifthSectionDataItem.set("endValue", 50);
        xAxis.createAxisRange(fifthSectionDataItem);
        fifthSectionDataItem.get("axisFill").setAll({visible:true, fillOpacity:1, fill:am5.color("#CEC9BF")});


        let axisDataItemObj = xAxis.makeDataItem({});
        axisDataItemObj.set("value", props?.value);


        let bullet = axisDataItemObj.set("bullet", am5xy.AxisBullet.new(root, {
            sprite: am5radar.ClockHand.new(root, {
                // radius: am5.percent(90),
                topWidth: 3,
                bottomWidth: 10,
                radius: am5.percent(85),
                innerRadius: 0,
            })
        }));

        bullet.get("sprite").hand.setAll({
            fill: am5.color("#7e88aa"),
            strokeWidth: 1,
            fillOpacity: 1,
        });

        bullet.get("sprite").pin.setAll({
            fill: am5.color("#EDEFF1"),
            strokeWidth: 2,
            fillOpacity: 1,
        });

        xAxis.createAxisRange(axisDataItemObj);

        axisDataItemObj.get("grid").set("visible", false);


        chart.appear(1000, 100);
        setAxisDataItem(axisDataItemObj);

        return () => {
            root.dispose()
        }

    }, [])

    useEffect(() => {
        axisDataItem && axisDataItem.animate({
            key: "value",
            to: +props?.value,
            duration: 800,
            easing: am5.ease.out(am5.ease.cubic)
        });
    },[props?.value, props?.id])

    return (
        <>
            <div className="col-7 chart-holder p-0" id={props?.id}/>
        </>
    )
}

export default GaugeSoilTemperature;