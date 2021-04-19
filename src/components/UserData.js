import store from "./redux/store";
import Api from "../api";
import moment from "moment";
import socket from "./socket.io";
const qs = require("query-string");

export async function asyncForEach(array, callback) {
  if (!array) return;
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
const UserData = {
  clearPosts: () => {
    store.dispatch({
      type: "CLEAR_POSTS",
    });
  },
  setPosts: (id, posts, isSchool = false) => {
    store.dispatch({
      type: "SET_POSTS",
      ...(isSchool ? { school_id: id } : { class_id: id }),
      posts,
    });
  },
  updatePosts: (id, payload, action) => {
    const { school_id, class_id } = store.getState().posts;
    let postId = class_id || school_id;
    if (postId + "" === id + "") {
      store.dispatch({
        type: action,
        ...payload,
      });
    }
  },
  updateUserDetails: async () => {
    let u = await Api.auth();
    store.dispatch({
      type: "SET_USERINFO",
      user: u,
    });
  },
  updateScheduleDetails: async (class_id, schedule_id) => {
    let schedCopy = {
      ...store.getState().classDetails[class_id].schedules[schedule_id],
    };
    let scheduleDetails = await Api.get(
      "/api/schedule/" +
        schedule_id +
        "?include=materials,publishedSeatworks,publishedProjects,projects,seatworks,lessonPlans"
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
    let schedules;
    if (
      store.getState().userInfo.user_type === "t" ||
      store.getState().userInfo.user_type === "a"
    ) {
      schedules = await Api.get(
        "/api/teacher/class-schedules/" +
          class_id +
          "?include=materials,publishedSeatworks,publishedProjects,projects,seatworks,lessonPlans"
      );
    } else {
      schedules = await Api.get(
        "/api/student/class-schedules/" +
          class_id +
          "?include=materials,publishedSeatworks,publishedProjects"
      );
    }
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
  addQuiz: (questionnaires) => {
    store.dispatch({
      type: "SET_QUESTIONNAIRES",
      questionnaires: [...store.getState().questionnaires, questionnaires],
    });
  },
  removeQuiz: (id) => {
    let index = store
      .getState()
      .questionnaires.findIndex((q) => parseInt(q.id) === parseInt(id));
    if (index >= 0) {
      let questionnaires = [...store.getState().questionnaires];
      questionnaires.splice(index, 1);
      store.dispatch({
        type: "SET_QUESTIONNAIRES",
        questionnaires,
      });
    }
  },
  getUserData: async function (user, callback = (e) => {}, id = "") {
    const { user_type } = user;
    if (!user_type) return;
    let data = {};
    if (user.user_type === "s") {
      let c = await Api.get(
        "/api/student/classes" + (id ? "?student_id=" + id : "")
      );
      data.classes = c.classes;
    } else if (user.user_type === "t") {
      data.classes = await Api.get(
        "/api/teacher/classes" + (id ? "?user_id=" + id : "")
      );
    } else if (user.user_type === "p") {
      data.parentData = await Api.get("/api/parent/show");
      if (data.parentData?.children.length) {
        let info = data.parentData.children[0].childInfo;
        let query = qs.parse(window.location.search);
        let childId,
          storedChild = window.localStorage["childID"];
        if (query.userId) childId = query.userId;
        else if (storedChild) childId = storedChild;
        else childId = info.id;
        if (childId) {
          let i = parseInt(childId);
          i = parseInt(i);
          if (!isNaN(i)) {
            let ii = data.parentData.children.find((q) => q.childInfo.id === i);
            if (ii) {
              childId = i;
              info = ii.childInfo;
            }
          }
        }
        if (childId) {
          if (typeof childId !== "number") childId = info.id;
          store.dispatch({
            type: "SET_CHILD_DATA",
            child: info,
          });
          await UserData.getUserData(info, callback, childId);
          window.localStorage["childID"] = childId;
        }
      }
    } else if (user.user_type === "a") {
      data.parentData = await Api.get("/api/schooladmin/teachers");
      if (data.parentData?.length) {
        data.parentData = {
          children: data.parentData.map((q) => ({
            childInfo: q,
          })),
        };
        let info = data.parentData.children[0].childInfo;
        let query = qs.parse(window.location.search);
        let childId,
          storedChild = window.localStorage["childID"];
        if (query.userId) childId = query.userId;
        else if (storedChild) childId = storedChild;
        else childId = info.id;
        if (childId) {
          let i = parseInt(childId);
          i = parseInt(i);
          if (!isNaN(i)) {
            let ii = data.parentData.children.find((q) => q.childInfo.id === i);
            if (ii) {
              childId = i;
              info = ii.childInfo;
            }
          }
        }
        if (childId) {
          if (typeof childId !== "number") childId = info.id;
          store.dispatch({
            type: "SET_CHILD_DATA",
            child: info,
          });
          await UserData.getUserData(info, callback, childId);
          window.localStorage["childID"] = childId;
        }
      }
    }
    // let questionnaires = await Api.get(
    //   "/api/questionnaires?types[]=myQnrs&limit=100"
    // );
    // let gradingCategories = await Api.get(
    //   "/api/schooladmin/school-grading-categories"
    // );

    let allclasses = {};
    await asyncForEach(data.classes, async (c) => {
      allclasses[c.id] = c;
      allclasses[c.id].teacher.pic = "/";
    });
    store.dispatch({
      type: "SET_PARENT_DATA",
      data: data.parentData,
    });
    // store.dispatch({
    //   type: "SET_GRADING_CATEGORIES",
    //   categories: gradingCategories,
    // });
    // store.dispatch({
    //   type: "SET_QUESTIONNAIRES",
    //   questionnaires,
    // });
    if (user_type === "s" || user_type === "t") {
      store.dispatch({
        type: "SET_CLASSES",
        classes: allclasses,
      });
      callback();
    }
    if (!id) {
      store.dispatch({
        type: "SET_USERINFO",
        user,
      });
    }
  },
};
UserData.posts = {
  subscribe: (callback = () => {}) => {
    socket.on("new post", ({ class_id, school_id, post }) => {
      if ((!class_id && !school_id) || !post) return;
      callback({
        class_id,
        school_id,
        payload: { post },
        action: "ADD_POST",
      });
    });
    socket.on("update post", ({ class_id, school_id, post }) => {
      if ((!class_id && !school_id) || !post) return;
      callback({
        class_id,
        school_id,
        payload: { post },
        action: "UPDATE_POST",
      });
    });
    socket.on("delete post", ({ class_id, school_id, post }) => {
      if ((!class_id && !school_id) || !post) return;
      callback({
        class_id,
        school_id,
        payload: { post },
        action: "DELETE_POST",
      });
    });
    socket.on("new comment", ({ class_id, school_id, post, comment }) => {
      if ((!class_id && !school_id) || !post || !comment) return;
      callback({
        class_id,
        school_id,
        payload: { post, comment },
        action: "ADD_COMMENT",
      });
    });
  },
};
export default UserData;
