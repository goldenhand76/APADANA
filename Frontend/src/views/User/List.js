import React, {useState, useEffect} from "react";
import {Redirect, Link} from "react-router-dom";
import {confirmAlert} from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import Table from "../../components/Table/Table";
import {getUsers, deleteUser, storeUser, getUser, updateUser} from "../../services/api";
import Button from "../../components/Button/Button";
import AddTile from "../../components/Dashboard/AddTile";
import Modal from "react-modal";
import UserForm from "../../components/Forms/UserForm";
import Action from "./Action";
import editIcon from "../../assets/img/icons/edit.png";
import RemoveIcon from "../../assets/img/icons/Delete.png";
import {isMobile} from "react-device-detect";

Modal.setAppElement('#root');


const customStyles = {
    content: {
        height: 'max-content',
        overflow: 'auto'
    }
}

const List = () => {
    const [users, setUsers] = useState([]);
    const [redirectTo, setRedirect] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [user, setUser] = useState(null)
    const [errors, setErrors] = useState()


    useEffect(() => {
        loadData();
    }, []);

    let headers = {
        username: "نام کاربری",
        can_control: {
            title: 'دسترسی',
            element: param => {
                return <span key={param?.id + 1}>{generatePermissionText(param)}</span>;
            }
        },
        is_active: {
            title: 'وضعیت',
            element: param => {
                return userStatus(param);
            }
        },
        action: {
            title: "عملیات",
            id: "id",
            actions: (param) => {
                return (
                    <div className="d-flex flex-row justify-content-center">
                        <div
                            className="mx-3 cursor-pointer"
                            key={param.id + 101}
                            onClick={() => edit(param)}
                            target="_new"
                        >
                            <div className="d-flex justify-content-center">
                                <img src={editIcon} width={24} title="ویرایش"/>
                            </div>
                        </div>
                        <div
                            className="mx-3 cursor-pointer"
                            key={param.id + 102}
                            onClick={() => confirmDelete(param)}
                            target="_new"
                        >
                            <div className="d-flex justify-content-center">
                                <img src={RemoveIcon} width={24} title="حذف"/>
                            </div>
                        </div>
                    </div>
                );
            },
        },
    };

    const userStatus = (param) => {
        return <span
            key={param?.id + 1} className={param?.is_active ? (param?.is_verified ? "text-green" : "text-orange") : "text-red"}>{param?.is_active ? (param?.is_verified ? "فعال" : "در انتظار تایید") : "غیرفعال"}</span>
    }

    const loadData = () => {
        getUsers()
            .then((res) => {
                setUsers(res);
            })
            .catch((err) => {
                console.log(err, "err");
            });
    };

    const edit = (row) => {
        getUser(row.id)
            .then(res => {
                setUser({...res, id: row.id});
            })
            .catch((err) => {
                console.log(err, "err");
            });
        setShowModal(true);
        // setRedirect({pathname: `/Panel/Dashboard/User/Action/${row.id}`});
    };

    const deleteRecord = (row) => {
        deleteUser(row.id)
            .then((res) => {
                alert.show(`باموفقیت حذف شد`, {type: "success"});
                loadData();
            })
            .catch((err) => {
                console.log(err, "err");
            });
    };

    const confirmDelete = (param) => {
        confirmAlert({
            customUI: ({onClose}) => {
                return (
                    <div className={`card card-box`}>
                        <p className={`text-dark text-center ${isMobile ? "mt-3" : ""}`}>آیا از حذف کاربر مطمئن
                            هستید؟</p>
                        <div className="d-flex mt-4 justify-content-center">
                            <button
                                className="button btn-primary-fill-outline py-2 px-3 col-6 ml-2 btn-primary-border text-primary bold"
                                onClick={() => {
                                    deleteRecord(param)
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

    const generatePermissionText = (item) => {
        let text = "";
        if (item?.is_admin) {
            return "مدیر سیستم"
        }
        text += item?.can_control ? "کنترل" : "";
        text += (item?.can_control && item?.can_monitor) ? "، " : "";
        text += item?.can_monitor ? "مانیتور " : "";
        text += (!item?.can_control && !item?.can_monitor) ? "کاربر عادی" : "";
        return text;
    }

    const handleUser = (data) => {
        setErrors(null)
        if (user) {
            updateUser(data, user.id)
                .then(res => {
                    alert.show(`کاربر با موفقیت ویرایش شد`, {type: "success"});
                    loadData()
                    setShowModal(false);
                    setUser(null)
                }).catch((err) => {
                setErrors(err.response?.data?.error?.details);
            });
        } else {
            storeUser(data).then(res => {
                alert.show(`کاربر جدید با موفقیت اضافه شد`, {type: "success"});
                loadData();
                setShowModal(false);
            }).catch((err) => {
                setErrors(err.response?.data?.error?.details);
            });
        }
    }

    return (
        <>
            {redirectTo && <Redirect to={redirectTo}/>}
            {
                !isMobile && <Button
                    className="button btn-primary-fill d-flex align-items-center justify-content-center py-2 px-3 mr-auto"
                    handler={() => setShowModal(true)}>
                    <i className="icon-user-add d-flex icon-20"/>
                    <span className="mr-2">کاربر جدید</span>
                </Button>
            }
            <div className={`overflow-auto mx--15px px-30px pt-15px height-user-page ${!isMobile ? "list" : "list mb-6 mt--15px"}`}>
                <section className={`row ${!isMobile ? "card card-box pb-2" : ""}`}>
                    <section className={!isMobile ? "mx-2" : "col-12"}>
                        <div className={!isMobile ? "mt-2" : "row"}>
                            <Table
                                columns={headers}
                                pageSize={10}
                                data={users}
                                rowIndexDisabled={true}
                                noDataMessage={"اطلاعاتی برای نمایش موجود نیست."}
                                mobileListTemplate={(data) => {
                                    return (
                                        <div key={data.id} className={"p-3"}>
                                            <div className="d-flex flex-column">
                                                <div className="pb-3 border-bottom">
                                                    <div className="text-dark">{data.name} {data.last_name}</div>
                                                </div>
                                                <div className="d-flex justify-content-between pt-3">
                                                    <div className="mobile-comment-content bold">
                                                        <div className="bold">دسترسی : <span
                                                            className="text-dark font-400">{generatePermissionText(data)}</span>
                                                        </div>
                                                        <div className="mt-2 bold">وضعیت : <span
                                                            className="text-dark font-400">{data?.is_active ? (data?.is_verified ? "فعال" : "در انتظار تایید") : "غیرفعال"}</span>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex justify-content-center align-items-end">
                                                        <Link
                                                            to={`/Panel/Dashboard/User/Action/${data.id}`}
                                                            className="ml-3 cursor-pointer"
                                                            key={data.id + 101}
                                                        >
                                                            <span className="d-flex justify-content-center">
                                                                <img src={editIcon} width={20} title="ویرایش"/>
                                                            </span>
                                                        </Link>
                                                        <div
                                                            className="cursor-pointer"
                                                            key={data.id + 102}
                                                            onClick={() => confirmDelete(data)}
                                                            target="_new"
                                                        >
                                                            <div className="d-flex justify-content-center">
                                                                <img src={RemoveIcon} width={20} title="حذف"/>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }}
                            />
                        </div>
                    </section>
                </section>

                {
                    isMobile && <Link
                        className="button btn-primary-fill d-flex align-items-center justify-content-center py-2 px-3 position-absolute bottom-left"
                        to="/Panel/Dashboard/User/Action"
                    >
                        <i className="icon-user-add d-flex icon-20"/>
                        <span className="mr-2">کاربر جدید</span>
                    </Link>
                }
            </div>


            <Modal
                isOpen={showModal}
                contentLabel="اضافه کردن کاربر جدید"
                className="modal-user"
                onRequestClose={() => setShowModal(false)}
                shouldCloseOnOverlayClick={true}
                style={customStyles}
            >
                <div className="container-fluid">
                    <UserForm
                        closeHandler={() => {
                            setShowModal(false)
                            setUser(null)
                            setErrors(null)
                        }}
                        submitHandler={handleUser}
                        data={user}
                        errors={errors}
                    />
                </div>
            </Modal>
        </>
    );
};

export default List;
