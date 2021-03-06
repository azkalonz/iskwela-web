import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import {
  Button,
  CssBaseline,
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Grid,
  Typography,
  makeStyles,
  Container,
  Box,
  useTheme,
  useMediaQuery,
  Snackbar,
} from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";
import actions from "../components/redux/actions";
import Api from "../api";
import { useTranslation } from "react-i18next";
import { styles } from "@material-ui/pickers/views/Calendar/Calendar";
import { _handleThemeType } from "../App";
import { ForgotPasswordDialog } from "../components/dialogs";

const queryString = require("query-string");
function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function Login(props) {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  useEffect(() => _handleThemeType("light"), []);
  return (
    <div className={classes.root} style={{ minHeight: "100vh" }}>
      {!props.userInfo.isLoggedIn && (
        <Box
          display="flex"
          width="100%"
          justifyContent="space-between"
          height="100vh"
          alignItems="stretch"
        >
          {!isMobile && (
            <Box flex={1} width="360" className={classes.loginLeftContent}>
              <Box className="lamp" />
              <Box className="media" />
              <Box className="student" />
              <Box className="logo" />
            </Box>
          )}
          <Box
            flex={1}
            width="55%"
            style={{
              background: !isMobile
                ? "#f9f5fe"
                : "radial-gradient(circle at center 30%, rgb(115, 53, 250), rgb(31, 9, 76))",
            }}
            display="flex"
            alignItems="center"
            justifyContent="center"
            className={isMobile ? classes.loginMobile : ""}
          >
            <Box className="lamp" />
            <Box className="media" />
            <Box className="student" />
            <Box width={!isMobile ? 360 : "80%"} maxWidth={435} minWidth={290}>
              <LoginContainer setLoading={props.setLoading} />
            </Box>
          </Box>
        </Box>
      )}
      <ForgotPasswordDialog
        open={props.location.hash === "#forgot-password"}
        onClose={() => props.history.push("#")}
      />
    </div>
  );
}

function LoginContainer(props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { t } = useTranslation();
  const classes = useStyles();
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const _handleLogin = async (e) => {
    props.setLoading(true);
    e.preventDefault();
    window.login_error = undefined;
    try {
      let res = await Api.post(
        "/api/login?username=" + username + "&password=" + password
      );
      if (!res.error) {
        let redirect_url = queryString.parse(window.location.search).r;
        localStorage["auth"] = JSON.stringify(res);
        if (res?.change_password_required) {
          window.localStorage["first_loggon_pass"] = password;
        } else {
          window.localStorage.removeItem("first_loggon_pass");
        }
        window.location = redirect_url ? redirect_url : "/";
        return;
      } else {
        window.login_error =
          "Your username or password is incorrect. Please try again.";
      }
    } catch (e) {
      window.login_error =
        "Your username or password is incorrect. Please try again.";
    }
    props.setLoading(false);
  };
  return (
    <React.Fragment>
      <Box width="100%" display="flex" justifyContent="center" marginBottom={2}>
        {isMobile && <img src="/logo/logo-single.svg" width={60} />}
      </Box>
      <Typography
        style={{
          fontWeight: "bold",
          color: !isMobile ? theme.palette.grey[800] : "#fff",
          fontSize: isMobile ? "1.8rem" : "2rem",
          textAlign: isMobile ? "center" : "left",
          zIndex: 2,
          position: "relative",
        }}
      >
        Sign in to iSkwela
      </Typography>
      <br />
      {window.login_error && (
        <Snackbar
          open={true}
          autoHideDuration={6000}
          id="error"
          onClose={() =>
            (document.querySelector("#error").style.display = "none")
          }
        >
          <Alert severity="error" style={{ margin: "30px 0" }}>
            {/* {window.login_error} */}
            Invalid Username or Password
          </Alert>
        </Snackbar>
      )}
      <form action="#" onSubmit={() => false}>
        <TextField
          variant="outlined"
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(event, value) => {
            if (event.keyCode == 13) _handleLogin(event);
          }}
          margin="normal"
          fullWidth
          className={!isMobile ? "themed-input" : "themed-input light"}
          id="email"
          label="Username"
          name="email"
          autoComplete="email"
          autoFocus
        />
        <TextField
          variant="outlined"
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          onKeyDown={(event, value) => {
            if (event.keyCode == 13) _handleLogin(event);
          }}
          fullWidth
          className={!isMobile ? "themed-input" : "themed-input light"}
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
        />
      </form>
      <Typography variant="body2" align="right">
        <Link
          href="#forgot-password"
          style={{ color: isMobile ? "#fff" : theme.palette.primary.main }}
        >
          Forgot Password?
        </Link>
      </Typography>
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="secondary"
        style={{ fontWeight: "bold", boxShadow: "none", height: 56 }}
        onClick={_handleLogin}
        className={classes.submit}
      >
        Sign In
      </Button>
    </React.Fragment>
  );
}

