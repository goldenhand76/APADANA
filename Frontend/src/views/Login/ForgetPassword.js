import React, {useState, useEffect} from 'react';
import {Link, Redirect, useHistory, useLocation, useParams} from "react-router-dom";

import {setNewPassowrd} from "../../services/api";
import LogoPic from "../../assets/img/logo-angizeh.png";
import Button from "../../components/Button/Button";
import {isMobile} from "react-device-detect";

const ForgetPassword = () => {
    const [redirectToReferrer, setRedirectToReferrer] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [validationForm, setValidationForm] = useState(false)
    const [isPasswordType, setIsPasswordType] = useState(true)
    const [isConfirmPasswordType, setIsConfirmPasswordType] = useState(true)
    const param = useParams();
    const {pathname} = useLocation();
    const history = useHistory();

    useEffect(() => {
        if(password !== "" && confirmPassword !== "") {
            password === confirmPassword ? setValidationForm(true) : setValidationForm(false)
        } else {
            setValidationForm(false)
        }
    },[password, confirmPassword])

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token && token.length > 0) {
            setRedirectToReferrer(true);
        }
    }, []);

    const handleSetPassword = (e) => {
        e.preventDefault();

        const formData = new FormData()
        formData.append("password", password);
        formData.append("token", param.token);
        formData.append("uidb64",param.uid);

        setNewPassowrd(param.uid, param.token, formData).then(res => {
            history.push('/Panel/Login');
        }).catch(err => {
            console.log(err)
        })

    };

    return (
        redirectToReferrer ? <Redirect to={{pathname: "/Panel/Dashboard"}}/> :
            <div className={`${isMobile ? "p-3" : "p-4"}`}>
                <div className={`login-parent row mx-0`}>
                    <div className='col-md-7 row display-none'>
                        <div className='col-md-10 bg-primary bg-img text-white'>
                            <h1 className='title'>سامانه هوشمند</h1>
                            <p className='text-center'>انگیزه نگار خاوران</p>
                            <hr className='line'/>
                            <div className='d-flex'>
                                <i className='icon icon-18 icon-phone'/>
                                <p className='me-2'>09013764636</p>
                            </div>
                            <div className='d-flex'>
                                <i className='icon icon-18 icon-address'/>
                                <p className='me-2'>مشهد-بلوار جانباز-جانباز5/1-ساختمان مروارید گوهرشاد-طبقه
                                    13-واحد4</p>
                            </div>
                        </div>
                        <div className='col-md-2 bg-left '/>
                    </div>
                    <div className='col-md-5 login-form '>
                        <div className='text-center'>
                            <img
                                src={LogoPic}
                                alt="طوس آب"
                                className="mb-5"/>
                        </div>
                        <form
                            action=""
                            onSubmit={(e) => {
                                handleSetPassword(e);
                            }}>
                            <div className="row">
                                <div className="col-md-12 mt-3 position-unset">
                                    <div className="row justify-content-center m-0">
                                        <div
                                            className={`col-md-12 forget-password-form-holder ${isMobile ? "p-0" : ""}`}>
                                            <Link className="d-flex align-items-center back-to-login"
                                                  to="/Panel/Login">
                                                <div className="icon icon-24 icon-arrow-right-light"/>
                                                <div className="mr-2">صفحه ورود</div>
                                            </Link>
                                            <h2 className='h5 bold mt-5'>تغییر کلمه عبور</h2>
                                            <p className='mt-2 text-primary' role="button">
                                                برای تنظیم کلمه عبور جدید لطفا کلمه عبور مناسب وارد نمایید
                                            </p>
                                            <div className="form-group mt-4">
                                                <label htmlFor="code" className="mb-2">
                                                    کلمه عبور جدید
                                                </label>
                                                <input
                                                    className="form-control mb-4"
                                                    type={isPasswordType ? "password" : "text"}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder='کلمه عبور خود را وارد نمایید.'
                                                />
                                                {
                                                    password === "" ? (<i className={"icon-20 icon-key d-flex"}/>) : (<><i className="icon icon-24 icon-eye" onClick={() => setIsPasswordType(prevState => !prevState)}/><i className="icon icon-24 icon-close-circle-white" onClick={() => setPassword("")}/></>)
                                                }
                                            </div>
                                            <div className="form-group mt-4">
                                                <label htmlFor="code" className="mb-2">
                                                    تکرار کلمه عبور جدید
                                                </label>
                                                <input
                                                    className="form-control mb-4"
                                                    type={isConfirmPasswordType ? "password" : "text"}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder='تکرار کلمه عبور خود را وارد نمایید.'
                                                />
                                                {
                                                    confirmPassword === "" ? (<i className={"icon-20 icon-key d-flex"}/>) : (<><i className="icon icon-24 icon-eye" onClick={() => setIsConfirmPasswordType(prevState => !prevState)}/><i className="icon icon-24 icon-close-circle-white" onClick={() => setConfirmPassword("")}/></>)
                                                }
                                            </div>
                                            <div className="form-group mb-4 pointer">
                                                <button
                                                    type="submit"
                                                    className={`d-flex button btn-primary-fill  submit text-decoration-none  justify-content-center align-items-center ${!validationForm ? "disabled" : ""}`}
                                                    onClick={(e) => {
                                                        changePassword(e);
                                                    }}
                                                    disabled={!password || !confirmPassword}
                                                >
                                                    {/* <h4> ورود</h4> */}
                                                    <p className='m-0'>ارسال</p>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
    );
};

export default ForgetPassword;
