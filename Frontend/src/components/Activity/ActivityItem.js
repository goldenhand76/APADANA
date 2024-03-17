import React from "react";
import {isMobile} from "react-device-detect";
import {getTimeMessage} from "../../utils/getDiffDate";
import {activityTextGenerator} from "../../utils/activityTextGenerator";

const ActivityItem = ({item}) => {

    return (
        <div className="notification-item d-flex flex-column">
            <div className="d-flex align-items-center">
                <div className="notification-item-img">
                    {
                        item?.actor?.photo ? (<img src={`http://127.0.0.1${item?.actor?.photo}`}
                                            className={`alarm-avatar ${isMobile ? "" : ""}`}/>) : (
                            <i className={`icon icon-40 icon-profile ${isMobile ? "" : ""}`}/>)
                    }
                </div>
                <div className="mr-3 d-flex flex-column justify-content-between font-size-14">
                    <p className="my-1 font-500 text-dark">{item?.actor?.username}</p>
                    <p className="my-1 font-400 notification-body-text" title={activityTextGenerator(item)}>{activityTextGenerator(item)}</p>
                </div>
            </div>
            <div className="d-flex justify-content-end ml-2 font-size-10">
                <span>{getTimeMessage(item?.timestamp)}</span>
            </div>
        </div>
    )
}

export default ActivityItem;