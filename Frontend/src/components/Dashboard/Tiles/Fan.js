import React from "react";

const Fan = ({isOnline, value}) => {
    return (
        <div className="d-flex flex-wrap flex-grow-1">
            <div className="col-6 d-flex align-items-center position-relative">
                <div className="d-flex align-items-center">
                    <div className={`icon icon-24 ${value ? "icon-fan-on" : "icon-fan-off"}`}/>
                    <div className={`h3 mr-2 mb-0 bold ${!isOnline ? "font-24" : "font-30"}`}>
                    <span className="">
                        {
                            value ? "روشن" : "خاموش"
                        }
                    </span>
                    </div>
                </div>
                {/*<div className="tile-description temperature">*/}
                {/*    <div className="d-flex align-items-center">*/}
                {/*        <span className="circle good"/>*/}
                {/*        <span>فعال</span>*/}
                {/*    </div>*/}
                {/*    <div className="mr-2 d-flex align-items-center">*/}
                {/*        <span className="circle caution"/>*/}
                {/*        <span>غیرفعال</span>*/}
                {/*    </div>*/}
                {/*</div>*/}
            </div>
        </div>
    )
}


export default Fan;