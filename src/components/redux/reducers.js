import { combineReducers } from "redux";

const userInfo = (state = { isLoggedIn: false }, action) => {
  switch (action.type) {
    case "SET_USERINFO":
      return { ...state, ...action.payload };
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
    default:
      return state;
  }
};

export default combineReducers({ userInfo, classes, route });
