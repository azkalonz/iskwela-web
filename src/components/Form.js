import Api from "../api";

class Form {
  constructor(d = {}) {
    this.data = d;
  }
  set(key, val) {
    this.data[key] = val;
  }
  append(key, val) {
    this.data[key] = val;
  }
  async send(endpoint) {
    let isAuth = await Api.auth();
    if (!isAuth.error) {
      let res = await Api.post(endpoint, {
        body: this.data,
      });
      return res;
    }
    return null;
  }
}

export default Form;
