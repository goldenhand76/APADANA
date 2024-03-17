import React, {useEffect, useState} from 'react'
import {isMobile} from "react-device-detect";



const CurrentTime = () => {

    let intervalId;
    const [currentTime, setCurrentTime] = useState(new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds())


    useEffect(() => {
        intervalId = setInterval(() => {
            let date = new Date();
            let hh = date.getHours();
            let mm = date.getMinutes();
            let ss = date.getSeconds();

            hh = hh < 10 ? "0" + hh : hh;
            mm = mm < 10 ? "0" + mm : mm;
            ss = ss < 10 ? "0" + ss : ss;
            let time = hh + ':' + mm + ':' + ss;
            setCurrentTime(time);
        }, 1000);


        return () => {
            clearInterval(intervalId);
        }
    },[])

    return (
        <div
            className={isMobile ? "d-none" : "d-flex text-center justify-content-center align-items-center ml-2"}>
            <i className="icon icon-20 icon-clockTime"/>
            <div className="pr-2 clock-box">{currentTime}</div>
        </div>
    )
}


export default CurrentTime;