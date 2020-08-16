import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Grow,
  Icon,
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  Snackbar,
  Switch,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  ExpansionPanel,
  ExpansionPanelSummary,
  List,
  ExpansionPanelDetails,
  ListItemAvatar,
  ListItemText,
  ListItem,
} from "@material-ui/core";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import CloseIcon from "@material-ui/icons/Close";
import MuiAlert from "@material-ui/lab/Alert";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import Api from "../api";
import { pageState, setTitle, _handleThemeType } from "../App";
import { DialogTitle } from "../components/dialogs";
import FileUpload, { stageFiles } from "./FileUpload";
import Form from "./Form";
import Messages, { RecentMessages } from "./Messages";
import actions from "./redux/actions";
import UserData from "./UserData";

const styles = (theme) => ({
  root: {
    margin: 0,
    position: "relative",
    zIndex: 10,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});
function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    top: 0,
    right: 0,
    zIndex: 15,
    maxHeight: 51,
    left: 0,
  },
  title: {
    flexGrow: 1,
    fontWeight: 600,
    opacity: 0.65,
    fontSize: "18px",
  },
}));

function NavBar(props) {
  const [notSeen, setNotSeen] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const history = useHistory();
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [locked, setLocked] = useState(false);
  const [messageAnchor, setMessageAnchor] = useState(null);
  const [changeProfileDialog, setChangeProfileDialog] = useState(false);
  const [changePassDialog, setchangePassDialog] = useState(false);
  const [pageTitle, setPageTitle] = useState([]);
  const [meetingDialog, setMeetingDialog] = useState(false);
  const meeting = {
    join: () => {
      let id = document.querySelector("#room-name");
      window.open(
        "https://meet.jit.si/" + id.value.replace(" ", "-"),
        "_blank"
      );
      setMeetingDialog(false);
    },
    close: () => setMeetingDialog(false),
  };
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
  useEffect(() => {
    Messages.getRecentMessages(props.userInfo);
    if (!!window.localStorage["first_loggon_pass"]) {
      setchangePassDialog(true);
      setLocked(true);
    }
  }, []);
  useEffect(() => {
    if (notSeen > 0) {
      window.clearInterval(window.newmessage);
      window.newmessage = setInterval(() => {
        if (new Date().getSeconds() % 2)
          setTitle(`(${notSeen}) New Message`, "iSkwela", false);
        else setTitle(pageState.subtitles, "iSkwela", false);
      }, 1000);
    } else {
      window.clearInterval(window.notfocused);
      window.notfocused = setInterval(() => {
        if (document.hasFocus()) {
          window.clearInterval(window.newmessage);
          setTitle(pageState.subtitles, "iSkwela", false);
          window.clearInterval(window.notfocused);
        }
      }, 100);
    }
  }, [notSeen]);
  return (
    <div className={[classes.root, "sticky"].join(" ")} id="nav-bar">
      <Dialog open={meetingDialog} onClose={meeting.close}>
        <DialogTitle onClose={meeting.close}>Start a meeting</DialogTitle>
        <DialogContent>
          <TextField
            variant="outlined"
            fullWidth
            id="room-name"
            className="themed-input"
            fullWidth
            type="text"
            label="Meeting ID"
            style={{ marginTop: 15 }}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" onClick={meeting.join}>
            Join
            <Icon style={{ marginLeft: 7 }}>videocam</Icon>
          </Button>
        </DialogActions>
      </Dialog>
      <ProfilePicDialog
        open={changeProfileDialog}
        onClose={() => setChangeProfileDialog(false)}
        userInfo={props.userInfo}
      />
      <ChangePasswordDialog
        open={changePassDialog || locked}
        passChanged={() => {
          setLocked(false);
          setchangePassDialog(false);
        }}
        onClose={() => setchangePassDialog(false)}
        userInfo={props.userInfo}
      />
      <AppBar position="static" className="shadowed" style={props.style}>
        <Toolbar>
          {props.left}
          <Typography
            variant="body1"
            color="textPrimary"
            className={classes.title}
            id="navbar-title"
          >
            {props.title || ""}
          </Typography>
          {props.right}
          {!props.right && (
            <Box display="flex" alignItems="center">
              <RecentMessages
                anchor={messageAnchor}
                onClose={() => setMessageAnchor(null)}
                onNotSeen={(n) => setNotSeen(n)}
              />
              <IconButton
                onClick={(e) => setMessageAnchor(e.currentTarget)}
                color={notSeen ? "primary" : "default"}
              >
                <Badge
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  badgeContent={notSeen}
                  color="error"
                >
                  <Icon>message</Icon>
                </Badge>
              </IconButton>
              <ButtonGroup>
                <Button
                  style={{ textTransform: "none" }}
                  onClick={() => setChangeProfileDialog(true)}
                  variant="text"
                >
                  <Avatar
                    style={{ height: 28, width: 28, marginRight: 7 }}
                    alt={props.userInfo.first_name}
                    src={props.userInfo.preferences.profile_picture}
                  />
                  {!isMobile && (
                    <Typography
                      style={{
                        fontWeight: 400,
                        fontSize: "12px",
                        letterSpacing: "0.3px",
                        maxWidth: 150,
                      }}
                    >
                      {props.userInfo.first_name +
                        " " +
                        props.userInfo.last_name}
                    </Typography>
                  )}
                </Button>
                <Button
                  style={{ paddingLeft: 0, paddingRight: 5, border: "none" }}
                  onClick={handleMenu}
                >
                  <ArrowDropDownIcon />
                </Button>
              </ButtonGroup>
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
                {props.parentData?.childInfo && (
                  <ExpansionPanel style={{ maxWidth: 280 }}>
                    <ExpansionPanelSummary>
                      Viewing as {props.parentData?.childInfo?.first_name}
                      <Icon>expand_more</Icon>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails style={{ padding: 0 }}>
                      {props.parentData?.children.length ? (
                        <List style={{ width: "100%" }}>
                          {props.parentData.children.map((child, index) => {
                            const {
                              first_name,
                              last_name,
                              id,
                              preferences,
                            } = child.childInfo;
                            return (
                              <ListItem
                                selected={props.parentData.childInfo?.id === id}
                                divider
                                onClick={() => {
                                  window.location = window.location.search.replaceUrlParam(
                                    "userId",
                                    id
                                  );
                                }}
                                key={index}
                              >
                                <ListItemAvatar>
                                  <Avatar
                                    src={preferences?.profile_picture}
                                    alt={first_name}
                                  />
                                </ListItemAvatar>
                                <ListItemText
                                  primary={first_name + " " + last_name}
                                />
                              </ListItem>
                            );
                          })}
                        </List>
                      ) : (
                        <Typography variant="body1" color="textSecondary">
                          No children
                        </Typography>
                      )}
                    </ExpansionPanelDetails>
                  </ExpansionPanel>
                )}
                {props.userInfo.user_type === "t" && (
                  <MenuItem>
                    <Box onClick={() => setMeetingDialog(true)}>
                      Start a Meeting
                    </Box>
                  </MenuItem>
                )}
                <MenuItem onClick={() => setchangePassDialog(true)}>
                  Preferences
                </MenuItem>
                <MenuItem onClick={() => _handleThemeType()}>
                  Dark mode
                  <Switch
                    checked={props.theme === "dark"}
                    name="checkedA"
                    inputProps={{ "aria-label": "secondary checkbox" }}
                  />
                </MenuItem>
                <MenuItem
                  onClick={() =>
                    window.open("https://tinyurl.com/iSkwelaReport", "_blank")
                  }
                >
                  Report a Problem
                </MenuItem>
                <MenuItem
                  onClick={() =>
                    window.open(
                      "https://www.facebook.com/groups/1161662237559709",
                      "_blank"
                    )
                  }
                >
                  FB Support Group
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
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
      if (!window.localStorage["first_loggon_pass"]) {
        setErrors(["Enter your current password."]);
        return;
      } else {
        setForm({
          ...form,
          current_password: window.localStorage["first_loggon_pass"],
        });
      }
    } else if (!form.password) {
      setErrors(["Enter new password."]);
      return;
    } else if (form.password !== form.confirm_password) {
      setErrors(["New password must be a match."]);
      return;
    }
    setSaving(true);
    await Api.auth();
    try {
      let req = await new Form(form).send("/api/user/change-password");
      if (!req.errors) {
        if (req.error) {
          setErrors(["Invalid password."]);
        } else {
          setSuccess(true);
          props.passChanged && props.passChanged();
          window.localStorage.removeItem("first_loggon_pass");
        }
      } else {
        let err = [];
        for (let e in req.errors) {
          err.push(req.errors[e][0]);
        }
        setErrors(err);
      }
    } catch (e) {
      setErrors(["Invalid password."]);
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
      {errors &&
        errors.map((e, i) => (
          <Snackbar
            key={i}
            open={errors ? true : false}
            autoHideDuration={6000}
            onClose={() => setErrors(null)}
          >
            <Grow in={true}>
              <Alert
                key={i}
                style={{ marginBottom: 9 }}
                severity="error"
                onClose={() => {
                  setErrors(() => {
                    let e = [...errors];
                    e.splice(i, 1);
                    return e;
                  });
                }}
              >
                {e}
              </Alert>
            </Grow>
          </Snackbar>
        ))}
      <DialogTitle>Change Password</DialogTitle>
      <DialogContent>
        <Box width="100%">
          <Typography style={{ marginBottom: 13 }}>
            You must change your password before logging on the first time.
          </Typography>
          <TextField
            label="Username"
            value={props.userInfo.username}
            fullWidth
          />
          {!window.localStorage["first_loggon_pass"] && (
            <TextField
              label="Current Password"
              onChange={(e) =>
                setForm({ ...form, current_password: e.target.value })
              }
              type="password"
              fullWidth
            />
          )}
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
        {!window.localStorage["first_loggon_pass"] && (
          <Button
            disabled={saving ? true : false}
            onClick={() => {
              if (saving) return;
              setErrors(null);
              setForm({
                username: props.userInfo.username,
              });
              props.onClose();
            }}
          >
            Cancel
          </Button>
        )}
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
        UserData.updateUserDetails();
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
      fullScreen={isMobile}
    >
      {errors &&
        errors.map((e, i) => (
          <Snackbar
            key={i}
            open={errors ? true : false}
            autoHideDuration={6000}
            onClose={() => setErrors(null)}
          >
            <Grow in={true}>
              <Alert
                key={i}
                style={{ marginBottom: 9 }}
                severity="error"
                onClose={() => {
                  setErrors(() => {
                    let e = [...errors];
                    e.splice(i, 1);
                    return e;
                  });
                }}
              >
                {e}
              </Alert>
            </Grow>
          </Snackbar>
        ))}
      <DialogTitle
        onClose={() => {
          if (!saving) {
            setPreview(false);
            props.onClose();
            setErrors(false);
          }
        }}
      >
        Change Profile
      </DialogTitle>
      <DialogContent>
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
            style={{
              width: isMobile ? "100%" : 500,
              height: isMobile ? "auto" : 500,
            }}
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
    parentData: states.parentData,
  }),
  actions
)(NavBar);
