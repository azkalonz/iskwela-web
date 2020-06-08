import React, { useState } from "react";
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
} from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";
import actions from "../components/redux/actions";
import Api from "../api";
import { useTranslation } from "react-i18next";

const queryString = require("query-string");
function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function Login(props) {
  const classes = useStyles();
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const { t } = useTranslation();

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
        window.location = redirect_url ? redirect_url : "/";
        return;
      } else {
        window.login_error = "Invalid username/password";
      }
    } catch (e) {
      window.login_error = "Invalid username/password";
    }
    props.setLoading(false);
  };

  return (
    <div className={classes.root} style={{ minHeight: "100vh" }}>
      {!props.userInfo.isLoggedIn && (
        <Container component="main" maxWidth="xs" className={classes.container}>
          <CssBaseline />
          <div className={classes.paper}>
            <Typography component="h1" variant="h5">
              iSkwela
            </Typography>

            <form className={classes.form} noValidate onSubmit={_handleLogin}>
              {window.login_error && (
                <Alert severity="error" style={{ margin: "30px 0" }}>
                  {window.login_error}
                </Alert>
              )}
              <TextField
                variant="filled"
                onChange={(e) => setUsername(e.target.value)}
                margin="normal"
                required
                fullWidth
                id="email"
                label="Username"
                name="email"
                autoComplete="email"
                autoFocus
              />
              <TextField
                variant="filled"
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
              />

              <Grid container alignItems="center">
                <Grid item xs>
                  <FormControlLabel
                    control={<Checkbox value="remember" color="primary" />}
                    label={t("common:login.rememberMe")}
                  />
                </Grid>
                <Grid item>
                  <Link
                    href="#"
                    variant="body2"
                    style={{ fontStyle: "italic", color: "gray" }}
                  >
                    {t("common:login.forgotPassword")}
                  </Link>
                </Grid>
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
              >
                {t("common:login.signIn")}
              </Button>
            </form>
          </div>
          <div className={classes.clouds}>
            <img src="/login/cloud1.png" width={320} />
            <img src="/login/cloud2.png" width={320} />
            <div class={classes.balloon}>
              <img src="/login/balloon.png" width={100} />
            </div>
          </div>
          <div className={classes.character}>
            <img src="/login/boy2.png" width={320} />
          </div>
        </Container>
      )}
      <div className={classes.land}>
        <img src="/login/land.png" width="100%" />
      </div>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
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
    animation: `$myEffect 10s linear infinite`,
    transformOrigin: "top",
    animationDirection: "alternate-reverse",
  },
  "@keyframes myEffect": {
    "0%": {
      transform: "rotate(-15deg) translateX(40px) translateY(-20px)",
    },
    "100%": {
      transform: "rotate(15deg) translateX(20px) translateY(10px)",
    },
  },
  clouds: {
    left: -150,
    position: "absolute",
    top: -100,
    right: -150,
    display: "flex",
    pointerEvents: "none",
    justifyContent: "space-between",
    alignItems: "flex-start",
    "& > img:last-of-type": {
      [theme.breakpoints.down("sm")]: {
        position: "relative",
        top: "initial",
        left: "initial",
      },
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
    background: "#fff",
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
  },
}));

export default connect(
  (states) => ({
    userInfo: states.userInfo,
  }),
  actions
)(Login);
