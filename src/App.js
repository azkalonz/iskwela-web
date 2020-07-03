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
import GooglePicker from "./components/GooglePicker";
import store from "./components/redux/store";
import socket from "./components/socket.io";
import UserData from "./components/UserData";
import Class from "./containers/Class";
import AnswerQuiz from "./screens/class/AnswerQuiz";
import Home from "./screens/Home";
import Login from "./screens/Login";
import Posts from "./screens/class/Posts";

const primaryColor = "#7539ff";
const secondaryColor = "#ffd000";

function App(props) {
  const [loading, setLoading] = useState(true);
  const skeletonCustomTheme = {
    color: "rgba(215, 215, 215, 0.4)",
    highlightColor: "rgba(176,176,176,0.2)",
  };

  const theme = createMuiTheme({
    typography: {
      fontFamily: '"NotoSansJP-Black", Helvetica, Arial, serif',
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
          background: "#fff!important",
          boxShadow: "0 -4px 17px rgba(143, 45, 253,0.2)!important",
          "& > div": {
            border: "none",
          },
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
          backgroundColor: "#efe7ff!important",
          borderRadius: 4,
          "&:hover": {
            backgroundColor: "#efe7ff!important",
          },
          "&:focus": {
            backgroundColor: "#efe7ff!important",
          },
        },
      },
      MuiDivider: {
        root: {
          marginTop: 1,
        },
      },
      MuiPaper: {
        root: {
          ...(props.theme === "dark" ? { backgroundColor: "#111" } : {}),
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
        root: {
          [defaultTheme.breakpoints.down("sm")]: {
            width: "100%",
            marginTop: 5,
            marginBottom: 5,
            whiteSpace: "nowrap",
          },
        },
      },

      MuiTextField: {
        root: {
          "&.no-legend": {
            border: "1px solid #c9b8eb",
            borderRadius: 4,
            marginTop: defaultTheme.spacing(4),
            "& fieldset": {
              display: "none",
            },
            "& .MuiInputLabel-outlined.MuiInputLabel-shrink": {
              transform: "translate(0px, -20px) scale(0.9)",
              fontWeight: "bold",
              color: defaultTheme.palette.grey[800],
            },
            "&.light .MuiInputLabel-outlined.MuiInputLabel-shrink": {
              color: "#fff",
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
      console.log(questionnaires);
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
          {!loading && (
            <BrowserRouter>
              <Switch>
                <Route exact path="/" component={Home} />
                <Route exact path="/post" component={Posts} />
                <Route exact path="/login">
                  <Login setLoading={(l) => setLoading(l)} />
                </Route>
                <Route exact path="/answer/:quiz_id?" component={AnswerQuiz} />
                <Route exact path="/content-maker" component={ContentMaker} />
                <Route exact path="/picker" component={GooglePicker} />
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
                    background:
                      "url(/logo/logo-full-colored.svg) no-repeat left",
                    marginBottom: -65,
                    backgroundSize: 200,
                    width: 50,
                    height: 100,
                  }}
                />
                <img src="/login/loader.svg" width={130} />
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
