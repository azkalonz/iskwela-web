const actions = (dispatch) => ({
  setUserInfo: (user) =>
    dispatch({
      type: "SET_USERINFO",
      payload: user,
    }),
  setRoute: (route) =>
    dispatch({
      type: "SET_ROUTE",
      route,
    }),
});

export default actions;
