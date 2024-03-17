import React, {useEffect, useState} from 'react'
import ActuatorManualForm from "../../components/Forms/ActuatorManualForm";
import {useHistory, useLocation, useParams} from "react-router-dom";
import {createActuatorManual, updateActuatorManual, retrieveActuatorManual} from "../../services/api";
import {isMobile} from "react-device-detect";

const ActuatorManual = (props) => {

    const [actuator, setActuator] = useState(null);
    const [errors, setErrors] = useState(null)

    const {location} = props
    const { actuators } = location.state
    const history = useHistory();

    const {id} = useParams();

    useEffect(() => {
        if (id) {
            retrieveActuatorManual(id)
                .then(res => {
                    setActuator(res);
                }).catch(err => console.log(err))
        }
    }, []);

    const handleAutomationManual = (data) => {
        setErrors(null)
        if (actuator) {
            updateActuatorManual(data, actuator.id).then(() => {
                history.goBack()
                setActuator(null)
            }).catch(err => setErrors(err?.response?.data?.error?.details))
        } else {
            createActuatorManual(data).then(() => {
                history.goBack()
            }).catch(err => setErrors(err?.response?.data?.error?.details))
        }
    }

    return (
        <div className={`row ${isMobile ? "px-3" : ""}`}>
            <div className={`col-12 card overflow-auto height-automation-form-custom`}>
                <ActuatorManualForm
                    onCancel={() => history.goBack()}
                    handler={handleAutomationManual}
                    data={actuator}
                    actuators={actuators}
                    errors={errors}
                />
            </div>
        </div>
    )
}


export default ActuatorManual;