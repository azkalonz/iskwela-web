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
    console.log("new user", u);
    store.dispatch({
      type: "SET_USERINFO",
      user: u,
    });
  },
  getSchedule: async (class_id) => {},
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

    console.log(mergedClassDetails);
    store.dispatch({
      type: "SET_CLASS_DETAILS",
      class_details: mergedClassDetails,
    });
  },
  updateClassDetails: async (class_id, initial = false) => {
    let newClassDetails = await Api.get(
      "/api/teacher/class/" + class_id + "?include=schedules,students"
    );
    let scheds = [];
    newClassDetails.schedules.forEach((s) => {
      scheds[s.id] = s;
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

    // if (initial) {
    //   let schedCopy = [...mergedClassDetails[class_id].schedules];

    //   let schedCopy = [...mergedClassDetails[class_id].schedules];
    //   await asyncForEach(schedCopy, async (s) => {
    //     if (!s) return;
    //     let scheduleDetails = await Api.get(
    //       "/api/schedule/" +
    //         s.id +
    //         "?include=materials, activities, lessonPlans"
    //     );
    //     scheduleDetails.date = moment(s.from).format("LL");
    //     scheduleDetails.time = moment(s.from).format("LT");
    //     scheduleDetails.teacher_name =
    //       s.teacher.first_name + " " + s.teacher.last_name;

    //     schedCopy[s.id] = scheduleDetails;
    //   });
    //   let all = [];
    //   schedCopy
    //     .filter((a) => (!a ? false : true))
    //     .forEach((s) => {
    //       all[s.id] = s;
    //     });

    //   mergedClassDetails[class_id].schedules = all;
    // }
    console.log("hahe", mergedClassDetails);
    store.dispatch({
      type: "SET_CLASS_DETAILS",
      class_details: mergedClassDetails,
    });
  },
  getUserData: async (user, setProgress = (e) => {}) => {
    let totalReq = 0;
    let data = {};
    let counter = 1;
    if (user.user_type === "s") {
      let c = await Api.get("/api/student/classes");
      data.classes = c.classes;
    } else {
      data.classes = await Api.get("/api/teacher/classes");
    }

    data.classDetails = {};
    // await asyncForEach(data.classes, async (c) => {
    //   let classDetails = await Api.get(
    //     "/api/teacher/class/" + c.id + "?include=schedules,students"
    //   );
    //   if (!totalReq) {
    //     totalReq = data.classes.length + classDetails.schedules.length;
    //   }
    //   setProgress((counter / totalReq) * 100);
    //   data.classDetails[c.id] = classDetails;
    //   let schedCopy = [...data.classDetails[c.id].schedules];
    //   data.classDetails[c.id].schedules = [];
    //   await asyncForEach(schedCopy, async (sched) => {
    //     totalReq += 1;
    //     let scheduleDetails = await Api.get(
    //       "/api/schedule/" +
    //         sched.id +
    //         "?include=materials, activities, lessonPlans"
    //     );
    //     counter++;
    //     setProgress((counter / totalReq) * 100);
    //     data.classDetails[c.id].schedules[sched.id] = scheduleDetails;
    //     data.classDetails[c.id].schedules[sched.id].date = moment(
    //       sched.from
    //     ).format("LL");
    //     data.classDetails[c.id].schedules[sched.id].time = moment(
    //       sched.from
    //     ).format("LT");
    //     data.classDetails[c.id].schedules[sched.id].teacher_name =
    //       sched.teacher.first_name + " " + sched.teacher.last_name;
    //   });
    // });
    console.log(data);
    store.dispatch({
      type: "SET_CLASS_DETAILS",
      class_details: data.classDetails,
    });
    store.dispatch({
      type: "SET_CLASSES",
      classes: data.classes,
    });
    store.dispatch({
      type: "SET_USERINFO",
      user,
    });
    setProgress(100);
  },
};
export default UserData;
