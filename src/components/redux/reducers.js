import { combineReducers } from "redux";
import Api from "../../api";

const userInfo = (state = {}, action) => {
  switch (action.type) {
    case "SET_USERINFO":
      return action.user;
    default:
      return state;
  }
};

const route = (state = { index: 0, title: "Class" }, action) => {
  switch (action.type) {
    case "SET_ROUTE":
      return action.route;
    default:
      return state;
  }
};

const classes = (state = [], action) => {
  switch (action.type) {
    case "SET_CLASSES":
      return action.classes;
    default:
      return state;
  }
};
const classDetails = (state = {}, action) => {
  switch (action.type) {
    case "SET_CLASS_DETAILS":
      return action.class_details;
    default:
      return state;
  }
};

const classSchedules = (state = {}, action) => {
  switch (action.type) {
    case "SET_CLASS_SCHEDULES":
      return action.class_schedules;
    default:
      return state;
  }
};
const theme = (state = "light", action) => {
  switch (action.type) {
    case "SET_THEME":
      return action.theme;
    default:
      return state;
  }
};

export default combineReducers({
  userInfo,
  classes,
  route,
  classDetails,
  classSchedules,
  theme,
});
