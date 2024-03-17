import React, {useEffect, useState, useRef} from "react";
import moment from "moment-jalaali";
import ReactSelect from '../../components/Select/Select';
import {DatePicker} from "react-persian-datepicker";
import {getChart, getDeviceType, getSensors} from "../../services/api";
import MultiSelect from "react-multi-select-component";
import {isMobile} from "react-device-detect";
import Button from "../../components/Button/Button";
import HighChart from "../../components/ChartView/HighChart";
import {sensorToList} from "../../utils/toList";

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

const tomorrowDate = moment();

let time = moment().utcOffset(0);
time.set({hour:0,minute:0,second:1,millisecond:0})


const HistoryData = () => {

    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [sensors, setSensors] = useState([]);
    const [selectedSensor, setSelectedSensor] = useState([])
    const [dateFrom, setDateFrom] = useState(time);
    const [dateTo, setDateTo] = useState(moment());
    const dateFromEl = useRef(null);
    const dateToEl = useRef(null);
    const [dataChart, setDataChart] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isValidationForm, setIsValidationForm] = useState(false);
    const [unit, setUnit] = useState(null);

    useEffect(() => {
        deviceType();
    }, []);

    useEffect(() => {
        setSensors([])
        setSelectedSensor([]);
        if (selectedDevice?.value) {
            getSensors(selectedDevice?.value).then(res => {
                setSensors(sensorToList(res))
                if (res[0].type?.default_unit) {
                    setUnit(res[0].type?.default_unit);
                }
            }).catch(err => console.log(err))
        }
    }, [selectedDevice]);


    useEffect(() => {
        if (selectedDevice !== null && selectedSensor?.length > 0) {
            setIsValidationForm(true)
        } else {
            setIsValidationForm(false)
        }
    },[selectedDevice, selectedSensor])

    useEffect(() => {
        if (dateFromEl.current.refs.input.readOnly) {
            dateFromEl.current.refs.input.readOnly = true;
            dateFromEl.current.refs.input.style.backgroundColor = "unset";
        }
    }, [])

    const deviceType = () => {
        getDeviceType().then(res => {
            setDevices(deviceToList(res));
        }).catch(err => {
            console.log(err)
        })
    }

    const ArrowRenderer = ({expanded}) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                               xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9L12 15L18 9" stroke="#646464" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    ;

    const deviceToList = res => {
        return res.map(item => {
            return {value: item.id, label: item.title}
        })
    }

    const loadChart = () => {
        setIsLoading(true)
        const param = {
            sensor_type: selectedDevice.value,
            sensor_list: selectedSensor.map(item => item.value),
            start_time: dateFrom.format("YYYY-MM-DD HH:mm:ss"),
            stop_time: dateTo.format("YYYY-MM-DD HH:mm:ss")
        }
        getChart(param).then(res => {
            setDataChart(res.data)
            setIsLoading(false)
        }).catch(err => {
            console.log(err)
            setIsLoading(false)
        })
    }

    return (
        <div className={`overflow-auto height-user-custom px-30px mx--15px mt--15px pt-15px`}>
            <section className="row card card-box">
                <div className={`col-12 pt-4 pb-32px px-32px`}>
                    <div className={`row ${isMobile ? "flex-column" : "align-items-end"}`}>
                        <div className={`col-lg-6 col-md-6 col-xl-7 col-sm-12 d-flex ${isMobile ? "flex-column" : ""}`}>
                            <div className={`form-group flex-grow-1 ${isMobile ? "" : "ml-4 mb-0"}`}>
                                <label htmlFor="provinceSelected" className="required mb-1">نوع سنسور</label>
                                <ReactSelect
                                    className="autoCompeletSelect "
                                    value={selectedDevice}
                                    onChange={setSelectedDevice}
                                    options={devices}
                                    mobileMode={true}
                                    placeholder="انتخاب کنید"/>
                            </div>
                            <div className={`form-group flex-grow-1 ${isMobile ? "mt-1" : "mb-0"}`}>
                                <label htmlFor="parameter" className="required mb-1">انتخاب سنسور</label>
                                <MultiSelect
                                    options={sensors}
                                    value={selectedSensor}
                                    hasSelectAll={false}
                                    disableSearch={true}
                                    ArrowRenderer={ArrowRenderer}
                                    onChange={setSelectedSensor}
                                    labelledBy="انتخاب کنید"
                                    overrideStrings={{
                                        "noOptions": "دیتایی وجود ندارد",
                                        "search": "جستجو...",
                                        "selectSomeItems": "انتخاب کنید",
                                        "allItemsAreSelected": 'تمامی آیتم ها انتخاب شده است'
                                    }}
                                />
                            </div>
                        </div>
                        <div className={`col-xl-5 col-lg-6 col-md-6 col-sm-12 d-flex align-items-end ${isMobile ? "flex-wrap" : ""}`}>
                            <div className={`d-flex w-100 ${isMobile ? "col-12 mt-1 p-0" : ""}`}>
                                <div className={`form-group w-50 ${isMobile ? "ml-2" : "ml-3 mb-0"}`}>
                                    <label htmlFor="dateFrom" className="ml-3 mb-1">تاریخ شروع</label>
                                    <DatePicker
                                        calendarStyles={styles}
                                        inputFormat="jYYYY/jM/jD"
                                        className="report-calendar-Container form-control p-date-picker"
                                        value={dateFrom}
                                        closeOnSelect={true}
                                        max={tomorrowDate}
                                        ref={dateFromEl}
                                        beforeShowDay={true}
                                        onChange={value => {
                                            dateFromEl.current.state.isOpen = false;
                                            setDateFrom(value);
                                        }}
                                    />
                                    <i className="icon icon-24 icon-calendar  left-12px"/>
                                </div>
                                <div className={`form-group w-50 ${isMobile ? "mr-2" : "ml-32px mb-0"}`}>
                                    <label htmlFor="dateTo" className="ml-3 mb-1">تاریخ پایان</label>
                                    <DatePicker
                                        calendarStyles={styles}
                                        inputFormat="jYYYY/jM/jD"
                                        className="report-calendar-Container form-control p-date-picker"
                                        value={dateTo}
                                        closeOnSelect={true}
                                        max={tomorrowDate}
                                        ref={dateToEl}
                                        beforeShowDay={false}
                                        onChange={value => {
                                            dateToEl.current.state.isOpen = false;
                                            setDateTo(value);
                                        }}
                                    />
                                    <i className="icon icon-24 icon-calendar left-12px"/>
                                </div>
                            </div>

                            <Button
                                className={`button btn-primary-fill d-flex align-items-center justify-content-center py-2 px-xl-5 px-lg-4 px-4 mr-auto ${!isValidationForm ? "disabled" : ""}`}
                                handler={loadChart}
                                isLoading={isLoading}
                            >
                                جستجو
                            </Button>
                        </div>
                    </div>
                </div>

            </section>
            <section className="row card mt-3">
                <div className="col-12">
                    {
                        dataChart && <HighChart data={dataChart} sensors={selectedSensor} unit={unit || ""}/>
                    }
                </div>
            </section>
        </div>
    );
};

export default HistoryData;