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

Api.auth = async (callback = {}) => {
  if (localStorage["auth"]) {
    try {
      let u = JSON.parse(localStorage["auth"]);
      Api.token = u.access_token;
      u = await Api.get("/api/user");
      if (!u.error) {
        return callback.success ? callback.success(u) : u;
      }
    } catch (e) {
      return callback.fail ? callback.fail(e) : e;
    }
  }
  localStorage.removeItem("auth");
  callback.fail && callback.fail();
  if (window.location.pathname !== "/login")
    window.location = "/login?r=" + window.location.pathname;
};

export default Api;
