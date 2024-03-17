import React from "react";


const DeviceDetailItem = ({type, item, color, label}) => {
  const {value, is_online} = item;
  return(
    <div 
      className={"col-md-3 col-6 mt-3 device-item item-" + type + " " + (is_online ? "item-is-online " : "item-is-offline ") + (value ? "item-value-true" : "")} 
      title={label}>
      <div className="card p-3 justify-content-around align-items-center device-item-content " >
        <div className="">{item?.title ? item?.title : ""}</div>
        { 
          type === "Temperature" ?
          <>
            <div className="px-3 " style={{direction: "ltr"}}>{is_online ? (value + " °C ") : "غیرفعال"}</div>
            <div className="icon icon-48 icon-temp"></div>
          </>
          : type === "Humidity" ?
          <>
            <div className="px-3 " style={{direction: "ltr"}}>{is_online ? (value + " % ") : "غیرفعال"}</div>
            <div className="icon icon-48 icon-humidity"></div>
          </>
          : type === "Power" ?
          <>
            <div className="px-3 " style={{direction: "ltr"}}>{is_online ? (value ? "برق نرمال" : "برق اضطراری") : "غیرفعال"}</div>
            <div className="icon icon-48 icon-power-light"></div>
          </> 
          : type === "Door" ?
          <>
            <div className="px-3 " style={{direction: "ltr"}}>{is_online ? (value ? "باز" : "بسته") : "غیرفعال"}</div>
            <div className="icon icon-48 icon-door"></div>
          </>
          : type === "HVAC" ?
          <>
            <div className="px-3 " style={{direction: "ltr"}}>{is_online ? ("" + (value ? " روشن" : " خاموش")) : "غیرفعال"}</div>
            <div className="icon icon-48 icon-air-cool"></div>
          </> 
          : type === "HVAC2" ?
          <>
            <div className="px-3 " style={{direction: "ltr"}}>{is_online ? ("کولر گازی ۲" + (value ? " روشن" : " خاموش")) : "غیرفعال"}</div>
            <div className="icon icon-48 icon-air-cool"></div>
          </> 
          : type === "Motion" ?
          <>
            <div className="px-3 " style={{direction: "ltr"}}>{is_online ? ("" + (value ? " روشن" : " خاموش")) : "غیرفعال"}</div>
            <div className="icon icon-48 icon-motion-detection"></div>
          </>
          : type === "GSM" ?
          <>
            <div className="px-3 " style={{direction: "ltr"}}>{is_online ? ("" + (value ? " عدم اتصال" : " متصل")) : "غیرفعال"}</div>
            <div className="icon icon-48 icon-electricity"></div>
          </> 
          : null
        }
        <div title={label} className="circle-point rounded-circle position-absolute " style={{backgroundColor: color}}></div>
      </div>
    </div>
  )
}

export default DeviceDetailItem;