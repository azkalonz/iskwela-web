import React, { useEffect, useState } from "react";
import Login from "./screens/Login";
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

const primaryColor = "#6200ef";

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

async function getUserData() {
  let data = {};
  data.user = await Api.get("/api/student/classes");
  if (data.user.user_type === "s") {
    data.classes = data.user.classes;
  } else {
    data.classes = await Api.get("/api/teacher/classes");
  }

  data.classDetails = {};
  data.classSchedules = {};
  await asyncForEach(data.classes, async (c) => {
    data.classSchedules[c.id] = {};
    let classDetails = await Api.get(
      "/api/teacher/class/" + c.id + "?include=schedules,students"
    );
    let classSchedules = await Api.get(
      "/api/teacher/class-schedules/" + c.id + "?include=materials, activities"
    );
    classSchedules.forEach((sched) => {
      data.classSchedules[c.id][sched.from.replace(" ", "_")] = sched;
      data.classSchedules[c.id][sched.from.replace(" ", "_")].date = moment(
        sched.from
      ).format("LL");
      data.classSchedules[c.id][sched.from.replace(" ", "_")].time = moment(
        sched.from
      ).format("LT");
      data.classSchedules[c.id][sched.from.replace(" ", "_")].teacher_name =
        sched.teacher.first_name + " " + sched.teacher.last_name;
    });
    data.classDetails[c.id] = classDetails;
  });

  store.dispatch({
    type: "SET_CLASS_SCHEDULES",
    class_schedules: data.classSchedules,
  });
  store.dispatch({
    type: "SET_CLASS_DETAILS",
    class_details: data.classDetails,
  });
  store.dispatch({ type: "SET_CLASSES", classes: data.classes });
  store.dispatch({ type: "SET_USERINFO", user: data.user });
}

function App(props) {
  const styles = useStyles();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Api.auth({
      success: async () => {
        await getUserData();
        setLoading(false);
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
                  <Route exact path="/login">
                    <Login setLoading={(l) => setLoading(l)} />
                  </Route>

                  <Route exact path="/" component={Home} />
                  <Route path="/class/:id/:name" component={Class} />
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
                  <CircularProgress
                    color={mode === "dark" ? "white" : "primary"}
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

const defaultTheme = createMuiTheme();
let mode = window.localStorage["mode"] ? window.localStorage["mode"] : "light";
mode = mode === "dark" || mode === "lgiht" ? mode : "light";
store.dispatch({
  type: "SET_THEME",
  theme: mode,
});
const useStyles = makeStyles((theme) => ({
  root: {
    background: mode === "dark" ? "#222222" : theme.palette.grey[300],
  },
}));
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
        ...(mode === "dark" ? { backgroundColor: "#111" } : {}),
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
          ...(mode === "dark"
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
    type: mode,
    primary: {
      main: primaryColor,
    },
    grey:
      mode === "dark"
        ? {
            100: "#171717",
            200: "#191919",
            300: "#1e1e1e",
          }
        : {},
  },
});

const skeletonCustomTheme =
  mode === "dark"
    ? {
        color: "#474747",
        highlightColor: "#575757",
      }
    : {
        color: "#d9d9d9",
        highlightColor: "#e9e9e9",
      };

export default App;
