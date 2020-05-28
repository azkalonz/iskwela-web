import Api from "../api";

const MAX_FILES = 1;

function FileUpload(props) {
  this.upload = async () => {
    let isAuth = await Api.auth();
    if (!isAuth) return;
    console.log(FileUpload.files);
  };
}

FileUpload.removeFiles = () => {
  FileUpload.files = null;
};
FileUpload.getFiles = () =>
  Object.keys(FileUpload.files)
    .map((k) => FileUpload.files[k].name)
    .splice(0, MAX_FILES);

export const stageFiles = (files, callback = null) => {
  window.x = files;
  FileUpload.files = files;
  callback && files && callback(files);
};

export default FileUpload;
