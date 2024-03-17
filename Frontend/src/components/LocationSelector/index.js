import React, {useEffect, useState} from "react";
import NeshanMap from "../NeshanMap";
import Button from "../Button/Button";

const LocationSelector = ({onClose, onSubmit, searchLocation, centerMap, setCenterMap, location}) => {

    const [fieldAddress, setFieldAddress] = useState("");
    const [center, setCenter] = useState([location?.lat, location?.lng] || [35.699739, 51.338097]);
    const [map, setMap] = useState(null);
    const [L, setL] = useState(null)
    const [marker, setMarker] = useState(null);

    useEffect(() => {
        if (map && marker) {
            map.flyTo([centerMap?.lat, centerMap?.lng], 11);
            marker.setLatLng(centerMap)
        }
    },[centerMap])

    const handleSubmit = (e) => {
        e.preventDefault();
        searchLocation(fieldAddress)
    }

    return (
        <div>
            <div className="d-flex justify-content-between">
                <h4>انتخاب موقعیت مکانی</h4>
                <i className="icon icon-24 icon-close cursor-pointer" onClick={onClose}/>
            </div>
            <div className="search-box mb-3 mt-4 position-relative">
                <form onSubmit={handleSubmit}>
                <label>جستجو</label>
                <input type="text" value={fieldAddress} onChange={e => setFieldAddress(e.target.value)}
                       className="form-control pr-3" placeholder="استان، شهر، آدرس خود را جستجو کنید"/>
                    <button type="submit" className="icon-search-input p-0 border-0 bg-transparent"><i className="icon icon-search icon-24 cursor-pointer"/></button>
                </form>
            </div>
            <div className="rounded-12 overflow-hidden">
                <NeshanMap options={{
                    key: 'web.f40d782fbfce47d0b479beb76ed82997',
                    maptype: 'dreamy',
                    poi: true,
                    traffic: false,
                    center: center,
                    zoom: 13,
                }}
                           onInit={(L, myMap) => {
                               let marker = L.marker(center)
                                   .addTo(myMap)
                                   .bindPopup('موقعیت مورد نظر');

                               myMap.on('click', function (e) {
                                   marker.setLatLng(e.latlng)
                                   // setCenterMap(e.latlng, e.zoom)
                               });
                           setMap(myMap);
                           setL(L)
                           setMarker(marker)
                           }}

                           style={{
                               width: '100%',
                               height: '461px'
                           }}
                />
            </div>
            <div className="row">
                <div className={`col-12 d-flex mt-3 justify-content-end`}>
                    <Button
                        className={`button btn-primary-fill py-2 px-5 d-flex align-items-center justify-content-center`}
                        handler={onSubmit}
                    >
                        <span className="p-1">تایید</span>
                    </Button>
                    <Button
                        className={`button btn-primary-fill-outline py-2 px-4 btn-primary-border mr-3 d-flex align-items-center justify-content-center`}
                        handler={onClose}
                    >
                        <span>لغو</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default LocationSelector;