import React from "react";
import { BrowserRouter, Route, Redirect } from "react-router-dom";
import Login from "./screens/Login";
import Home from "./screens/Home";
import Class from "./containers/Class";
import {
  createMuiTheme,
  MuiThemeProvider,
  makeStyles,
} from "@material-ui/core/styles";
import { StylesProvider } from "@material-ui/styles";
import { SkeletonTheme } from "react-loading-skeleton";
import PrivateRoute from "./components/PrivateRoute";
import { Paper } from "@material-ui/core";

const defaultTheme = createMuiTheme();
const mode = window.localStorage["mode"]
  ? window.localStorage["mode"]
  : "light";
const useStyles = makeStyles((theme) => ({
  root: {
    background: mode === "dark" ? "#575757" : theme.palette.grey[300],
  },
}));
const theme = createMuiTheme({
  overrides: {
    MuiDivider: {
      root: {
        marginTop: 1,
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
      main: "#6200ef",
    },
    grey:
      mode === "dark"
        ? {
            100: "#424242",
            200: "#424242",
          }
        : {},
  },
});

const skeletonCustomTheme =
  mode === "dark"
    ? {
        color: "#787878",
        highlightColor: "#9f9f9f",
      }
    : {
        color: "#d9d9d9",
        highlightColor: "#e9e9e9",
      };

function App(props) {
  const styles = useStyles();
  return (
    <MuiThemeProvider theme={theme}>
      <StylesProvider>
        <SkeletonTheme {...skeletonCustomTheme}>
          <Paper
            className={[styles.root, "App"].join(" ")}
            style={{ overflow: "hidden" }}
          >
            <BrowserRouter>
              <Route exact path="/login" component={Login} />
              <PrivateRoute
                authed={localStorage["user"]}
                exact
                path="/"
                component={Home}
              />
              <PrivateRoute
                authed={localStorage["user"]}
                path="/class/:id/:name"
                component={Class}
              />
            </BrowserRouter>
          </Paper>
        </SkeletonTheme>
      </StylesProvider>
    </MuiThemeProvider>
  );
}

export default App;
