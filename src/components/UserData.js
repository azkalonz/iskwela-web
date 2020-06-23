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
  updateClass: (class_id, classinfo, dispatch = true) => {
    let classes = { ...store.getState().classes };
    classes[class_id] = classinfo;
    if (dispatch)
      store.dispatch({
        type: "SET_CLASSES",
        classes: classes,
      });
    return classes;
  },
  updateClassDetails: async function (
    class_id,
    details = null,
    callback = null
  ) {
    let newClassDetails;

    if (!details) {
      newClassDetails = await Api.get(
        "/api/teacher/class/" + class_id + "?include=schedules,students"
      );
      let scheduleAdded;
      if (
        !Object.keys(store.getState().classes[class_id].next_schedule).length
      ) {
        scheduleAdded = {
          ...store.getState().classes[class_id],
          next_schedule: {
            ...newClassDetails.schedules[newClassDetails.schedules.length - 1],
            nosched: true,
          },
        };
        console.log("neww", this.updateClass(class_id, scheduleAdded, false));
        store.dispatch({
          type: "SET_CLASSES",
          classes: this.updateClass(class_id, scheduleAdded, false),
        });
        if (callback)
          callback(
            newClassDetails.schedules[newClassDetails.schedules.length - 1]
          );
      }
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
    let quizzes = await Api.get(
      "/api/quizzes?types[]=myQuizzes&types[]=schoolQuizzes&types[]=classQuizzes"
    );
    let allclasses = {};
    await asyncForEach(data.classes, async (c) => {
      allclasses[c.id] = c;
      allclasses[c.id].teacher.pic = await this.getUserPic(c.teacher.id);
    });
    data.classDetails = {};
    store.dispatch({
      type: "SET_QUIZZES",
      quizzes,
    });
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
