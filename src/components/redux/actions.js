const actions = (dispatch) => ({
  setUserInfo: (user) =>
    dispatch({
      type: "SET_USERINFO",
      payload: user,
    }),
  setClasses: (classes) =>
    dispatch({
      type: "SET_CLASSES",
      classes,
    }),
  setClassDetails: (classDetails) =>
    dispatch({
      type: "SET_CLASS_DETAILS",
      class_details: classDetails,
    }),
  setRoute: (route) =>
    dispatch({
      type: "SET_ROUTE",
      route,
    }),
});

export default actions;
