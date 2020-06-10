import store from "./redux/store";
import Api from "../api";
import moment from "moment";

export async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
const UserData = {
  updateUserDetails: async () => {
    let u = await Api.auth();
    store.dispatch({
      type: "SET_USERINFO",
      user: u,
    });
  },
  getUserPic: async (id) => {
    if (store.getState().pics[id]) return store.getState().pics[id];
    let userpic = {};
    let pic = await Api.postBlob("/api/download/user/profile-picture", {
      body: { id },
    }).then((resp) => (resp.ok ? resp.blob() : null));
    if (pic) {
      var picUrl = URL.createObjectURL(pic);
      userpic[id] = picUrl;
      store.dispatch({
        type: "SET_PIC",
        userpic,
      });
      return picUrl;
    }
  },
  updateScheduleDetails: async (class_id, schedule_id) => {
    let schedCopy = {
      ...store.getState().classDetails[class_id].schedules[schedule_id],
    };
    let scheduleDetails = await Api.get(
      "/api/schedule/" +
        schedule_id +
        "?include=materials, activities, lessonPlans"
    );
    schedCopy.date = moment(schedCopy.from).format("LL");
    schedCopy.time = moment(schedCopy.from).format("LT");
    schedCopy.teacher_name =
      schedCopy.teacher.first_name + " " + schedCopy.teacher.last_name;

    schedCopy = { ...schedCopy, ...scheduleDetails };
    let mergedClassDetails = { ...store.getState().classDetails };
    mergedClassDetails[class_id].schedules[schedule_id] = schedCopy;

    store.dispatch({
      type: "SET_CLASS_DETAILS",
      class_details: mergedClassDetails,
    });

    return schedCopy;
  },
  addClassSchedule: (class_id, details) => {
    let schedule_id = details.id;
    let classDetails = { ...store.getState().classDetails };
    if (!classDetails[class_id]) {
      return;
    }
    classDetails[class_id].schedules[schedule_id] = details;
    store.dispatch({
      type: "SET_CLASS_DETAILS",
      class_details: classDetails,
    });
  },
  updateClass: (class_id, classinfo) => {
    let classes = [...store.getState().classes];
    let all = [];
    classes.forEach((c) => {
      if (c) all[c.id] = c;
    });
    all[class_id] = classinfo;
    store.dispatch({
      type: "SET_CLASSES",
      classes: all,
    });
  },
  updateClassDetails: async (class_id, details = null) => {
    let newClassDetails;
    if (!details) {
      newClassDetails = await Api.get(
        "/api/teacher/class/" + class_id + "?include=schedules,students"
      );
    } else {
      newClassDetails = details[class_id];
    }
    let scheds = [];
    newClassDetails.schedules.forEach((s) => {
      if (s) scheds[s.id] = s;
    });
    newClassDetails.schedules = scheds;
    let mergedClassDetails = {
      ...store.getState().classDetails,
    };
    mergedClassDetails[class_id] = newClassDetails;

    let allScheds = [];
    let schedules = await Api.get(
      "/api/teacher/class-schedules/" +
        class_id +
        "?include=materials, activities, lessonPlans"
    );
    schedules.forEach((s) => {
      allScheds[s.id] = s;
      allScheds[s.id].date = moment(s.from).format("LL");
      allScheds[s.id].time = moment(s.from).format("LT");
      allScheds[s.id].teacher_name =
        s.teacher.first_name + " " + s.teacher.last_name;
    });

    mergedClassDetails[class_id].schedules = allScheds;

    store.dispatch({
      type: "SET_CLASS_DETAILS",
      class_details: mergedClassDetails,
    });
    return mergedClassDetails;
  },
  getUserData: async function (user, setProgress = (e) => {}) {
    let data = {};
    if (user.user_type === "s") {
      let c = await Api.get("/api/student/classes");
      data.classes = c.classes;
    } else {
      data.classes = await Api.get("/api/teacher/classes");
    }
    let allclasses = [];
    await asyncForEach(data.classes, async (c) => {
      // if (!Object.keys(c.next_schedule).length) {
      //   let details = await UserData.updateClassDetails(c.id);
      //   details =
      //     details[c.id].schedules[Object.keys(details[c.id].schedules)[0]];
      //   c.next_schedule = {
      //     id: details.id,
      //     from: details.from,
      //     to: details.to,
      //     status: details.status,
      //   };
      // }
      if (!Object.keys(c.next_schedule).length) return;
      allclasses[c.id] = c;
      allclasses[c.id].teacher.pic = await this.getUserPic(c.teacher.id);
    });

    data.classDetails = {};
    store.dispatch({
      type: "SET_CLASS_DETAILS",
      class_details: data.classDetails,
    });
    store.dispatch({
      type: "SET_CLASSES",
      classes: allclasses,
    });
    store.dispatch({
      type: "SET_USERINFO",
      user,
    });
    setProgress(100);
  },
};
export default UserData;
