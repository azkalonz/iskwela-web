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
      console.log("classes", payload.classes);
      return payload.classes;
    default:
      return state;
  }
};
const classDetails = (state = {}, payload) => {
  switch (payload.type) {
    case "SET_CLASS_DETAILS":
      console.log("details", payload.class_details);
      return payload.class_details;
    default:
      return state;
  }
};

const questionnaires = (state = [], payload) => {
  switch (payload.type) {
    case "SET_QUESTIONNAIRES":
      console.log(payload.questionnaires);
      return payload.questionnaires;
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
      return { ...state, ...payload.userpic };
    default:
      return state;
  }
};
const dataProgress = (state = {}, payload) => {
  switch (payload.type) {
    case "SET_PROGRESS":
      let data = {};
      data[payload.id] = payload.data;
      return { ...state, ...data };
    case "CLEAR_PROGRESS":
      let d = { ...state };
      delete d[payload.id];
      return d;
    default:
      return state;
  }
};

export default combineReducers({
  userInfo,
  classes,
  route,
  dataProgress,
  questionnaires,
  classDetails,
  theme,
  pics,
});
