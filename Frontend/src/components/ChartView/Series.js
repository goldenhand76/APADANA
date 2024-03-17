import React, { Component } from 'react';
import Highcharts from 'highcharts';
import {
  HighchartsChart, Chart, withHighcharts, XAxis, YAxis, Title, Subtitle, Legend, LineSeries, Caption
} from 'react-jsx-highcharts';

const plotOptions = {
  series: {
    // pointStart: 1
    type: 'line'
  }
};

class ChartSeries extends Component {

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
        const {data, title, Subtitle, lineName, AXTitle } = this.props;
        const dates = [];
        const line = [];
        for (let i = 0; i < data.length; i++) {
            dates.push(data[i][0]);
            line.push(data[i][1]);
        }
        return (
            <div className="charts">
                <HighchartsChart >
                    <Chart />

                    <Title>{title}</Title>

                    {/* <Subtitle>{Subtitle ? Subtitle : ""}</Subtitle> */}

                    <Legend layout="vertical" align="right" verticalAlign="middle" />
                
                    <XAxis categories={dates} >
                        <XAxis.Title>تاریخ</XAxis.Title>
                    </XAxis>

                    <YAxis>
                        <YAxis.Title>{AXTitle ? AXTitle : ""}</YAxis.Title>
                        <LineSeries name={lineName ? lineName : ""} data={data} />
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

export default withHighcharts(ChartSeries, Highcharts);