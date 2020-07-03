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
      const colors = [
        "#238468",
        "#5B539D",
        "#444B99",
        "#008430",
        "#E06B47",
        "#4E2102",
        "#CA54A0",
        "#1650A5",
        "#117F7F",
        "#4B5320",
        "#C26F2C",
        "#A13668",
        "#0E6352",
        "#492885",
        "#7539FF",
      ];
      let colorID = 0;
      Object.keys(payload.classes).forEach((k) => {
        if (colorID > colors.length - 1) colorID = 0;
        payload.classes[k].theme = colors[colorID++];
      });
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

const gradingCategories = (state = [], payload) => {
  switch (payload.type) {
    case "SET_GRADING_CATEGORIES":
      return payload.categories;
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
  gradingCategories,
});
