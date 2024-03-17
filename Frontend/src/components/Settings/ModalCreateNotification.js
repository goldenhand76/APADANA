import React, {useEffect} from "react";
import Modal from "react-modal";
import CreateNotificationForm from "../Forms/CreateNotificationForm";

Modal.setAppElement('#root');
const customStyles = {
    content: {
        height: 'max-content',
        overflowY: 'auto'
    }
}

const ModalCreateNotification = ({onClose, isOpen, onSubmit, data, actuators, sensors}) => {


    const handleSubmit = (values) => {
        onSubmit(values);
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            style={customStyles}
            className="modal-user"
            contentLabel="Example Modal">

            <CreateNotificationForm onSubmit={handleSubmit} data={data} onClose={onClose} sensors={sensors} actuators={actuators}/>
        </Modal>
    )
}

export default ModalCreateNotification;