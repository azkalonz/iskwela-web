import axios from "axios";
import { makeLinkTo } from "../components/router-dom";
function Api() {}

const domain = "https://api.iskwela.net";
Api.domain = domain;

Api.get = (endpoint, params = {}) =>
  axios
    .get(domain + endpoint, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + Api.token,
      },
      cancelToken: new axios.CancelToken(function executor(c) {
        let url = window.location.pathname;
        window.onclick = () => {
          if (url !== window.location.pathname) {
            c();
          }
        };
      }),
      ...params.config,
    })
    .then((resp) => resp.data);
Api.post = (endpoint, params = {}) => {
  return axios
    .post(domain + endpoint, params.body, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + Api.token,
        ...params.headers,
      },
      onUploadProgress: (progressEvent) =>
        params.onUploadProgress
          ? params.onUploadProgress(progressEvent)
          : progressEvent,
      cancelToken: new axios.CancelToken(function executor(c) {
        if (params.cancelToken) params.cancelToken(c);
      }),
      ...params.config,
    })
    .then((resp) => resp.data);
};
Api.pixabay = {
  get: ({ search = "", page = 1 }) =>
    axios
      .get(
        "https://pixabay.com/api" +
          makeLinkTo(["key", "q", "safe", "p", "&perpage=20"], {
            key: "?key=16972310-8d3dda4b0b9073ed9da25d551",
            safe: "&safesearch=" + true,
            q: "&q=" + search,
            p: "&page=" + page,
          })
      )
      .then((r) => r.data),
};
Api.questions = {
  get: (endpoint) =>
    axios.get("https://jservice.io/api/" + endpoint).then((r) => r.data),
};
Api.postBlob = (endpoint, params = {}) => {
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
  });
};

Api.delete = (endpoint, params = {}) => {
  return axios
    .delete(domain + endpoint, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + Api.token,
        ...params.headers,
      },
      ...params.config,
    })
    .then((resp) => resp.data);
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
      callback.fail && callback.fail(e);
    }
  }
  localStorage.removeItem("auth");
  callback.fail && callback.fail();
  if (
    window.location.pathname !== "/login" &&
    window.location.pathname !== "/login/"
  )
    window.location = "/login?r=" + window.location.pathname;
};

export default Api;
