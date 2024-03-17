import React, {useEffect, useRef, useState} from 'react';
import ReactSelect from "../Select/Select";
import {isMobile} from "react-device-detect";
import Button from "../Button/Button";
import {getConditionContentTypes, getContentTypes} from "../../services/api";
import DurationInput from "../DurationInput";
import {DatePicker} from "react-persian-datepicker";
import moment from "moment-jalaali";

const styles = {
    calendarContainer: 'calendarContainer',
    dayPickerContainer: 'dayPickerContainer',
    monthsList: 'monthsList',
    daysOfWeek: 'daysOfWeek',
    dayWrapper: 'dayWrapper',
    currentMonth: 'currentMonth',
    selected: 'selected',
    heading: 'heading',
    prev: 'prev',
    next: 'next',
    title: 'title',
}
const tomorrowDate = moment().subtract(1, 'days');


const scheduleOptions = [
    {label: "یکبار", value: "ONCE"},
    {label: "ساعتی", value: "HOURLY"},
    {label: "روزانه", value: "DAILY"},
    {label: "هفتگی", value: "WEEKLY"},
    {label: "ماهانه", value: "MONTHLY"},
    {label: "فصلی", value: "SEASONALLY"},
    {label: "سالانه", value: "YEARLY"}
]

const alarmOptions = [
    {label: "روشن", value: "ON"},
    {label: "خاموش", value: "OFF"},
    {label: "تغییر وضعیت", value: "SWITCH"}
]

const SENSOR_TYPES_BINARY = "BINARY"
const SENSOR_TYPES_CONTINUES = "CONTINUES"

