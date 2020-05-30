function Api() {}

const domain = "https://dev-middleware.iskwela.net";
Api.domain = domain;

Api.get = (endpoint, params = {}) =>
  fetch(domain + endpoint, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + Api.token,
    },
    ...params.config,
  }).then((resp) => resp.json());
Api.post = (endpoint, params = {}) => {
  console.log({
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + Api.token,
      ...params.headers,
    },
    body: JSON.stringify(params.body),
    ...params.config,
  });
  return fetch(domain + endpoint, {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + Api.token,
      ...params.headers,
    },
    body: JSON.stringify(params.body),
    ...params.config,
  }).then((resp) => resp.json());
};

Api.auth = async (callback = {}) => {
  if (localStorage["auth"]) {
    try {
      let u = JSON.parse(localStorage["auth"]);
      Api.token = u.access_token;
      u = await Api.get("/api/user?include=preferences");
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
