import {verbGenerator} from "./notificationTextGenerator";

export const activityTextGenerator = item => {
    let text = item?.action_object?.app ? typeGenerator(item?.action_object?.app) + ' ' : '';
    text += item?.action_object?.username ? item?.action_object.username : '';
    text += item?.action_object?.title ? item?.action_object?.title + ' توسط کاربر ' : ' توسط کاربر ';
    text += item?.actor?.username + ' ';
    text += verbGenerator(item?.verb)
    return text
}

const typeGenerator = type => {
    switch (type) {
        case 'Automation':
            return 'اتوماسیون'
        default:
            return '';
    }
}