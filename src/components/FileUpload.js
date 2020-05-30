import Api from "../api";
import axios from "axios";

function FileUpload() {}
FileUpload.upload = async (endpoint, params = {}) => {
  if (!params.body) return;
  let isAuth = await Api.auth();
  if (!isAuth) return;
  let req = await axios.post(Api.domain + endpoint, params.body, {
    headers: {
      Accept: "application/json",
      "Content-Type": "multipart/form-data",
      Authorization: "Bearer " + Api.token,
    },
  });
  return req;
};

FileUpload.removeFiles = (id) => {
  delete FileUpload.files[id];
};
FileUpload.getFiles = (id) => {
  return FileUpload.files[id]
    ? Object.keys(FileUpload.files[id]).map((k) => ({
        id: k,
        uploaded_file: FileUpload.files[id][k].name,
        isFile: true,
      }))
    : [];
};
FileUpload.files = {};
export const stageFiles = (id, files, callback = null) => {
  FileUpload.files[id] = files;
  callback && files && callback(files);
};

export default FileUpload;
