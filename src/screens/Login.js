import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Grid,
  Box,
  Typography,
  makeStyles,
  Container,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import actions from "../components/redux/actions";
import { useTranslation } from "react-i18next";
import logo from "../static/images/logo.png";

const dummyusers = require("./dummyusers.json");

function Login(props) {
  const history = useHistory();
  const { t } = useTranslation();
  const classes = useStyles();
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();

  useEffect(() => {
    if (localStorage["user"]) window.location = "/";
  }, []);

  const _handleLogin = (e) => {
    e.preventDefault();
    let user = dummyusers.find((u) => u.user_id === username);
    if (!user) return;
    let dummyresponse = {
      access_token:
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC90YWxpbmEubG9jYWw6ODA4MFwvYXBpXC9sb2dpbiIsImlhdCI6MTU4OTE5OTE4NSwiZXhwIjoxNTg5MjAyNzg1LCJuYmYiOjE1ODkxOTkxODUsImp0aSI6ImN2TVhWakdhNjRTT0x3NmkiLCJzdWIiOiJKREpWSkdELTdhbjZlbDUiLCJwcnYiOiIyM2JkNWM4OTQ5ZjYwMGFkYjM5ZTcwMWM0MDA4NzJkYjdhNTk3NmY3Iiwia2V5Ijo4fQ.V_9sTyiSHk5VuaIm6uy3cGzigvqDRBoL4Ek7SjR49Vg",
      token_type: "Bearer",
      expires_in: 3600,
    };
    user = { ...dummyresponse, ...user, isLoggedIn: true };
    props.setUserInfo(user);
    localStorage["user"] = JSON.stringify(user);
    window.location = "/";
    return false;
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      {!props.userInfo.isLoggedIn && (
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <div className={classes.paper}>
            <Avatar className={classes.avatar} alt="SH" src={logo} />
            {/* <Avatar className={classes.avatar}>
        <LockOutlinedIcon />
      </Avatar> */}
            <Typography component="h1" variant="h5">
              {t("common:login.title")}
            </Typography>
            <form className={classes.form} noValidate onSubmit={_handleLogin}>
              <TextField
                variant="outlined"
                onChange={(e) => setUsername(e.target.value)}
                margin="normal"
                required
                fullWidth
                id="email"
                label={t("common:login.idNumber")}
                name="email"
                autoComplete="email"
                autoFocus
              />
              <TextField
                variant="outlined"
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                fullWidth
                name="password"
                label={t("common:login.password")}
                value="123456"
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
        </Container>
      )}
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
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
