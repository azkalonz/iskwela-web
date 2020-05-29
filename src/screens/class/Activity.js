import React, { useState, useEffect } from "react";
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  CircularProgress,
  DialogActions,
  Input,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Menu,
  Snackbar,
  Paper,
  MenuItem,
  withStyles,
  Box,
  Button,
  TextField,
  IconButton,
  InputBase,
  ListItemSecondaryAction,
  makeStyles,
  Typography,
  Link,
} from "@material-ui/core";
import InsertDriveFileOutlinedIcon from "@material-ui/icons/InsertDriveFileOutlined";
import MoreHorizOutlinedIcon from "@material-ui/icons/MoreHorizOutlined";
import Moment from "react-moment";
import ArrowDownwardOutlinedIcon from "@material-ui/icons/ArrowDownwardOutlined";
import ArrowUpwardOutlinedIcon from "@material-ui/icons/ArrowUpwardOutlined";
import SearchIcon from "@material-ui/icons/Search";
import AttachFileOutlinedIcon from "@material-ui/icons/AttachFileOutlined";
import FileViewer from "../../components/FileViewer";
import moment from "moment";
import LaunchIcon from "@material-ui/icons/Launch";
import Grow from "@material-ui/core/Grow";
import FileUpload, { stageFiles } from "../../components/FileUpload";
import Form from "../../components/Form";
import MomentUtils from "@date-io/moment";
import CancelIcon from "@material-ui/icons/Cancel";
import { connect } from "react-redux";
import getUserData from "../../components/getUserData";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import Api from "../../api";
import $ from "jquery";
import axios from "axios";
import MuiAlert from "@material-ui/lab/Alert";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function Activity(props) {
  const [saving, setSaving] = useState(false);
  const [hasFiles, setHasFiles] = useState([false, false]);
  const { class_id } = props.match.params;
  const [activities, setActivities] = useState();
  const [dragover, setDragover] = useState(false);
  const [sortType, setSortType] = useState("DESCENDING");
  const [search, setSearch] = useState("");
  const [modals, setModals] = React.useState([false, false]);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [file, setFile] = useState();
  const [fileViewerOpen, setfileViewerOpen] = useState(false);
  const isTeacher = props.userInfo.user_type === "t" ? true : false;
  const styles = useStyles();
  const classSched = props.classSched;
  const [currentActivity, setCurrentActivity] = useState();
  const [errors, setErrors] = useState();
  const [newMaterial, setNewMaterial] = useState({});
  const [success, setSuccess] = useState(false);
  const formTemplate = {
    activity_type: 1,
    title: "",
    description: "",
    available_from: moment(new Date()).format("YYYY-MM-DD"),
    available_to: moment(new Date()).format("YYYY-MM-DD"),
    schedule_id: classSched,
    subject_id: props.classDetails[class_id].subject.id,
    published: 0,
    class_id,
  };
  const [form, setForm] = useState(formTemplate);

  const _handleFileOption = (option, file) => {
    setAnchorEl(() => {
      let a = {};
      a[file.id] = null;
      return { ...anchorEl, ...a };
    });
    switch (option) {
      case "view":
        _handleItemClick(file);
        return;
      case "edit":
        handleClickOpen();
        setForm({
          ...file,
          activity_type: file.activity_type == "class activity" ? 1 : 2,
          published: file.status == "unpublished" ? 0 : 1,
          schedule_id: classSched,
          subject_id: props.classDetails[class_id].subject.id,
          id: file.id.substr(file.id.indexOf("-") + 1, file.id.length),
          class_id,
        });
        return;
    }
  };
  useEffect(() => {
    _getActivities();
  }, [props.classDetails]);
  useEffect(() => {
    if (currentActivity) {
      document.querySelector("#right-panel").scrollTop = 0;
      $("#navbar-title").text(currentActivity.title);
    }
  }, [currentActivity]);
  const _getActivities = () => {
    if (!classSched) return;
    try {
      let a = props.classDetails[class_id].schedules[classSched];
      a = a.activities.map((i) => ({ ...i, id: "item-" + i.id }));
      setActivities(a);
    } catch (e) {
      // handle invalid schedule
    }
  };
  useEffect(() => {
    _getActivities();
  }, []);
  useEffect(() => {
    if (!fileViewerOpen) setFile();
  }, [fileViewerOpen]);
  useEffect(() => {
    if (activities) {
      setAnchorEl(() => {
        let a = {};
        activities.forEach((i) => {
          a[i.id] = null;
        });
        return a;
      });
    }
  }, [activities]);

  const _handleSort = () => {
    if (sortType === "ASCENDING") {
      setActivities(
        activities.sort((a, b) => "" + a.title.localeCompare(b.title))
      );
      setSortType("DESCENDING");
    } else {
      setActivities(
        activities.sort((a, b) => "" + b.title.localeCompare(a.title))
      );
      setSortType("ASCENDING");
    }
  };
  const _handleSearch = (e) => {
    setSearch(e.toLowerCase());
  };

  const handleClickOpen = () => {
    setModals([true, modals[1]]);
  };

  const handleClose = () => {
    if (!saving) setModals([false, modals[1]]);
  };
  const _handleItemClick = (item) => {
    setCurrentActivity(
      currentActivity && item.id === currentActivity.id ? undefined : item
    );
  };
  const _handleCreateActivity = async (params = {}) => {
    setErrors(null);
    setSaving(true);
    let formData = new Form({ ...form, ...params });
    let res = await formData.send("/api/class/activity/save");
    if (formData.data.published && formData.data.id) {
      let rr = await Api.post(
        "/api/class/activity/publish/" + formData.data.id
      );
    }
    if (res) {
      if (!res.errors) {
        let file = document.querySelector("#activity-material");
        if (file.files.length) {
          let body = new FormData();
          body.append("file", file.files[0]);
          body.append("assignment_id", res.id);
          let a = await FileUpload.upload("/api/upload/activity/material", {
            body,
          });
        }
        setSuccess(true);
        await getUserData(props.userInfo);
        _handleFileOption("view", res);
        setModals([modals[0], false]);
      } else {
        let err = [];
        for (let e in res.errors) {
          err.push(res.errors[e][0]);
        }
        setErrors(err);
      }
    }
    setSaving(false);
  };

  return (
    <Box width="100%" alignSelf="flex-start" height="100%">
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Success
        </Alert>
      </Snackbar>
      <Dialog
        open={fileViewerOpen}
        keepMounted
        id="file-viewer-container"
        fullWidth
        onClose={() => setfileViewerOpen(false)}
        maxWidth="xl"
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogContent>
          {file && <FileViewer url={file.url} title={file.title} />}
        </DialogContent>
      </Dialog>
      <Box
        m={2}
        display="flex"
        justifyContent={isTeacher ? "space-between" : "flex-end"}
        flexWrap="wrap"
        alignItems="center"
      >
        {isTeacher && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              handleClickOpen();
              setForm(formTemplate);
            }}
          >
            Add New Activity
          </Button>
        )}
        <Box
          flexDirection="row"
          flexWrap="wrap"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          {props.utilities}
          <Box border={1} p={0.3} borderRadius={7}>
            <InputBase
              onChange={(e) => _handleSearch(e.target.value)}
              placeholder="Search"
              inputProps={{ "aria-label": "search activity" }}
            />
            <IconButton
              type="submit"
              aria-label="search"
              style={{ padding: 0 }}
            >
              <SearchIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
      {currentActivity && currentActivity && (
        <Grow in={true}>
          <Box p={2}>
            <Paper id="activity-preview">
              <Box p={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography style={{ fontWeight: "bold" }} variant="body1">
                    {currentActivity.title}
                  </Typography>
                  <Typography>
                    {moment(currentActivity.available_from).format("LL")} -{" "}
                    {moment(currentActivity.available_to).format("LL")}
                  </Typography>
                </Box>
                <Box m={2} style={{ marginLeft: 0, marginRight: 0 }}>
                  <Typography style={{ whiteSpace: "pre-wrap" }}>
                    {currentActivity.description}
                  </Typography>
                </Box>
                <Box display="inline-block">
                  <Typography color="textSecondary">Resources</Typography>
                  {currentActivity.materials.map((m) => (
                    <Typography component="div">
                      <Link
                        component="div"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setFile({
                            url: m.resource_link
                              ? m.resource_link
                              : m.uploaded_file,
                            title: m.resource_link
                              ? m.resource_link
                              : m.uploaded_file,
                          });
                          setfileViewerOpen(true);
                        }}
                      >
                        {m.resource_link ? m.resource_link : m.uploaded_file}
                        <LaunchIcon fontSize="small" />
                      </Link>
                    </Typography>
                  ))}
                </Box>
              </Box>
            </Paper>
            {!isTeacher && (
              <Box marginTop={2}>
                <Typography
                  style={{ fontWeight: "bold", marginBottom: 7 }}
                  color="textSecondary"
                >
                  Upload your Answer
                </Typography>

                <Paper>
                  <Box
                    width="100%"
                    p={2}
                    style={{ boxSizing: "border-box" }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragover(true);
                      return false;
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      stageFiles("answers", e.dataTransfer.files, (files) => {
                        setHasFiles([true, hasFiles[1]]);
                      });
                      return false;
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setDragover(false);
                      return false;
                    }}
                  >
                    <Input
                      type="file"
                      id="file-upload"
                      style={{ display: "none" }}
                      onChange={() => {
                        stageFiles(
                          "answers",
                          document.querySelector("#file-upload").files
                        );
                        setHasFiles([true, hasFiles[1]]);
                      }}
                    />
                    <Box className={styles.upload}>
                      {!hasFiles[0] ? (
                        <div>
                          {!dragover ? (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <Link
                                component="div"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  cursor: "pointer",
                                  fontWeight: "bold",
                                }}
                                onClick={() =>
                                  document.querySelector("#file-upload").click()
                                }
                              >
                                <AttachFileOutlinedIcon fontSize="small" />
                                Add file&nbsp;
                              </Link>
                              or drag file in here
                            </div>
                          ) : (
                            <div>Drop here</div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <div>
                              {FileUpload.getFiles("answers").map((f) => (
                                <Typography variant="body1" color="primary">
                                  {f.title}
                                </Typography>
                              ))}
                            </div>
                            <div>
                              <Button
                                onClick={() =>
                                  new FileUpload("answers").upload()
                                }
                              >
                                Upload
                              </Button>
                              <Button
                                onClick={() => {
                                  FileUpload.removeFiles();
                                  setDragover(false);
                                  setHasFiles([false, hasFiles[1]]);
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          </Box>
                        </div>
                      )}
                    </Box>
                  </Box>
                </Paper>
              </Box>
            )}
          </Box>
        </Grow>
      )}
      {!activities && (
        <Box
          width="100%"
          alignItems="center"
          justifyContent="center"
          display="flex"
          height="70%"
        >
          <Typography variant="h6" component="h2">
            No activities
          </Typography>
        </Box>
      )}
      {activities && (
        <Box width="100%" alignSelf="flex-start">
          <Box m={2}>
            <List className={styles.hideonmobile}>
              <ListItem
                ContainerComponent="li"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  backgroundColor: "transparent",
                }}
              >
                <Button size="small" onClick={_handleSort}>
                  <ListItemText primary="Title" />
                  {sortType === "ASCENDING" ? (
                    <ArrowUpwardOutlinedIcon />
                  ) : (
                    <ArrowDownwardOutlinedIcon />
                  )}
                </Button>
                <Typography variant="body1" style={{ marginRight: 10 }}>
                  DATE
                </Typography>
                <ListItemSecondaryAction></ListItemSecondaryAction>
              </ListItem>
            </List>
            {!activities.length && (
              <Box
                width="100%"
                alignItems="center"
                justifyContent="center"
                display="flex"
                height="70%"
              >
                <Typography variant="h6" component="h2">
                  No activities
                </Typography>
              </Box>
            )}
            <Grow in={activities ? true : false}>
              <List>
                {activities
                  .filter(
                    (a) => JSON.stringify(a).toLowerCase().indexOf(search) >= 0
                  )
                  .filter((a) => (isTeacher ? true : a.status === "published"))
                  .reverse()
                  .map((item, index) => (
                    <ListItem
                      className={styles.listItem}
                      style={{
                        ...(currentActivity && item.id === currentActivity.id
                          ? {
                              background:
                                props.theme === "dark" ? "#111" : "#fff",
                            }
                          : {}),
                      }}
                    >
                      <ExpansionPanel
                        style={{
                          width: "100%",
                          boxShadow: "none",
                          background: "transparent",
                        }}
                      >
                        <ExpansionPanelSummary
                          className={styles.expansionSummary}
                        >
                          <ListItemIcon>
                            <InsertDriveFileOutlinedIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={item.title}
                            secondary={item.description.substr(0, 50) + "..."}
                          />
                          <Typography
                            variant="body1"
                            component="div"
                            style={{ marginRight: 55 }}
                          >
                            {moment(item.available_from).format("LL")}
                            &nbsp;-&nbsp;
                            {moment(item.available_from).format("LL")}
                          </Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails
                          className={styles.expansionDetails}
                        >
                          <Box width="100%">{item.description}</Box>
                          <Box width="100%">
                            <Typography color="textSecondary">
                              Resources
                            </Typography>
                            {item.materials.map((m) => (
                              <Typography component="div">
                                <Link
                                  component="div"
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    setFile({
                                      url: m.resource_link
                                        ? m.resource_link
                                        : m.uploaded_file,
                                      title: m.resource_link
                                        ? m.resource_link
                                        : m.uploaded_file,
                                    });
                                    setfileViewerOpen(true);
                                  }}
                                >
                                  {m.resource_link
                                    ? m.resource_link
                                    : m.uploaded_file}
                                  <LaunchIcon fontSize="small" />
                                </Link>
                              </Typography>
                            ))}
                          </Box>
                        </ExpansionPanelDetails>
                      </ExpansionPanel>
                      <ListItemSecondaryAction
                        style={{
                          top: 40,
                        }}
                      >
                        <IconButton
                          onClick={(event) =>
                            setAnchorEl(() => {
                              let a = {};
                              a[item.id] = event.currentTarget;
                              return { ...anchorEl, ...a };
                            })
                          }
                        >
                          <MoreHorizOutlinedIcon />
                        </IconButton>
                        {anchorEl && (
                          <StyledMenu
                            id="customized-menu"
                            anchorEl={anchorEl[item.id]}
                            keepMounted
                            open={Boolean(anchorEl[item.id])}
                            onClose={() =>
                              setAnchorEl(() => {
                                let a = {};
                                a[item.id] = null;
                                return { ...anchorEl, ...a };
                              })
                            }
                          >
                            <StyledMenuItem>
                              <ListItemText
                                primary="View"
                                onClick={() => _handleFileOption("view", item)}
                              />
                            </StyledMenuItem>
                            {isTeacher && (
                              <div>
                                <StyledMenuItem>
                                  <ListItemText
                                    primary="Edit"
                                    onClick={() =>
                                      _handleFileOption("edit", item)
                                    }
                                  />
                                </StyledMenuItem>
                                <StyledMenuItem>
                                  <ListItemText primary="Delete" />
                                </StyledMenuItem>
                              </div>
                            )}
                          </StyledMenu>
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
              </List>
            </Grow>
          </Box>
        </Box>
      )}
      <Dialog
        open={modals[0]}
        keepMounted
        onClose={handleClose}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">
          {form.id ? "Edit Activity" : "Create Activity"}
        </DialogTitle>
        <DialogContent>
          <Box style={{ marginBottom: 18 }}>
            {errors &&
              errors.map((e, i) => (
                <Grow in={true}>
                  <Alert key={i} style={{ marginBottom: 9 }} severity="error">
                    {e}
                  </Alert>
                </Grow>
              ))}
          </Box>
          <DialogContentText
            id="alert-dialog-slide-description"
            component="div"
          >
            <Box display="flex" flexWrap="wrap">
              <TextField
                label="Title"
                className={styles.textField}
                InputLabelProps={{
                  shrink: true,
                }}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                fullWidth
              />
              <TextField
                label="Description"
                style={{ marginTop: 13 }}
                rows={4}
                value={form.description}
                multiline={true}
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                fullWidth
              />
              <MuiPickersUtilsProvider utils={MomentUtils}>
                <Box
                  display="flex"
                  width="100%"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <KeyboardDatePicker
                    disableToolbar
                    variant="inline"
                    format="MMM DD, YYYY"
                    margin="normal"
                    id="date-picker-inline"
                    label="From"
                    value={moment(form.available_from).format("YYYY-MM-DD")}
                    onChange={(date) =>
                      setForm({
                        ...form,
                        available_from: moment(date).format("YYYY-MM-DD"),
                      })
                    }
                    KeyboardButtonProps={{
                      "aria-label": "change date",
                    }}
                  />
                  <KeyboardDatePicker
                    disableToolbar
                    variant="inline"
                    format="MMM DD, YYYY"
                    margin="normal"
                    id="date-picker-inline"
                    label="To"
                    value={moment(form.available_to).format("YYYY-MM-DD")}
                    onChange={(date) =>
                      setForm({
                        ...form,
                        available_to: moment(date).format("YYYY-MM-DD"),
                      })
                    }
                    KeyboardButtonProps={{
                      "aria-label": "change date",
                    }}
                  />
                </Box>
              </MuiPickersUtilsProvider>
            </Box>
            {form.materials && (
              <Box style={{ marginTop: 7 }}>
                <Typography variant="body1" color="textSecondary">
                  Activity Materials
                </Typography>
                {FileUpload.getFiles("activity-materials")
                  .concat(form.materials)
                  .map((f) => (
                    <List dense={true}>
                      <ListItem>
                        <ListItemText
                          primary={
                            f.resource_link ? f.resource_link : f.uploaded_file
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => {
                              if (f.isFile) {
                                FileUpload.removeFiles("activity-materials");
                                setHasFiles([hasFiles[0], false]);
                              }
                            }}
                          >
                            <CancelIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  ))}
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions style={{ justifyContent: "space-between" }}>
          <div>
            <input
              type="file"
              id="activity-material"
              style={{ display: "none" }}
              onChange={(e) => {
                stageFiles(
                  "activity-materials",
                  document.querySelector("#activity-material").files
                );
                setHasFiles([hasFiles[0], true]);
              }}
              multiple
            />
            <Button
              onClick={() =>
                document.querySelector("#activity-material").click()
              }
              variant="outlined"
              style={{ float: "left" }}
            >
              <AttachFileOutlinedIcon />
              Add File
            </Button>
            <Button
              onClick={() => setModals([modals[0], true])}
              variant="outlined"
              style={{ float: "left" }}
            >
              Add Link
            </Button>
          </div>
          <DialogActions>
            <Button variant="outlined" onClick={handleClose}>
              Cancel
            </Button>
            <div style={{ position: "relative" }}>
              <Button
                variant="contained"
                onClick={() => _handleCreateActivity()}
                color="primary"
                className={styles.wrapper}
                disabled={saving}
              >
                Save
              </Button>
              {saving && (
                <CircularProgress size={24} className={styles.buttonProgress} />
              )}
            </div>
            <div style={{ position: "relative" }}>
              <Button
                disabled={saving}
                className={styles.wrapper}
                variant="contained"
                onClick={() =>
                  _handleCreateActivity({ published: form.published ? 0 : 1 })
                }
                color="primary"
              >
                {form.published ? "Unpublish" : "Publish"}
              </Button>
              {saving && (
                <CircularProgress size={24} className={styles.buttonProgress} />
              )}
            </div>
          </DialogActions>
        </DialogActions>
      </Dialog>

      <Dialog
        open={modals[1]}
        keepMounted
        onClose={() => {
          setNewMaterial(null);
          setModals([modals[0], false]);
        }}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">Web Link</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <Box display="flex" flexWrap="wrap">
              <TextField
                label="Title"
                className={styles.textField}
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={(e) => {
                  setNewMaterial({ ...newMaterial, title: e.target.value });
                }}
                fullWidth
              />
              <TextField
                label="link"
                variant="filled"
                onChange={(e) => {
                  setNewMaterial({
                    ...newMaterial,
                    resource_link: e.target.value,
                  });
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
              />
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setNewMaterial(null);
              setModals([modals[0], false]);
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              let m = form.materials
                ? [newMaterial, ...form.materials]
                : [newMaterial];
              setForm({ ...form, materials: m });
              setModals([modals[0], false]);
            }}
          >
            Add Link
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
const StyledMenu = withStyles({
  paper: {
    border: "1px solid #d3d4d5",
  },
})((props) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "center",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "center",
    }}
    {...props}
  />
));
const StyledMenuItem = withStyles((theme) => ({
  root: {
    "&:focus": {
      backgroundColor: theme.palette.grey[200],
      "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
        color: theme.palette.common.primary,
      },
    },
  },
}))(MenuItem);

const useStyles = makeStyles((theme) => ({
  expansionSummary: {
    "& > div": {
      alignItems: "center",
    },
  },
  expansionDetails: {
    flexWrap: "wrap",
    background: theme.palette.type === "dark" ? "#111" : "#fff",
    paddingRight: 30,
  },
  hideonmobile: {
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
  },
  buttonProgress: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  wrapper: { margin: theme.spacing(1), position: "relative" },
  upload: {
    borderColor: theme.palette.primary.main,
    borderWidth: 2,
    borderRadius: 6,
    borderStyle: "dashed",
    position: "relative",
    "& > div": {
      position: "relative",
      zIndex: 1,
      height: 170,
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    "&:before": {
      content: "''",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.palette.primary.main,
      opacity: 0.1,
    },
  },
  listItem: {
    padding: 0,
    backgroundColor: theme.palette.grey[100],
    borderLeft: "4px solid #fff",
    marginBottom: 7,
  },
}));

export default connect((state) => ({
  userInfo: state.userInfo,
  theme: state.theme,
  classDetails: state.classDetails,
}))(Activity);
