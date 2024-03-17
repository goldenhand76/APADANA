import {
    ADD_HEADER_ACTION, MESSAGES_ADDED, MESSAGES_CLEAR,
    REMOVE_HEADER_ACTION,
} from '../constrants/actionTypes';

export default (state = null, action) => {
    switch (action.type) {
        case ADD_HEADER_ACTION:
            return action.data;
        case REMOVE_HEADER_ACTION:
            return action.data;
        default:
            return state;
    }
}
