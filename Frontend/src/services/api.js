import React, {Component} from "react";
import axios from 'axios';
import axiosRetry from 'axios-retry';
import {Redirect} from 'react-router-dom';
import {createStore} from 'redux';
import {store} from '../redux/store';
import {
    MESSAGES_ADDED,
} from '../redux/constrants/actionTypes';
import {mergedFilterOrder, mergedFilterOrderWithURL} from '../utils/util';


const version = 'v1';
let client_token, auth_token;
const mode = process.env.NODE_ENV;
const API_URL = process.env.API_URL || "http://127.0.0.1:8080/api/";

const CancelToken = axios.CancelToken;

let cancel;

auth_token = localStorage.getItem("token");

// if (mode === "development") {
//   API_URL = `http://api.${window.location.host}/hosting/${version}/`;
//   client_token = getCookie("client-token");
//   auth_token = getCookie("auth-token");
// }

// if (mode === "local") {
//   API_URL = `http://api.mizboon.local/hosting/${version}/`;
//   // client_token = '5be16be30ca2e';
//   // auth_token = 'f3737099e490beac86c5aed6483f1159c785ed8dbd0ac1ee1616089672a38f52';
//   client_token = getCookie("client-token");
//   auth_token = getCookie("auth-token");
// }

// if (mode === "test") {
//   API_URL = `https://api.nama.mizbun.com/hosting/${version}/`;
//   client_token = getCookie("client-token");
//   auth_token = getCookie("auth-token");
// }

// if (mode === "production") {
//   API_URL = `https://api.mizboon.com/hosting/${version}/`;
//   client_token = getCookie("client-token");
//   auth_token = getCookie("auth-token");
// }

axiosRetry(axios, {retries: 2});
axiosRetry(axios, {retryDelay: axiosRetry.exponentialDelay});

axios.defaults.baseURL = API_URL;
axios.defaults.timeout = 30000;
axios.defaults.headers.common.Accept = 'application/json';
axios.defaults.headers.common['Accept-Language'] = "fa";
axios.defaults.headers.common['Content-Type'] = 'application/json';
// axios.defaults.headers.common['client-token'] = client_token;
// axios.defaults.headers.common['token'] = auth_token;
axios.defaults.headers.common['Authorization'] = "Bearer " + auth_token;

const client = axios.create({
    baseURL: API_URL
})

client.defaults.headers.common.Accept = 'application/json';
client.defaults.headers.common['Accept-Language'] = "fa";
client.defaults.headers.common['Content-Type'] = 'application/json';
client.defaults.headers.common['Authorization'] = "Bearer " + auth_token;

axios.interceptors.response.use(
    response => {
        // if (response && response.data && response.data.notices && response.data.notices.length > 0) {
        //   store.dispatch({ type: MESSAGES_ADDED, messages: response.data.notices });
        // }
        if (response.status === 400) {

        }
        return response;
    },
    error => {
        handleError(error);
        // if (error.response.status === 401) {
        //   store.dispatch(authLogout())
        // }
        // if (error?.response?.status !== 400 && error?.response?.data?.success) {
        return Promise.reject(error);
        // }
    });




function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function handleError(error) {
    if (error?.response) {
        const {status} = error.response;
        const {data} = error.response;
        if (status === 401) {
            removeToken();
            // window.location.href = window.location.href.split("/Panel")[0] + "/login";
        } else if (status === 403) { // forbidden
            // window.location.href = window.location.href.split("/Panel")[0] + "/login";
            if (!data?.success && data?.message) {
                alert.show(data.message, {type: 'error'});
            }
        } else if (status === 404) { // not found

        } else if (status === 400) { // server error
            if (!data?.success && data?.message) {
                // email: ["user with this email already exists."]
                // last_name: ["This field is required."]
                // name: ["This field is required."]
                // password: ["Ensure this field has at least 8 characters."]
                // phone: ["Ensure this field has at least 11 characters."]
                // username: ["user with this username already exists."]
                alert.show(data.message, {type: 'error'});
            } else {
                // alert.show('خطایی رخ داد! لطفا دوباره امتحان کنید.', { type: 'error' });
            }
        } else if (status === 500) {
            alert.show("خطایی در سرور رخ داده است، لطفا مجددا امتحان کنید.", {type: 'error'});
        } else if (status === 502) {
            alert.show("خطایی در سرور رخ داده است، لطفا مجددا امتحان کنید.", {type: 'error'});
        } else if (status === 423) {
            alert.show("تعداد دفعات ارسال درخواست در بازه زمانی بیش از حد مجاز است، لطفا یک دقیقه صبر کنید.", {type: 'error'});
        }
    }
}
export function setToken(token) {
    localStorage.setItem("token", token);
    axios.defaults.headers.common['Authorization'] = "Bearer " + token;
}

