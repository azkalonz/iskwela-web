import { Box, MuiThemeProvider } from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import { StylesProvider } from "@material-ui/styles";
import React, { useEffect, useMemo, useState } from "react";
import { SkeletonTheme } from "react-loading-skeleton";
import { connect } from "react-redux";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import Api from "./api";
import Calendar from "./components/Calendar";
import ContentMaker from "./components/content-creator";
import { VideoCall } from "./components/dialogs";
import Messages from "./components/Messages";
import store from "./components/redux/store";
import socket from "./components/socket.io";
import UserData from "./components/UserData";
import Class from "./containers/Class";
import Explore from "./containers/Explore";
import Chat, {
  ChatProvider,
  FloatingChatWidget,
  VideoChat,
} from "./screens/Chat";
import AnswerQuiz from "./screens/class/AnswerQuiz";
import Home from "./screens/Home";
import Login from "./screens/Login";
import getTheme from "./styles/muiTheme";
import Dashboard from "./screens/Admin/Dashboard";
const qs = require("query-string");
function App(props) {
  const [chat, setChat] = useState();
  const [loading, setLoading] = useState(true);
  const [videocall, setVideocall] = useState({});
  const skeletonCustomTheme = {
    color: "rgba(215, 215, 215, 0.4)",
    highlightColor: "rgba(176,176,176,0.2)",
  };
  const theme = useMemo(() => getTheme(), [props.theme]);
  useEffect(() => {
    Api.auth({
      success: async (user) => {
        await UserData.getUserData(user);
        socket.emit("online user", { ...user, status: "online" });
        Messages.subscribe((resp) => {
          const query = qs.parse(window.location.search);
          let current = store.getState().messages.current;
          let channel = user.username + "-" + query.t;
          if (
            current.channel &&
            resp.type === "SET_MESSAGES" &&
            channel !== resp.data?.channel
          )
            return;
          store.dispatch({
            type: resp.type,
            data: resp.data,
          });
        });
        UserData.posts.subscribe((res) => {
          const { class_id, payload, action } = res;
          UserData.updatePosts(class_id, payload, action);
        });
        socket.on("videocall", ({ caller, receiver, status }) => {
          setVideocall({
            open: true,
            caller,
            receiver,
            status,
          });
          if (status !== "CALLING") setVideocall({ ...videocall, open: false });
        });
        socket.on("get class details", (c) => {
          if (store.getState().classes[c.id]) {
            UserData.updateClassDetails(c.id, c.details);
            UserData.updateClass(c.id, c.details[c.id]);
          }
        });
        socket.on("get questionnaires", (q) => {
          let questionnaires = [...store.getState().questionnaires];
          let qIndex = questionnaires.findIndex((qq) => q.id === qq.id);
          if (qIndex >= 0) {
            questionnaires.splice(qIndex, 1, q);
          } else {
            questionnaires.push(q);
          }
          store.dispatch({
            type: "SET_QUESTIONNAIRES",
            questionnaires,
          });
        });
        socket.on("get schedule details", (c) => {
          if (store.getState().classes[c.id]) {
            UserData.addClassSchedule(c.id, c.details);
          }
        });
        Messages.hooks["new message"] = (data) => {
          const { sender } = data;
          if (sender.id !== user.id) {
            let notifsound = document.querySelector("#notif-sound");
            if (!notifsound) {
              let notifAudio = document.createElement("audio");
              notifAudio.setAttribute("id", "notif-sound");
              notifAudio.setAttribute("autoplay", "");
              notifAudio.src = "/chat/notification.mp3";
              notifAudio.style.display = "none";
              document.body.appendChild(notifAudio);
            }
            notifsound = document.querySelector("#notif-sound");
            notifsound.currentTime = 0;
            notifsound.play();
          }
        };
        setTimeout(() => {
          setLoading(false);
        }, 500);
      },
      fail: () => {
        if (
          window.location.pathname === "/login" ||
          window.location.pathname === "/login/"
        )
          setLoading(false);
      },
    });
  }, []);
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <StylesProvider>
        <SkeletonTheme {...skeletonCustomTheme}>
          <VideoCall
            open={videocall.open}
            caller={videocall.caller}
            receiver={videocall.receiver}
            status={videocall.status}
          />
          {!loading && (
            <React.Fragment>
              <BrowserRouter>
                <Switch>
                  <Route
                    exact
                    path="/"
                    render={(p) => {
                      setTitle("Dashboard");
                      return <Home {...p} />;
                    }}
                  />
                  <Route exact path="/chat/:chat_id?" component={Chat} />
                  <Route exact path="/calendar" component={Calendar} />
                  <Route
                    exact
                    path="/videocall"
                    render={(p) => {
                      setTitle("Video Call");
                      return <VideoChat {...p} />;
                    }}
                  />
                  <Route
                    exact
                    path="/login"
                    render={(p) => {
                      setTitle("Login");
                      return <Login setLoading={(l) => setLoading(l)} {...p} />;
                    }}
                  />
                  <Route
                    exact
                    path="/answer/:quiz_id?"
                    render={(p) => {
                      const { quiz_id } = p.match.params;
                      setTitle(["Chat"].concat([quiz_id]));
                      return <AnswerQuiz {...p} />;
                    }}
                  />
                  <Route
                    exact
                    path="/content-maker"
                    render={(p) => {
                      setTitle("Content Maker");
                      return <ContentMaker {...p} />;
                    }}
                  />
                  <Route
                    exact
                    path="/explore/:screen_name?"
                    render={(p) => {
                      const { screen_name } = p.match.params;
                      setTitle(["Explore"].concat([screen_name]));
                      return <Explore {...p} />;
                    }}
                  />
                  <Route
                    exact
                    path="/dashboard/:option_name?"
                    render={(p) => {
                      setTitle("Dashboard");
                      return <Dashboard {...p} />;
                    }}
                  />
                  <Route
                    path="/class/:class_id/:schedule_id?/:option_name?/:room_name?"
                    component={Class}
                  />
                  <Route path="*">
                    <Redirect to="/" />
                  </Route>
                </Switch>
                {props.userInfo.id &&
                  window.location.pathname.indexOf("/chat") < 0 && (
                    <Box
                      style={{
                        position: "fixed",
                        bottom: 0,
                        right: 10,
                        zIndex: 20,
                      }}
                    >
                      <ChatProvider
                        {...props}
                        noRedirect={true}
                        chatId={chat}
                        setChatId={(id) => setChat(id)}
                      >
                        <FloatingChatWidget />
                      </ChatProvider>
                    </Box>
                  )}
              </BrowserRouter>
            </React.Fragment>
          )}

          {loading && (
            <Box
              width="100vw"
              height="100vh"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
            >
              <Box
                p={2}
                style={{ pointerEvents: "none", userSelect: "none" }}
                display="flex"
                flexDirection="column"
                alignItems="center"
              >
                <Box
                  style={{
                    ...(props.theme === "dark"
                      ? {
                          background: "url(/logo/logo192.png) no-repeat",
                          backgroundSize: "100%",
                        }
                      : {
                          background:
                            "url(/logo/logo-full-colored.svg) no-repeat left",
                          backgroundSize: 200,
                        }),
                    marginBottom: -65,
                    width: 50,
                    height: 100,
                  }}
                />
                {props.theme === "dark" ? (
                  <img src="/login/loader-light.svg" width={130} />
                ) : (
                  <img src="/login/loader.svg" width={130} />
                )}
              </Box>
            </Box>
          )}
        </SkeletonTheme>
      </StylesProvider>
    </MuiThemeProvider>
  );
}

