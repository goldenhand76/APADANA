import {isMobile} from "react-device-detect";
import Button from "../Button/Button";
import React, {useEffect, useState} from "react";
import OtpInput from "react-otp-input";

const customInputStyle = {
    width: '3rem',
    height: '3rem',
    borderRadius: '12px',
    border: '1px solid #212121',
    paddingLeft: '0'
}

let interval;

const OTPInput = ({code, setCode, handler, userPhone}) => {

    const [isShowResendLink, setIsShowResendLink] = useState(false);
    const [minCountDown, setMinCountDown] = useState(1);
    const [secondCountDown, setSecondCountDown] = useState(59);

    useEffect(() => {
        interval = setInterval(() => {
            setSecondCountDown(prevState => prevState - 1);
        },1000)
    },[])

    useEffect(() => {
        if (secondCountDown === 0) {
            setSecondCountDown(59)
            setMinCountDown(0);
        }
        if (secondCountDown === 0 && minCountDown === 0) {
            clearInterval(interval);
            setIsShowResendLink(true);
        }
    },[secondCountDown])

    const handleChange = (otp) => setCode(otp) ;

    return (
        <div className={`col-md-12 position-unset login-form-holder ${isMobile ? "p-0" : ""}`}>
            <div className="form-group">
                <label htmlFor="code" className="mb-4 d-block mx-auto text-center">
                    لطفا کد ارسال شده به شماره {userPhone} را وارد نمایید.
                </label>
                <OtpInput
                    value={code}
                    onChange={handleChange}
                    numInputs={6}
                    inputStyle={customInputStyle}
                    containerStyle={"flex-row-reverse justify-content-between pt-8"}
                />
            </div>
            { !isShowResendLink ? (<p className="text-center text-primary mt-4">
                <span>{secondCountDown > 9 ? secondCountDown : `0${secondCountDown}`} : </span>
                <span>0{minCountDown}</span>
                <span> مانده تا دریافت مجدد کد</span>
            </p>) : (
                <p className="text-center text-primary cursor-pointer mt-4">ارسال مجدد کد فعال سازی</p>
            )}
            <div className={`form-group bottom pointer mt-5 ${isMobile ? "" : "position-unset"}`}>
                <Button
                    className={`w-100 text-center  button btn-primary-fill ${!code ? "disabled" : ""}`}
                    handler={handler}>
                    ورود
                </Button>
            </div>
        </div>
    )
}

export default OTPInput;