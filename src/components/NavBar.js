import React, { useState } from "react";
import {
  makeStyles,
  AppBar,
  Avatar,
  Toolbar,
  CircularProgress,
  Button,
  Typography,
  IconButton,
  MenuItem,
  Dialog,
  Snackbar,
  DialogContent,
  DialogTitle,
  Menu,
  Box,
  DialogActions,
  Input,
  TextField,
} from "@material-ui/core";
import AccountCircle from "@material-ui/icons/AccountCircle";
import { connect } from "react-redux";
import actions from "./redux/actions";
import { useHistory } from "react-router-dom";
import Brightness6Icon from "@material-ui/icons/Brightness6";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import FileUpload, { stageFiles } from "./FileUpload";
import CloseIcon from "@material-ui/icons/Close";
import Form from "./Form";
import Api from "../api";
import MuiAlert from "@material-ui/lab/Alert";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    position: "sticky",
    top: 0,
    right: 0,
    zIndex: 10,
    left: 0,
  },
  appbar: {
    background: theme.palette.grey[200],
    boxShadow: "none",
  },
  title: {
    flexGrow: 1,
  },
}));

function NavBar(props) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const history = useHistory();
  const [changeProfileDialog, setChangeProfileDialog] = useState(false);
  const [changePassDialog, setchangePassDialog] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    localStorage.removeItem("auth");
    window.location = "/login";
  };
  const _handleThemeType = () => {
    let mode = window.localStorage["mode"];
    if (mode) mode = mode === "dark" ? "light" : "dark";
    else mode = "dark";
    window.localStorage["mode"] = mode;
    window.location.reload();
  };
  return (
    <div className={classes.root}>
      <ProfilePicDialog
        open={changeProfileDialog}
        onClose={() => setChangeProfileDialog(false)}
        userInfo={props.userInfo}
      />
      <ChangePasswordDialog
        open={changePassDialog}
        onClose={() => setchangePassDialog(false)}
        userInfo={props.userInfo}
      />
      <AppBar position="static" className={classes.appbar}>
        <Toolbar>
          {props.left}
          <Typography
            variant="body1"
            color="textPrimary"
            className={classes.title}
            style={{ fontWeight: "bold" }}
            id="navbar-title"
          >
            {props.title || ""}
          </Typography>
          {props.right}
          {!props.right && (
            <div>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={() => setChangeProfileDialog(true)}
              >
                <Avatar
                  style={{ height: 25, width: 25 }}
                  alt={props.userInfo.first_name}
                  src={props.userInfo.preferences.profile_picture}
                />
              </IconButton>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
              >
                <ArrowDropDownIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={open}
                onClose={handleClose}
              >
                <MenuItem onClick={() => setchangePassDialog(true)}>
                  Settings
                </MenuItem>
                <MenuItem onClick={_handleThemeType}>
                  Dark mode {props.theme !== "dark" ? "ON" : "OFF"}
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar>
    </div>
  );
}

const ChangePasswordDialog = React.memo(function (props) {
  const [form, setForm] = useState({
    username: props.userInfo.username,
  });
  const [errors, setErrors] = useState();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const _handleChangePass = async () => {
    setErrors(false);
    if (!form.current_password) {
      setErrors(["Enter your current password."]);
      return;
    } else if (!form.password) {
      setErrors(["Enter new password."]);
      return;
    } else if (form.password !== form.confirm_password) {
      setErrors(["New password must be a match."]);
      return;
    }
    setSaving(true);
    await Api.auth();
    let req = await new Form(form).send("/api/user/change-password");
    if (!req.errors) {
      if (req.error) {
        setErrors(["Invalid password."]);
      } else {
        setSuccess(true);
      }
    } else {
      let err = [];
      for (let e in req.errors) {
        err.push(req.errors[e][0]);
      }
      setErrors(err);
    }

    setSaving(false);
  };

  return (
    <Dialog
      onClose={() => {
        if (saving) return;
        setErrors(null);
        setForm({
          username: props.userInfo.username,
        });
        props.onClose();
      }}
      open={props.open}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Change Password</DialogTitle>
      <DialogContent>
        {errors &&
          errors.map((e, i) => (
            <Alert key={i} style={{ marginBottom: 9 }} severity="error">
              {e}
            </Alert>
          ))}
        <Box width="100%">
          <TextField
            label="Username"
            value={props.userInfo.username}
            fullWidth
          />
          <TextField
            label="Current Password"
            onChange={(e) =>
              setForm({ ...form, current_password: e.target.value })
            }
            type="password"
            fullWidth
          />
          <TextField
            label="New Password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            fullWidth
            type="password"
          />
          <TextField
            label="Confirm New Password"
            onChange={(e) =>
              setForm({ ...form, confirm_password: e.target.value })
            }
            fullWidth
            type="password"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button disabled={saving ? true : false}>Cancel</Button>
        <Button onClick={_handleChangePass} disabled={saving ? true : false}>
          Save
        </Button>
      </DialogActions>
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert onClose={() => setSuccess(false)} severity="success">
          Success
        </Alert>
      </Snackbar>
    </Dialog>
  );
});

const ProfilePicDialog = React.memo(function (props) {
  const [preview, setPreview] = useState();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState();

  const _handleUpload = async () => {
    let file = document.querySelector("#profile-pic-upload");
    if (!file.files.length) return;
    setSaving(true);
    setErrors(false);
    try {
      let body = new FormData();
      body.append("profile_picture", file.files[0]);
      let res = await FileUpload.upload("/api/upload/user/profile-picture", {
        body,
      });

      if (!res.errors) {
        console.log(res);
      } else {
        let err = [];
        for (let e in res.errors) {
          err.push(res.errors[e][0]);
        }
        setErrors(err);
      }
    } catch (e) {
      setErrors(["Invalid file type."]);
    }
    setSaving(false);
  };
  return (
    <Dialog
      open={props.open}
      onClose={() => {
        if (!saving) {
          setPreview(false);
          props.onClose();
          setErrors(false);
        }
      }}
    >
      <DialogTitle>Change Profile</DialogTitle>
      <DialogContent>
        {errors &&
          errors.map((e, i) => (
            <Alert key={i} style={{ marginBottom: 9 }} severity="error">
              {e}
            </Alert>
          ))}
        <div style={{ position: "relative" }}>
          {preview && (
            <div
              style={{ position: "absolute", right: 30, top: 10, zIndex: 2 }}
            >
              <IconButton onClick={() => setPreview(null)}>
                <CloseIcon />
              </IconButton>
            </div>
          )}
          {saving && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bottom: 0,
                background: "rgba(255, 255, 255, 0.7)",
                zIndex: 10,
              }}
            >
              <CircularProgress />
            </div>
          )}
          <Avatar
            alt={props.userInfo.first_name}
            con
            id="preview"
            src={preview ? preview : props.userInfo.preferences.profile_picture}
            style={{ width: 500, height: 500 }}
            variant="square"
          />
        </div>
      </DialogContent>
      <DialogActions>
        <input
          accept="image/x-png,image/gif,image/jpeg"
          id="profile-pic-upload"
          type="file"
          style={{ display: "none" }}
          onChange={(e) => {
            if (document.querySelector("#profile-pic-upload").files[0]) {
              stageFiles(
                "pic",
                document.querySelector("#profile-pic-upload").files
              );
              let r = new FileReader();
              r.onload = (p) => setPreview(p.target.result);
              r.readAsDataURL(
                document.querySelector("#profile-pic-upload").files[0]
              );
            }
          }}
        />
        <Button
          color="primary"
          onClick={() => document.querySelector("#profile-pic-upload").click()}
          disabled={saving ? true : false}
        >
          Upload
        </Button>
        <Button onClick={_handleUpload} disabled={saving ? true : false}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default connect(
  (states) => ({
    route: states.route,
    theme: states.theme,
    userInfo: states.userInfo,
  }),
  actions
)(NavBar);