let mode = window.localStorage["mode"] ? window.localStorage["mode"] : "light";
mode = mode === "dark" || mode === "light" ? mode : "light";
store.dispatch({
  type: "SET_THEME",
  theme: mode,
});
export const isMobileDevice = () => {
  if (
    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
      navigator.userAgent
    ) ||
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
      navigator.userAgent.substr(0, 4)
    )
  ) {
    return true;
  } else {
    return false;
  }
};
export const _handleThemeType = (m = null) => {
  let mode = window.localStorage["mode"];
  if (mode) mode = mode === "dark" ? "light" : "dark";
  else mode = "dark";
  window.localStorage["mode"] = m || mode;
  store.dispatch({ type: "SET_THEME", theme: m || mode });
};
export const pageState = {};
export const setTitle = (
  subtitles = [],
  title = "iSkwela",
  saveState = true
) => {
  if (typeof subtitles === "string") {
    subtitles = [subtitles];
  }
  subtitles = subtitles.filter((q) => q !== undefined);
  title = [title].concat(subtitles);
  document.title = title.join(" | ");
  if (saveState) {
    pageState.title = title;
    pageState.subtitles = subtitles;
  }
};
String.prototype.ucfirst = function () {
  var firstLetter = this.valueOf().substr(0, 1);
  return firstLetter.toUpperCase() + this.valueOf().substr(1);
};
Math.map = (n, start1, stop1, start2, stop2) => {
  return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
};
Math.rand = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};
String.prototype.replaceUrlParam = function (paramName, paramValue) {
  let url = this.valueOf();
  if (paramValue == null) {
    paramValue = "";
  }
  var pattern = new RegExp("\\b(" + paramName + "=).*?(&|#|$)");
  if (url.search(pattern) >= 0) {
    return url.replace(pattern, "$1" + paramValue + "$2");
  }
  url = url.replace(/[?#]$/, "");
  return (
    url + (url.indexOf("?") >= 0 ? "&" : "?") + paramName + "=" + paramValue
  );
};

export default connect((states) => ({
  theme: states.theme,
  users: states.users,
  chat: states.messages.current,
  userInfo: states.userInfo,
  recent: states.messages.recent_messages,
}))(App);
