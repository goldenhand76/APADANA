import {
    GET_TILES,
    PROFILE_PAGE_UNLOADED,
  } from '../constrants/actionTypes';
  
  export default (state = {}, action) => {
    switch (action.type) {
      case GET_TILES:
        return {
          ...action.data
        };
      default:
        return state;
    }
};