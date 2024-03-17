import React, {useState, useEffect} from "react";
import Button from "../Button/Button";
import AddDashboard from "./AddDashboard";
import Modal from "react-modal";
import Tab from "./Tab";
import {addTab, deleteTab, getTab, updateTab} from "../../services/api";
import {confirmAlert} from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import {isMobile} from 'react-device-detect';


Modal.setAppElement('#root');

const Tabs = ({tabs, onLoadTabs, onClick, selectedTab, onEditLayout}) => {

    const [showModal, setShowModal] = useState(false);
    const [tab, setTab] = useState(null);
    const [errors, setErrors] = useState(null);

    const handleGetTab = id => {
        getTab(id).then(res => {
            setTab(res);
            setShowModal(true);
        }).catch(err => {
            console.log(err)
        })
    }

    const handleActionTab = (title) => {
        setErrors(null)
        if (tab) {
            const data = {...tab};
            data.title = title
            updateTab(data, tab.id).then(res => {
                onLoadTabs()
                setShowModal(false);
                setTab(null)
            }).catch(err => {
                setErrors(err?.response?.data?.error?.details)
            })
        } else {
            const data = {
                title: title,
                is_favorite: false,
                order: 1,
                field: 1
            }
            addTab(data).then(res => {
                onLoadTabs();
                setShowModal(false);
                setTab(null)
            }).catch(err => {
                if (err.response.status === 403) {
                    setShowModal(false)
                    alert.show(err?.response?.data?.error?.details.detail, {type: "error"});
                } else {
                    setErrors(err?.response?.data?.error?.details)
                }
            })
        }
    }

    const deleteItem = (id) => {
        deleteTab(id).then(res => {
            onLoadTabs();
        }).catch(err => {
            console.log(err, ": error")
        })
    }

    const handleConfirmDelete = (id) => {
        confirmAlert({
            customUI: ({onClose}) => {
                return (
                    <div className={`card card-box`}>
                        <p className={`text-dark text-center ${isMobile ? "mt-3" : ""}`}>آیا از حذف میزکار مطمئن
                            هستید؟</p>
                        <div className="d-flex mt-4 justify-content-center">
                            <button
                                className="button btn-primary-fill-outline py-2 px-3 col-6 ml-2 btn-primary-border text-primary bold"
                                onClick={() => {
                                    deleteItem(id)
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

    const handleCloseModalDashboard = () => {
        setShowModal(false)
        setTab(null)
        setErrors(null)
    }

    return (
        <section className="card header-dashboard-tab">
            <div className={`row align-items-center mx-0 p-3 flex-nowrap ${isMobile ? "cg-2" : ""}`}>
                <Button
                    className={`d-flex button btn-primary-fill submit justify-content-center align-items-center ${isMobile ? "height-auto p-2" : "pl-3 pr-3"}`}
                    handler={() => setShowModal(true)}>
                    <div className="icon icon-24 icon-plus"/>
                    {
                        !isMobile && <div className="mr-2 text-nowrap">میزکار جدید</div>
                    }
                </Button>
                <div className={`d-flex ${isMobile ? "overflow-x-auto overflow-y-clip hide-scroll" : ""}`}>
                    {
                        tabs?.map((item, i) => {
                            return (<Tab item={item} key={i} selectedTab={selectedTab} onEdit={handleGetTab}
                                         onClick={onClick}
                                         onDelete={handleConfirmDelete} onEditLayout={onEditLayout}/>)
                        })
                    }
                </div>
            </div>

            <Modal
                isOpen={showModal}
                contentLabel="اضافه کردن تایل"
                className="position-unset bg-white"
                onRequestClose={handleCloseModalDashboard}
                shouldCloseOnOverlayClick={true}
            >
                <AddDashboard
                    onClose={handleCloseModalDashboard}
                    data={tab}
                    handleActionTab={handleActionTab}
                    errors={errors}
                />
            </Modal>
        </section>
    )
}

export default Tabs;