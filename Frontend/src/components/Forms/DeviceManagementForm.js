import React, {useEffect, useState} from 'react';
import {isMobile} from "react-device-detect";
import Button from "../Button/Button";
import Modal from "react-modal";

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'unset',
        bottom: 'unset',
    },
};

Modal.setAppElement('#root');

const DeviceManagementForm = ({data, handler, isOpenDevice, onClose, onChange, errorDevice, errors}) => {

    const [titleDevice, setTitleDevice] = useState("");
    const [serialDevice, setSerialDevice] = useState("");
    const [validationForm, setValidationForm] = useState(false)

    useEffect(() => {
        if(data) {
            setTitleDevice(data.title)
            setSerialDevice(data.part_number)
        }
    },[data])

    useEffect(() => {
        if(titleDevice !== "" && serialDevice !== "" && errorDevice !== "exist") {
            setValidationForm(true)
        } else {
            setValidationForm(false)
        }
    },[titleDevice, serialDevice, errorDevice])


    const handleDevice = () => {
        const values = {
            title: titleDevice,
            part_number: serialDevice
        }

        handler(values)
    }

    const handleCloseModal = () => {
        setTitleDevice("")
        setSerialDevice("")
        onClose()
    }

    return (
        <Modal
            isOpen={isOpenDevice}
            onRequestClose={onClose}
            style={customStyles}
            contentLabel="Example Modal"
            className="p-3 bg-white"
        >
            <div className="modal-header">
                <h5 className={`bold text-dark text-nowrap ${isMobile ? "text-right" : "text-center"}`}>
                    {
                        data ? "ویرایش اطلاعات دستگاه" : "افزودن دستگاه جدید"
                    }
                </h5>
                {
                    isMobile && <i className="icon icon-24 icon-close" onClick={handleCloseModal}/>
                }
            </div>

            <div className={`col-lg-12 col-sm-12 ${isMobile ? "px-0 mt-3" : "mt-4 pt-2"}`}>
                <div className="form-group">
                    <label htmlFor="name" className="required">نام دستگاه</label>
                    <input
                        type="text"
                        id="title"
                        value={titleDevice}
                        onChange={e => setTitleDevice(e.target.value)}
                        className={`form-control pr-3 ${errors && errors?.title ? "border-error" : ""}`}
                        placeholder="نام دستگاه را وارد نمایید."/>
                    {
                        errors && errors?.title ? <p className="error-field">{errors?.title[0]}</p> : null
                    }
                </div>
            </div>
            <div className={`col-lg-12 col-sm-12 pt-2 ${isMobile ? "px-0 mt-3 pb-3" : "mt-4"}`}>
                <div className="form-group">
                    <label htmlFor="name" className="required">شماره سریال دستگاه</label>
                    <input
                        type="text"
                        id="name"
                        value={serialDevice}
                        onChange={e => {
                            onChange(e.target.value)
                            setSerialDevice(e.target.value)
                        }}
                        className={`form-control pr-3 ${data ? "disabled" : ""} ${errors && errors?.part_number ? "border-error" : ""}`}
                        placeholder="بعنوان مثال VT#341"/>
                    {
                        errors && errors?.part_number ? <p className="error-field">{errors?.part_number[0]}</p> : null
                    }
                    {
                        errorDevice === "exist" ? (<p className="danger-text">این شماره سریال قبلا ثبت شده است.</p>) : errorDevice === "notFound" ? (<p className="danger-text">شماره سریال وارد شده وجود ندارد.</p>) : null
                    }
                </div>
            </div>
            <div className={`col-12 d-flex justify-content-end ${isMobile ? "px-0" : "mt-5"}`}>
                <Button
                    className={`d-flex align-items-center button justify-content-center btn-primary-fill ml-2 px-4 ${isMobile ? "width-65" : ""} ${!validationForm ? "disabled" : ""}`}
                    handler={() => {
                        handleDevice()
                    }}
                >
                    <span className="px-2">تایید</span>
                </Button>
                <Button
                    className={`d-flex align-items-center button justify-content-center btn-primary-outline mr-2 px-4 ${isMobile ? "width-35" : "btn-primary-border"}`}
                    handler={handleCloseModal}
                >
                    <span className="px-2">لغو</span>
                </Button>
            </div>
        </Modal>
    )
}


export default DeviceManagementForm