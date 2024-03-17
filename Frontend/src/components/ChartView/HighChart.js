import React, {useEffect, useState} from "react";
import Highcharts from 'highcharts';
import {
    HighchartsChart, Chart, HighchartsProvider, XAxis, YAxis, Tooltip, Legend, LineSeries
} from 'react-jsx-highcharts';
import moment from "moment-jalaali";


const HighChart = ({data, sensors, unit}) => {

    const [categories, setCategories] = useState([])
    const [min, setMin] = useState([]);
    const [max, setMax] = useState([])

    const [charts, setCharts] = useState([])
    //
    // function formatTooltip(this) {
    //     // const {x, y} = context;
    //     console.log(this)
    //     // console.log(context, x, y, tooltip);
    //     // return `<b>${x}</b><br/>: ${y}`;
    //     return `<div>h</div>`
    // }

    const plotOptions = {
        title: {
            text: 'Highcharts with a shared tooltip formatter'
        },

        xAxis: {
            categories: categories,
        },

        tooltip: {
            formatter: function () {
                return this.points.reduce(function (s, point) {
                    return 'hi';
                }, '</b>');
            },
            shared: true
        },

        series: [charts]
    };

    useEffect(() => {
        if (data && data.length > 0) {
            let allCharts = [];
            let allMin = [];
            let allMax = [];
            let dataValues = [];
            let max = [];
            let min = [];
            let tempCategories = [];
            data.map((item, index) => {
                Object.values(item).map(el => {
                    tempCategories = [];
                    dataValues = [];
                    max = [];
                    min = [];
                    el.map(row => {
                        tempCategories.push(moment(row.time).format('jYYYY/jMM/jDD hh:mm'));
                        dataValues.push(Math.ceil(row.mean_value * 10) / 10);
                        min.push(row.min);
                        max.push(row.max);
                    })
                    allCharts.push(dataValues);
                    allMin.push(min);
                    allMax.push(max);
                })
            })
            setMin(allMin);
            setMax(allMax);
            setCategories(tempCategories);
            setCharts(allCharts);
        }
    }, [data])

    return (
        <div>
            <HighchartsProvider Highcharts={Highcharts}>
                <HighchartsChart mapNavigation={{enableMouseWheelZoom: true}} plotOptions={plotOptions}>
                    <Chart zooming={{type: 'x', }}/>

                    <Tooltip valueSuffix={` ${unit}`} pointFormat={"{point.y}"} shared />

                    <Legend layout="horizontal" align="top" verticalAlign="left"/>

                    <XAxis categories={categories} labels={{formatter: item => {
                        const result = item.value.split(' ');
                        return (`
                            <div style="display: flex; flex-direction: column">
                                <div style="color: #585858;">${result[0]}</div>
                                <div style="color: #283972;">${result[1]}</div>
                            </div>
                        `)}
                        }}>

                    </XAxis>

                    <YAxis>
                        {
                            charts.length > 0 && charts.map((item, index) => {
                                return (<LineSeries
                                                    key={index}
                                                    name={sensors[index]?.label}
                                                    data={item}
                                                    marker={{
                                                        fillColor: 'white',
                                                        lineWidth: 2,
                                                        lineColor: Highcharts.getOptions().colors[0]
                                                    }}
                                />)
                            })
                        }
                    </YAxis>
                </HighchartsChart>
            </HighchartsProvider>
        </div>
    )
}

export default HighChart;