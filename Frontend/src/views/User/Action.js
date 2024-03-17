import React, {useState, useEffect} from "react";
import {useParams} from "react-router-dom";
import {getUser, storeUser, updateUser} from "../../services/api";
import UserForm from "../../components/Forms/UserForm";

const Action = () => {
    const [user, setUser] = useState(null);
    const [errors, setErrors] = useState(null)
    const {id} = useParams();

    useEffect(() => {
        if (id) {
            getUser(id)
                .then((res) => {
                    setUser({...res, id});
                })
                .catch((err) => {
                    console.log(err, "err");
                });
        }
    }, []);

    const handleUser = (data) => {
        setErrors(null)
        if (user) {
            updateUser(data, user.id)
                .then(res => {
                    alert.show(`کاربر با موفقیت ویرایش شد`, {type: "success"});
                    setUser(null)
                    history.back()
                }).catch((err) => {
                    setErrors(err.response?.data?.error?.details)
            });
        } else {
            storeUser(data).then(res => {
                alert.show(`کاربر جدید با موفقیت اضافه شد`, {type: "success"});
                history.back()
            }).catch((err) => {
                setErrors(err.response?.data?.error?.details)
            });
        }
    }

    return (
        <>
            {
                <div className="overflow-auto height-user-custom mx--15px px-30px mt--15px pt-15px">
                    <UserForm closeHandler={() => {
                        history.back()
                        setUser(null)
                    }}
                              submitHandler={handleUser}
                              data={user}
                              errors={errors}
                    />
                </div>
            }
        </>
    );
};

export default Action;