export function removeToken() {
    localStorage.removeItem("token");
    localStorage.removeItem("photo");
    axios.defaults.headers.common['Authorization'] = "";
}

export function login(data) {
    delete axios.defaults.headers.common['Authorization'];
    return axios.post(`auth/login/`, data)
        .then(res => {
            return res;
        })
        .catch(err => {
            return Promise.reject(err);
        })
}

export function loginByPhone(values) {
    delete axios.defaults.headers.common['Authorization'];
    return axios.post('/auth/phone-login/', values)
        .then(res => {
            return res.data;
        })
        .catch(err => {
            console.log(err)
        })
}

export function submitCodeLogin(values) {
    return axios.post('/auth/code-login/', values)
        .then(res => {
            return res;
        })
        .catch(err => {
            console.log(err)
        })
}

export function logout() {
    return axios.post(`auth/logout/`, {refresh: localStorage.getItem("refresh")})
        .then(res => {
            removeToken();
            window.location.replace('/Login');
        })
        .catch(err => {
            return Promise.reject(err);
        })
}


export function forgetPassword(data) {
    return axios.post(`/auth/request-reset-email/`, data)
        .then(res => {
            return res.data;
        })
        .catch(err => {
            return Promise.reject(err);
        })
}

export function setNewPassowrd(uid, token, data) {
    axios.defaults.headers.common['Authorization'] = "";
    return axios.post(`/auth/email-verify/${uid}/${token}/`, data).then(res => {
        return res.data
    }).catch(err => {
        return Promise.reject(err)
    })
}

// tabs apis

export function getTabs() {
    let req = '/dashboard/tabs/';
    return axios.get(req)
        .then(res => {
            return res.data;
        })
        .catch(err => {
            return Promise.reject(err);
        })
}

export function getTab(id) {
    return axios.get(`/dashboard/tabs/${id}`)
        .then(res => {
            return res.data;
        })
        .catch(err => {
            return Promise.reject(err);
        })
}

export function addTab(data) {
    return axios.post(`/dashboard/tabs/add-tab`, data)
        .then(res => {
            return res;
        })
        .catch(err => {
            return Promise.reject(err);
        })
}

export function updateTab(data, id) {
    return axios.patch(`/dashboard/tabs/${id}/edit`, data)
        .then(res => {
            return res.data;
        })
        .catch(err => {
            return Promise.reject(err);
        })
}

export function deleteTab(id) {
    return axios.delete(`/dashboard/tabs/${id}/delete`)
        .then(res => {
            return res;
        })
        .catch(err => {
            return Promise.reject(err);
        })
}

// tiles Apis
export function getTiles(id) {
    let req = `/dashboard/tabs/${id}/tiles/`;
    return axios.get(req, {
        cancelToken: new CancelToken(function executor(c) {
            cancel = c;
        }),
    })
        .then(res => {
            return res.data;
        })
        .catch(err => {
            return Promise.reject(err);
        })
}

export function getTile(id) {
    let req = `/dashboard/tiles/${id}`;
    return axios.get(req, {
        cancelToken: new CancelToken(function executor(c) {
            cancel = c;
        }),
    })
        .then(res => {
            return res.data;
        })
        .catch(err => {
            return Promise.reject(err);
        })
}

export function getTileData(id) {
    return axios.get(`/dashboard/tiles/${id}/data`)
        .then(res => {
            return res.data;
        })
        .catch(err => {
            return Promise.reject(err);
        })
}

export function getTileGaugeData(id) {
    return axios.get(`/dashboard/tiles/${id}/gauge`)
        .then(res => {
            return res.data;
        })
        .catch(err => {
            return Promise.reject(err);
        })
}

export function getTileGraphData(id) {
    return axios.get(`/dashboard/tiles/${id}/graph`)
        .then(res => {
            return res.data;
        })
        .catch(err => {
            return Promise.reject(err);
        })
}

export function addTile(data, tileId) {
    return axios.post(`/dashboard/tabs/${tileId}/add-tile`, data)
        .then(res => {
            return res;
        })
        .catch(err => {
            return Promise.reject(err);
        })
}

