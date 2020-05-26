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
  setRoute: (route) =>
    dispatch({
      type: "SET_ROUTE",
      route,
    }),
});

export default actions;
