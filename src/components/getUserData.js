import store from "./redux/store";
import Api from "../api";
import moment from "moment";
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

export default async function getUserData(user) {
  let data = {};
  if (user.user_type === "s") {
    let c = await Api.get("/api/student/classes");
    data.classes = c.classes;
  } else {
    data.classes = await Api.get("/api/teacher/classes");
  }

  data.classDetails = {};
  await asyncForEach(data.classes, async (c) => {
    let classDetails = await Api.get(
      "/api/teacher/class/" + c.id + "?include=schedules,students"
    );
    data.classDetails[c.id] = classDetails;
    let schedCopy = [...data.classDetails[c.id].schedules];
    data.classDetails[c.id].schedules = [];
    await asyncForEach(schedCopy, async (sched) => {
      let scheduleDetails = await Api.get(
        "/api/schedule/" +
          sched.id +
          "?include=materials, activities, lessonPlans"
      );
      data.classDetails[c.id].schedules[sched.id] = scheduleDetails;
      data.classDetails[c.id].schedules[sched.id].date = moment(
        sched.from
      ).format("LL");
      data.classDetails[c.id].schedules[sched.id].time = moment(
        sched.from
      ).format("LT");
      data.classDetails[c.id].schedules[sched.id].teacher_name =
        sched.teacher.first_name + " " + sched.teacher.last_name;
    });
  });
  console.log(data);
  store.dispatch({
    type: "SET_CLASS_DETAILS",
    class_details: data.classDetails,
  });
  store.dispatch({ type: "SET_CLASSES", classes: data.classes });
  store.dispatch({ type: "SET_USERINFO", user: user });
}
