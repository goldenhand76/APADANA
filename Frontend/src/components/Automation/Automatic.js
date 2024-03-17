import React, {useEffect, useState} from "react";
import {isMobile} from "react-device-detect";
import Button from "../Button/Button";
import editIcon from "../../assets/img/icons/edit.png";
import RemoveIcon from "../../assets/img/icons/Delete.png";
import {createActuatorAutomatic, deleteActuatorAutomatic, getActuators, getActuatorsListAutomatic, getSensors, retrieveActuatorAutomatic, updateActuatorAutomatic
} from "../../services/api";
import Modal from "react-modal";
import {Link, useHistory} from "react-router-dom";
import ActuatorScheduleForm from "../Forms/ActuatorScheduleForm";
import {confirmAlert} from "react-confirm-alert";
import LoaderAutomation from "../Loader/LoaderAutomation";
import Loader from "../Loader/Loader";
import {actuatorsToList, sensorToList} from "../../utils/toList";


const customStyles = {
    content: {
        height: 'max-content',
        overflowY: 'auto'
    }
}

const Automatic = ({automationType, handleShowAutomation}) => {

    const history = useHistory();
    const [actuatorsAutomatic, setActuatorsAutomatic] = useState([]);
    const [isOpenActionModal, setIsOpenActionModal] = useState(false);
    const [selectedActuator, setSelectedActuator] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [automationData, setAutomationData] = useState(null)
    const [actuators, setActuators] = useState(null);
    const [sensors, setSensors] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [plans, setPlans] = useState([]);
    const [errors, setErrors] = useState(null);

    useEffect(() => {
        loadActuatorsList()
        loadActuators()
        loadSensors()
    }, []);

    useEffect(() => {
        const ws = new WebSocket(`ws://127.0.0.1/ws/automation/${localStorage.getItem('token')}/`)
        console.log(ws)
        ws.onopen = () => {
            ws.addEventListener('message', function (event) {
                const data = JSON.parse(event.data);
                if (data.status === 'STARTED') {
                    setPlans(prevState => [...prevState, data])
                }
                if (data.status === 'FAILED' || data.status === 'success') {
                    const filteredAutomations = plans.filter(item => item.id !== data.id);
                    setPlans(filteredAutomations);
                    loadActuatorsList()
                }
            })
        }

        return () => {
            ws.close()
        }
    }, [])

    const loadActuatorsList = () => {
        setIsLoading(true)
        getActuatorsListAutomatic().then(res => {
            setActuatorsAutomatic(res);
            setIsLoading(false)
        }).catch(err => {
            console.log(err)
            setIsLoading(false)
        })
    }

    const edit = (item) => {
        if (automationType === 'automatic') {
            retrieveActuatorAutomatic(item.id)
                .then(res => {
                    setAutomationData(res);
                    setIsOpen(true);
                    setSelectedActuator(item)
                })
                .catch(err => console.log(err))
        } else {
            handleShowAutomation({isOpen: true, type: 'اتوماتیک'})
        }
    };

    const deleteRecord = (id) => {
        deleteActuatorAutomatic(id)
            .then(() => {
                loadActuatorsList()
            }).catch(err => {
            console.log(err)
        })
    };

    const handleConfirmDelete = (id, title) => {
        if (automationType === 'automatic') {
            confirmAlert({
                customUI: ({onClose}) => {
                    return (
                        <div className={`card card-box`}>
                            <p className={`text-dark text-center ${isMobile ? "mt-3" : ""}`}>آیا از حذف
                                اتوماسیون {title} مطمئن
                                هستید؟</p>
                            <div className="d-flex mt-4 justify-content-center">
                                <button
                                    className="button btn-primary-fill-outline py-2 px-3 col-6 ml-2 btn-primary-border text-primary bold"
                                    onClick={() => {
                                        deleteRecord(id)
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
        } else {
            handleShowAutomation({isOpen: true, type: 'اتوماتیک'})
        }
    }

    const handleChangeState = (e, param) => {
        if (automationType === 'automatic') {
            const values = {
                "active": e.target.checked
            }

            updateActuatorAutomatic(values, param.id).catch(err => console.log(err))
        } else {
            handleShowAutomation({isOpen: true, type: 'اتوماتیک'})
        }
    }

    const handleCancel = () => {
        setIsOpen(false);
        setAutomationData(null)
        setErrors(null)
    }

    const handleAutomation = (formValues) => {
        if (automationType === 'automatic') {
            setErrors(null);
            if (automationData) {
                updateActuatorAutomatic(formValues, selectedActuator.id).then(res => {
                    loadActuatorsList();
                    setIsOpen(false)
                }).catch(err => setErrors(err?.response?.data?.error?.details))
            } else {
                createActuatorAutomatic(formValues).then(res => {
                    loadActuatorsList();
                    setIsOpen(false)
                }).catch(err => setErrors(err?.response?.data?.error?.details))
            }
        } else {
            handleShowAutomation({isOpen: true, type: 'اتوماتیک'})
        }
    }

    const loadActuators = () => {
        getActuators().then(res => {
            setActuators(actuatorsToList(res))
        }).catch(err => console.log(err));
    }

    const loadSensors = () => {
        getSensors().then(res => {
            setSensors(sensorToList(res))
        }).catch(err => console.log(err));
    }

    const handleModalOpen = () => {
        if (automationType === 'automatic' && !isMobile) {
            setIsOpen(prevState => !prevState)
        } else if (automationType === 'automatic' && isMobile) {
            history.push({
                pathname: '/Panel/Dashboard/Control/AddActuatorAutomatic',
                state : {actuators, sensors}
            })
        } else {
            handleShowAutomation({isOpen: true, type: 'اتوماتیک'})
        }
    }

    const handleModalOptionOpen = (data) => {
        if (automationType === 'automatic') {
            setSelectedActuator(data);
            setIsOpenActionModal(true)
        } else {
            handleShowAutomation({isOpen: true, type: 'اتوماتیک'})
        }
    }

    return (
        <>
            <div
                className={`row mx--30px px-15px mt--30px pt-15px overflow-auto ${isMobile ? "height-automation-custom-mobile" : "height-automation-custom"}`}>
                <div className="col-lg-6 col-md-12 col-sm-12 px-0">
                    <div className={`${isMobile ? "" : "card p-2"}`}>
                        {
                            isLoading && <Loader/>
                        }
                        {
                            !isMobile && (<div className="table-custom">
                                <div className="table-custom-header">
                                    <span className="table-custom-header-title">نام وضعیت</span>
                                    <span className="table-custom-header-action">فعالیت</span>
                                    <span className="table-custom-header-action">عملیات</span>
                                </div>
                                <div className="table-custom-body">
                                    {
                                        actuatorsAutomatic.length > 0 && actuatorsAutomatic.map(item => {
                                                return (<div className="table-custom-body-row" key={item?.id}>
                                                    <span className="table-custom-body-title overflow-hidden text-nowrap text-truncate">{item.title}</span>
                                                    <div className="table-custom-body-action">
                                                        <LoaderAutomation
                                                            display={`${plans?.some(el => el.id === item.id) ? "visibility" : "invisible "}`}/>
                                                        <label
                                                            className={`switch mx-3 ${plans?.some(el => el.id === item.id) ? "disabled" : ""}`}>
                                                            <input type="checkbox" checked={item.active}
                                                                   onChange={e => handleChangeState(e, item)}/>
                                                            <span className="slider round"/>
                                                        </label>
                                                    </div>
                                                    <div className="table-custom-body-action">
                                                        <div
                                                            className="mx-3 cursor-pointer"
                                                            key={item.id + 102}
                                                            onClick={() => edit(item)}
                                                            target="_new"
                                                        >
                                                            <div className="d-flex justify-content-center">
                                                                <img src={editIcon} width={24} title="ویرایش"/>
                                                            </div>
                                                        </div>
                                                        <div
                                                            className="mx-3 cursor-pointer"
                                                            key={item.id + 103}
                                                            onClick={() => handleConfirmDelete(item.id, item.title)}
                                                            target="_new"
                                                        >
                                                            <div className="d-flex justify-content-center">
                                                                <img src={RemoveIcon} width={24} title="حذف"/>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>)
                                            }
                                        )
                                    }
                                </div>
                            </div>)
                        }


                        {
                            isMobile && actuatorsAutomatic.length > 0 && actuatorsAutomatic.map((item, index) => {
                                    return (
                                        <div key={item.id} className={`card py-2 pr-12px pl-2 ${index !== 0 ? "mt-12px" : ""}`}>
                                            <div className="d-flex justify-content-between align-items-center py-1">
                                                <div className="text-dark basis-40 overflow-hidden text-nowrap text-truncate">{item.title}</div>
                                                <div className="mr-auto ml-3">
                                                    <LoaderAutomation
                                                        display={`${plans?.some(el => el.id === item.id) ? "visibility" : "invisible "}`}/>
                                                </div>
                                                <label className={`switch ml-12px ${plans?.some(el => el.id === item.id) ? "disabled" : ""}`}>
                                                    <input type="checkbox" checked={item.active}
                                                           onChange={e => handleChangeState(e, item)}/>
                                                    <span className="slider round"/>
                                                </label>
                                                <div className="">
                                                    <i className="icon icon-24 icon-more-vertical"
                                                       onClick={() => handleModalOptionOpen(item)}/>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            )
                        }
                        {
                            (actuatorsAutomatic.length === 0 && !isLoading) ? <p className="text-center mt-4 mb-0">اطلاعاتی برای نمایش موجود نیست.</p> : null
                        }
                        {
                            !isMobile && <div className="mt-3 mb-2">
                                <Button className="button btn-primary-fill p-2 height-auto"
                                        handler={handleModalOpen}>
                                    <i className="icon icon-24 icon-plus"/>
                                </Button>
                            </div>
                        }
                    </div>
                </div>

                {
                    isMobile && <div className="mt-3 align-self-end">
                        <Button className="button btn-primary-fill p-2 height-auto"
                                handler={handleModalOpen}>
                            <i className="icon icon-24 icon-plus"/>
                        </Button>
                    </div>
                }
            </div>

            <Modal
                isOpen={isOpen}
                className={"modal-user"}
                onRequestClose={handleCancel}
                shouldCloseOnOverlayClick={true}
                style={customStyles}
            >
                <ActuatorScheduleForm
                    onCancel={handleCancel}
                    actuators={actuators}
                    sensors={sensors}
                    handler={handleAutomation}
                    automationData={automationData}
                    errors={errors}
                />
            </Modal>

            {
                isMobile && (
                    <Modal
                        isOpen={isOpenActionModal}
                        className="action-modal"
                    >
                        <div className="row justify-content-end position-relative">
                            <div className="position-absolute btn-close">
                                <i className="icon icon-24 icon-close" onClick={() => setIsOpenActionModal(false)}/>
                            </div>
                        </div>
                        <div className="row px-2">
                            <div className="col-12 mt-2 px-2 py-2 border-bottom">
                                <Link
                                    to={{
                                        pathname: `/Panel/Dashboard/Control/AddActuatorAutomatic/${selectedActuator?.id}`,
                                        state: {actuators, sensors}
                                    }}
                                    className="ml-3 cursor-pointer d-flex align-items-center"
                                >
                                        <span className="d-flex justify-content-center py-1">
                                            <img src={editIcon} width={20} title="ویرایش"/>
                                        </span>
                                    <span className="mr-2 text-dark">ویرایش</span>
                                </Link>
                            </div>
                            <div className="col-12 px-2 py-2">
                                <div
                                    className="ml-3 cursor-pointer d-flex align-items-center"
                                    onClick={() => {
                                        handleConfirmDelete(selectedActuator?.id, selectedActuator?.title)
                                        setIsOpenActionModal(false)
                                    }}
                                >
                                        <span className="d-flex justify-content-center py-1">
                                            <img src={RemoveIcon} width={20} title="حذف"/>
                                        </span>
                                    <span className="mr-2 text-dark">حذف کردن</span>
                                </div>
                            </div>
                        </div>
                    </Modal>
                )
            }
        </>
    )
}

export default Automatic