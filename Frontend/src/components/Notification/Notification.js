import React, {useCallback, useEffect, useRef, useState} from "react";
import {
    getActuators, getActuatorsListAutomatic,
    getActuatorsListManual, getContentType,
    getNotifications,
    getSensors,
    markAllAsReadNotification
} from "../../services/api";
import NotificationItem from "./NotificationItem";
import Modal from "react-modal";
import MultiSelect from "react-multi-select-component";
import {DatePicker} from "react-persian-datepicker";
import moment from "moment-jalaali";
import Button from "../Button/Button";
import {isMobile} from "react-device-detect";
import ReactSelect from "../Select/Select";
import {
    actuatorsToList,
    automaticToList,
    manualToList,
    notificationTypesToList,
    sensorToList
} from "../../utils/toList";

Modal.setAppElement('#root');

const customStyles = {
    content: {
        height: 'max-content',
        overflow: 'auto',
        marginRight: 'auto',
        padding: '0 15px',
        width: '365px',
    }
}

const customStylesMobile = {
    content: {
        height: 'max-content',
        overflow: 'auto',
        marginRight: 'auto',
        marginLeft: 'auto',
        padding: '0 15px',
        inset: '15px',
        width: '365px',
    }
}

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

const notificationTypeNames = {
    SENSOR: 20,
    ACTUATOR: 21,
    SYSTEM: 22
}

const notificationTypes = [
    {value: notificationTypeNames.SENSOR, label: 'هشدار های سنسور'},
    {value: notificationTypeNames.ACTUATOR, label: 'هشدار های رله'},
    {value: notificationTypeNames.SYSTEM, label: 'هشدار های سیستمی'}
]

