import {isMobile} from "react-device-detect";
import Button from "../Button/Button";
import React from "react";

const Username = ({userName, setUsername, setPage}) => {

    const handlePage = () => {
        if (username !== "") {
            setPage("getPassword")
        }
    }

    return (
        <>
            <div
                className={`col-md-12 position-unset login-form-holder ${isMobile ? "p-0" : ""}`}>
                <div className="form-group">
                    <label htmlFor="code" className="mb-2">
                        نام کاربری / ایمیل / شماره تلفن
                    </label>
                    <input
                        className="form-control mb-4"
                        type="text"
                        id="username"
                        name="code"
                        value={userName}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder='نام کاربری یا ایمیل یا شماره موبایل خود را وارد کنید.'
                    />
                    {
                        userName === "" ? (<i className={"icon-20 icon-user d-flex"}/>) : null
                    }
                </div>
                <div
                    className={`form-group bottom pointer ${isMobile ? "" : "position-unset"}`}>
                    <Button
                        className={`w-100 text-center  button btn-primary-fill ${!userName ? "disabled" : ""}`}
                        handler={handlePage}>
                        ورود
                    </Button>
                </div>
            </div>
        </>
    )
}

export default Username;