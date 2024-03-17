import {confirmAlert} from "react-confirm-alert";
import React from "react";

const ErrorHandling = () => {
    return confirmAlert({
        customUI: ({onClose}) => {
            return (
                <div className={`card card-box`}>
                    <i className="icon icon-24 icon-danger mx-auto"/>
                    <p className={`text-dark text-center mt-3`}>لطفا وضعیت اتصال به اینترنت را بررسی کنید.</p>
                    <div className="d-flex mt-4 justify-content-center">
                        <button
                            className="button btn-primary-fill-outline py-2 px-3 col-6 ml-2 btn-primary-border text-primary bold"
                            onClick={() => {
                                onClose();
                            }}
                        >
                            <span className="py-1 px-3">تایید</span>
                        </button>
                    </div>
                </div>
            );
        },
        overlayClassName: "overlay-custom-confirm-modal"
    });
}

export default ErrorHandling;