import React, { Component } from "react";
import { Redirect } from "react-router-dom";
// import { isMobile } from 'react-device-detect';
import { login, setToken, passwordReset } from "../../services/api";
import LogoPic from "../../assets/img/arm_toossab_F.png";

export default class _Login extends Component {

    constructor(props) {
        super(props)

        this.state = {
            redirectToReferrer: false,
            userName: "",
            password: "",
        }

        this.resetPassword = this.resetPassword.bind(this);
        this.keyDownChanged = this.keyDownChanged.bind(this);
    }

    componentDidMount() {
        const token = localStorage.getItem("token");
        if (token && token.length > 0) {
            this.setState({
                redirectToReferrer: true
            });
        }
    }
    

    doLogin(e) {
        e.preventDefault();
        const user = {
            username: this.refs.userNameRef.value,
            password: this.refs.passwordRef.value
        }
        login(user)
            .then(res => {
                if (res && res.data && res.data.tokens?.access) {
                    const { data } = res;
                    setToken(data.tokens?.access);
                    localStorage.setItem("username", res.data?.username);
                    localStorage.setItem("name", res.data?.name);
                    localStorage.setItem("last_name", res.data?.last_name);
                    localStorage.setItem("refresh", res.data?.tokens?.refresh);
                    setTimeout(() => {
                        this.setState({
                            redirectToReferrer: true
                        });
                    }, 300);
                } else {
                    // if (res && res.data && res.data.message) {
                    //     alert.error(res.data.message);
                    // }
                }
            })
            .catch(err => {
                // alert.error("نام کاربری و یا گذرواژه اشتباه است");
                console.log(err, "err");
                throw err;
            })
    }

    keyDownChanged(e) {
        if (e.key === 'Enter') {
            this.doLogin(e);
        }
    }

    resetPassword() {
        passwordReset()
            .then(res => {
                
            })
            .catch(err => {
                console.log(err, "err");
                throw err;
            })
    }

    render() {
        const from = {pathname: "/Panel/Dashboard/Dashboard"};
        const { redirectToReferrer } = this.state;
        if (redirectToReferrer) {
            return <Redirect to={from} />;
        }
        return (
            <div className="login">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-6  shadow-sm login-window">
                            {/* <form action=""> */}
                                <div>
                                    <div className="col-md-12 mt-3">
                                        <div className="text-center p-3">
                                            {/* <img src={LogoPic} alt="توس آب" width={75} /> */}
                                            <h2>
                                                ورود به سامانه
                                                dfffsfsfdd
                                            </h2>
                                        </div>
                                        <div className="row justify-content-center">
                                            <div className="form-group col-md-9 mt-3">
                                                <label htmlFor="username"
                                                    className="position-absolute d-flex lable-position">
                                                    نام کاربری
                                                </label>
                                                <input type="text" className="form-control p-4 text-left"
                                                    ref={"userNameRef"} onKeyDown={this.keyDownChanged} />
                                            </div>
                                            <div className="form-group col-md-9 my-4">
                                                <label htmlFor="password"
                                                    className="position-absolute d-flex lable-position">
                                                    گذرواژه
                                                </label>
                                                <input type="password" className="form-control p-4 text-left"
                                                    ref={"passwordRef"} onKeyDown={this.keyDownChanged} />
                                            </div>
                                            <div className="form-group col-md-9 my-4">
                                            </div>
                                            <div className="form-group col-md-9 mb-4 pointer">
                                                <button type={"yes"}
                                                    className="d-flex form-row btn-success submit text-decoration-none  justify-content-center btn-info "
                                                    role="button" aria-pressed="true" onClick={(e) => {
                                                        this.doLogin(e)
                                                    }}>
                                                    <h4 >ورود</h4>
                                                </button>
                                            </div>
                                            <div className="my-3 text-center pointer" onClick={() => this.resetPassword()}>
                                                فراموشی گذرواژه
                                            </div>
                                        </div>
                                    </div>
                                    {/* <a className="row m-4 text-decoration-none active" role="button" aria-pressed="true" onClick={(e) => { this.passwordRecovery(e) }}>
                    <span>بازیابی گذرواژه</span>
                    <div className="icon-arrow-left icon-16 m-1"> </div>
                  </a> */}
                                </div>
                            {/* </form> */}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
