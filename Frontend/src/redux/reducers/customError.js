export default (state = null, action) => {
    switch (action.type) {
        case 'HAS_ERROR':
            return action.data;
        case 'REMOVE_ERROR':
            return action.data;
        default:
            return state;
    }
}