import React, {useEffect, useRef, useState} from "react";
import {useIsInViewport} from "../../utils/useIsInViewport";
import {markAsReadNotification} from "../../services/api";
import {getTimeMessage} from "../../utils/getDiffDate";
import {notificationTextGenerator} from "../../utils/notificationTextGenerator";


const NotificationItem = ({item}) => {

    const notificationRef = useRef(null);
    const [read, setRead] = useState(item.unread);
    const isInViewport = useIsInViewport(notificationRef);

    useEffect(() => {
        if(isInViewport && item?.unread) {
            markAsReadNotification(item?.id).then(res => {
                setRead(false);
            }).catch(err => console.log(err))
        }
    },[isInViewport])

    return (
        <div className={`notification-item d-flex flex-column ${read ? "" : "readed"}`} ref={notificationRef}>
            <div className="d-flex align-items-center">
                <div className="notification-item-icon">
                    <i className={`icon icon-24 icon-${item?.actor_content_type?.model ? item?.actor_content_type?.model : 'relay'}`}/>
                </div>
                <div className="mr-3 d-flex flex-column justify-content-between font-size-14">
                    <p className="my-1 font-500 text-dark">هشدار {item?.actor?.title}</p>
                    <p className="my-1 font-400 notification-body-text">{notificationTextGenerator(item)}</p>
                </div>
            </div>
            <div className="d-flex justify-content-end ml-2 font-size-10">
                <span>{getTimeMessage(item?.timestamp)}</span>
            </div>
        </div>
    )
}


export default NotificationItem;