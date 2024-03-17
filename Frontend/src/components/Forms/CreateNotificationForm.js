import {isMobile} from "react-device-detect";
import ReactSelect from "../Select/Select";
import Button from "../Button/Button";
import React, {useEffect, useState} from "react";
import {getContentType} from "../../services/api";
import {notificationTypesToList} from "../../utils/toList";

const CreateNotificationForm = ({onSubmit, data, onClose,  actuators, sensors, manuals, automatics, errors}) => {
    const [titleNotification, setTitleNotification] = useState("");
    const [validationForm, setValidationForm] = useState(true);
    const [notificationTypes, setNotificationTypes] = useState([]);
    const [selectedNotificationType, setSelectedNotificationType] = useState(null);

    const [selectedSensor, setSelectedSensor] = useState(null);
    const [limitPoint, setLimitPoint] = useState("");
    const [condition, setCondition] = useState(null);
    const [selectedActuator, setSelectedActuator] = useState(null);

    const [selectedManual, setSelectedManual] = useState(null);
    const [selectedAutomatic, setSelectedAutomatic] = useState(null)

    useEffect(() => {
        if (titleNotification !== "" && selectedNotificationType && (condition && condition !== "") && ((selectedSensor && limitPoint !== "" || selectedSensor && condition) || selectedActuator || selectedManual || selectedAutomatic)) {
            setValidationForm(true)
        } else setValidationForm(false)
    }, [titleNotification, selectedNotificationType, condition, selectedSensor, limitPoint, selectedActuator, selectedAutomatic, selectedManual])


    useEffect(() => {
        loadContentType()
    }, [data]);

    useEffect(() => {
        if (data) {
            setTitleNotification(data.title);
            setCondition(data.condition);
            setLimitPoint(data.set_point);
        }
    }, [data])

    useEffect(() => {
        if (data) {
            setSelectedNotificationType(notificationTypes.find(item => item.value === data.content_type_id));
        }
    }, [notificationTypes])

    useEffect(() => {
        if (data) {
            if(selectedNotificationType?.name === "sensor") {
                setSelectedSensor(sensors.find(item => item.value === data.action_object_id))
            } else if (selectedNotificationType?.name === "actuator") {
                setSelectedActuator(actuators.find(item => item.value === data.action_object_id))
            } else if (selectedNotificationType?.name === "manualtile") {
                setSelectedManual(manuals.find(item => item.value === data.action_object_id))
            } else if (selectedNotificationType?.name === "automatictile") {
                setSelectedAutomatic(automatics.find(item => item.value === data.action_object_id))
            }
        }
    },[selectedNotificationType])

    const loadContentType = () => {
        getContentType().then(res => {
            setNotificationTypes(notificationTypesToList(res))
        }).catch(err => console.log(err))
    }

    const handleSubmit = () => {
        const values = {
            "title": titleNotification,
            "content_type_id": selectedNotificationType.value,
            "action_object_id": selectedNotificationType.name === "sensor" ? selectedSensor.value : selectedNotificationType?.name === "actuator" ?  selectedActuator.value : selectedNotificationType?.name === "manualtile" ? selectedManual.value : selectedNotificationType?.name === "automatictile" ? selectedAutomatic.value : null,
            "condition": condition,
            "set_point": selectedNotificationType.name === "sensor" && selectedSensor?.item?.type?.value === "CONTINUES" ? limitPoint : null
        }
        onSubmit(values);
    }

    return (
        <>
            <div className={`${isMobile ? "row card flex-nowrap py-3 px-3" : ""}`}>
                <div className="row justify-content-center modal-header">
                    <p className="col-5 text-center bold font-size-18 text-dark">{data ? "ویرایش هشدار" : "هشدار جدید"}</p>
                </div>
                <div className={`row ${isMobile ? "px-3" : "align-items-center"}`}>
                    <div className={`col-lg-12 col-sm-12 ${isMobile ? "px-0 pb-2 mt-3" : "mt-4 pt-2"}`}>
                        <div className="form-group">
                            <label htmlFor="name" className="required">عنوان هشدار</label>
                            <input
                                name="name"
                                value={titleNotification}
                                onChange={(e) => setTitleNotification(e.target.value)}
                                type="text"
                                id="name"
                                className={`form-control pr-3 ${errors && errors?.title ? "border-error" : ""}`}
                                placeholder="عنوان هشدار را وارد نمایید."/>
                            {
                                errors && errors?.title ? <p className="error-field">{errors?.title[0]}</p> : null
                            }
                        </div>
                    </div>
                </div>
                <div className={`row ${isMobile ? "px-3" : "align-items-center"}`}>
                    <div className={`col-lg-12 col-sm-12 ${isMobile ? "px-0 pb-2" : "pt-2"}`}>
                        <div className="form-group">
                            <label htmlFor="name" className="required">نوع هشدار</label>
                            <ReactSelect
                                options={notificationTypes}
                                className={data ? "disabled" : ""}
                                value={selectedNotificationType}
                                onChange={setSelectedNotificationType}
                                mobileMode={true}
                                placeholder="انتخاب..."
                            />
                            {
                                errors && errors?.content_type_id ? <p className="error-field">{errors?.content_type_id[0]}</p> : null
                            }
                        </div>
                    </div>
                </div>

                {
                    selectedNotificationType?.name === "sensor" ? (
                        <>
                            <div className={`row ${isMobile ? "px-3" : "align-items-center"}`}>
                                <div className={`col-lg-12 col-sm-12 ${isMobile ? "px-0 pb-2" : "pt-2"}`}>
                                    <div className="form-group">
                                        <label htmlFor="name" className="required">انتخاب سنسور</label>
                                        <ReactSelect
                                            options={sensors}
                                            value={selectedSensor}
                                            className={data ? "disabled" : ""}
                                            onChange={setSelectedSensor}
                                            mobileMode={true}
                                            placeholder="انتخاب..."
                                            size={"small"}
                                        />
                                    </div>
                                </div>
                            </div>
                            {
                                selectedSensor && selectedSensor.item.type.value === "BINARY" ? (
                                    <>
                                        <div className={`row justify-content-between ${isMobile ? "px-3 pb-3" : "align-items-center p-3 mt-3"}`}>
                                            <div className="">
                                                <label
                                                    className={`container-radio ${isMobile ? "col-6 mb-1" : ""}`}>
                                                    <input type="radio" name="notificationRelayType" value="ON"
                                                           checked={condition === "ON"}
                                                           onChange={e => setCondition(e.target.value)}/>
                                                    <span className="radio-mark"/>
                                                    <span className="radio-text">روشن</span>
                                                </label>
                                            </div>
                                            <div className="">
                                                <label
                                                    className={`container-radio ${isMobile ? "col-6 mb-1" : "mr-4"}`}>
                                                    <input type="radio" name="notificationRelayType" value="OFF"
                                                           checked={condition === "OFF"}
                                                           onChange={e => setCondition(e.target.value)}/>
                                                    <span className="radio-mark"/>
                                                    <span className="radio-text">خاموش</span>
                                                </label>
                                            </div>
                                            <div className="">
                                                <label
                                                    className={`container-radio ${isMobile ? "col-6 mb-1" : "mr-4"}`}>
                                                    <input type="radio" name="notificationRelayType" value="SWITCH"
                                                           checked={condition === "SWITCH"}
                                                           onChange={e => setCondition(e.target.value)}/>
                                                    <span className="radio-mark"/>
                                                    <span className="radio-text">تغییر وضعیت</span>
                                                </label>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className={`row ${isMobile ? "pb-4 px-3" : "align-items-end"}`}>
                                            <div className={`mb-3 col-lg-3 col-md-3 col-6 ${isMobile ? "px-0" : ""}`}>
                                                <label
                                                    className={`container-radio ${isMobile ? "col-6 mb-1" : ""}`}>
                                                    <input type="radio" name="statusSensor" value="HT"
                                                           checked={condition === "HT"}
                                                           onChange={e => setCondition(e.target.value)}/>
                                                    <span className="radio-mark"/>
                                                    <span className="radio-text">بیشتر از</span>
                                                </label>
                                            </div>
                                            <div className="mb-3 col-lg-3 col-md-3 col-6">
                                                <label
                                                    className={`container-radio ${isMobile ? "col-6 mb-1" : "mr-4"}`}>
                                                    <input type="radio" name="statusSensor" value="LT"
                                                           checked={condition === "LT"}
                                                           onChange={e => setCondition(e.target.value)}/>
                                                    <span className="radio-mark"/>
                                                    <span className="radio-text">کمتر از</span>
                                                </label>
                                            </div>
                                            <div className={`form-group col-lg-5 col-md-5 col-12  mr-auto mb-0 ${isMobile ? "px-0" : ""}`}>
                                                <label>نقطه تنظیم</label>
                                                <input
                                                    type="number"
                                                    value={limitPoint}
                                                    onChange={e => setLimitPoint(e.target.value)}
                                                    className={`form-control pl-3 text-left placeholder-text-right`}
                                                    placeholder={selectedSensor ? selectedSensor?.item?.type?.name === "Humidity" ? "درصد رطوبت را وارد کنید" : "دما را وارد کنید" : ""}
                                                />
                                                {
                                                    selectedSensor && <span className="unit-placeholder">{selectedSensor?.item?.type?.name === "Humidity" ? "%" : "°C"}</span>
                                                }
                                            </div>
                                        </div>
                                    </>
                                )
                            }
                        </>
                    ) : selectedNotificationType?.name === "actuator" ? (
                        <>
                            <div className={`row ${isMobile ? "px-3" : "align-items-center"}`}>
                                <div className={`col-lg-12 col-sm-12 ${isMobile ? "px-0 pb-2" : "pt-2"}`}>
                                    <div className="form-group">
                                        <label htmlFor="name" className="required">انتخاب عملگر</label>
                                        <ReactSelect
                                            options={actuators}
                                            value={selectedActuator}
                                            onChange={setSelectedActuator}
                                            mobileMode={true}
                                            placeholder="انتخاب..."
                                            size={"small"}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className={`row justify-content-between ${isMobile ? "px-3 pb-3" : "align-items-center p-3 mt-3"}`}>
                                <div className="">
                                    <label
                                        className={`container-radio ${isMobile ? "col-6 mb-1" : ""}`}>
                                        <input type="radio" name="notificationRelayType" value="ON"
                                               checked={condition === "ON"}
                                               onChange={e => setCondition(e.target.value)}/>
                                        <span className="radio-mark"/>
                                        <span className="radio-text">روشن</span>
                                    </label>
                                </div>
                                <div className="">
                                    <label
                                        className={`container-radio ${isMobile ? "col-6 mb-1" : "mr-4"}`}>
                                        <input type="radio" name="notificationRelayType" value="OFF"
                                               checked={condition === "OFF"}
                                               onChange={e => setCondition(e.target.value)}/>
                                        <span className="radio-mark"/>
                                        <span className="radio-text">خاموش</span>
                                    </label>
                                </div>
                                <div className="">
                                    <label
                                        className={`container-radio ${isMobile ? "col-6 mb-1" : "mr-4"}`}>
                                        <input type="radio" name="notificationRelayType" value="SWITCH"
                                               checked={condition === "SWITCH"}
                                               onChange={e => setCondition(e.target.value)}/>
                                        <span className="radio-mark"/>
                                        <span className="radio-text">تغییر وضعیت</span>
                                    </label>
                                </div>
                            </div>
                        </>
                    ) : selectedNotificationType?.name === "manualtile" || selectedNotificationType?.name === "automatictile" ? (
                        <div className={`row justify-content-between ${isMobile ? "px-3 pb-3" : "align-items-center"}`}>
                            {
                                selectedNotificationType?.name === "automatictile" && (
                                    <div className={`col-lg-12 col-sm-12 ${isMobile ? "px-0 pb-2" : "pt-2"}`}>
                                        <div className="form-group">
                                            <label htmlFor="name" className="required">اتوماسیون</label>
                                            <ReactSelect
                                                options={automatics}
                                                value={selectedAutomatic}
                                                onChange={setSelectedAutomatic}
                                                className={data ? "disabled" : ""}
                                                mobileMode={true}
                                                placeholder="انتخاب..."
                                                size={"small"}
                                            />
                                        </div>
                                    </div>
                                )
                            }
                            {
                                selectedNotificationType?.name === "manualtile" && (
                                    <div className={`col-lg-12 col-sm-12 ${isMobile ? "px-0 pb-2" : "pt-2"}`}>
                                        <div className="form-group">
                                            <label htmlFor="name" className="required">اتوماسیون</label>
                                            <ReactSelect
                                                options={manuals}
                                                value={selectedManual}
                                                onChange={setSelectedManual}
                                                className={data ? "disabled" : ""}
                                                mobileMode={true}
                                                placeholder="انتخاب..."
                                                size={"small"}
                                            />
                                        </div>
                                    </div>
                                )
                            }
                            <div className="col-lg-12 col-sm-12 d-flex justify-content-between mt-2">
                                <div className="">
                                    <label
                                        className={`container-radio ${isMobile ? "col-6 mb-1" : ""}`}>
                                        <input type="radio" name="notificationRelayType" value="ON"
                                               checked={condition === "ON"}
                                               onChange={e => setCondition(e.target.value)}/>
                                        <span className="radio-mark"/>
                                        <span className="radio-text">روشن</span>
                                    </label>
                                </div>
                                <div className="">
                                    <label
                                        className={`container-radio ${isMobile ? "col-6 mb-1" : "mr-4"}`}>
                                        <input type="radio" name="notificationRelayType" value="OFF"
                                               checked={condition === "OFF"}
                                               onChange={e => setCondition(e.target.value)}/>
                                        <span className="radio-mark"/>
                                        <span className="radio-text">خاموش</span>
                                    </label>
                                </div>
                                <div className="">
                                    <label
                                        className={`container-radio ${isMobile ? "col-6 mb-1" : "mr-4"}`}>
                                        <input type="radio" name="notificationRelayType" value="SWITCH"
                                               checked={condition === "SWITCH"}
                                               onChange={e => setCondition(e.target.value)}/>
                                        <span className="radio-mark"/>
                                        <span className="radio-text">تغییر وضعیت</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    ) : null
                }
            </div>
            <div className="row">
                <div className={`col-12 d-flex justify-content-end ${isMobile ? "px-0 mt-3" : "mt-4 pt-2"}`}>
                    <Button
                        className={`ml-3 button btn-primary-fill d-flex align-items-center justify-content-center py-2 px-5 ${isMobile ? "width-65" : ""} ${validationForm ? "" : "disabled"}`}
                        handler={handleSubmit}
                    >
                        <span>تایید</span>
                    </Button>
                    <Button
                        className={`button btn-primary-outline d-flex btn-primary-border align-items-center justify-content-center py-2 px-5 ${isMobile ? "width-35" : ""}`}
                        handler={onClose}>
                        <span>لغو</span>
                    </Button>
                </div>
            </div>
        </>
    )
}

export default CreateNotificationForm;