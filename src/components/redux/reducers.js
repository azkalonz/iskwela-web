import { combineReducers } from "redux";

const userInfo = (state = {}, payload) => {
  switch (payload.type) {
    case "SET_USERINFO":
      return payload.user;
    default:
      return state;
  }
};

const route = (state = { index: 0, title: "Class" }, payload) => {
  switch (payload.type) {
    case "SET_ROUTE":
      return payload.route;
    default:
      return state;
  }
};

const classes = (state = [], payload) => {
  switch (payload.type) {
    case "SET_CLASSES":
      const images = {
        math: "/class/mathematics.svg",
        english: "/class/english.svg",
        science: {
          random: () =>
            ["/class/science.svg", "/class/science2.svg"][
              Math.floor(Math.random() * 2)
            ],
        },
        geography: "/class/history.svg",
      };
      Object.keys(payload.classes).forEach((k) => {
        let imageID = Object.keys(images).find(
          (kk) =>
            payload.classes[k] &&
            payload.classes[k].subject.name
              .toLowerCase()
              .indexOf(kk.toLowerCase()) >= 0
        );
        if (imageID)
          payload.classes[k].image =
            typeof images[imageID] === "string"
              ? images[imageID]
              : images[imageID].random();
        else {
          let i = images[Object.keys(images)[Math.floor(Math.random() * 4)]];
          i = typeof i === "string" ? i : i.random();
          payload.classes[k].image = i;
        }
      });
      return payload.classes;
    default:
      return state;
  }
};
const classDetails = (state = {}, payload) => {
  switch (payload.type) {
    case "SET_CLASS_DETAILS":
      console.log(payload.class_details);
      return payload.class_details;
    default:
      return state;
  }
};

const questionnaires = (state = [], payload) => {
  switch (payload.type) {
    case "SET_QUESTIONNAIRES":
      return payload.questionnaires;
    default:
      return state;
  }
};

const gradingCategories = (state = [], payload) => {
  switch (payload.type) {
    case "SET_GRADING_CATEGORIES":
      return payload.categories;
    default:
      return state;
  }
};

const theme = (state = "light", payload) => {
  switch (payload.type) {
    case "SET_THEME":
      return payload.theme;
    default:
      return state;
  }
};
const pics = (state = {}, payload) => {
  switch (payload.type) {
    case "SET_PIC":
      return { ...state, ...payload.userpic };
    default:
      return state;
  }
};
const dataProgress = (state = {}, payload) => {
  switch (payload.type) {
    case "SET_PROGRESS":
      let data = {};
      data[payload.id] = payload.data;
      return { ...state, ...data };
    case "CLEAR_PROGRESS":
      let d = { ...state };
      delete d[payload.id];
      return d;
    default:
      return state;
  }
};
const users = (state = [], payload) => {
  switch (payload.type) {
    case "SET_ONLINE_USERS":
      return payload.data;
    default:
      return state;
  }
};
const posts = (state = { current: [] }, payload) => {
  let postIndex;
  if (payload.post) {
    postIndex = state.current.findIndex((q) => q.id === payload.post.id);
  }
  switch (payload.type) {
    case "SET_POSTS":
      return { ...state, current: payload.posts, class_id: payload.class_id };
    case "ADD_POST":
      return { ...state, current: [...state.current, payload.post] };
    case "UPDATE_POST":
      if (postIndex >= 0) {
        let posts = [...state.current];
        posts[postIndex] = payload.post;
        return { ...state, current: posts };
      }
    case "ADD_COMMENT": {
      if (postIndex >= 0) {
        let posts = [...state.current];
        if (typeof posts[postIndex].comments === "object")
          posts[postIndex].comments.push(payload.comment);
        else posts[postIndex].comments = [payload.comment];
        return { ...state, current: posts };
      }
    }
    case "DELETE_POST":
      if (postIndex >= 0) {
        let posts = [...state.current];
        posts.splice(postIndex, 1);
        return { ...state, current: posts };
      }
    default:
      return state;
  }
};
const messages = (
  state = {
    recent_messages: [],
    current: { messages: [], loaded: 0 },
  },
  payload
) => {
  switch (payload.type) {
    case "CLEAR_MESSAGES":
      return {
        recent_messages: [],
        current: { messages: [], loaded: 0 },
      };
    case "SET_MESSAGES":
      let added = payload.data.messages.length;
      let { messages, loaded, channel } = state.current;
      if (payload.data.channel !== channel || payload.data.start <= 0)
        loaded = 0;
      console.log("All messages", {
        ...state,
        current: {
          ...state.current,
          ...payload.data,
          messages:
            payload.data.channel === channel &&
            state.current.messages.length < payload.data.total
              ? [...messages, ...payload.data.messages]
              : payload.data.messages,
          loaded: loaded + added,
        },
      });
      return {
        ...state,
        current: {
          ...state.current,
          ...payload.data,
          messages:
            payload.data.channel === channel &&
            state.current.messages.length < payload.data.total
              ? [...messages, ...payload.data.messages]
              : payload.data.messages,
          loaded: loaded + added,
        },
      };
    case "SET_RECENT":
      let r = [...state.recent_messages];
      let recentIndex = r.findIndex(
        (q) =>
          (q.receiver.username === payload.data[0].sender.username &&
            q.sender.username === payload.data[0].receiver.username) ||
          (q.receiver.username === payload.data[0].receiver.username &&
            q.sender.username === payload.data[0].sender.username)
      );
      if (recentIndex >= 0) r.splice(recentIndex, 1);
      r = [...r, ...payload.data];
      return {
        ...state,
        recent_messages: r,
      };
    case "ADD_MESSAGE":
      let newMessage = [...state.current.messages];
      if (payload.data.channel === state.current.channel)
        newMessage.push(payload.data);
      return {
        ...state,
        recent_messages: [...state.recent_messages, payload.data],
        current: {
          ...state.current,
          messages: newMessage,
        },
      };
    case "UPDATE_MESSAGE":
      const { id, update } = payload.data;
      let updatedState = { ...state };
      if (typeof id === "number") {
        updatedState.recent_messages = updatedState.recent_messages.map((q) =>
          q.id === id
            ? {
                ...q,
                ...update,
              }
            : q
        );
        updatedState.current.messages = updatedState.current.messages.map((q) =>
          q.id === id
            ? {
                ...q,
                ...update,
              }
            : q
        );
      } else if (typeof id === "object") {
        for (let i of id) {
          updatedState.recent_messages = updatedState.recent_messages.map((q) =>
            q.id === i
              ? {
                  ...q,
                  ...update,
                }
              : q
          );
          updatedState.current.messages = updatedState.current.messages.map(
            (q) =>
              q.id === i
                ? {
                    ...q,
                    ...update,
                  }
                : q
          );
        }
      }
      return updatedState;
    case "UPDATE_CHAT":
      let updatedChat = { ...state };
      updatedChat.current = {
        ...updatedChat.current,
        ...payload.data.update,
      };
      return updatedChat;
    default:
      return state;
  }
};

export default combineReducers({
  userInfo,
  classes,
  route,
  dataProgress,
  questionnaires,
  classDetails,
  posts,
  theme,
  pics,
  gradingCategories,
  users,
  messages,
});