const Notification = ({unReadCountNotification, handleCloseModal, notifications, lastMessage, loadNotifications, loadUnReadCountNotification}) => {

    const dateFromEl = useRef(null);
    const [isShowFilter, setIsShowFilter] = useState(false);
    const [list, setList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [titleNotificationItems, setTitleNotificationItems] = useState("")
    const [notificationItems, setNotificationItems] = useState([]);

    const [filterOptions, setFilterOptions] = useState({
        selectedNotificationType: null,
        selectedNotificationItems: [],
        dateFrom: null
    })
    const [prevFilterOptions, setPrevFilterOptions] = useState({
        selectedNotificationType: null,
        selectedNotificationItems: [],
        dateFrom: null
    })

    const [nextPage, setNextPage] = useState(null);
    const [prevPage, setPrevPage] = useState(null);

    const [isFilter, setIsFilter] = useState(false);

    useEffect(() => {
        console.log("Number 1")
        setList(notifications?.results)
        setNextPage(notifications?.next ? notifications?.next.replace('http', 'http') : null)
        setPrevPage(notifications?.previous ? notifications?.previous.replace('http', 'http') : null)
    }, [notifications])

    useEffect(() => {
        if (lastMessage) {
            setList(prevState => [lastMessage].concat(prevState));
        }
    },[lastMessage])

    useEffect(() => {
        setFilterOptions({...filterOptions, selectedNotificationItems: []})
        if (filterOptions.selectedNotificationType?.value === notificationTypeNames.SENSOR) {
            loadSensors()
        } else if (filterOptions.selectedNotificationType?.value === notificationTypeNames.ACTUATOR) {
            loadActuators()
        }
    }, [filterOptions.selectedNotificationType])

    const handleReadAllNotifications = () => {
        markAllAsReadNotification().then(() => {
            loadUnReadCountNotification()
        }).catch(err => {
            console.log(err)
        });
    }

    const handleShowFilter = () => {
        setIsShowFilter(true);
    }

    const handleHideFilter = () => {
        setIsShowFilter(false);
    }

    const ArrowRenderer = ({expanded}) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                               xmlns="http://www.w3.org/2000/svg">
        <path d="M6 9L12 15L18 9" stroke="#646464" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>;

    const loadSensors = () => {
        getSensors().then(res => {
            setNotificationItems(sensorToList(res))
        }).catch(err => console.log(err))
    }

    const loadActuators = () => {
        getActuators().then(res => {
            setNotificationItems(sensorToList(res))
        }).catch(err => console.log(err));
    }

    useEffect(() => {
        if (filterOptions.selectedNotificationItems.length === 0 && filterOptions.selectedNotificationType === null && filterOptions.dateFrom === null) {
            setIsFilter(false)
        } else {
            setIsFilter(true)
        }
    }, [filterOptions])

    const handleScroll = () => {
        const element = document.querySelector(".notification-list")
        if (Math.ceil(element.scrollHeight - element.scrollTop) === element.clientHeight || Math.ceil(element.scrollHeight - element.scrollTop) - 1 === element.clientHeight) {
            if (nextPage && !isLoading) {
                getNextPageNotification()
            }
        }
    }

    const getNextPageNotification = () => {
        setIsLoading(true);
        getNotifications(null, null, null, null, nextPage).then(res => {
            console.log("Number 2")
            setList(prev => [...prev, ...res.results]);
            setNextPage(res?.next ? res?.next.replace('http', 'http') : null);
            setPrevPage(res?.previous ? res?.previous.replace('http', 'http') : null)

            setIsLoading(false);
        }).catch(err => {
            setIsLoading(false);
        })
    }

    const getPrevPageNotification = () => {
        setIsLoading(true)
        getNotifications(null, null, null, null, prevPage).then(res => {
            setList(prev => [...res.results, ...prev]);
            setNextPage(res?.next ? res?.next.replace('http', 'https') : null);
            setPrevPage(res?.previous ? res?.previous.replace('http', 'https') : null)

            setIsLoading(false);
        }).catch(err => setIsLoading(false))
    }

    const handleFilter = () => {
        const notificationItemsId = filterOptions.selectedNotificationItems.map(item => item.value).toString()
        const date = filterOptions?.dateFrom ? filterOptions?.dateFrom.format('YYYY-MM-DD') : null;
        const notificationType = filterOptions.selectedNotificationType ? filterOptions.selectedNotificationType.value : null
        setPrevFilterOptions(filterOptions)

        getNotifications(null, notificationType, notificationItemsId, date, null)
            .then(res => {
                setList(res?.results)
                setNextPage(res?.next ? res?.next.replace('http', 'https') : null);
                setPrevPage(res?.previous ? res?.previous.replace('http', 'https') : null)

                setIsShowFilter(false)
            }).catch(err => console.log(err))

        setIsShowFilter(false)
    }

    const checkAutomationItems = () => {
        let result = false;
        let filterAutomationItemsIds = filterOptions.selectedNotificationItems.map(item => item.value)
        if (prevFilterOptions.selectedNotificationItems.length !== filterOptions.selectedNotificationItems.length) {
            result = false
        } else {
            result = handleCheck(filterAutomationItemsIds)
        }
        return result;
    }

    const handleCheck = (filterAutomationItemsIds) => {
        const res = prevFilterOptions.selectedNotificationItems.map(item => filterAutomationItemsIds.some(el => item.value === el))
        return !res.some(item => item === false);
    }

    const isFilterOptionsChanged = () => {
        if (filterOptions.selectedNotificationItems.length  === 0 && filterOptions.selectedNotificationType === null && filterOptions.dateFrom === null && prevFilterOptions.selectedNotificationItems.length  === 0 && prevFilterOptions.selectedNotificationType === null && prevFilterOptions.dateFrom === null) {
            return false
        } else return !(prevFilterOptions.selectedNotificationType?.value !== filterOptions.selectedNotificationType?.value || prevFilterOptions.dateFrom !== filterOptions.dateFrom || !checkAutomationItems());
    }

    const handleChangeNotificationType = item => {
        setFilterOptions({...filterOptions, selectedNotificationType: item})
    }

    const handleChangeNotificationItems = items => {
        setFilterOptions({...filterOptions, selectedNotificationItems: items})
    }

    const resetFilter = () => {
        setFilterOptions({selectedNotificationType: null, selectedNotificationItems: [], dateFrom: null})
        setPrevFilterOptions({selectedNotificationType: null, selectedNotificationItems: [], dateFrom: null})
        loadNotifications()
        setIsShowFilter(false);
    }

    useEffect(() => {
        if (filterOptions.selectedNotificationType?.label === "هشدار های رله") {
            setTitleNotificationItems("رله")
        } else if (filterOptions.selectedNotificationType?.label === "هشدار های سیستمی") {
            setTitleNotificationItems("سیستمی")
        } else if (filterOptions.selectedNotificationType?.label === "هشدار های سنسور") {
            setTitleNotificationItems("سنسور")
        } else {
            setTitleNotificationItems("")
        }
    },[filterOptions.selectedNotificationType])

    return (
        <>
            <div className={`row px-2 border-bottom notif-scroll ${isMobile ? "pb-4 pt-2" : "py-4"}`}>
                <div className="col-12 d-flex justify-content-between  align-items-center">
                    <div className="d-flex  align-items-center font-weight-bold text-dark">
                        اعلان ها
                        <span className="notification-counter mr-2">
                            {
                                unReadCountNotification
                            }
                        </span>
                    </div>
                    <div className="d-flex align-items-center">
                        <i className={`icon icon-24 icon-filter cursor-pointer ml-3 ${isFilter ? "circle-filter" : ""}`}
                           onClick={handleShowFilter}/>
                        <div
                            className="px-2 all-read ml-3"
                            role="button"
                            onClick={() => handleReadAllNotifications()}
                        >
                            همه را خواندم
                        </div>
                        <i
                            className="icon icon-24 icon-close cursor-pointer"
                            onClick={handleCloseModal}
                        />
                    </div>
                </div>
            </div>
            <div className="notification-list" onScroll={handleScroll}>
                {list?.map((item) => (
                    <NotificationItem key={item?.id} item={item}/>
                ))}


                {isLoading && <p className="text-center text-primary font-weight-bold mt-3"><span
                    className="indicator-left indicator-right">در حال ارتباط</span></p>}


                {/*{error && <p className="text-center text-primary font-weight-bold mt-3"><span*/}
                {/*    className="indicator-left indicator-right">خطا در برقراری ارتباط با سرور</span></p>}*/}
                {
                    !nextPage && <div className="d-flex justify-content-center text-primary font-weight-bold mt-3">
                        <span className="end-notification-list font-400 font-size-12 indicator-left indicator-right">پایان آلارم ها</span>
                    </div>
                }
            </div>

            <Modal
                isOpen={isShowFilter}
                contentLabel="اضافه کردن کاربر جدید"
                onRequestClose={() => setIsShowFilter(false)}
                shouldCloseOnOverlayClick={true}
                style={isMobile ? customStylesMobile : customStyles}
            >
                <div className="d-flex flex-column filter-modal">
                    <div className="d-flex justify-content-between align-items-center py-3">
                        <div className="d-flex align-items-center">
                            <i className="icon icon-24 icon-filter"/>
                            <span className="mr-2">فیلتر</span>
                        </div>
                        <i className="icon icon-24 icon-close cursor-pointer" onClick={handleHideFilter}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="name">انتخاب هشدار</label>
                        <ReactSelect
                            options={notificationTypes}
                            value={filterOptions.selectedNotificationType}
                            onChange={handleChangeNotificationType}
                            placeholder="انتخاب کنید"
                            mobileMode={true}
                            className="autoCompeletSelect "
                        />
                    </div>
                    <div className="form-group mt-12px">
                        <label htmlFor="name"> فهرست {titleNotificationItems}</label>
                        <MultiSelect
                            options={notificationItems}
                            value={filterOptions.selectedNotificationItems}
                            hasSelectAll={false}
                            disableSearch={true}
                            ArrowRenderer={ArrowRenderer}
                            onChange={handleChangeNotificationItems}
                            labelledBy="انتخاب کنید"
                            overrideStrings={{
                                "noOptions": "دیتایی وجود ندارد",
                                "search": "جستجو...",
                                "selectSomeItems": "انتخاب کنید",
                                "allItemsAreSelected": 'تمامی آیتم ها انتخاب شده است'
                            }}
                        />
                    </div>

                    <div className="form-group mt-12px">
                        <label htmlFor="name">برو به تاریخ</label>
                        <DatePicker
                            calendarStyles={styles}
                            inputFormat="jYYYY/jM/jD"
                            className="report-calendar-Container form-control "
                            value={filterOptions.dateFrom}
                            closeOnSelect={true}
                            max={tomorrowDate}
                            ref={dateFromEl}
                            beforeShowDay={true}
                            onChange={value => {
                                dateFromEl.current.state.isOpen = false;
                                setFilterOptions({...filterOptions, dateFrom: value})
                            }}
                        />
                    </div>

                    <div className="d-flex form-group my-4 ">
                        {
                            isFilterOptionsChanged() ?
                                <Button
                                    className={`ml-3 button btn-primary-fill d-flex align-items-center justify-content-center width-50 py-2 px-5`}
                                    handler={resetFilter}>
                                    <span className="text-nowrap">حذف فیلتر</span>
                                </Button> : <Button
                                    className={`ml-3 button btn-primary-fill d-flex align-items-center justify-content-center width-50 py-2 px-5`}
                                    handler={handleFilter}>
                                    <span className="text-nowrap">تایید</span>
                                </Button>
                        }
                        <Button
                            className={`button btn-primary-outline d-flex align-items-center justify-content-center width-50 py-2 px-5`}
                            handler={handleHideFilter}>
                            <span>لغو</span>
                        </Button>
                    </div>

                </div>
            </Modal>
        </>
    );
};

export default Notification;
