import {
  Box,
  createMuiTheme,
  makeStyles,
  MuiThemeProvider,
} from "@material-ui/core";
import CssBaseline from "@material-ui/core/CssBaseline";
import { StylesProvider } from "@material-ui/styles";
import React, { useEffect, useState } from "react";
import { SkeletonTheme } from "react-loading-skeleton";
import { connect } from "react-redux";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import Api from "./api";
import ContentMaker from "./components/content-creator";
import Recorder from "./components/Recorder";
import GooglePicker from "./components/GooglePicker";
import WhiteBoard from "./components/WhiteBoard";
import store from "./components/redux/store";
import socket from "./components/socket.io";
import UserData from "./components/UserData";
import Class from "./containers/Class";
import Explore from "./containers/Explore";
import AnswerQuiz from "./screens/class/AnswerQuiz";
import Home from "./screens/Home";
import Chat, { VideoChat } from "./screens/Chat";
import Login from "./screens/Login";
import Posts from "./screens/class/Posts";
import Messages from "./components/Messages";
import { VideoCall } from "./components/dialogs";

const primaryColor = "#7539ff";
const secondaryColor = "#FFD026";

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
function App(props) {
  const [loading, setLoading] = useState(true);
  const [videocall, setVideocall] = useState({});
  const skeletonCustomTheme = {
    color: "rgba(215, 215, 215, 0.4)",
    highlightColor: "rgba(176,176,176,0.2)",
  };

  const theme = createMuiTheme({
    typography: {
      fontFamily: "'Work Sans', sans-serif",
    },
    overrides: {
      MuiCssBaseline: {
        "@global": {
          "::selection": {
            backgroundColor: primaryColor,
            color: "#fff",
          },
          ".react-loading-skeleton": {
            backgroundImage:
              "linear-gradient( 90deg,rgba(255, 255, 255, 0),rgba(255,255,255,0.14),rgba(65, 65, 65, 0) )!important",
          },
          ":focus": {
            outline: 0,
          },
          "#selected-option": {
            position: "relative",
            "&:before": {
              content: "''",
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: primaryColor,
              opacity: 0.2,
              zIndex: -1,
            },
          },
        },
      },
      MuiCard: {
        root: {
          "&.class-card-tag": {
            width: 225,
            position: "relative",
            "& .media": {
              height: 70,
            },
            "& .title-container": {
              position: "absolute",
              top: 10,
              left: 10,
            },
          },
        },
      },
      MuiTooltip: {
        tooltip: {
          fontSize: "1em",
          backgroundColor: "rgba(107, 43, 255, 0.72)",
          position: "relative",
        },
        tooltipPlacementRight: {
          "&::before": {
            content: "''",
            position: "absolute;",
            top: 7,
            left: -22,
            transform: "scaleX(1.3) scaleY(0.5) skewY(-40deg)",
            border: "10px solid transparent",
            borderRightColor: "rgba(107, 43, 255, 0.72)",
          },
        },
      },
      MuiAppBar: {
        root: {
          background:
            props.theme === "dark" ? "#1d1d1d!important" : "#fff!important",
          border:
            props.theme === "dark" ? "none" : "1px solid rgb(233, 228, 239)",
          borderRadius: 0,
          "& > div": {
            border: "none",
          },
        },
      },
      MuiTouchRipple: {
        child: {
          backgroundColor: primaryColor,
        },
      },
      MuiExpansionPanel: {
        root: {
          "&::before": {
            display: "none",
          },
        },
      },
      MuiDrawer: {
        paperAnchorDockedLeft: {
          borderRight: "none",
          boxShadow: "4px 0 3px rgba(143, 45, 253,0.1)!important",
        },
      },
      MuiOutlinedInput: {
        root: {
          paddingLeft: 10,
          border:
            "1px solid " +
            (props.theme === "dark" ? "rgba(255,255,255,0.22)" : "#E9E4EF"),
          backgroundColor:
            props.theme === "dark" ? "#1d1d1d!important" : "#EEE6FF!important",
          borderRadius: 4,
          "&:hover": {
            backgroundColor:
              props.theme === "dark"
                ? "#1d1d1d!important"
                : "#EEE6FF!important",
          },
          "&:focus": {
            backgroundColor:
              props.theme === "dark"
                ? "#1d1d1d!important"
                : "#EEE6FF!important",
          },
        },
      },
      MuiDivider: {
        root: {
          marginTop: 1,
        },
      },
      MuiAvatar: {
        root: {
          fontSize: "1em",
          zIndex: "10!important",
        },
      },
      MuiPaper: {
        root: {
          ...(props.theme === "dark" ? { backgroundColor: "#111" } : {}),
          "&:not(.MuiCard-root):not(.MuiAppBar-root):not(.MuiDialog-paper):not(.MuiAlert-root):not(.box-container)": {
            ...(props.theme === "dark"
              ? { backgroundColor: "#111" }
              : {
                  boxShadow: "0 2px 4px rgb(241, 230, 255)!important",
                  border: "1px solid rgb(233, 228, 239)",
                }),
            borderRadius: 4,
          },
        },
      },
      MuiToolbar: {
        regular: {
          minHeight: "51px!important",
          borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
        },
      },
      MuiListItem: {
        root: {
          "&:hover": {
            cursor: "pointer!important",
            ...(props.theme === "dark"
              ? { backgroundColor: "#111" }
              : { backgroundColor: "#fff" }),
          },
        },
      },
      MuiSelect: {
        root: {
          padding: 10,
        },
      },
      MuiButton: {
        contained: {
          boxShadow: "0 1px 10px 0 rgba(83, 28, 209, 0.34)",
        },
        root: {
          [defaultTheme.breakpoints.down("sm")]: {
            width: "100%",
            marginTop: 5,
            marginBottom: 5,
            whiteSpace: "nowrap",
          },
        },
      },
      MuiInputLabel: {
        animated: {
          transition:
            "color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms,transform 100ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
        },
        outlined: {
          "&.MuiInputLabel-shrink": {
            transform: "translate(0px, -20px) scale(0.9)",
            fontWeight: "bold",
            color: defaultTheme.palette.grey[800],
          },
        },
        root: {
          color: "#424242",
        },
      },
      MuiFormControl: {
        root: {
          "& fieldset": {
            display: "none",
          },
          "&.themed-input.select > div": {
            paddingTop: "9px!important",
            padding: 9,
          },
        },
      },
      MuiTextField: {
        root: {
          "&.themed-input": {
            borderRadius: 4,
            "& .MuiInputLabel-shrink": {
              transform: "translate(0px, -20px) scale(0.9)",
              fontWeight: "bold",
              color: defaultTheme.palette.grey[800],
            },
            "&:not(.no-margin)": {
              marginTop: defaultTheme.spacing(4),
            },
            "& fieldset": {
              display: "none",
            },
            "&.light .MuiInputLabel-shrink": {
              color: "#fff",
            },
            "&.date": {
              margin: 0,
              "& > div": {
                margin: 0,
                padding: 8,
                height: 56,
                backgroundColor:
                  props.theme === "dark"
                    ? "#1d1d1d!important"
                    : "#EEE6FF!important",
                "&::before,&::after": {
                  display: "none",
                },
              },
            },
          },
        },
      },
      MuiTypography: {
        root: {
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        },
      },
    },
    palette: {
      type: props.theme,
      primary: {
        main: primaryColor,
      },
      secondary: {
        main: secondaryColor,
      },
      grey:
        props.theme === "dark"
          ? {
              100: "#171717",
              200: "#191919",
              300: "#1e1e1e",
            }
          : {},
    },
  });
  useEffect(() => {
    Messages.subscribe((resp) => {
      store.dispatch({
        type: resp.type,
        data: resp.data,
      });
    });
    UserData.posts.subscribe((res) => {
      const { class_id, payload, action } = res;
      console.log(class_id, payload, action);
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
    // setLoading(false);
    Api.auth({
      success: async (user) => {
        socket.emit("online user", { ...user, status: "online" });
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
        await UserData.getUserData(user);
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
                    return <Login setLoading={(l) => setLoading(l)} />;
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
                  path="/class/:class_id/:schedule_id?/:option_name?/:room_name?"
                  component={Class}
                />
                <Route path="*">
                  <Redirect to="/" />
                </Route>
              </Switch>
            </BrowserRouter>
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
                          background: "url(/logo192.png) no-repeat",
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

const defaultTheme = createMuiTheme();

let mode = window.localStorage["mode"] ? window.localStorage["mode"] : "light";
mode = mode === "dark" || mode === "light" ? mode : "light";
store.dispatch({
  type: "SET_THEME",
  theme: mode,
});

export default connect((states) => ({ theme: states.theme }))(App);