const ActuatorScheduleForm = ({onCancel, handler, automationData, actuators, sensors, errors}) => {


    const [conditionContentTypes, setConditionContentTypes] = useState([])
    const [contentTypes, setContentTypes] = useState([])
    const [selectedSensor, setSelectedSensor] = useState(null);
    const [automationType, setAutomationType] = useState("schedule")

    const [scheduleOption, setScheduleOption] = useState(null);
    const [selectedActuator, setSelectedActuator] = useState(null)
    const [time, setTime] = useState(null);
    const [title, setTitle] = useState("");
    const [statusRelaySchedule, setStatusRelaySchedule] = useState(null);
    const [delay, setDelay] = useState(false)
    const [delayValue, setDelayValue] = useState("")
    const [alarm, setAlarm] = useState(false)
    const [alarmType, setAlarmType] = useState(null)
    const [sensorType, setSensorType] = useState(null)
    const [condition, setCondition] = useState(null);
    const [limitPoint, setLimitPoint] = useState("");
    const [dateFrom, setDateFrom] = useState(moment());
    const inputRef = useRef(null)
    const dateFromEl = useRef(null);
    const [validationFormSchedule, setValidationFormSchedule] = useState(false);
    const [validationFormRegulation, setValidationFormRegulation] = useState(false);

    useEffect(() => {
        if (automationType === "schedule") {
            if (title !== "" && scheduleOption && selectedActuator && statusRelaySchedule && time && ((!delay && delayValue === "") || (delay && delayValue !== "") || (!delay && delayValue !== "")) && ((!alarm && alarmType === null) || (alarm && alarmType !== null) || (!alarm && alarmType !== null))) {
                setValidationFormSchedule(true)
            } else {
                setValidationFormSchedule(false)
            }
        }

        if (automationType === "regulation") {
            if (title !== "" && selectedSensor && condition && selectedActuator && statusRelaySchedule && ((!delay && delayValue === "") || (delay && delayValue !== "") || (!delay && delayValue !== "")) && ((!alarm && alarmType === null) || (alarm && alarmType !== null) || (!alarm && alarmType !== null))) {
                setValidationFormRegulation(true)
            } else {
                setValidationFormRegulation(false)
            }
        }
    }, [title, selectedSensor, scheduleOption, selectedActuator, statusRelaySchedule, time, delay, delayValue, alarm, alarmType, limitPoint, condition])

    useEffect(() => {
        loadConditionContentTypes()
        loadContentTypes()

        inputRef.current.focus();
    }, []);

    useEffect(() => {
        if (automationData) {

            let res = automationData.condition_object.set_time?.split("T")
            if (res) {
                setDateFrom(moment(res[0]));
                const timeDuration = moment(automationData.condition_object.set_time).format("hh:mm");
                setTime(timeDuration);
            }

            setAutomationType(automationData.type);
            setTitle(automationData.title);
            setCondition(automationData.condition_object?.operator)
            setScheduleOption(() => {
                return scheduleOptions.find(item => item.value === automationData.condition_object?.operator)
            });
            setSelectedActuator(() => {
                return actuators?.find(item => item.value === automationData.actuator?.id)
            })
            setSelectedSensor(() => {
                return sensors?.find(item => item.value === automationData?.condition_object?.sensor)
            })
            setLimitPoint(automationData.condition_object?.set_point ? automationData.condition_object.set_point : "")
            setStatusRelaySchedule(automationData.output);
            setDelay(automationData.delay_status)
            if (automationData?.delay_status) {
                setDelayValue(parseInt(automationData.delay.slice(0, automationData.delay.length - 1)))
            }
            setAlarm(automationData.alarm?.following);
            if (automationData.alarm?.following) {
                setAlarmType(alarmOptions.find(item => item.value === automationData.alarm?.condition))
            }
        }
    }, [automationData])

    const handleCreateAutomationSchedule = () => {

        const selectedConditionContentType = conditionContentTypes.find(item => item.model === "schedule");

        const formValues = {
            alarm: {
                condition: alarmType ? alarmType.value : null,
                set_point: null,
                following: alarm
            },
            condition_content_type: {
                id: selectedConditionContentType ? selectedConditionContentType.id : null
            },
            condition_object: {
                operator: scheduleOption.value,
                set_time: dateFrom.format("YYYY-MM-DD").toString() + " " + time
            },
            type: "schedule",
            title: title,
            actuator: {id: selectedActuator.value},
            delay_status: delay,
            delay: delayValue !== '' ? `${delayValue}m` : null,
            output: statusRelaySchedule,
            active: true,
            lock: true,
        }
        handler(formValues)
    }

    const handleCreateAutomationRegulation = () => {
        const selectedConditionContentType = conditionContentTypes.find(item => item.model === selectedSensor.type?.toLowerCase());

        const formValues = {
            alarm: {
                condition: alarmType ? alarmType.value : null,
                set_point: null,
                following: alarm
            },
            condition_content_type: {
                id: selectedConditionContentType ? selectedConditionContentType.id : null
            },
            condition_object: {
                sensor: selectedSensor.value,
                operator: condition,
                set_point: sensorType === SENSOR_TYPES_CONTINUES ? limitPoint : null
            },
            type: "regulation",
            title: title,
            actuator: {id: selectedActuator.value},
            delay_status: delay,
            delay: delayValue !== '' ? delayValue : null,
            output: statusRelaySchedule,
            active: true,
            lock: true,
        }
        handler(formValues)
    }

    useEffect(() => {
        if (selectedSensor) setSensorType(selectedSensor?.item?.type?.value)
        if (condition === "" && selectedSensor?.type === SENSOR_TYPES_CONTINUES) {
            setCondition("HT")
        } else if (condition === "" && selectedSensor?.type === SENSOR_TYPES_BINARY) {
            setCondition("ON")
        }
    }, [selectedSensor])

    const loadConditionContentTypes = () => {
        getConditionContentTypes()
            .then(res => setConditionContentTypes(res.results))
            .catch(err => console.log(err))
    }

    const loadContentTypes = () => {
        getContentTypes()
            .then(res => setContentTypes(res.results))
            .catch(err => console.log(err))
    }

    return (<>
            <div className="row header-schedule-form p-2 bold mx-0">
                <div
                    className={`col-6 text-center header-schedule-form-item position-relative cursor-pointer ${automationData?.type === "regulation" ? "disabled" : ""} ${automationType === "schedule" ? "active" : ""}`}
                    onClick={() => setAutomationType("schedule")}>تابع براساس زمانبندی
                </div>
                <div
                    className={`col-6 text-center header-schedule-form-item position-relative cursor-pointer ${automationData?.type === "schedule" ? "disabled" : ""} ${automationType === "regulation" ? "active" : ""}`}
                    onClick={() => setAutomationType("regulation")}>تابع براساس خوانش سنسور
                </div>
            </div>
            <section className={`body-automatic-form ${isMobile ? "card px-3 mt-3 pb-3" : ""}`}>
                {
                    automationType === "schedule" ? (<>
                        <div className={`row mx-0 mb-1`}>
                            <div className={`col-lg-7 col-sm-12 px-0 ${isMobile ? "mt-4" : "mt-3"}`}>
                                <div className="form-group">
                                    <label className="required">نام تابع خود را تعریف کنید: </label>
                                    <input
                                        type="text"
                                        className={`form-control pr-3 ${errors && errors?.title ? "border-error" : ""}`}
                                        placeholder="نام دلخواه را برای وضعیت انتخاب نمایید."
                                        value={title}
                                        ref={inputRef}
                                        onChange={e => setTitle(e.target.value)}
                                    />
                                    {
                                        errors && errors?.title ? <p className="error-field">{errors?.title[0]}</p> : null
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="row mx-0 mt-3">
                            <div className="col-12 border rounded-12 px-3 position-relative">
                                <span className="title">اگر</span>
                                <div className={`col-lg-12 col-sm-12 mt-3 ${isMobile ? "px-0" : ""}`}>
                                    <div className="form-group">
                                        <label className="required">زمان بندی</label>
                                        <div className="row m-0">
                                            <div className="">
                                                <ReactSelect
                                                    className="autoCompeletSelect "
                                                    value={scheduleOption}
                                                    onChange={setScheduleOption}
                                                    options={scheduleOptions}
                                                    mobileMode={true}
                                                    placeholder="انتخاب کنید"
                                                />
                                            </div>
                                            <div className="col-2 mr-4">
                                                <DurationInput
                                                    value={time || automationData?.condition_object.set_time ? moment(automationData?.condition_object.set_time).format("hh:mm") : null}
                                                    onChange={setTime}
                                                />
                                            </div>
                                            <div
                                                className={`col-lg-5 col-sm-6 col-6 d-flex pr-0 ${isMobile ? "flex-column mb-2" : "flex-row align-items-center mr-4"}`}>
                                                <div className="form-group mb-0">
                                                    <DatePicker
                                                        // timePickerComponent={TimePicker}
                                                        calendarStyles={styles}
                                                        inputFormat="jYYYY/jM/jD"
                                                        className={`report-calendar-Container form-control p-date-picker ${isMobile ? "" : "mr-1"}`}
                                                        value={dateFrom}
                                                        closeOnSelect={true}
                                                        min={tomorrowDate}
                                                        ref={dateFromEl}
                                                        beforeShowDay={true}
                                                        onChange={value => {
                                                            dateFromEl.current.state.isOpen = false;
                                                            setDateFrom(value);
                                                        }}
                                                    />
                                                    <i className="icon icon-24 icon-calendar left-12px"/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-4 pt-3 mx-0">
                            <div className="col-12 border rounded-12 position-relative pr-3">
                                <span className="title">آنگاه</span>
                                <div className={`form-group mt-3 ${isMobile ? "" : "px-3"}`}>
                                    <label className="required">انتخاب رله</label>
                                    <div className={`d-flex ${isMobile ? "flex-column align-items-stretch" : "align-items-center"}`}>
                                        <ReactSelect
                                            className={`autoCompeletSelect ${errors && errors?.actuator ? "border-error" : ""}`}
                                            value={selectedActuator}
                                            onChange={setSelectedActuator}
                                            options={actuators}
                                            mobileMode={true}
                                            placeholder="انتخاب کنید"
                                        />
                                        {
                                            errors && errors?.actuator ? <p className="error-field">{errors?.actuator.non_field_errors[0]}</p> : null
                                        }
                                        <div className={`d-flex justify-content-between position-relative flex-grow-1 pl-0 ${isMobile ? "flex-wrap mt-4" : "pr-3 mr-5"}`}>
                                            <label className={`container-radio ${isMobile ? "col-6 mb-1" : ""}`}>
                                                <input type="radio" name="statusRelay" value="ON"
                                                       checked={statusRelaySchedule === "ON"}
                                                       onChange={e => setStatusRelaySchedule(e.target.value)}/>
                                                <span className="radio-mark"/>
                                                <span className="radio-text">روشن</span>
                                            </label>
                                            <label className={`container-radio ${isMobile ? "col-6 mb-1" : ""}`}>
                                                <input type="radio" name="statusRelay" value="OFF"
                                                       checked={statusRelaySchedule === "OFF"}
                                                       onChange={e => setStatusRelaySchedule(e.target.value)}/>
                                                <span className="radio-mark"/>
                                                <span className="radio-text">خاموش</span>
                                            </label>
                                            <label className={`container-radio ${isMobile ? "col-6 mt-3" : ""}`}>
                                                <input type="radio" name="statusRelay" value="SWITCH"
                                                       checked={statusRelaySchedule === "SWITCH"}
                                                       onChange={e => setStatusRelaySchedule(e.target.value)}/>
                                                <span className="radio-mark"/>
                                                <span className="radio-text">تغییر وضعیت</span>
                                            </label>
                                            {
                                                errors && errors?.output ? <p className="error-field">{errors?.output[0]}</p> : null
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-3 mx-0">
                            <div
                                className={`col-12 ${isMobile ? "pt-2 pb-4" : "pt-3"}`}>
                                <div className={`row ${isMobile ? "justify-content-between" : "pl-2"}`}>
                                    <label
                                        className={`container-checkbox d-flex align-items-center mb-0`}>
                                        <input type="checkbox" name="automation" checked={delay}
                                               onChange={e => setDelay(e.target.checked)}/>
                                        <span className="checkmark"/>
                                        <span
                                            className="radio-text text-wrap">در عملکرد رله تاخیر زمانی وجود داشته باشد</span>
                                    </label>
                                    <div className={`px-0 ${isMobile ? "col-12 mt-3" : "mr-3"}`}>
                                        <input
                                            type="number"
                                            value={delayValue}
                                            onChange={(e) => setDelayValue(e.target.value)}
                                            className="form-control pr-3"
                                            placeholder="تاخیر زمانی را به دقیقه وارد نمایید."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={`row mx-0 ${isMobile ? "" : "mt-3"}`}>
                            <div
                                className={`col-12 ${isMobile ? "pb-4" : "pt-3"}`}>
                                <div className={`row ${isMobile ? "justify-content-between" : "pl-2"}`}>
                                    <label className="container-checkbox d-flex align-items-center mb-0">
                                        <input type="checkbox" name="automation" checked={alarm}
                                               onChange={e => setAlarm(e.target.checked)}/>
                                        <span className="checkmark"/>
                                        <span
                                            className="radio-text text-wrap">در زمان عملکرد رله، هشداری فعال شود</span>
                                    </label>
                                    <div className={`px-0 ${isMobile ? "col-12 mt-3" : "mr-3"}`}>
                                        <ReactSelect
                                            className={`autoCompeletSelect pl-0 ${!alarm ? "disabled" : ""}`}
                                            value={alarmType}
                                            onChange={setAlarmType}
                                            options={alarmOptions}
                                            mobileMode={true}
                                            placeholder="انتخاب کنید"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={`row ${isMobile ? "mt-2" : " mt-4"}`}>
                            <div className={`col-12 text-left ${isMobile ? "px-3" : "px-0 pt-3"}`}>
                                <Button
                                    handler={handleCreateAutomationSchedule}
                                    className={`button btn-primary-fill py-2 px-5 d-flex- align-items-center justify-content-center ${isMobile ? "width-65" : ""} ${!validationFormSchedule ? "" : ""}`}><span                                    className="p-2">تایید</span></Button>
                                <Button
                                    className={`button btn-primary-fill-outline py-2 d-flex- align-items-center justify-content-center ${isMobile ? "width-35 px-4" : "px-5"}`}
                                    handler={onCancel}>
                                    <span className="p-2">لغو</span>
                                </Button>
                            </div>
                        </div>
                    </>) : null
                }

                {
                    automationType === "regulation" ? (<>
                        <div className="row mx-0 mb-1">
                            <div className={`col-lg-7 col-sm-12 px-0 ${isMobile ? "mt-4" : "mt-3"}`}>
                                <div className="form-group">
                                    <label>نام تابع خود را تعریف کنید: </label>
                                    <input
                                        type="text"
                                        className={`form-control pr-3 ${errors && errors?.title ? "border-error" : ""}`}
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="نام دلخواه را برای وضعیت انتخاب نمایید."
                                    />
                                    {
                                        errors && errors?.title ? <p className="error-field">{errors?.title[0]}</p> : null
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="row mx-0 mt-3">
                            <div className="col-12 border rounded-12 px-3 position-relative">
                                <span className="title">اگر</span>
                                <div className={`col-lg-12 col-sm-12 mt-3 ${isMobile ? "px-0" : ""}`}>
                                    <div className="form-group">
                                        <label>انتخاب سنسور</label>
                                        <div className={`d-flex align-items-center ${isMobile ? "flex-wrap" : ""}`}>
                                            <div className={`${isMobile ? "col-12 p-0" : ""}`}>
                                                <ReactSelect
                                                    className={`autoCompeletSelect ${errors && errors?.sensor ? "border-error" : ""}`}
                                                    value={selectedSensor}
                                                    onChange={setSelectedSensor}
                                                    options={sensors}
                                                    mobileMode={true}
                                                    placeholder="انتخاب کنید"
                                                />
                                                {
                                                    errors && errors?.sensor ? <p className="error-field">{errors?.sensor[0]}</p> : null
                                                }
                                            </div>
                                            <div
                                                className={`d-flex justify-content-between position-relative align-items-center flex-grow-1 pl-0 ${isMobile ? "col-12 px-0 flex-wrap mt-4" : "pr-3 mr-5"}`}>
                                                {
                                                    sensorType === SENSOR_TYPES_CONTINUES ? (
                                                        <>
                                                            <label
                                                                className={`container-radio ${isMobile ? "col-6 mb-1" : ""}`}>
                                                                <input type="radio" name="statusSensor" value="HT"
                                                                       checked={condition === "HT"}
                                                                       onChange={e => setCondition(e.target.value)}/>
                                                                <span className="radio-mark"/>
                                                                <span className="radio-text">بیشتر از</span>
                                                            </label>
                                                            <label
                                                                className={`container-radio ${isMobile ? "col-6 mb-1" : "mr-4"}`}>
                                                                <input type="radio" name="statusSensor" value="LT"
                                                                       checked={condition === "LT"}
                                                                       onChange={e => setCondition(e.target.value)}/>
                                                                <span className="radio-mark"/>
                                                                <span className="radio-text">کمتر از</span>
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={limitPoint}
                                                                onChange={e => setLimitPoint(e.target.value)}
                                                                className={`form-control ${isMobile ? "mt-3" : "mr-4"}`}
                                                                placeholder="دما را وارد نمایید."
                                                            />
                                                            {
                                                                errors && errors?.condition_object ? <p className="error-field">{errors?.condition_object[0]}</p> : null
                                                            }
                                                        </>
                                                    ) : (
                                                        <>
                                                            <label
                                                                className={`container-radio ${isMobile ? "col-6 mb-1" : ""}`}>
                                                                <input type="radio" name="statusSensor" value="ON"
                                                                       checked={condition === "ON"}
                                                                       onChange={e => setCondition(e.target.value)}
                                                                />
                                                                <span className="radio-mark"/>
                                                                <span className="radio-text">روشن</span>
                                                            </label>
                                                            <label
                                                                className={`container-radio ${isMobile ? "col-6 mb-1" : ""}`}>
                                                                <input type="radio" name="statusSensor" value="OFF"
                                                                       checked={condition === "OFF"}
                                                                       onChange={e => setCondition(e.target.value)}
                                                                />
                                                                <span className="radio-mark"/>
                                                                <span className="radio-text">خاموش</span>
                                                            </label>
                                                            <label
                                                                className={`container-radio ${isMobile ? "col-6 mt-3" : ""}`}>
                                                                <input type="radio" name="statusSensor" value="SWITCH"
                                                                       checked={condition === "SWITCH"}
                                                                       onChange={e => setCondition(e.target.value)}
                                                                />
                                                                <span className="radio-mark"/>
                                                                <span className="radio-text">تغییر وضعیت</span>
                                                            </label>
                                                            {
                                                                errors && errors?.condition_object ? <p className="error-field">{errors?.condition_object[0]}</p> : null
                                                            }
                                                        </>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-4 pt-3 mx-0">
                            <div className="col-12 border rounded-12 position-relative pr-3">
                                <span className="title">آنگاه</span>
                                <div className={`form-group mt-3 ${isMobile ? "" : "px-3"}`}>
                                    <label>انتخاب رله</label>
                                    <div
                                        className={`d-flex ${isMobile ? "flex-column align-items-stretch" : "align-items-center"}`}>
                                        <ReactSelect
                                            className={`autoCompeletSelect ${errors && errors?.actuator ? "border-error" : ""}`}
                                            value={selectedActuator}
                                            onChange={setSelectedActuator}
                                            options={actuators}
                                            mobileMode={true}
                                            placeholder="انتخاب کنید"
                                        />
                                        {
                                            errors && errors?.actuator ? <p className="error-field">{errors?.actuator[0]}</p> : null
                                        }
                                        <div className={`d-flex justify-content-between position-relative flex-grow-1 pl-0 ${isMobile ? "flex-wrap mt-4" : "pr-3 mr-5"}`}>
                                            <label className={`container-radio ${isMobile ? "col-6 mb-1" : ""}`}>
                                                <input type="radio" name="automation" value="ON"
                                                       checked={statusRelaySchedule === "ON"}
                                                       onChange={e => setStatusRelaySchedule(e.target.value)}/>
                                                <span className="radio-mark"/>
                                                <span className="radio-text">روشن</span>
                                            </label>
                                            <label className={`container-radio ${isMobile ? "col-6 mb-1" : ""}`}>
                                                <input type="radio" name="automation" value="OFF"
                                                       checked={statusRelaySchedule === "OFF"}
                                                       onChange={e => setStatusRelaySchedule(e.target.value)}/>
                                                <span className="radio-mark"/>
                                                <span className="radio-text">خاموش</span>
                                            </label>
                                            <label className={`container-radio ${isMobile ? "col-6 mt-3" : ""}`}>
                                                <input type="radio" name="automation" value="SWITCH"
                                                       checked={statusRelaySchedule === "SWITCH"}
                                                       onChange={e => setStatusRelaySchedule(e.target.value)}/>
                                                <span className="radio-mark"/>
                                                <span className="radio-text">تغییر وضعیت</span>
                                            </label>
                                            {
                                                errors && errors?.output ? <p className="error-field">{errors?.output[0]}</p> : null
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={`row mx-0 ${isMobile ? "mt-2" : "mt-3"}`}>
                            <div
                                className={`col d-flex justify-content-between ${isMobile ? "flex-column pt-3 pb-4" : "flex-row pt-3"}`}>
                                <div className={`row ${isMobile ? "justify-content-between" : "pl-2"}`}>
                                    <label className="container-checkbox d-flex align-items-center mb-0">
                                        <input type="checkbox" name="automation" checked={delay}
                                               onChange={e => setDelay(e.target.checked)}/>
                                        <span className="checkmark"/>
                                        <span
                                            className="radio-text text-wrap">در عملکرد رله تاخیر زمانی وجود داشته باشد</span>
                                    </label>
                                    <div className={`px-0 ${isMobile ? "col-12 mt-3" : "mr-3"}`}>
                                        <input
                                            type="number"
                                            value={delayValue}
                                            onChange={(e) => setDelayValue(e.target.value)}
                                            className="form-control pr-3"
                                            placeholder="تاخیر زمانی را به دقیقه وارد نمایید."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={`row mx-0 ${isMobile ? "" : "mt-3"}`}>
                            <div
                                className={`col-12 d-flex justify-content-between ${isMobile ? "flex-column pb-4" : "flex-row pt-3"}`}>
                                <div className={`row ${isMobile ? "justify-content-between" : "pl-2"}`}>
                                    <label className="container-checkbox d-flex align-items-center mb-0">
                                        <input type="checkbox" name="automation" checked={alarm}
                                               onChange={e => setAlarm(e.target.checked)}/>
                                        <span className="checkmark"/>
                                        <span
                                            className="radio-text text-wrap">در زمان عملکرد رله، هشداری فعال شود</span>
                                    </label>
                                    <div className={`px-0 ${isMobile ? "col-12 mt-3" : "mr-3"}`}>
                                        <ReactSelect
                                            className={`autoCompeletSelect ${!alarm ? "disabled" : ""}`}
                                            value={alarmType}
                                            onChange={setAlarmType}
                                            options={alarmOptions}
                                            mobileMode={true}
                                            placeholder="انتخاب کنید"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={`row ${isMobile ? "" : "mt-4"}`}>
                            <div className={`col-12 text-left ${isMobile ? "px-3 mt-2" : "px-0 mt-3"}`}>
                                <Button
                                    handler={handleCreateAutomationRegulation}
                                    className={`button btn-primary-fill py-2 px-5 d-flex- align-items-center justify-content-center ${isMobile ? "width-65" : ""} ${!validationFormRegulation ? "disabled" : ""}`}><span
                                    className="p-2">تایید</span></Button>
                                <Button
                                    className={`button btn-primary-fill-outline py-2 d-flex- align-items-center justify-content-center ${isMobile ? "width-35 px-4" : "px-5"}`}
                                    handler={onCancel}>
                                    <span className="p-2">لغو</span>
                                </Button>
                            </div>
                        </div>

                    </>) : null
                }
            </section>
        </>
    )
}

export default ActuatorScheduleForm