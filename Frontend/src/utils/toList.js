export const sensorTypesToList = (res) => {
    return res.map((item) => {return {value: item?.id, label: item?.title, item}});
}

export const sensorToList = (res) => {
    return res.map((item) => {return {value: item?.id, label: `${item.title} - ${item?.part_number}`, item}});
}

export const unitsToList = (res) => {
    return res.map((item) => {return {value: item, label: item}});
}

export const actuatorsToList = (res) => {
    return res.map(el => {return {label: `${el.title} - ${el?.part_number}`, value: el?.id}});
}

export const manualToList = (res) => {
    return res.map(el => {return {label: el?.title, value: el?.id}})
}

export const automaticToList = (res) => {
    return res.map(el => {return {label: el?.title, value: el?.id}});
}

export const notificationTypesToList = (res) => {
    return res.map(el => {
        return {label: el?.model_fa, name: el?.model, value: el?.id, el}
    });
}

export const usersToList = (res) => {
    return res.map(el => {
        return {label: el?.username, value: el?.id, el}
    });
}