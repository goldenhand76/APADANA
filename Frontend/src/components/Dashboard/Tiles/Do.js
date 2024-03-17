import React from "react";
import GaugeTemperature from "../Charts/GaugeTemperature";
import GraphTemperature from "../Charts/GraphTemperature";

const Do = ({data, isOnline, value, lastUpdated, interval, fakeValues, graphValue}) => {
    return (
    <div className={`d-flex flex-wrap ${data?.size === "small" ? "align-items-center flex-grow-1" : ""}`}>
        <div
            className={((data?.size === "medium" || data?.size === "large") ? "col-5 pl-0 " : "col-12 ") + "d-flex align-items-center"}>
            <div className="d-flex align-items-center">
                <div className={`icon icon-24 ${isOnline ? "icon-do" : "icon-do-disable"}`}/>
                <div className={`h3 mr-2 mb-0 bold ${!isOnline ? "font-24" : "font-30"}`}>
                        <span className="">
                            {
                                !isOnline ? "غیرفعال" : value ? value[value.length - 1].value : "خاموش"
                            }
                        </span>
                </div>
            </div>
            {/*{*/}
            {/*    isOnline && <div className="tile-description temperature">*/}
            {/*        <div className="d-flex align-items-center">*/}
            {/*            <span className="circle good"/>*/}
            {/*            <span>میزان اکسیژن</span>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*}*/}
            {
                !isOnline && value && <div className="tile-description temperature">
                    <div className="d-flex align-items-center">
                        <span>
                            {lastUpdated} دقیقه قبل :
                        </span>
                        <span>
                                {value && value[value.length - 1].value}
                        </span>
                    </div>
                </div>
            }
        </div>
        {(data?.size === "medium" || data?.size === "large") ? value ? (
            <GaugeTemperature id={"gauge-" + data.id} value={value[value.length - 1].value}/>) : (<GaugeTemperature id={"gauge-" + data.id} value={0}/>) : null
        }
        {
            data?.size === "large" && interval ? (
                <GraphTemperature interval={interval} id={"graph-" + data.id} value={graphValue?.data || fakeValues} fakeData={!value}/>
            ) : null
        }
    </div>
    )
}

export default Do;