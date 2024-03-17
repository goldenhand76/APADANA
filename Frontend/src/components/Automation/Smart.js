import React, {useEffect, useState} from "react";
import {isMobile} from "react-device-detect";
import {getActuatorsListSmart, updateActuatorSmart} from "../../services/api";
import Loader from "../Loader/Loader";

const Smart = ({automationType, handleShowAutomation}) => {

    const [actuatorsSmart, setActuatorsSmart] = useState([]);
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        loadActuatorsList()
    }, []);

    const loadActuatorsList = () => {
        setIsLoading(true)
        getActuatorsListSmart().then(res => {
            setActuatorsSmart(res);
            setIsLoading(false)
        }).catch(err => {
            console.log(err)
            setIsLoading(false)
        }
        )
    }

    const handleChangeState = (e, param) => {
        if (automationType === 'smart') {
            const values = {
                "active": e.target.checked
            }
            updateActuatorSmart(values, param.id).then(res => {
                loadActuatorsList()
            }).catch(err => console.log(err))
        } else {
            handleShowAutomation({isOpen: true, type: 'هوشمند'})
        }
    }

    return (
        <>
            <div
                className={`row mx--30px px-15px mt--30px pt-15px overflow-auto ${isMobile ? "height-automation-custom-mobile" : "height-automation-custom"}`}>
                <div className="col-lg-5 col-md-12 col-sm-12 px-0">
                    <div className={`${isMobile ? "" : "card p-2"}`}>
                        {
                            isLoading && <Loader/>
                        }

                        {
                            !isMobile && (<div className={`table-custom ${isLoading ? "pb-5" : ""}`}>
                                <div className="table-custom-header">
                                    <span className="table-custom-header-title">نام وضعیت</span>
                                    <span className="table-custom-header-action">فعالیت</span>
                                </div>
                                <div className="table-custom-body">
                                    {
                                        actuatorsSmart.length > 0 && actuatorsSmart.map(item => {
                                                return (<div className="table-custom-body-row">
                                                    <span className="table-custom-body-title">{item.title}</span>
                                                    <div className="table-custom-body-action">
                                                        <label
                                                            className={`switch mx-3 ${item.lock ? "disabled" : ""}`}>
                                                            <input type="checkbox" checked={item.active}
                                                                   onChange={e => handleChangeState(e, item)}/>
                                                            <span className="slider round"/>
                                                        </label>
                                                    </div>
                                                </div>)
                                            }
                                        )
                                    }
                                </div>
                            </div>)
                        }

                        {
                            isMobile && actuatorsSmart.length > 0 && actuatorsSmart.map((item, index) => {
                                    return (
                                        <div key={item.id} className={`card py-3 pr-3 pl-2 ${index !== 0 ? "mt-12px" : ""}`}>
                                            <div className="d-flex justify-content-between align-items-center py-1">
                                                <div className="text-dark">{item.title}</div>
                                                <label className={`switch ml-12px ${item.lock ? "disabled" : ""}`}>
                                                    <input type="checkbox" checked={item.active}
                                                           onChange={e => handleChangeState(e, item)}/>
                                                    <span className="slider round"/>
                                                </label>
                                            </div>
                                        </div>
                                    )
                                }
                            )
                        }

                        {
                            (actuatorsSmart.length === 0 && !isLoading) ? <p className="text-center mt-4 mb-0">اطلاعاتی برای نمایش موجود نیست.</p> : null
                        }
                    </div>
                </div>
            </div>

        </>
    )
}


export default Smart