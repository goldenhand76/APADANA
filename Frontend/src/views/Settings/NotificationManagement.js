import React, {useEffect, useState} from "react";
import CreateNotificationForm from "../../components/Forms/CreateNotificationForm";
import {useHistory, useLocation, useParams} from "react-router-dom";
import {
    createNotificationAutomation,
    getNotificationAutomation,
    updateNotificationAutomation
} from "../../services/api";

const NotificationManagement = () => {

    const [data, setData] = useState()
    const [errors, setErrors] = useState(null);
    const location = useLocation()
    const {actuators, sensors, manuals, automatics} = location.state
    const {id} = useParams();
    const history = useHistory()

    useEffect(() => {
        if (id) {
            getNotificationAutomation(id).then(res => {
                setData(res)
            }).catch(err => console.log(err))
        }
    }, []);

    const handleSubmit = (values) => {
        setErrors(null)
        if (data) {
            updateNotificationAutomation(id, values)
                .then(res => history.goBack())
                .catch(err => setErrors(err?.response?.data?.error?.details))
        } else {
            createNotificationAutomation(values).then(res => {
                history.goBack()
            }).catch(err => setErrors(err?.response?.data?.error?.details))
        }
    }

    return (
        <div className="px-3">
            <CreateNotificationForm
                onSubmit={handleSubmit}
                actuators={actuators}
                sensors={sensors}
                automatics={automatics}
                manuals={manuals}
                data={data}
                errors={errors}
                onClose={() => history.goBack()}

            />
        </div>
    )
}

export default NotificationManagement;