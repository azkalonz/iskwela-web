function Api() {}
Api.get = (endpoint, params = {}) =>
  fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + Api.token,
    },
    ...params.config,
  }).then((resp) => resp.json());
Api.post = (endpoint, params = {}) =>
  fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + Api.token,
    },
    body: params.body,
    ...params.config,
  }).then((resp) => resp.json());

Api.auth = async (callback = { success: () => {}, fail: () => {} }) => {
  if (localStorage["auth"]) {
    try {
      let u = JSON.parse(localStorage["auth"]);
      Api.token = u.access_token;
      u = await Api.get("/api/student/classes");
      if (!u.error) {
        callback.success();
        return u.access_token;
      }
    } catch (e) {}
  }
  localStorage.removeItem("auth");
  callback.fail();
  if (window.location.pathname !== "/login") window.location = "/login";
};

export default Api;
