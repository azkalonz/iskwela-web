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
    let res = await Api.post(endpoint, {
      body: this.data,
    });
    return res;
  }
}

export default Form;
