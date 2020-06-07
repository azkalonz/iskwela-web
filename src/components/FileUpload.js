import Api from "../api";
import axios from "axios";

function FileUpload() {}
FileUpload.upload = async (endpoint, params = {}) => {
  if (!params.body) return;
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();
  try {
    let req = await axios.post(Api.domain + endpoint, params.body, {
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
        Authorization: "Bearer " + Api.token,
      },
      cancelToken: source.token,
      onUploadProgress: (progressEvent) =>
        params.onUploadProgress
          ? params.onUploadProgress(progressEvent, source)
          : progressEvent,
    });
    return req;
  } catch (e) {
    console.log("eee", e);
    return { errors: "Unprocessable entity" };
  }
};

FileUpload.removeFiles = (id) => {
  delete FileUpload.files[id];
};
FileUpload.getFiles = (id) => {
  return FileUpload.files[id]
    ? Object.keys(FileUpload.files[id]).map((k) => ({
        id: k,
        uploaded_file: FileUpload.files[id][k].name,
        title: FileUpload.files[id][k].name,
        isFile: true,
      }))
    : [];
};
FileUpload.files = {};
export const stageFiles = (id, files, callback = null) => {
  if (FileUpload.files[id])
    if (files.length)
      FileUpload.files[id] = [...FileUpload.files[id], ...files];
    else FileUpload.files[id] = [...FileUpload.files[id], files];
  else if (files.length) FileUpload.files[id] = files;
  else FileUpload.files[id] = [files];
  callback && files && callback(FileUpload.files[id]);
};

export default FileUpload;
