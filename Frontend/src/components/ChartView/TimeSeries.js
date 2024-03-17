import React, { Component } from 'react';
import Highcharts from 'highcharts';
import {
  HighchartsChart, Chart, withHighcharts, XAxis, YAxis, Title, Subtitle, Legend, LineSeries, Caption, SplineSeries, Tooltip
} from 'react-jsx-highcharts';
import moment from "moment-jalaali";
import {roundDecimal2Digit} from "../../utils/util";

const plotOptions = {
  series: {
    // pointStart: 1,
    type: 'line',
    lineWidth: 2,
    states: {
        hover: {
            lineWidth: 2
        }
    },
    marker: {
        enabled: false
    },
  }
};

const listToChart = (res, dateFormat) => {
    const list = res.map(el => { return [moment(el?.time, "YYYY-MM-DD HH:mm:ss").format(dateFormat), roundDecimal2Digit(+el?.mean_value)] });
    return list;
}

class ChartView extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        // const tooltipPositioner = function () {
        //     return { x: this.chart.chartWidth - this.label.width, y: 10 };
        // };
        // const colour = "rgb(90, 153, 255)";
        // // const { data } = this.props;
        // const days = [];
        // const visits = [];
        // if (data) {
        //     for (let i = 0; i < data.length; i++) {
        //         days.push(formatDate(data[i].day));
        //         visits.push(data[i].count);
        //     }
        // }
        const {data, title, Subtitle, lineName, AXTitle, startDate, dateFormat } = this.props;
        const categories = [];
        for (let i = 0; i < data[0]?.data.length; i++) {
            categories.push(moment(data[0]?.data[i]?.time, "YYYY-MM-DD HH:mm:ss").format(dateFormat));
        }
        return (
            <div className="charts">
                <HighchartsChart plotOptions={plotOptions} >
                    <Chart />

                    <Title>{title}</Title>

                    {/* <Subtitle>{Subtitle ? Subtitle : ""}</Subtitle> */}

                    <Legend layout="vertical" align="right" verticalAlign="middle" />

                    <Tooltip valueSuffix={` ${(title === "دما") ? "سانتی گرد" : "RH"}`} />

                    <XAxis categories={categories}>
                        <XAxis.Title>ساعت</XAxis.Title>
                    </XAxis>

                    <YAxis>
                        <YAxis.Title>{AXTitle ? AXTitle : ""}</YAxis.Title>
                        {/* <LineSeries name={lineName ? lineName : ""} data={data} /> */}
                        {
                            data?.length > 0 ?
                            data.map((item, i) => {
                                return (<LineSeries name={item?.title} data={listToChart(item?.data, dateFormat)} color={item?.color}/>)
                            })
                            : null
                        }
                        
                        {/* <LineSeries name={""} data={data} color={"green"} /> */}
                        {/* <LineSeries name="Manufacturing" data={[24916, 24064, 29742, 29851, 32490, 30282, 38121, 40434]} />
                        <LineSeries name="Sales & Distribution" data={[11744, 17722, 16005, 19771, 20185, 24377, 32147, 39387]} />
                        <LineSeries name="Project Development" data={[null, null, 7988, 12169, 15112, 22452, 34400, 34227]} />
                        <LineSeries name="Other" data={[12908, 5948, 8105, 11248, 8989, 11816, 18274, 18111]} /> */}
                    </YAxis>
                    {/* <Caption align="center">The installation sector sees the most growth.</Caption> */}
                </HighchartsChart>
            </div>
        );
    }
}

export default withHighcharts(ChartView, Highcharts);