import TimeAgo from "javascript-time-ago";
import moment from "moment-jalaali";

const timeAgo = new TimeAgo('fa-IR')

export const getTimeMessage = (date) => {
    const now = new Date();
    const messageDate = new Date(date)

    const diff = Math.abs(messageDate - now)

    if(diff >= (1000 * 60 * 60 * 24)) {
        return moment(date).format('jDD jMMMM hh:mm')
    }

    return timeAgo.format(Date.now() - diff, 'twitter')
}