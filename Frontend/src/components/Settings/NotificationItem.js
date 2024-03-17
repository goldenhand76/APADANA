import React, {useEffect, useRef, useState} from "react";
import {isMobile} from "react-device-detect";
import {Link} from "react-router-dom";

const NotificationItem = ({onNotificationState, item, onDelete, onEdit, sensors, actuators, manuals, automatics}) => {

    const [dropDownMenuOpen, setDropDownMenuOpen] = useState(false);
    const refMore = useRef(null);
    const wrapperRef = useRef(null);

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleClickOutside = (event) => {
        if ((wrapperRef.current && !wrapperRef.current.contains(event.target)) && (refMore.current && !refMore.current.contains(event.target))) {
            setDropDownMenuOpen(false);
        }
    }

    const stopPropagation = (e) => {
        e.stopPropagation();
        setDropDownMenuOpen(true)
    }

    return (
        <div
            className={`col notifications-list-item position-relative d-flex justify-content-between align-items-center ${isMobile ? "px-0 py-3" : "py-3 px-0"}`}>
            <div className="d-flex flex-column">
                <p className="mb-0 py-1">{item?.title}</p>
                <div>
                    {
                        item?.action_object?.part_number && <span className="tag-name mt-2 d-inline-block">{item?.action_object?.part_number}</span>
                    }
                    {
                        item?.action_object?.title && <span className="tag-name mt-2 d-inline-block">{item?.action_object?.title}</span>
                    }
                </div>
            </div>
            <div className="d-flex align-items-center">
                <label className="switch">
                    <input type="checkbox" checked={item.following}
                           onChange={e => onNotificationState(e.target.checked, item.id)}/>
                    <span className="slider round"/>
                </label>
                <div className={`icon icon-24 icon-more-vertical cursor-pointer`}
                     ref={refMore}
                     onMouseDown={e => stopPropagation(e)}
                     onTouchStart={e => stopPropagation(e)}
                />
            </div>
            <div
                className={"tile-dropdown position-absolute px-2 bg-white " + (dropDownMenuOpen ? "selected" : "")}
                ref={wrapperRef}>
                {
                    isMobile ? (<Link
                        className="d-flex tile-dropdown-item cursor-pointer border-bottom mx-1 py-3 align-items-center"
                        to={{
                            pathname: `/Panel/Dashboard/Settings/NotificationManagement/${item?.id}`,
                            state: {sensors, actuators, manuals, automatics}
                        }}>
                        <div className="icon icon-20 icon-edit"/>
                        <div className="mr-2">ویرایش</div>
                    </Link>) : (<div
                        className="d-flex tile-dropdown-item cursor-pointer border-bottom mx-1 py-3 align-items-center"
                        onClick={() => onEdit(item?.id)}>
                        <div className="icon icon-20 icon-edit"/>
                        <div className="mr-2">ویرایش</div>
                    </div>)
                }
                <div className="d-flex tile-dropdown-item cursor-pointer mx-1 py-3 align-items-center"
                     onClick={() => onDelete(item?.id)}>
                    <div className="icon icon-20 icon-delete"/>
                    <div className="mr-2">حذف</div>
                </div>
            </div>
        </div>
    )
}

export default NotificationItem