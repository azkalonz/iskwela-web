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
  Box,
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
      window.login_error = "Server error";
    }
    props.setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      {!props.userInfo.isLoggedIn && (
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <div className={classes.paper}>
            <Typography component="h1" variant="h5">
              iSkwela
            </Typography>

            <form className={classes.form} noValidate onSubmit={_handleLogin}>
              {window.login_error && (
                <Alert severity="error">{window.login_error}</Alert>
              )}
              <TextField
                variant="outlined"
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
                variant="outlined"
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
