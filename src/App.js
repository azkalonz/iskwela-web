import React, { useEffect, useState } from "react";
import Login from "./screens/Login";
import Class from "./containers/Class";
import Quiz from "./containers/Quiz";
import Home from "./screens/Home";
import AnswerQuiz from "./screens/class/AnswerQuiz";

import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import {
  createMuiTheme,
  MuiThemeProvider,
  CircularProgress,
  Box,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { StylesProvider } from "@material-ui/styles";
import { SkeletonTheme } from "react-loading-skeleton";
import Api from "./api";
import store from "./components/redux/store";
import CssBaseline from "@material-ui/core/CssBaseline";
import UserData from "./components/UserData";
import socket from "./components/socket.io";
import GooglePicker from "./components/GooglePicker";
import ContentMaker from "./components/content-creator";
import { connect } from "react-redux";

const primaryColor = "#7539ff";
const secondaryColor = "#ffd000";

function App(props) {
  const useStyles = makeStyles((theme) => ({
    root: {
      background: props.theme === "dark" ? "#222222" : "#fff",
    },
  }));
  const [loading, setLoading] = useState(true);
  const skeletonCustomTheme =
    props.theme === "dark"
      ? {
          color: "#4747471a",
          highlightColor: "#5757571a",
        }
      : {
          color: "#d9d9d91a",
          highlightColor: "#e9e9e91a",
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
          ":focus": {
            outline: 0,
          },
          // ".MuiBackdrop-root": {
          //   backgroundColor: "rgba(117, 57, 255, 0.6)",
          // },
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
      MuiFilledInput: {
        root: {
          backgroundColor: "rgba(0, 0, 0, 0.03)",
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
          [defaultTheme.breakpoints.down("xs")]: {
            width: "100%",
            marginTop: 5,
            marginBottom: 5,
            whiteSpace: "nowrap",
          },
        },
      },
      MuiInputBase: {
        input: {
          paddingLeft: 10,
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
    window.localStorage.removeItem("greeted");
    socket.on("get class details", (c) => {
      if (store.getState().classes[c.id]) {
        UserData.updateClassDetails(c.id, c.details);
        UserData.updateClass(c.id, c.details[c.id]);
      }
    });
    socket.on("get quiz", (q) => {
      let quizzes = [...store.getState().quizzes];
      let quizIndex = quizzes.findIndex((qq) => q.id === qq.id);
      if (quizIndex >= 0) {
        quizzes.splice(quizIndex, 1, q);
      } else {
        quizzes.push(q);
      }
      console.log(quizzes);
      store.dispatch({
        type: "SET_QUIZZES",
        quizzes,
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
                <Route exact path="/login">
                  <Login setLoading={(l) => setLoading(l)} />
                </Route>
                <Route exact path="/answer/:quiz_id?" component={AnswerQuiz} />
                <Route
                  exact
                  path="/quiz/:subject_id?/:quiz_id?"
                  component={Quiz}
                />
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
              <Box p={2}>
                <img src="/login/loader.svg" width={200} />
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
