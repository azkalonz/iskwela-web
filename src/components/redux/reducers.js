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
      const images = {
        math: "/class/mathematics.svg",
        english: "/class/english.svg",
        science: {
          random: () =>
            ["/class/science.svg", "/class/science2.svg"][
              Math.floor(Math.random() * 2)
            ],
        },
        history: "/class/history.svg",
      };
      Object.keys(payload.classes).forEach((k) => {
        let imageID = Object.keys(images).find(
          (kk) =>
            payload.classes[k] &&
            payload.classes[k].subject.name
              .toLowerCase()
              .indexOf(kk.toLowerCase()) >= 0
        );
        if (imageID)
          payload.classes[k].image =
            typeof images[imageID] === "string"
              ? images[imageID]
              : images[imageID].random();
        else {
          let i = images[Object.keys(images)[Math.floor(Math.random() * 4)]];
          i = typeof i === "string" ? i : i.random();
          payload.classes[k].image = i;
        }
      });
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
