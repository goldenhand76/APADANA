import React, {useEffect, useState} from 'react';
import ProfileForm from "../../components/Forms/ProfileForm";
import {getMe, uploadAvatar} from "../../services/api";

const Me = () => {

    const [user, setUser] = useState(null)
    const [errors, setErrors] = useState(null);

    useEffect(() => {
        getMe().then(res => {
            setUser(res)
        }).catch(error => console.log(error))
    },[])


    const handleProfileUser = (data) => {
        const formValues = new FormData();

        formValues.append("name",data.name)
        formValues.append("last_name",data.last_name)
        formValues.append("phone",data.phone)
        formValues.append("address",data.address)

        uploadAvatar(formValues).then(res => {
            localStorage.setItem("username", res?.username);
            localStorage.setItem("name", res?.name);
            localStorage.setItem("last_name", res?.last_name);
            history.back()
        }).catch(err => setErrors(err?.response?.data?.error?.details))
    }

    return (
        <section className="mx--15px px-30px mt--15px pt-15px mb--15px height-user-custom overflow-auto">
            <ProfileForm
                closeHandler={() => history.back()}
                submitHandler={handleProfileUser}
                data={user}
                errors={errors}
            />
        </section>
    )
}

export default Me;