import Api from "../api";

const MAX_FILES = 1;

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

function FileUpload(id) {
  this.FILE_ID = id;
  this.upload = async (endpoint, params = {}) => {
    if (!FileUpload.files[this.FILE_ID]) return;
    let isAuth = await Api.auth();
    if (!isAuth) return;
    await asyncForEach(FileUpload.files[this.FILE_ID], async (f) => {
      console.log({
        ...params.body,
        file: f,
      });
      let req = await Api.post(endpoint, {
        body: {
          ...params.body,
          file: f,
        },
      });
    });
  };
}

FileUpload.removeFiles = (id) => {
  delete FileUpload.files[id];
};
FileUpload.getFiles = (id) => {
  return FileUpload.files[id]
    ? Object.keys(FileUpload.files[id]).map((k) => ({
        id: k,
        title: FileUpload.files[id][k].name,
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
