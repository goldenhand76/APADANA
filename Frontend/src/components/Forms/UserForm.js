import React, {useEffect, useRef, useState} from 'react';
import Button from "../Button/Button";
import {isMobile} from "react-device-detect";
import {emailValidation} from "../../utils/emailValidation";
import {phoneNumberValidation} from "../../utils/phoneNumberValidation";


const UserForm = ({closeHandler, data, submitHandler, errors}) => {


    const [user, setUser] = useState({
        name: "",
        last_name: "",
        username: "",
        email: "",
        phone: "",
        can_monitor: true,
        can_control: false
    })
    const [validInputs, setValidInputs] = useState({});
    const [validationForm, setValidationForm] = useState(false);
    const inputRef = useRef(null);

    const handleChangeUser = (e) => {
        setUser({...user, [e.target.name]: e.target.value});
    }

    useEffect(() => {
        if (user.username !== "" && (emailValidation(user.email) || user.email === "") && phoneNumberValidation(user.phone)) {
            setValidationForm(true)
        } else {
            setValidationForm(false)
        }
    }, [user])

    useEffect(() => {
        if (data) setUser(data);
    }, [data])

    useEffect(() => {
        inputRef.current.focus();
    }, [])


    const handleCheckEmail = () => {
        setValidInputs({...validInputs, email: user.email === "" ? false : !emailValidation(user.email)})
    }

    const handleCheckPhone = () => {
        setValidInputs({...validInputs, phone: !phoneNumberValidation(user.phone)})
    }

    return (<>
        {
            !isMobile && <div className="row justify-content-center modal-header">
                <p className="col-5 text-center bold text-dark">{data ? "ویرایش کاربر" : "کاربر جدید"}</p>
            </div>
        }
        <div className={`row ${isMobile ? "card pb-4 px-3" : "align-items-center"}`}>
            <div className={`col-lg-6 col-sm-12 ${isMobile ? "px-0 pb-2 mt-3" : "mt-4 pt-2"}`}>
                <div className="form-group">
                    <label htmlFor="name">نام</label>
                    <input
                        name="name"
                        value={user.name}
                        onChange={handleChangeUser}
                        type="text"
                        id="name"
                        ref={inputRef}
                        className={`form-control ${errors && errors?.name ? "border-error" : ""}`}
                        placeholder="نام خود را وارد نمایید."/>
                    <i className={"icon-22 icon-user d-flex"}/>
                    {
                        errors && errors?.name ? <p className="error-field">{errors?.name[0]}</p> : null
                    }
                </div>
            </div>
            <div className={`col-lg-6 col-sm-12  ${isMobile ? "px-0 pb-2 border-bottom" : "mt-4 pt-2"}`}>
                <div className="form-group">
                    <label htmlFor="lastName">نام خانوادگی</label>
                    <input
                        name="last_name"
                        value={user.last_name}
                        onChange={handleChangeUser}
                        type="text"
                        id="lastName"
                        className={`form-control ${errors && errors?.last_name ? "border-error" : ""}`}
                        placeholder="نام خانوادگی خود را وارد نمایید."/>
                    <i className={"icon-22 icon-user d-flex"}/>
                    {
                        errors && errors?.last_name ? <p className="error-field">{errors?.last_name[0]}</p> : null
                    }
                </div>
            </div>
            <div className={`col-lg-6 col-sm-12 mt-3 ${isMobile ? "px-0 pb-2" : ""}`}>
                <div className="form-group">
                    <label htmlFor="username" className="required">نام کاربری</label>
                    <input
                        name="username"
                        value={user.username}
                        onChange={handleChangeUser}
                        type="text"
                        id="username"
                        className={`form-control ${errors && errors?.username ? "border-error" : ""}`}
                        placeholder="بصورت انگلیسی وارد نمایید."/>
                    <i className={"icon-22 icon-user d-flex"}/>
                    {
                        errors && errors?.username ? <p className="error-field">{errors?.username[0]}</p> : null
                    }
                </div>
            </div>

            <div className={`col-lg-6 col-sm-12 ${isMobile ? "px-0 pb-2" : "mt-3"}`}>
                <div className="form-group">
                    <label htmlFor="phone" className="required">شماره موبایل</label>
                    <input
                        name="phone"
                        value={user.phone}
                        onBlur={handleCheckPhone}
                        onChange={handleChangeUser}
                        type="tell"
                        id="phone"
                        className={`form-control ${errors && errors?.phone ? "border-error" : ""} ${validInputs?.phone ? "border-error" : ""}`}
                        placeholder="بعنوان مثال: 09012345678"/>
                    <i className={"icon-22 icon-phone d-flex"}/>
                    {
                        errors && errors?.phone ? <p className="error-field">{errors?.phone[0]}</p> : null
                    }
                </div>
            </div>

            <div className={`col-lg-6 col-sm-12 ${isMobile ? "px-0 pb-2" : "mt-3"}`}>
                <div className="form-group">
                    <label htmlFor="email" className="required">ایمیل</label>
                    <input
                        name="email"
                        value={user.email}
                        onBlur={handleCheckEmail}
                        onChange={handleChangeUser}
                        type="email"
                        id="email"
                        className={`form-control ${errors && errors?.email ? "border-error" : ""} ${validInputs?.email ? "border-error" : ""}`}
                        placeholder="بعنوان مثال: email@gmail.com"/>
                    <i className={"icon-22 icon-email d-flex"}/>
                    {
                        errors && errors?.email ? <p className="error-field">{errors?.email[0]}</p> : null
                    }
                </div>
            </div>
            <div className={`col-lg-6 col-sm-12 ${isMobile ? "px-0 pb-2 mt-2" : "mt-4 d-flex align-items-center"}`}>
                <label htmlFor="canControl" className="container-checkbox m-0">
                    <input type="checkbox" id="canControl" checked={user.can_control} name={"can_control"}
                           onChange={e => setUser({...user, [e.target.name]: e.target.checked})}/>
                    آیا کاربر قابلیت اتوماسیون داشته باشد؟
                    <span className="checkmark"/>
                </label>
            </div>
        </div>

        <div className="row">
            <div className={`col-12 d-flex justify-content-end mt-3 pt-2 ${isMobile ? "px-0" : ""}`}>
                <Button
                    className={`ml-3 button btn-primary-fill d-flex align-items-center justify-content-center py-2 px-5 ${isMobile ? "width-65" : ""} ${!validationForm ? "disabled" : ""}`}
                    handler={() => submitHandler(user)}>
                    <span>تایید</span>
                </Button>
                <Button
                    className={`button btn-primary-outline d-flex align-items-center justify-content-center py-2 px-5 ${isMobile ? "width-35" : ""}`}
                    handler={closeHandler}>
                    <span>لغو</span>
                </Button>
            </div>
        </div>
    </>)
}

export default UserForm;