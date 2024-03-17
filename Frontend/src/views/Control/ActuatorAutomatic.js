import React, {useEffect, useState} from 'react';
import {isMobile} from "react-device-detect";
import ActuatorScheduleForm from "../../components/Forms/ActuatorScheduleForm";
import {useHistory, useLocation, useParams} from "react-router-dom";
import {
    createActuatorAutomatic,
    retrieveActuatorAutomatic,
    updateActuatorAutomatic,
} from "../../services/api";



const ActuatorAutomatic = () => {

    const [automationData, setAutomationData] = useState(null);
    const [errors, setErrors] = useState(null);

    const location = useLocation()
    const history = useHistory();
    const { actuators, sensors } = location.state

    const {id} = useParams();

    useEffect(() => {
        if (id) {
            retrieveActuatorAutomatic(id)
                .then(res => {
                    setAutomationData(res);
                }).catch(err => console.log(err))
        }
    }, []);

    const handleAutomationAutomatic = (data) => {
        setErrors(null)
        if (automationData) {
            updateActuatorAutomatic(data, automationData.id).then(() => {
                history.goBack()
                setAutomationData(null)
            }).catch(err => setErrors(err?.response?.data?.error?.details))
        } else {
            createActuatorAutomatic(data).then(() => {
                history.goBack()
            }).catch(err => setErrors(err?.response?.data?.error?.details))
        }
    }


    return (
        <div className={`row ${isMobile ? "" : ""}`}>
            <div className={`col-12 overflow-auto height-automation-form-custom`}>
                <ActuatorScheduleForm
                    onCancel={() => history.goBack()}
                    handler={handleAutomationAutomatic}
                    automationData={automationData}
                    sensors={sensors}
                    actuators={actuators}
                    errors={errors}
                />
            </div>
        </div>
    )
}

export default ActuatorAutomatic;