import React, {useEffect, useState} from 'react'
import moment from "moment-jalaali";
import {isMobile} from "react-device-detect";
import Modal from "react-modal";
import LocationSelector from "../LocationSelector";
import {updateTab} from "../../services/api";

Modal.setAppElement('#root');

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'unset',
        bottom: 'unset',
        transform: 'translate(-50%, -50%)',
        width: '775px',
        height: '742px'
    },
};

const Weather = ({selectedTab, location, setLocation}) => {

    const [current, setCurrent] = useState(null)
    const [foreCast, setForeCast] = useState([]);
    const [isShowModal, setIsShowModal] = useState(false)
    const [locationName, setLocationName] = useState(null);
    const [centerMap, setCenterMap] = useState(null);

    const handleCloseModal = () => {
        setIsShowModal(false);
    }

    useEffect(() => {
        let url = location ? `https://api.weatherapi.com/v1/forecast.json?key=56379b2277c749e59dd113151220810&q=${location.lat},${location.lng}&days=5&aqi=no&alerts=no` : `https://api.weatherapi.com/v1/forecast.json?key=56379b2277c749e59dd113151220810&q=Tehran&days=5&aqi=no&alerts=no`
        fetch(url)
            .then(response => response.json())
            .then(res => {
                setCurrent(res?.current)
                setForeCast(res?.forecast?.forecastday)
                setLocationName(res?.location);
            })
            .catch(err => console.log(err))
    }, [location])

    const searchLocation = (fieldAddress) => {
        fetch(`https://api.neshan.org/v1/search?term=${fieldAddress}&lat=35.699739&lng=51.338097`, {
            headers: {
                'Api-Key': 'service.5af3f2ec6ee6420cae20291c0bb815da',
            }
        })
            .then(response => response.json())
            .then(res => {
                if (res.count > 0) {
                    setCenterMap({lat: res?.items[0]?.location?.y, lng: res?.items[0]?.location?.x});
                }
            })
            .catch(err => console.log(err))
    }

    const handleSubmitLocation = () => {
        const data = {
            location: centerMap
        }

        updateTab(data, selectedTab).then(res => {
            setLocation(res?.location);
            handleCloseModal()
        }).catch(err => {
            console.log(err)
        })
    }

    return (
        <>
            <div className="weather bg-white">
                <div className="weather-body">
                    <div className="weather-body-primary">
                        <div className="row">
                            <div
                                className={`col-6 d-flex ${isMobile ? "flex-column justify-content-center align-items-center" : "justify-content-around align-items-baseline"}`}>
                            <span className="d-flex align-items-center dir-ltr">
                                {foreCast[0]?.day?.maxtemp_c}°C
                                <i className={"icon icon-22 icon-arrow-up icon-white"}/>
                            </span>
                                <span className="d-flex align-items-center dir-ltr">
                                {foreCast[0]?.day?.mintemp_c}°C
                                <i className={"icon icon-22 icon-arrow-down icon-white"}/>
                            </span>
                            </div>
                            <div className="col-6 d-flex justify-content-around align-items-center pl-0">
                                <div className="d-flex flex-column justify-content-center align-items-start">
                                    <span className="font-40 dir-ltr">{current?.temp_c}<span
                                        className="font-24">°C</span></span>
                                    {
                                        locationName && <span>{locationName?.country}، {locationName?.name}</span>
                                    }
                                    <span className="mt-1 cursor-pointer" onClick={() => setIsShowModal(true)}><i
                                        className="icon icon-16 icon-map ml-1"/><span className="font-9 text-nowrap">تغییر موقعیت مکانی</span></span>
                                </div>
                                <i className={`icon icon-${current?.is_day ? "day" : "night"}-weather-${current?.condition?.code} ${isMobile ? "icon-48" : "icon-96"}`}/>
                            </div>
                        </div>
                    </div>
                    <div className="weather-body-secondary">
                        <div className="row">
                            <div
                                className={`d-flex justify-content-around flex-column font-size-21 ${isMobile ? "col-6 pr-0" : "col-4"}`}>
                                <div className="d-flex align-items-center"><i className="icon icon-24 icon-windy ml-2"/>
                                    <span>km/h</span>
                                    <span className="mr-2">
                                    {current?.wind_kph}
                                </span>
                                </div>
                                <div className="d-flex"><i
                                    className="icon icon-24 icon-weather-humidity"/><span
                                    className="mr-2">{current?.humidity}%</span></div>
                            </div>
                            <div
                                className={`d-flex justify-content-between ${isMobile ? "col-6 overflow-x-auto gap-x-12" : "col-8"}`}>
                                {
                                    foreCast?.map((item, index) => {
                                        return (<div className="weather-future" key={index}>
                                            <div className="d-flex flex-column">
                                            <span className="mt-1 text-left text-nowrap dir-ltr">
                                                {parseInt(item.day.maxtemp_c)}
                                                <i className={`icon icon-18 icon-arrow-up icon-white`}/>
                                            </span>
                                                <span className="mb-1 text-left text-nowrap dir-ltr">
                                                {parseInt(item.day.mintemp_c)}
                                                    <i className={`icon icon-18 icon-arrow-down icon-white`}/>
                                            </span>
                                            </div>
                                            <i className={`icon icon-day-weather-${item.day.condition?.code} ${isMobile ? "icon-16" : "icon-24"}`}/>
                                            <span
                                                className={`${isMobile ? "font-9" : ""}`}>{moment(item.date).locale('fa').format('dddd')}</span>
                                        </div>)
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Modal
                isOpen={isShowModal}
                onRequestClose={handleCloseModal}
                style={customStyles}
                className=""
                contentLabel="Example Modal"
            >
                <LocationSelector
                    onClose={handleCloseModal}
                    onSubmit={handleSubmitLocation}
                    searchLocation={searchLocation}
                    centerMap={centerMap}
                    setCenterMap={setCenterMap}
                    location={location}
                />
            </Modal>
        </>
    )
}

export default Weather;