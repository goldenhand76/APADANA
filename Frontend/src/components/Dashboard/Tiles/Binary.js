import React from "react";

const Binary = ({isOnline, value}) => {

    return (<div className="d-flex flex-wrap">
        <div className="col-6 d-flex align-items-center position-relative">
            <div className="d-flex align-items-center">
                <div className="icon icon-24 icon-check-circle-active"/>
                <div className={`h3 mr-2 mb-0 bold ${!isOnline ? "font-24" : "font-30"}`}>
                    <span className="">
                        {
                            isOnline ? "روشن" : "غیرفعال"
                        }
                    </span>
                </div>
            </div>
        </div>

    </div>)
}

export default Binary;