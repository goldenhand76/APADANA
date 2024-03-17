import React from "react";
import GaugeHumidity from "../Charts/GaugeHumidity";
import GraphTemperature from "../Charts/GraphTemperature";

const Moisture = ({data, isOnline, value, lastUpdated, interval, fakeValues, graphValue}) => {

    return (
        <div className={`d-flex flex-wrap ${data?.size === "small" ? "align-items-center flex-grow-1" : ""}`}>
            <div className="col-5 pl-0 d-flex align-items-center position-relative">
                <div className="d-flex align-items-center">
                    <div className={`icon icon-24 ${isOnline ? "icon-soil-moisture" : "icon-soil-moisture"}`}/>
                    <div className={`h3 mr-2 mb-0 bold ${!isOnline ? "font-24" : "font-30"}`}>
                    <span className="">
                        {
                            !isOnline ? "غیرفعال" : value ? value[value?.length - 1]?.value > 1000 ? parseInt(value[value?.length - 1]?.value / 10) : value[value?.length - 1]?.value : ""
                        }
                    </span>
                        <span className="h6">
                        {
                            isOnline ? "%" : ""
                        }
                        </span>
                    </div>
                </div>
                {
                    isOnline && data?.size === "medium" && <div className="tile-description">
                        <span className="circle soilMoisture"/>
                        <span>میزان رطوبت خاک</span>
                    </div>
                }

                {
                    !isOnline && value && <div className="tile-description temperature">
                        <div className="d-flex align-items-center">
                            <span>
                                {lastUpdated} دقیقه قبل :
                            </span>
                            <span>%</span>
                            <span>
                                {value && value[value.length - 1].value}
                        </span>
                        </div>
                    </div>
                }
            </div>
            {(data?.size === "medium" || data?.size === "large") ? value ? (
                <GaugeHumidity id={"gauge-" + data.id} value={value[value.length - 1].value}/>) : (
                <GaugeHumidity id={"gauge-" + data.id} value={0}/>) : null
            }
            {
                data?.size === "large" && interval ? (
                    <GraphTemperature interval={interval} id={"graph-" + data.id} value={graphValue?.data || fakeValues}
                                      fakeData={!value}/>) : null
            }
        </div>
    )
}


export default Moisture;