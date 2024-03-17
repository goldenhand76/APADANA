import {
    PROFILE_PAGE_LOADED,
    PROFILE_PAGE_UNLOADED,
  } from '../constrants/actionTypes';
  
  export default (state = {}, action) => {
    switch (action.type) {
      case PROFILE_PAGE_LOADED:
        return {
          ...action.newData
        };
      default:
        return state;
    }
};