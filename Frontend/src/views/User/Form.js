import React, { useState, useEffect } from "react";
import { Redirect, Link } from "react-router-dom";
import moment from "moment-jalaali";

import { storeUser, updateUser } from "../../services/api";
import Button from '../../components/Button/Button';
import ReactSelect from '../../components/Select/Select';

const Form = ({ data, id }) => {
  const [redirectTo, setRedirect] = useState(null);
  const [btnIsLoading, setBtnIsLoading] = useState(false);
  const [inputValues, setInputValues] = useState(data);

  const save = () => {
    if (inputValues.username) {
      const user = {
        ...inputValues
      };

      if (!id) {
        storeUser(user)
          .then((res) => {
            setBtnIsLoading(false);
            setRedirect({ pathname: `/Panel/Dashboard/User/List/` });
            alert.show(`باموفقیت ثبت شد`, { type: "success" });
          })
          .catch((err) => {
            setBtnIsLoading(false);
          });
      } else {
        updateUser(user, id)
          .then((res) => {
            setBtnIsLoading(false);
            setRedirect({ pathname: `/Panel/Dashboard/User/List/` });
            alert.show(`باموفقیت ثبت شد`, { type: "success" });
          })
          .catch((err) => {
            // alert.show('خطایی رخ داد! لطفا دوباره امتحان کنید.', { type: 'error' });
            setBtnIsLoading(false);
          });
      }
    }
  };

  return (
    <>
      {redirectTo && <Redirect to={redirectTo} />}
      <div className="col list mt-4 ">
        <section className="row card card-box">
          <section className="my-4 mx-1 pb-5">
            <div className="mx-3 ">
              <Link
                to="/Panel/Dashboard/User/List"
                className="text-center justify-content-center button btn-primary-fill p-2 "
              >
                بازگشت به لیست کاربران
              </Link>
            </div>
            <div className="mb-3 mx-3 mt-4">
              <h3>{data ? "ویرایش کاربر" : "ایجاد کاربر"}</h3>
            </div>
            <div className="row mx-1 mt-3 flex-md-row ">
              <div className="col-md-6 co-sm-12">
                <div className="form-group mt-3 ">
                  <label htmlFor="title" className="required">
                    نام
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    id="name"
                    name="name"
                    value={inputValues?.name}
                    onChange={(e) =>
                      setInputValues({ ...inputValues, name: e.target.value })
                    }
                  />
                </div>
                <div className="form-group mt-3 ">
                  <label htmlFor="title" className="required">
                    نام خانوادگی
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={inputValues?.last_name}
                    onChange={(e) =>
                      setInputValues({ ...inputValues, last_name: e.target.value })
                    }
                  />
                </div>
                <div className="form-group mt-3 ">
                  <label htmlFor="email" className="required">
                    آدرس پست الکترونیکی
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    id="email"
                    name="email"
                    value={inputValues?.email}
                    onChange={(e) =>
                      setInputValues({ ...inputValues, email: e.target.value })
                    }
                  />
                </div>
                <div className="form-group mt-3 ">
                  <div className="d-flex">
                    <div className="">
                      <input 
                        type="checkbox" 
                        className="form-check-input" 
                        name="can_monitor" 
                        checked={inputValues?.can_monitor} 
                        onChange={(e) =>
                          setInputValues({ ...inputValues, can_monitor: e.target.checked })
                        } 
                      />
                      <label htmlFor="can_monitor" className="">
                        امکان مانیتور
                      </label>
                    </div>
                    <div className="me-4">
                      <input 
                        type="checkbox" 
                        className="form-check-input" 
                        name="can_control" 
                        checked={inputValues?.can_control}
                        onChange={(e) =>
                          setInputValues({ ...inputValues, can_control: e.target.checked })
                        } 
                      />
                      <label htmlFor="can_control" className="">
                        امکان کنترل
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 co-sm-12">
                <div className="form-group mt-3 ">
                  <label htmlFor="title" className="required">
                    نام کاربری
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    id="username"
                    name="username"
                    value={inputValues?.username}
                    onChange={(e) =>
                      setInputValues({ ...inputValues, username: e.target.value })
                    }
                  />
                </div>
                <div className="form-group mt-3 ">
                  <label htmlFor="code" className="required">
                    شماره همراه
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    id="phone"
                    name="phone"
                    value={inputValues?.phone}
                    onChange={(e) =>
                      setInputValues({ ...inputValues, phone: e.target.value })
                    }
                  />
                </div>
                {
                  !data &&
                  <div className="form-group mt-3 ">
                    <label htmlFor="code" className="required">
                      گذرواژه
                    </label>
                    <input
                      className="form-control"
                      type="password"
                      id="password"
                      name="password"
                      value={inputValues?.password}
                      onChange={(e) =>
                        setInputValues({ ...inputValues, password: e.target.value })
                      }
                    />
                  </div>
                }
                <div className="mt-3">
                  <Button
                    isLoading={btnIsLoading}
                    className=""
                    type={"btn-green-outline"}
                    onClick={save}
                  >
                    <div className="pr-2">ذخیره</div>
                  </Button>
                </div>
              </div>
          </div>
        </section>
      </section>
    </div>
    </>
  );
};

export default Form;

    