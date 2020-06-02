import React, { useEffect, useState } from "react";
import Login from "./screens/Login";
import Blank from "./containers/Blank";
import Class from "./containers/Class";
import Home from "./screens/Home";

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
import { Paper } from "@material-ui/core";
import Api from "./api";
import store from "./components/redux/store";
import moment from "moment";
import CssBaseline from "@material-ui/core/CssBaseline";
import UserData from "./components/UserData";
import socket from "./components/socket.io";
import GooglePicker from "./components/GooglePicker";
import { connect } from "react-redux";

const primaryColor = "#6200ef";

function App(props) {
  const useStyles = makeStyles((theme) => ({
    root: {
      background: props.theme === "dark" ? "#222222" : theme.palette.grey[300],
    },
  }));
  const styles = useStyles();
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const skeletonCustomTheme =
    props.theme === "dark"
      ? {
          color: "#474747",
          highlightColor: "#575757",
        }
      : {
          color: "#d9d9d9",
          highlightColor: "#e9e9e9",
        };
  const theme = createMuiTheme({
    overrides: {
      MuiCssBaseline: {
        "@global": {
          "::selection": {
            backgroundColor: primaryColor,
            color: "#fff",
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
    socket.on("get schedule details", (c) => {
      console.log("aaaaah", c);
      if (store.getState().classes[c.id]) {
        UserData.addClassSchedule(c.id, c.details);
      }
    });
    Api.auth({
      success: async (user) => {
        await UserData.getUserData(user, setLoadingProgress);
        setLoadingProgress(100);
        setTimeout(() => {
          setLoading(false);
        }, 500);
      },
      fail: () => {
        if (window.location.pathname === "/login") setLoading(false);
      },
    });
  }, []);
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <StylesProvider>
        <SkeletonTheme {...skeletonCustomTheme}>
          <Paper
            className={[styles.root, "App"].join(" ")}
            style={{ overflow: "hidden" }}
          >
            {!loading && (
              <BrowserRouter>
                <Switch>
                  <Route exact path="/picker" component={GooglePicker} />
                  <Route exact path="/login">
                    <Login setLoading={(l) => setLoading(l)} />
                  </Route>

                  <Route exact path="/" component={Home} />
                  <Route
                    path="/class/:class_id/:schedule_id/:option_name/:room_name"
                    component={Class}
                  />

                  <Route
                    path="/class/:class_id/:schedule_id/:option_name"
                    component={Class}
                  />
                  <Route
                    path="/class/:class_id/:schedule_id"
                    component={Class}
                  />
                  <Route path="/class/:class_id" component={Class} />
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
                  <CircularProgressWithLabel
                    value={loadingProgress}
                    variant="static"
                    color={props.theme === "dark" ? "white" : "primary"}
                  />
                </Box>
                <Typography variant="h5">iSkwela</Typography>
              </Box>
            )}
          </Paper>
        </SkeletonTheme>
      </StylesProvider>
    </MuiThemeProvider>
  );
}

function CircularProgressWithLabel(props) {
  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress variant="static" {...props} />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography
          variant="caption"
          component="div"
          color="textSecondary"
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
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
