import { combineReducers } from 'redux';
import headerAction from "./reducers/headerAction";
import alerts from './reducers/alerts';
import profile from './reducers/profile';
import tile from './reducers/tile';
import tilesData from './reducers/tilesData';
import tilesGraph from "./reducers/tilesGraph";
import customError from "./reducers/customError";

export default combineReducers({
  headerAction,
  tilesData,
  profile,
  alerts,
  tile,
  tilesGraph,
  customError
});