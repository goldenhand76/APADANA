import React from "react";

const ACPower = ({isOnline, value}) => {

    return (
        <div className="d-flex flex-wrap flex-grow-1">
            <div className="col-6 d-flex align-items-center position-relative">
                <div className="d-flex align-items-center">
                    <div className={`icon icon-24 ${!isOnline ? "icon-electricity-off" : value?.length > 0 && value[0]?.value === 1 ? "icon-electricity-natural" : "icon-electricity-emergency"}`}/>
                    <div className={`h3 mr-2 mb-0 bold ${!isOnline ? "font-24" : "font-30"}`}>
                    <span className="">
                        {
                            !isOnline ? "خاموش" : value?.length > 0 && value[0]?.value === 1 ? "طبیعی" : "اضطراری"
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


export default ACPower