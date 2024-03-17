import React from "react";
import GaugeHumidity from "../Charts/GaugeHumidity";
import GraphTemperature from "../Charts/GraphTemperature";
import GaugeSoilTemperature from "../Charts/GaugeSoilTemperature";

const SoilTemperature = ({data, isOnline, value, lastUpdated, interval, fakeValues, graphValue}) => {
    return (
        <div className={`d-flex flex-wrap ${data?.size === "small" ? "align-items-center flex-grow-1" : ""}`}>
            <div className="col-5 pl-0 d-flex align-items-center position-relative">
                <div className="d-flex align-items-center">
                    <div className={`icon icon-24 ${isOnline ? "icon-soil-temperature" : "icon-soil-temperature"}`}/>
                    <div className={`h3 mr-2 mb-0 bold ${!isOnline ? "font-24" : "font-30"}`}>
                    <span className="">
                        {
                            !isOnline ? "غیرفعال" : value ? value[value.length - 1].value : ""
                        }
                    </span>
                        {
                            isOnline && <span className="h6">{data.unit}</span>
                        }
                    </div>
                </div>
                {/*{*/}
                {/*    isOnline && <div className="tile-description temperature">*/}
                {/*        <div className="d-flex align-items-center">*/}
                {/*            <span className="circle good-soil"/>*/}
                {/*            <span>مناسب</span>*/}
                {/*        </div>*/}
                {/*        <div className="mr-2 d-flex align-items-center">*/}
                {/*            <span className="circle caution-soil"/>*/}
                {/*            <span>احتیاط</span>*/}
                {/*        </div>*/}
                {/*        <div className="mr-2 d-flex align-items-center">*/}
                {/*            <span className="circle danger"/>*/}
                {/*            <span>خطر</span>*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*}*/}

                {
                    !isOnline && value && <div className="tile-description temperature">
                        <div className="d-flex align-items-center">
                            <span>
                                {lastUpdated} دقیقه قبل :
                            </span>
                            <span>{data.unit}</span>
                            <span>
                                {value && value[value.length - 1].value}
                            </span>
                        </div>
                    </div>
                }
            </div>
            {(data?.size === "medium" || data?.size === "large") ? value ? (
                <GaugeSoilTemperature id={"gauge-" + data.id} value={value[value.length - 1].value}/>) : (
                <GaugeSoilTemperature id={"gauge-" + data.id} value={0}/>) : null
            }
            {
                data?.size === "large" && interval ? (
                    <GraphTemperature interval={interval} id={"graph-" + data.id} value={graphValue?.data || fakeValues}
                                      fakeData={!value}/>) : null
            }
        </div>
    )
}

export default SoilTemperature;