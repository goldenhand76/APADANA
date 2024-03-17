import {
    ROUTE_CHANGED,
  } from '../constrants/actionTypes';
  
  export default (state = {}, action) => {
    switch (action.type) {
      case ROUTE_CHANGED:
        return {
          ...action.location
        };
      default:
        return state;
    }
};