const useStyles = makeStyles((theme) => ({
  loginLeftContent: {
    background:
      "radial-gradient(circle at center 30%, rgb(115, 53, 250), rgb(31, 9, 76))",
    position: "relative",
    "& > div": {
      position: "absolute",
    },
    "& .student": {
      width: "70%",
      height: "100%",
      background: "url(/login/student.svg) no-repeat center",
      marginTop: "15%",
      backgroundSize: "100% auto",
      right: "5%",
      animation: `$myEffect 20s ease-in-out infinite`,
      animationDirection: "alternate-reverse",
    },
    "& .media": {
      width: "35%",
      animation: `$myEffect 20s ease-in-out infinite`,
      animationDirection: "alternate",
      height: "100%",
      background: "url(/login/media.svg) no-repeat center",
      // backgroundPosition: "0 50%",
      backgroundSize: "100% auto",
      left: "15%",
    },
    "& .lamp": {
      width: "100%",
      height: "30%",
      background: "url(/login/lamp.svg) no-repeat bottom center",
      backgroundSize: "10% auto",
      animation: `$lamp 4s cubic-bezier(0.61, 0, 0.31, 1.01) infinite`,
      animationDirection: "alternate",
      left: 0,
      right: 0,
      top: 0,
    },
    "& .logo": {
      width: "20%",
      height: "20%",
      background: "url(/logo/logo-full.svg) no-repeat center",
      backgroundSize: "100% auto",
      left: "10%",
      top: 0,
    },
  },
  loginMobile: {
    overflowX: "hidden",
    overflowY: "auto",
    position: "relative",
    "& .student,& .media, & .lamp": {
      position: "absolute",
      pointerEvents: "none",
      zIndex: 1,
      display: "none",
    },
    "& .student": {
      height: "100%",
      width: 255,
      minHeight: 630,
      bottom: 0,
      top: 0,
      right: -50,
      background: "url(/login/student.svg) no-repeat",
      backgroundSize: "100% auto",
      display: "none",
      backgroundPosition: "0 95%",
    },
    "& .media": {
      height: "100%",
      width: 130,
      minHeight: 630,
      bottom: 0,
      top: 0,
      left: 0,
      background: "url(/login/media.svg) no-repeat",
      backgroundSize: "100% auto",
      display: "none",
      backgroundPosition: "0 70%",
    },
    "& .lamp": {
      height: "35%",
      top: 0,
      left: 0,
      right: 0,
      background: "url(/login/lamp.svg) no-repeat",
      backgroundPosition: "80% 100%",
      backgroundSize: "50px auto",
      // backgroundPosition: "0 70%",
    },
  },
  character: {
    [theme.breakpoints.down("sm")]: {
      right: -100,
      bottom: -230,
      "& img": {
        width: 270,
      },
    },
    position: "absolute",
    bottom: -150,
    right: -300,
    display: "flex",
    pointerEvents: "none",
    alignItems: "flex-end",
  },
  balloon: {
    position: "absolute",
    left: -70,
    top: 100,
    transformOrigin: "top",
    animation: `$myEffect 10s linear infinite`,
    animationDirection: "alternate-reverse",
  },
  "@keyframes myEffect": {
    "0%": {
      transform: "rotate(-7deg) translateX(40px) translateY(-20px)",
    },
    "100%": {
      transform: "rotate(0) translateX(0) translateY(0)",
    },
  },
  "@keyframes lamp": {
    "0%": {
      transform: "rotate(3deg)",
    },
    "100%": {
      transform: "rotate(-3deg)",
    },
  },
  clouds: {
    [theme.breakpoints.down("sm")]: {
      right: 0,
      left: 40,
      top: -160,
    },
    left: -100,
    position: "absolute",
    top: -70,
    right: -150,
    display: "flex",
    pointerEvents: "none",
    justifyContent: "space-between",
    alignItems: "flex-start",
    "& > img:last-of-type": {
      position: "absolute",
      left: -130,
      top: 30,
    },
  },
  land: {
    height: 200,
    zIndex: 1,
    position: "absolute",
    display: "flex",
    alignItems: "flex-end",
    bottom: 0,
    left: 0,
    right: 0,
  },
  container: {
    background: theme.palette.type === "dark" ? "#222" : "#fff",
    padding: 30,
    position: "relative",
    zIndex: 10,
  },
  root: {
    display: "flex",
    alignItems: "center",
    background: theme.palette.primary.main,
    backgroundSize: "contain",
    position: "relative",
  },
  paper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    backgroundColor: theme.palette.secondary.main,
    height: theme.spacing(8),
    margin: theme.spacing(1),
    width: theme.spacing(8),
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    "&:hover": {
      backgroundColor: "#FFDA53!important",
      boxShadow: "0 5px 10px 0 rgba(0,0,0,0.10)!important",
      borderRadius: 6,
    },
  },
}));

export default connect(
  (states) => ({
    userInfo: states.userInfo,
  }),
  actions
)(Login);
