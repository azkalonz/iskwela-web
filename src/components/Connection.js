import axios from "axios";

const apiAuth = async (user) => {
  let token = await axios.post("/api/login", user);
  localStorage["token"] = token.data.token;
  return await axios.post(
    "/checkuser",
    {},
    {
      headers: { Authorization: "Bearer " + token.data.token },
    }
  );
};
const apiFetch = async (props) => {
  let result = null;
  let { url = "", after = () => {}, before = () => {} } = props;
  let headers = {
    Authorization: "Bearer " + localStorage["token"],
  };
  before();
  if (props.method == "get") {
    result = await axios.get(url, { headers: headers });
  } else if (props.method == "post") {
    let { data } = props;
    result = await axios.post(url, data, { headers: headers });
  }
  after(result);
};
export { apiAuth, apiFetch };
