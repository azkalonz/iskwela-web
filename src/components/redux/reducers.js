import { combineReducers } from "redux";

const userInfo = (state = {}, payload) => {
  switch (payload.type) {
    case "SET_USERINFO":
      return payload.user;
    default:
      return state;
  }
};

const route = (state = { index: 0, title: "Class" }, payload) => {
  switch (payload.type) {
    case "SET_ROUTE":
      return payload.route;
    default:
      return state;
  }
};

const classes = (state = [], payload) => {
  switch (payload.type) {
    case "SET_CLASSES":
      return payload.classes;
    default:
      return state;
  }
};
const classDetails = (state = {}, payload) => {
  switch (payload.type) {
    case "SET_CLASS_DETAILS":
      console.log("class", payload.class_details);
      return payload.class_details;
    default:
      return state;
  }
};

const theme = (state = "light", payload) => {
  switch (payload.type) {
    case "SET_THEME":
      return payload.theme;
    default:
      return state;
  }
};
const pics = (state = {}, payload) => {
  switch (payload.type) {
    case "SET_PIC":
      console.log({ ...state, ...payload.userpic });
      return { ...state, ...payload.userpic };
    default:
      return state;
  }
};

export default combineReducers({
  userInfo,
  classes,
  route,
  classDetails,
  theme,
  pics,
});
