import React, {useState, useEffect, useRef} from 'react';
import Button from "../Button/Button";
import {isMobile} from "react-device-detect";

const AddDashboard = ({onClose, data, handleActionTab, errors}) => {

    const [dashboardName, setDashboardName] = useState("");
    const inputRef = useRef(null)

    useEffect(() => {
        if (data) setDashboardName(data.title);
    }, [data])

    useEffect(() => {
        inputRef.current.focus();
    },[])

    return (
        <div className="position-relative">
            <div className="row">
                <div className="col-md-12 col-sm-12">
                    <div className="form-group">
                        {
                            isMobile && <i className="icon icon-20 icon-close btn-close" onClick={onClose}/>
                        }
                        <label htmlFor="title" className={`required ${isMobile ? "mb-3" : ""}`}>
                            {data ? "ویرایش نام میزکار" : "نام میزکار جدید"}
                        </label>
                        <input
                            className={`form-control px-3 ${errors && errors?.title ? "border-error" : ""}`}
                            type="text"
                            id="title"
                            name="title"
                            placeholder="یک نام برای میزکار خود انتخاب کنید"
                            value={dashboardName}
                            ref={inputRef}
                            onChange={(e) => setDashboardName(e.target.value)}
                        />
                        {
                            errors && errors?.title ? <p className="error-field">{errors?.title[0]}</p> : null
                        }
                    </div>
                </div>
            </div>
            <div className="row justify-content-end">
                <div className="col-12 d-flex justify-content-end">
                    <Button
                        type="submit"
                        className={`d-flex button btn-primary-fill justify-content-center align-items-center px-5 ${(isMobile && !data) ? "w-100 mt-3" : "width-65 ml-3"} ${dashboardName === "" ? "disabled" : ""}`}
                        handler={() => {
                            handleActionTab(dashboardName);
                        }}>
                        <p className='m-0'>ذخیره</p>
                    </Button>
                    {
                        ((!isMobile) || (isMobile && data)) && <Button
                            type="submit"
                            className={`d-flex button btn-primary-outline px-5 justify-content-center align-items-center width-35`}
                            handler={(e) => {
                                onClose && onClose();
                            }}>
                            <p className='m-0'>لغو</p>
                        </Button>
                    }
                </div>
            </div>
        </div>
    )
}

export default AddDashboard;