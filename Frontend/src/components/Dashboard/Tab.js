import React, {useEffect, useRef, useState} from 'react';
import {isMobile} from "react-device-detect";
import Modal from "react-modal";

Modal.setAppElement('#root')
const Tab = ({item, onEdit, onDelete, onClick, selectedTab, onEditLayout}) => {

    const [dropDownMenuOpen, setDropDownMenuOpen] = useState(false);
    const wrapperRef = useRef(null);

    const handleClickOutside = (event) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
            setDropDownMenuOpen(false);
        }
    }

    useEffect(() => {
        document.addEventListener("click", handleClickOutside, true);
        return () => {
            document.removeEventListener("click", handleClickOutside, true);
        };
    }, [])

    return (
        <div className={`position-relative ${dropDownMenuOpen ? "dropdown-open" : ""} ${selectedTab?.id === item.id ? "tab tab-active" : "tab"}`}>
            <div className={`py-2 border-left text-nowrap cursor-pointer ${isMobile ? "pr-2" : "pr-4"} ${selectedTab?.id === item.id ? "" : "pl-4"}`}>
                <span onClick={() => onClick(item)}>{item?.title}</span>
                {
                    selectedTab?.id === item.id && <div className="icon icon-18 icon-more-vertical mr-1" onClick={() => setDropDownMenuOpen(prevState => !prevState)} />
                }
            </div>

            {
                isMobile ? (
                    <Modal
                        isOpen={dropDownMenuOpen}
                        onRequestClose={() => setDropDownMenuOpen(false)}
                        shouldCloseOnOverlayClick={true}
                        className="action-modal pb-2"
                    >
                        <div className="row justify-content-end mb-3 position-relative">
                            <div className="position-absolute btn-close">
                                <i className="icon icon-24 icon-close" onClick={() => setDropDownMenuOpen(false)}/>
                            </div>
                        </div>
                        <div className="row px-2 font-size-14 font-400">
                            <div className="col-12 mt-2 px-2">
                                <div
                                    onClick={() => {
                                        setDropDownMenuOpen(false)
                                        onEdit(item.id)
                                    }}
                                    className="d-flex tile-dropdown-item py-2 border-bottom border-muted align-items-center cursor-pointer">
                                    <div className="icon icon-20 icon-edit"/>
                                    <div className="mr-2 text-nowrap">ویرایش نام میزکار</div>
                                </div>
                            </div>
                            <div className="col-12 mt-2 px-2">
                                <div
                                    onClick={() => {
                                        setDropDownMenuOpen(false)
                                        onEditLayout()
                                    }}
                                    className="d-flex tile-dropdown-item py-2 border-bottom border-muted align-items-center cursor-pointer">
                                    <div className="icon icon-20 icon-moving-tiles"/>
                                    <div className="mr-2 text-nowrap">جا به جایی تایل ها</div>
                                </div>
                            </div>
                            <div className="col-12 px-2">
                                <div className="d-flex tile-dropdown-item py-2 align-items-center cursor-pointer"
                                     onClick={() => {
                                         onDelete(item.id)
                                         setDropDownMenuOpen(false)
                                     }}>
                                    <div className="icon icon-20 icon-delete"/>
                                    <div className="mr-2">حذف</div>
                                </div>
                            </div>
                        </div>
                    </Modal>
                ) : (
                    <div className={`tile-dropdown position-absolute font-size-14 font-400 px-3 bg-white`} ref={wrapperRef}>
                        <div
                            onClick={() => onEdit(item.id)}
                            className="d-flex tile-dropdown-item border-bottom border-muted py-3 align-items-center cursor-pointer">
                            <div className="icon icon-20 icon-edit"/>
                            <div className="mr-2 text-nowrap">ویرایش نام میزکار</div>
                        </div>
                        <div
                            onClick={() => {
                                setDropDownMenuOpen(false)
                                onEditLayout()
                            }}
                            className="d-flex tile-dropdown-item border-bottom border-muted py-3 align-items-center cursor-pointer">
                            <div className="icon icon-20 icon-moving-tiles"/>
                            <div className="mr-2 text-nowrap">جا به جایی تایل ها</div>
                        </div>
                        <div className="d-flex tile-dropdown-item py-3 align-items-center cursor-pointer"
                             onClick={() => {
                                 onDelete(item.id)
                                 setDropDownMenuOpen(false)
                             }}>
                            <div className="icon icon-20 icon-delete"/>
                            <div className="mr-2">حذف</div>
                        </div>
                    </div>
                )
            }
        </div>
    )
}

export default Tab;