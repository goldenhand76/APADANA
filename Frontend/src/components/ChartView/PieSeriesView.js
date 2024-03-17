import React, { Component } from 'react';
import Highcharts from 'highcharts';
import {
  HighchartsChart, Chart, withHighcharts, XAxis, YAxis, Title, Subtitle, Legend, LineSeries, Caption, PieSeries
} from 'react-jsx-highcharts';

class PieSeriesView extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        const {data, lineName } = this.props;
        const pieData = [];
        for (let i = 0; i < data.length; i++) {
            if(data[i]?.year) {
                pieData.push({
                    name: data[i]?.year.toString()+ ": " + data[i]?.ratio + "%",
                    y: +data[i]?.ratio
                }); 
            }
        }
        return (
            <div className="charts">
                <HighchartsChart >
                    <Chart />
                    <YAxis>
                        <PieSeries name={lineName ? lineName : ""} data={pieData} size={220} showInLegend={false} allowPointSelect={true}/>
                    </YAxis>
                </HighchartsChart>
            </div>
        );
    }
}

export default withHighcharts(PieSeriesView, Highcharts);