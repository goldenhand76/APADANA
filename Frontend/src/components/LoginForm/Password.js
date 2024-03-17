import React, {useState} from "react";
import Button from "../Button/Button";
import {isMobile} from "react-device-detect";

const Password = ({password,setPassword, handler, setPage, sendCode, handleForgetPassword}) => {

    const [isPasswordType, setIsPasswordType] = useState(true)

    return (
        <div className={`col-md-12 position-unset login-form-holder ${isMobile ? "p-0" : ""}`}>
            <div className="form-group">
                <label htmlFor="code" className="mb-2">
                  کلمه عبور
                </label>
                <input
                    className="form-control mb-5"
                    type={isPasswordType ? "password" : "text"}
                    id="password"
                    name="code"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='کلمه عبور خود را وارد نمایید.'
                />
                {
                    password === "" ? (<i className={"icon-20 icon-key d-flex"}/>) : (<><i className={`icon icon-24 icon-eye${isPasswordType ? "" : "-close"}`} onClick={() => setIsPasswordType(prevState => !prevState)}/><i className="icon icon-16 icon-close-circle-white" onClick={() => setPassword("")}/></>)
                }
            </div>
            <p className='text-primary bold text-right w-fit-content'
               role="button"
               onClick={sendCode}>
                ورود با ارسال کد یکبار مصرف
            </p>
            <p className='text-primary mt-2 bold text-right w-fit-content' role="button" onClick={handleForgetPassword}>
                کلمه عبور خود را فراموش کرده اید؟
            </p>
            <div
                className={`form-group pointer ${isMobile ? "" : "position-unset"}`}>
                <Button
                    className={`w-100 text-center  button btn-primary-fill ${!password ? "disabled" : ""}`}
                    handler={handler}>
                    ورود
                </Button>
            </div>
        </div>
    )
}

export default Password;