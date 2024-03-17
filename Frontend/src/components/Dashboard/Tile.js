import React, {useEffect, useState, useRef} from "react";
import {deleteTile} from "../../services/api";
import Temperature from "./Tiles/Temperature";
import Humidity from "./Tiles/Humidity";
import NI from './Tiles/NI';
import EC from './Tiles/EC';
import PH from './Tiles/PH';
import PHOS from './Tiles/PHOS';
import POT from './Tiles/POT';
import Door from "./Tiles/Door";
import Moisture from "./Tiles/Moisture";
import SoilTemperature from "./Tiles/SoilTemperature";
import Do from "./Tiles/Do";
import ACPower from "./Tiles/ACPower";
import {confirmAlert} from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import {isMobile} from 'react-device-detect';
import {connect} from "react-redux";
import moment from "moment-jalaali";
import {Link} from "react-router-dom";
import {store} from "../../redux/store";

const PAGES = {
    Temperature: Temperature,
    Humidity: Humidity,
    NI: NI,
    EC: EC,
    PH: PH,
    PHOS: PHOS,
    POT: POT,
    Door: Door,
    Moisture: Moisture,
    SoilTemperature: SoilTemperature,
    DO: Do,
    ACPower: ACPower
}
const fakeValues = [
    {value: 0, time: moment().subtract(1, "days").format("YYYY-MM-DD HH:mm:ss")},
    {value: 0, time: moment().format("YYYY-MM-DD HH:mm:ss")},
]

const Tile = ({data, onRemoveItem, onEdit, isDraggable, tilesData, selectedTab, tilesGraph}) => {

    let socketData;
    let graphData;
    const [isOnline, setIsOnline] = useState(true);
    const [dropDownMenuOpen, setDropDownMenuOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [graphValue, setGraphValue] = useState(null);
    const [interval, setInterval] = useState("")
    const wrapperRef = useRef(null);
    const refMore = useRef(null);
    const [lastUpdated, setLastUpdated] = useState(0);

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        socketData = tilesData.find(item => item.id === data?.id)
        setInterval(socketData?.interval ? socketData.interval : '1h');
        setValue(socketData?.data?.length > 0 ? socketData?.data : null)
        setIsOnline(socketData?.is_online)
        if (isOnline && socketData?.data) {
            let now = moment(new Date());
            let lastUpdatedTile = moment(socketData?.data[socketData?.data.length - 1]?.time);
            let diff = now.diff(lastUpdatedTile, 'minutes');
            setLastUpdated(diff);
        }
    }, [tilesData])


    useEffect(() => {
        graphData = tilesGraph.find(item => item.id === data?.id);
        setGraphValue(graphData)
    }, [tilesGraph])

    store.subscribe(() => {
        graphData = tilesGraph.find(item => item.id === data?.id);
        setGraphValue(graphData)
    });

    const handleClickOutside = (event) => {
        if ((wrapperRef.current && !wrapperRef.current.contains(event.target)) && (refMore.current && !refMore.current.contains(event.target))) {
            setDropDownMenuOpen(false);
        }
    }

    const deleteItem = async () => {
        onRemoveItem && onRemoveItem(data.id);
        setDropDownMenuOpen(false);
        await deleteTile(data?.id);
    }

    const Handler = PAGES[data?.sensor_type?.name];

    const handleConfirmDelete = () => {
        confirmAlert({
            customUI: ({onClose}) => {
                return (
                    <div className={`card card-box`}>
                        <p className={`text-dark text-center ${isMobile ? "mt-3" : ""}`}>آیا از حذف تایل مطمئن
                            هستید؟</p>
                        <div className="d-flex mt-4 justify-content-center">
                            <button
                                className="button btn-primary-fill-outline py-2 px-3 col-6 ml-2 btn-primary-border text-primary bold"
                                onClick={() => {
                                    deleteItem()
                                    onClose();
                                }}
                            >
                                <span className="py-1 px-3">مطمئنم</span>
                            </button>
                            <button className="button btn-primary-fill py-2 px-4 col-6 mr-2 bold" onClick={onClose}>
                                <span className="py-1 px-3">لغو</span>
                            </button>
                        </div>
                    </div>
                );
            },
            overlayClassName: "overlay-custom-confirm-modal"
        });
    }

    const stopPropagation = (e) => {
        e.stopPropagation();
        setDropDownMenuOpen(true)
    }

    return (
        <section
            className={`tile-item ${data?.size === 'large' ? "tile-item-large" : "tile-item-medium"} ${isOnline ? "tile-bg-white" : "tile-bg-grey"}`}
        >
            <div className={`tile-card position-relative ${data?.size === "small" ? "h-100 d-flex flex-column" : ""}`}>
                <div className="tile-header d-flex justify-content-between py-2 px-12 align-items-center border-bottom">
                    <div className="title-text h5 mb-0" title={data?.title}>{data?.title}</div>
                    <div className={`icon icon-24 icon-more-vertical cursor-pointer ${isDraggable ? "disabled" : ""}`}
                         ref={refMore}
                         onMouseDown={e => stopPropagation(e)}
                         onTouchStart={e => stopPropagation(e)}
                    />
                </div>
                {
                    Handler &&
                    <Handler data={data} isOnline={isOnline} value={value} interval={interval} graphValue={graphValue}
                             fakeValues={fakeValues} lastUpdated={lastUpdated}/>
                }
                <div
                    className={"tile-dropdown position-absolute px-2 bg-white " + (dropDownMenuOpen ? "selected" : "")}
                    ref={wrapperRef}>
                    {
                        isMobile ? (
                            <Link className="d-flex tile-dropdown-item border-bottom mx-1 py-2 align-items-center"
                                  to={{
                                      pathname: `/Panel/Dashboard/AddNewTile/${data?.id}`,
                                      state: {selectedTab: selectedTab}
                                  }}>
                                <div className="icon icon-16 icon-edit"/>
                                <div className="mr-2">ویرایش</div>
                            </Link>) : (
                            <div className="d-flex tile-dropdown-item border-bottom mx-1 py-2 align-items-center"
                                 onClick={() => onEdit(data?.id)}>
                                <div className="icon icon-16 icon-edit"/>
                                <div className="mr-2">ویرایش</div>
                            </div>)
                    }
                    <div className="d-flex tile-dropdown-item mx-1 py-2 align-items-center"
                         onClick={() => handleConfirmDelete()}>
                        <div className="icon icon-16 icon-delete"/>
                        <div className="mr-2">حذف</div>
                    </div>
                </div>
            </div>
        </section>
    )
}

const mapStateToProps = state => ({
    tilesData: state.tilesData,
    tilesGraph: state.tilesGraph
});

export default connect(mapStateToProps, null)(Tile);