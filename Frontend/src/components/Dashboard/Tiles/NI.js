import React from "react";
import GraphTemperature from "../Charts/GraphTemperature";
import GaugeCommon from "../Charts/GaugeCommon";

const NI = ({data, isOnline, value, interval, lastUpdated, fakeValues, graphValue}) => {

    return (<div className={`d-flex flex-wrap ${data?.size === "small" ? "align-items-center flex-grow-1" : ""}`}>
        <div className="col-5 pl-0 d-flex align-items-center position-relative">
            <div className="d-flex align-items-center">
                <div className={`icon icon-24 ${isOnline ? "icon-nitrogen" : "icon-nitrogen-disable"}`}/>
                <div className={`h3 mr-2 mb-0 bold ${!isOnline ? "font-24" : "font-30"}`}>
                    <span className="">
                        {
                            !isOnline ? "غیرفعال" : value ? value[value?.length - 1]?.value > 1000 ? parseInt(value[value?.length - 1]?.value / 10) : value[value?.length - 1]?.value : ""
                        }
                    </span>
                    <span className="h6">{value && value[value?.length - 1]?.value > 1000 && isOnline ? "g/kg" : isOnline ? "mg/kg" : ""}</span>
                </div>
            </div>
            {
                data?.size === "medium" && <div className="tile-description">
                    <span className="circle humidity"/>
                    <span>میزان نیتروژن خاک</span>
                </div>
            }
            {
                !isOnline && value && <div className="tile-description temperature">
                    <div className="d-flex align-items-center">
                            <span>
                                {lastUpdated} دقیقه قبل :
                            </span>
                        <span>mg/kg</span>
                        <span>
                                {value && value[value.length - 1].value}
                            </span>
                    </div>
                </div>
            }
        </div>
        {(data?.size === "medium" || data?.size === "large") &&
            <GaugeCommon id={"gauge-" + data?.id} value={value ? value[value.length - 1].value : 0} />}

        {
            data?.size === "large" && interval ? (
                <GraphTemperature interval={interval} id={"graph-" + data.id} value={graphValue?.data || fakeValues} fakeData={!value}/>) : null
        }
    </div>)
}

export default NI;