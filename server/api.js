import axios from "axios";

const config = {
  url: "https://dev-middleware.iskwela.net:8443/",
};

class Api {
  constructor() {}
}
Api.get = (endpoint, params) =>
  Api.token &&
  axios.get(config.url + params.endpoint.replace("/", ""), {
    headers: {
      Authorization: "Bearer " + Api.token,
    },
    ...params.config,
  });
Api.post = (endpoint, params) =>
  Api.token &&
  axios.post(config.url + params.endpoint.replace("/", ""), params.data, {
    headers: {
      Authorization: "Bearer " + Api.token,
    },
    ...params.config,
  });

Api.token = undefined;

module.exports = Api;