export function deleteTile(id) {
    return axios
        .delete(`/dashboard/tiles/${id}/delete`)
        .then((res) => {
            return res;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
}

export function updateTile(data, tileId) {
    return axios.patch(`/dashboard/tiles/${tileId}/edit`, data)
        .then(res => {
            return res;
        })
        .catch(err => {
            return Promise.reject(err);
        })
}

// sensors APis

export function getSensors(id) {
    let req
    if (id) {
        req = `/device/sensors/?type=${id}`;
    } else {
        req = `/device/sensors/`;
    }
    return axios.get(req)
        .then(res => {
            return res.data;
        })
        .catch(err => {
            return Promise.reject(err);
        })
}

export function getSensorTypes(param) {
    let req = `/device/types/`;
    return axios.get(req, {
        params: param,
        cancelToken: new CancelToken(function executor(c) {
            cancel = c;
        }),
    })
        .then(res => {
            return res.data;
        })
        .catch(err => {
            return Promise.reject(err);
        })
}

export function getDeviceType() {
    let req = `/device/types/`;

    return axios.get(req).then(res => {
        return res.data
    }).catch(err => {
        return Promise.reject(err);
    })
}

export function getChart(param) {
    return axios.post(`/history/`, param).then(res => {
        return res.data
    }).catch(err => {
        return Promise.reject(err)
    })
}


//  user api
export function getUsers() {
    let req = "/accounting/list-user/";
    return axios
        .get(req)
        .then((res) => {
            return res.data.results;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
}

export function getUser(id) {
    let req = `/accounting/user/${id}/`;
    return axios
        .get(req)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
}

export function storeUser(data) {
    return axios
        .post(`/accounting/add-user/`, data)
        .then((res) => {
            return res;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
}

export function updateUser(data, id) {
    return axios
        .patch(`/accounting/user/${id}/edit`, data)
        .then((res) => {
            return res;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
}

export function deleteUser(id) {
    return axios
        .delete(`/accounting/user/${id}/delete`)
        .then((res) => {
            return res;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
}

export function uploadAvatar(formValues) {
    return axios
        .patch(`/accounting/me/`, formValues)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
}

export function getMe() {
    let req = `/accounting/me/`;
    return axios
        .get(req)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
}

// export function passwordReset(data) {
//   return axios.post(`/auth/password-reset/`, data)
//     .then(res => {
//       return res;
//     })
//     .catch(err => {
//       return Promise.reject(err);
//     })
// }


// settings


export function getSettingsAutomation() {
    return axios.get(`settings/automation/`)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
}

export function updateSettingsAutomation(values) {
    return axios.patch(`/settings/automation/`, values)
        .then(res => res)
        .catch(err => Promise.reject(err))
}

export function getSettingsLanguage() {
    return axios.get(`settings/language/`)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
}

export function getDevicesList() {
    return axios.get(`/settings/manage-devices/`)
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}

export function getSensorDevice(id) {
    return axios.get(`/settings/manage-devices/sensor/${id}`)
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}

export function getActuatorDevice(id) {
    return axios.get(`/settings/manage-devices/actuator/${id}`)
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}

export function updateSensorDevice(id, values) {
    return axios.patch(`/settings/manage-devices/sensor/${id}`, values)
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}

export function updateActuatorDevice(id, values) {
    return axios.patch(`/settings/manage-devices/actuator/${id}`, values)
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}

export function addDevice(values) {
    return axios.patch(`/settings/manage-devices/add-sensor`, values)
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}

export function deleteDevice(values) {
    return axios
        .delete(`/settings/manage-devices/add-sensor`, {data: values})
        .then((res) => {
            return res;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
}

export function getNotificationsAutomation() {
    return axios.get(`/notification/manager/`)
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}

export function getNotificationAutomation(id) {
    return axios.get(`/notification/manager/${id}`)
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}

export function getContentType() {
    return axios.get(`/notification/manager/content-types/`)
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}

export function createNotificationAutomation(data) {
    return axios.post(`/notification/manager/add`, data)
        .then(res => res)
        .catch(err => Promise.reject(err))
}

export function deleteNotificationAutomation(id) {
    return axios.delete(`/notification/manager/${id}/delete`)
        .then(res => res)
        .catch(err => Promise.reject(err))
}

export function updateNotificationAutomation(id, data) {
    return axios.patch(`/notification/manager/${id}/edit`, data)
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}

export function followNotification(id) {
    return axios.get(`/notification/manager/${id}/follow`)
        .then(res => res)
        .catch(err => Promise.reject(err))
}

export function unFollowNotification(id) {
    return axios.get(`/notification/manager/${id}/unfollow`)
        .then(res => res)
        .catch(err => Promise.reject(err))
}

export function getNotificationType() {
    return axios.get(`/settings/notification/type/`)
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}

export function updateNotificationType(values) {
    return axios.patch(`settings/notification/type/`, values)
        .then(res => res)
        .catch(err => Promise.reject(err))
}


// export function getAlarms(param) {
//   let req = `/plan/alarm/`;
//   return axios
//     .get(req, {
//       params: param
//     })
//     .then((res) => {
//       return res.data;
//     })
//     .catch((err) => {
//       return Promise.reject(err);
//     });
// }

// export function setAlarms(data) {
//   return axios
//     .patch(`/plan/alarm/`, data)
//     .then((res) => {
//       return res;
//     })
//     .catch((err) => {
//       return Promise.reject(err);
//     });
// }

// automation manual
export function getActuatorsListManual() {
    return axios.get(`/automation/manual/tiles/`)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
}

export function createActuatorManual(values) {
    return axios.post(`/automation/manual/tiles/add-tile`, values)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
}

export function retrieveActuatorManual(id) {
    return axios.get(`/automation/manual/tiles/${id}`)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
}

export function updateActuatorManual(data, id) {
    return axios.patch(`/automation/manual/tiles/${id}/edit`, data)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
}

export function turnOnActuatorManual(id) {
    return axios.get(`/automation/manual/tiles/${id}/turn-on`)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
}

export function turnOffActuatorManual(id) {
    return axios.get(`/automation/manual/tiles/${id}/turn-off`)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
}

export function lockOffActuatorManual(id) {
    return axios.get(`/automation/manual/tiles/${id}/lock-off`)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
}

export function lockOnActuatorManual(id) {
    return axios.get(`/automation/manual/tiles/${id}/lock-on`)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
}

export function deleteActuatorManual(id) {
    return axios.delete(`/automation/manual/tiles/${id}/delete`)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
}


// automation automatic

export function getActuatorsListAutomatic() {
    return axios.get(`/automation/automatic/tiles/`)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
}

export function createActuatorAutomatic(values) {
    return axios.post(`/automation/automatic/tiles/add-tile`, values)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
}

export function retrieveActuatorAutomatic(id) {
    return axios.get(`/automation/automatic/tiles/${id}/`)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
}

export function updateActuatorAutomatic(data, id) {
    return axios.patch(`/automation/automatic/tiles/${id}/edit`, data)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
}

export function deleteActuatorAutomatic(id) {
    return axios.delete(`/automation/automatic/tiles/${id}/delete`)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
}


// automation smart


export function getActuatorsListSmart() {
    return axios.get(`/automation/smart/tiles/`)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
}

export function updateActuatorSmart(data, id) {
    return axios.patch(`/automation/smart/tiles/${id}/edit`, data)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
}

export function getActuators(param) {
    let req = `/device/actuators/`;
    return axios
        .get(req)
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return Promise.reject(err);
        });
}

// export function commandActuator(data, id) {
//   return axios
//     .patch(`/devices/command/${id}/`, data)
//     .then((res) => {
//       return res;
//     })
//     .catch((err) => {
//       return Promise.reject(err);
//     });
// }

export function getNotifications(page = null, actorContentTypeId = null, actorObjectId = null, timestamp = null, url = null) {
    let req;
    if (url) {
        req = url;
    } else {
        req = `/notification/?${page ? `page=${page}` : ''}${actorContentTypeId ? `&actor_content_type_id=${actorContentTypeId}` : ''}${actorObjectId ? `&actor_object_ids=${actorObjectId}` : ''}${timestamp ? `&timestamp=${timestamp}` : ''}`;
    }
    return axios.get(req)
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}

export function getUnReadNotification() {
    return axios.get(`/notification/unread/`)
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}

export function markAllAsReadNotification() {
    return axios.get(`/notification/mark-all-as-read/`)
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}

export function markAsReadNotification(id) {
    return axios.get(`/notification/mark-as-read/${id}/`)
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}

export function markAsUnReadNotification(id) {
    return axios.get(`/notification/mark-as-unread/${id}/`)
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}


export function deleteNotification(id) {
    return axios.get(`/notification/delete/${id}/`)
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}

export function getUnReadNotificationCount() {
    return axios.get(`/notification/unread_count/`)
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}

export function getNotificationCount() {
    return axios.get(`/notification/all_count/`)
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}


export function getActivities(page = null, actionContentTypeId = null, actionObjectId = null, timestamp = null, user_ids = null, url = null) {
    let req;
    if (url) {
        req = url;
    } else {
        req = `/activity/?${page ? `page=${page}` : ''}${actionContentTypeId ? `&action_content_type_id=${actionContentTypeId}` : ''}${actionObjectId ? `&action_object_ids=${actionObjectId}` : ''}${timestamp ? `&timestamp=${timestamp}` : ''}${user_ids ? `&user_ids=${user_ids}` : ''}`;
    }

    return axios.get(req)
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}


export function getConditionContentTypes() {
    return axios.get(`/automation/automatic/condition-content-types`)
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}

export function getContentTypes() {
    return axios.get(`/automation/automatic/if-content-types`)
        .then(res => res.data)
        .catch(err => Promise.reject(err))
}