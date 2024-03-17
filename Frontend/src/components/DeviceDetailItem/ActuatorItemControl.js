import React, { useEffect, useState, useRef } from "react";
import Button from '../../components/Button/Button';
import Loader from '../Loader/Loader';

const ActuatorItemControl = ({item, onChange, isLocked}) => {
    const {title, is_online, type, active, status} = item;
    const [command, setCommand] = useState(item?.command);

    const getIconClass = (type) => {
        switch (type) {
            case "Door":
                return "icon-door"
                break;
            case "Stone_Light":
                return "icon-stone-light"
                break;
            default:
                break;
        }
    }

    const open = (item) => {
        if(!isLocked) {
            setCommand(true);
            onChange(item, true);
        }
    }

    const close = (item) => {
        if(!isLocked) {
            setCommand(false);
            onChange(item, false);
        }
    }

    const btnType = (status, isLocked, openBtn) => {
        if(isLocked) {
            return "btn-gray-fill";
        }
        if(status) {
            return (openBtn) ? "btn-green-fill" : "btn-gray-fill";
        }
        return (!openBtn) ? "btn-green-fill" : "btn-gray-fill";
    }

    return(
        type === "Door" ?
            <div className="sensor-control-item col-lg-4 col-md-6 col-sm-12 mt-3  mt-3" title={title}>
                <div className="d-flex p-3 justify-content-around align-items-center bg-white " >
                    <div className="icon icon-48 icon-door"></div>
                    <div className="px-2 " style={{direction: "ltr"}}>{title}</div>
                    <div className="d-flex">
                        {
                            isLocked ? <Loader className="page-loading mx-auto "/> :
                            is_online && active ?
                                <div className="d-flex">
                                    {/* <input 
                                        className="form-check-input" 
                                        type="checkbox" 
                                        id="flexSwitch" 
                                        value={command} 
                                        onChange={(e) => {
                                            setCommand(e.target.checked);
                                            onChange(item, e.target.checked);
                                        }} 
                                    /> */}
                                    <Button
                                        className=""
                                        type={btnType(status, isLocked, true)}
                                        onClick={() => open(item)}>
                                        <div className="pr-2">باز کردن</div>
                                    </Button>
                                    <Button
                                        className="me-3"
                                        type={btnType(status, isLocked)}
                                        onClick={() => open(item)}>
                                        <div className="pr-2">بستن   </div>
                                    </Button>
                                    {/* <label className="form-check-label" htmlFor="flexSwitch">{command ? "خاموش هست" : "روشن هست"}</label> */}
                                </div>
                            : <div className="px-2 " >غیرفعال</div>
                        }
                    </div>
                    {/* <div title={label} className="circle-point rounded-circle position-absolute " style={{backgroundColor: color}}></div> */}
                </div>
            </div>
            : type === "Stone_Light" ?
            <div className="col-lg-4 col-md-6 col-sm-12 mt-3  mt-3" title={title}>
                <div className="d-flex p-3 justify-content-around align-items-center bg-white " >
                    <div className="icon icon-48 icon-stone-light"></div>
                    <div className="px-2 " style={{direction: "ltr"}}>{title}</div>
                    <div className="d-flex">
                        {
                            isLocked ? <Loader className="page-loading mx-auto "/> :
                            is_online && active ?
                                <div className="d-flex">
                                    {/* <input 
                                        className="form-check-input" 
                                        type="checkbox" 
                                        id="flexSwitch" 
                                        value={command} 
                                        onChange={(e) => {
                                            setCommand(e.target.checked);
                                            onChange(item, e.target.checked);
                                        }} 
                                    /> */}
                                    <Button
                                        className=""
                                        type={btnType(status, isLocked, true)}
                                        onClick={() => open(item)}>
                                        <div className="pr-2">روشن کردن</div>
                                    </Button>
                                    <Button
                                        className="me-3"
                                        type={btnType(status, isLocked)}
                                        onClick={() => close(item)}>
                                        <div className="pr-2">خاموش کردن</div>
                                    </Button>
                                    {/* <label className="form-check-label" htmlFor="flexSwitch">{command ? "خاموش هست" : "روشن هست"}</label> */}
                                </div>
                            : <div className="px-2 " >غیرفعال</div>
                        }
                    </div>
                    {/* <div title={label} className="circle-point rounded-circle position-absolute " style={{backgroundColor: color}}></div> */}
                </div>
            </div>
            : type === "Alarm" ?
            <div className="col-lg-4 col-md-6 col-sm-12 mt-3  mt-3" title={title}>
                <div className="d-flex p-3 justify-content-around align-items-center bg-white " >
                    <div className="icon icon-48 icon-alarm"></div>
                    <div className="px-2 " style={{direction: "ltr"}}>{title}</div>
                    <div className="d-flex">
                        {
                            isLocked ? <Loader className="page-loading mx-auto "/> :
                            is_online && active ?
                                <div className="d-flex">
                                    {/* <input 
                                        className="form-check-input" 
                                        type="checkbox" 
                                        id="flexSwitch" 
                                        value={command} 
                                        onChange={(e) => {
                                            setCommand(e.target.checked);
                                            onChange(item, e.target.checked);
                                        }} 
                                    /> */}
                                    <Button
                                        className=""
                                        type={btnType(status, isLocked, true)}
                                        onClick={() => open(item)}>
                                        <div className="pr-2">روشن کردن</div>
                                    </Button>
                                    <Button
                                        className="me-3"
                                        type={btnType(status, isLocked)}
                                        onClick={() => close(item)}>
                                        <div className="pr-2">خاموش کردن</div>
                                    </Button>
                                    {/* <label className="form-check-label" htmlFor="flexSwitch">{command ? "خاموش هست" : "روشن هست"}</label> */}
                                </div>
                            : <div className="px-2 " >غیرفعال</div>
                        }
                    </div>
                    {/* <div title={label} className="circle-point rounded-circle position-absolute " style={{backgroundColor: color}}></div> */}
                </div>
            </div>
            : type === "Fan" ?
            <div className="icon icon-48 icon-air-cool"></div>
        : null
    )
}

export default ActuatorItemControl;