import React, { useState, useEffect } from "react";
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogActions,
  DialogContent,
  useTheme,
  useMediaQuery,
  DialogTitle,
  Menu,
  MenuItem,
  FormControl,
  Select,
  Toolbar,
  InputLabel,
  withStyles,
  Box,
  Button,
  TextField,
  IconButton,
  InputBase,
  ListItemSecondaryAction,
  makeStyles,
  Typography,
  Snackbar,
  CircularProgress,
  Grow,
} from "@material-ui/core";
import InsertDriveFileOutlinedIcon from "@material-ui/icons/InsertDriveFileOutlined";
import MoreHorizOutlinedIcon from "@material-ui/icons/MoreHorizOutlined";
import ArrowDownwardOutlinedIcon from "@material-ui/icons/ArrowDownwardOutlined";
import ArrowUpwardOutlinedIcon from "@material-ui/icons/ArrowUpwardOutlined";
import SearchIcon from "@material-ui/icons/Search";
import AttachFileOutlinedIcon from "@material-ui/icons/AttachFileOutlined";
import ExpandMoreOutlinedIcon from "@material-ui/icons/ExpandMoreOutlined";
import InsertLinkOutlinedIcon from "@material-ui/icons/InsertLinkOutlined";
import CloudUploadOutlinedIcon from "@material-ui/icons/CloudUploadOutlined";
import FileViewer from "../../components/FileViewer";
import { connect } from "react-redux";
import FileUpload, { stageFiles } from "../../components/FileUpload";
import MuiAlert from "@material-ui/lab/Alert";
import UserData, { asyncForEach } from "../../components/UserData";
import Api from "../../api";
import CloseIcon from "@material-ui/icons/Close";
import FullscreenIcon from "@material-ui/icons/Fullscreen";
import FullscreenExitIcon from "@material-ui/icons/FullscreenExit";
import { saveAs } from "file-saver";
import socket from "../../components/socket.io";
import moment from "moment";
import Pagination, { getPageItems } from "../../components/Pagination";
import {
  ScheduleSelector,
  StatusSelector,
  SearchInput,
} from "../../components/Selectors";

const queryString = require("query-string");
function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function InstructionalMaterials(props) {
  const query = queryString.parse(window.location.search);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { class_id, option_name, schedule_id } = props.match.params;
  const [materials, setMaterials] = useState();
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("DESCENDING");
  const [modals, setModals] = useState([false, false]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [addNewFileAnchor, setAddNewFileAnchor] = useState(null);
  const classSched = props.classSched;
  const isTeacher = props.userInfo.user_type === "t" ? true : false;
  const styles = useStyles();
  const [file, setFile] = useState();
  const [fileViewerOpen, setfileViewerOpen] = useState(false);
  const [form, setForm] = useState();
  const [hasFiles, setHasFiles] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState();
  const [confirmed, setConfirmed] = useState();
  const [savingId, setSavingId] = useState();
  const [fileFullScreen, setFileFullScreen] = useState(false);
  const [selectedSched, setSelectedSched] = useState(
    query.date && query.date !== -1 ? query.date : null
  );
  const [selectedStatus, setSelectedStatus] = useState(
    isTeacher
      ? query.status && query.status !== "all"
        ? query.status
        : null
      : "published"
  );
  const [page, setPage] = useState(query.page ? query.page : 1);

  const _handleFileOption = (option, file) => {
    setAnchorEl(() => {
      let a = {};
      a[file.id] = null;
      return { ...anchorEl, ...a };
    });
    switch (option) {
      case "view":
        _handleOpenFile(file);
        return;
      case "edit":
        setForm({ title: file.title, url: file.resource_link, id: file.id });
        setModals([true, modals[1]]);
        return;
      case "publish":
        updateMaterialStatus(file, "publish");
        return;
      case "unpublish":
        updateMaterialStatus(file, "unpublish");
        return;
      case "download":
        _downloadFile(file);
        return;
      case "delete":
        _handleRemoveMaterial(file);
        return;
      default:
        return;
    }
  };

  const _getMaterials = () => {
    if (!classSched) return;
    try {
      let a = props.classDetails[class_id].schedules;
      let allMaterials = [];
      a.forEach((s) => {
        s.materials.forEach((ss) => {
          allMaterials.push({ ...ss, schedule_id: s.id });
        });
      });
      setMaterials(allMaterials);
    } catch (e) {
      //handle invalid schedule
    }
  };
  useEffect(() => {
    _getMaterials();
  }, []);
  useEffect(() => {
    if (!fileViewerOpen) setFile();
  }, [fileViewerOpen]);
  useEffect(() => {
    if (materials)
      setAnchorEl(() => {
        let a = {};
        materials.forEach((i) => {
          a[i.id] = null;
        });
        return a;
      });
  }, [materials]);

  const _downloadFile = async (file) => {
    setErrors(null);
    setSaving(true);
    setSavingId(file.id);
    let res = await Api.postBlob(
      "/api/download/class/material/" + file.id
    ).then((resp) => (resp.ok ? resp.blob() : null));
    if (res) saveAs(new File([res], file.title, { type: res.type }));
    else setErrors(["Cannot download file."]);
    setSaving(false);
    setSavingId(null);
  };

  const _handleSort = () => {
    if (sortType === "ASCENDING") {
      setMaterials(
        materials.sort((a, b) => ("" + a.title).localeCompare(b.title))
      );
      setSortType("DESCENDING");
    } else {
      setMaterials(
        materials.sort((a, b) => ("" + b.title).localeCompare(a.title))
      );
      setSortType("ASCENDING");
    }
  };
  const _handleSearch = (e) => {
    setSearch(e.toLowerCase());
  };

  const handleClickOpen = (event) => {
    setAddNewFileAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAddNewFileAnchor(null);
  };

  const _handleOpenFile = async (f) => {
    setFile({
      title: f.title,
    });
    setfileViewerOpen(true);
    if (!f.uploaded_file) {
      setFile({ ...file, url: f.resource_link });
      return;
    }
    let res = await Api.postBlob(
      "/api/download/class/material/" + f.id
    ).then((resp) => (resp.ok ? resp.blob() : null));
    if (res)
      setFile({
        ...file,
        url: URL.createObjectURL(new File([res], f.title, { type: res.type })),
        type: res.type,
      });
    else setErrors(["Cannot open file."]);
  };

  const _handleMaterialAddLink = async () => {
    if (!form) {
      setErrors(["Invalid title"]);
      return;
    }
    if (!form.title) {
      setErrors(["Invalid url"]);
      return;
    }
    if (!form.url) {
      setErrors(["Invalid link"]);
      return;
    }
    let err = [];
    setErrors(null);
    setSaving(true);
    let res = await Api.post("/api/class/material/save", {
      body: {
        class_id,
        schedule_id: selectedSched ? selectedSched : classSched,
        ...form,
      },
    });
    if (res.errors) {
      for (let e in res.errors) {
        err.push(res.errors[e][0]);
      }
    }
    if (!err.length) {
      setSuccess(true);
      let newScheduleDetails = await UserData.updateScheduleDetails(
        class_id,
        selectedSched ? selectedSched : schedule_id
      );
      socket.emit("update schedule details", {
        id: class_id,
        details: newScheduleDetails,
      });
      setModals([false, modals[1]]);
    } else setErrors(err);
    setSaving(true);
    setErrors(null);
  };

  const _handleMaterialUpload = async () => {
    if (!form) {
      setErrors(["Invalid title"]);
      return;
    }
    let m = document.querySelector("#materials-upload");
    if (!m.files.length) {
      setErrors(["Attach file/s"]);
      return;
    }
    let err = [];
    setErrors(null);
    setSaving(true);
    await asyncForEach(m.files, async (file) => {
      let body = new FormData();
      body.append("class_id", class_id);
      body.append("file", file);
      body.append("schedule_id", schedule_id);
      body.append("title", form.title);
      let res = await FileUpload.upload("/api/upload/class/material", {
        body,
      });
      if (res.errors) {
        for (let e in res.errors) {
          err.push(res.errors[e][0]);
        }
      }
    });
    if (!err.length) {
      setSuccess(true);
      let newScheduleDetails = await UserData.updateScheduleDetails(
        class_id,
        selectedSched ? selectedSched : schedule_id
      );
      socket.emit("update schedule details", {
        id: class_id,
        details: newScheduleDetails,
      });
      FileUpload.removeFiles("materials");
      setHasFiles(false);
      setModals([modals[0], false]);
    } else setErrors(err);
    setSaving(true);
    setErrors(null);
  };
  const updateMaterialStatus = async (item, stat) => {
    let { id } = item;
    setConfirmed(null);
    setErrors(null);
    setSuccess(false);
    setConfirmed({
      title: stat.charAt(0).toUpperCase() + " Material",
      message: "Are you sure you want to " + stat + " this material?",
      yes: async () => {
        setSavingId(id);
        setSaving(true);
        setConfirmed(null);
        let res = await Api.post("/api/class/material/" + stat + "/" + id);
        if (!res.errors) {
          setSuccess(true);
          let newScheduleDetails = await UserData.updateScheduleDetails(
            class_id,
            item.schedule_id
          );
          socket.emit("update schedule details", {
            id: class_id,
            details: newScheduleDetails,
          });
        } else {
          let err = [];
          for (let e in res.errors) {
            err.push(res.errors[e][0]);
          }
          setErrors(err);
        }
        setSaving(false);
      },
    });
  };
  const _handleRemoveMaterial = (activity) => {
    setConfirmed({
      title: "Remove Material",
      message: "Are you sure you want to remove this material?",
      yes: async () => {
        setErrors(null);
        setSaving(true);
        setConfirmed(null);
        setSavingId(activity.id);
        let res = await Api.post(
          "/api/teacher/remove/class-material/" + activity.id,
          {
            body: {
              id: activity.id,
            },
          }
        );
        if (!res.errors) {
          setSuccess(true);
          let newScheduleDetails = await UserData.updateScheduleDetails(
            class_id,
            activity.schedule_id
          );
          socket.emit("update schedule details", {
            id: class_id,
            details: newScheduleDetails,
          });
        } else {
          let err = [];
          for (let e in res.errors) {
            err.push(res.errors[e][0]);
          }
          setErrors(err);
        }
        setSaving(false);
      },
    });
  };
  const getFilteredMaterials = () =>
    materials
      .filter((i) => (isTeacher ? true : i.status === "published"))
      .filter((a) => (selectedStatus ? selectedStatus === a.status : true))
      .filter((i) => JSON.stringify(i).toLowerCase().indexOf(search) >= 0)
      .filter((a) =>
        parseInt(selectedSched) >= 0
          ? parseInt(selectedSched) === a.schedule_id
          : true
      )
      .reverse();
  return (
    <Box width="100%" alignSelf="flex-start">
      <Dialog
        open={fileViewerOpen}
        keepMounted
        id="file-viewer-container"
        fullWidth
        onClose={() => setfileViewerOpen(false)}
        maxWidth="xl"
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
        fullScreen={fileFullScreen}
      >
        {file && (
          <DialogContent style={{ height: "100vh" }}>
            <Toolbar
              style={{
                position: "sticky",
                zIndex: 10,
                background: "#fff",
                height: "6%",
                top: 0,
                right: 0,
                left: 0,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="body1"
                color="textPrimary"
                style={{ fontWeight: "bold" }}
              >
                {file.title}
              </Typography>
              <div>
                <IconButton onClick={() => setFileFullScreen(!fileFullScreen)}>
                  {fileFullScreen ? (
                    <FullscreenExitIcon size={24} />
                  ) : (
                    <FullscreenIcon size={24} />
                  )}
                </IconButton>
                <IconButton onClick={() => setfileViewerOpen(false)}>
                  <CloseIcon size={24} />
                </IconButton>
              </div>
            </Toolbar>
            <FileViewer
              url={file.url}
              title={file.title}
              type={file.type}
              onClose={() => setfileViewerOpen(false)}
            />
          </DialogContent>
        )}
      </Dialog>
      <Dialog
        open={confirmed ? true : false}
        onClose={() => setConfirmed(null)}
      >
        <DialogTitle>{confirmed && confirmed.title}</DialogTitle>
        <DialogContent>{confirmed && confirmed.message}</DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setConfirmed(null);
            }}
          >
            No
          </Button>

          <Button
            color="primary"
            variant="contained"
            onClick={() => confirmed.yes()}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
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
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Success
        </Alert>
      </Snackbar>
      <Box
        m={2}
        display="flex"
        justifyContent={isTeacher ? "space-between" : "flex-end"}
        flexWrap="wrap"
        alignItems="center"
      >
        {isTeacher && (
          <div style={isMobile ? { width: "100%", order: 2 } : {}}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleClickOpen}
            >
              Add New File
              <ExpandMoreOutlinedIcon />
            </Button>
            <StyledMenu
              id="customized-menu"
              anchorEl={addNewFileAnchor}
              keepMounted
              open={Boolean(addNewFileAnchor)}
              onClose={handleClose}
            >
              <StyledMenuItem onClick={() => setModals([true, modals[1]])}>
                <ListItemIcon>
                  <InsertLinkOutlinedIcon />
                </ListItemIcon>
                <ListItemText primary="Web Link" />
              </StyledMenuItem>
              <StyledMenuItem onClick={() => setModals([modals[0], true])}>
                <ListItemIcon>
                  <CloudUploadOutlinedIcon />
                </ListItemIcon>
                <ListItemText primary="Upload" />
              </StyledMenuItem>
            </StyledMenu>
          </div>
        )}
        <Box
          flexDirection="row"
          flexWrap="wrap"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <ScheduleSelector
            classId={class_id}
            scheduleId={schedule_id}
            onChange={(schedId) => setSelectedSched(schedId)}
            schedule={selectedSched ? selectedSched : -1}
            optionName={option_name}
          />
          &nbsp;
          {isTeacher && (
            <StatusSelector
              classId={class_id}
              scheduleId={schedule_id}
              onChange={(statusId) => setSelectedStatus(statusId)}
              status={selectedStatus ? selectedStatus : "all"}
              optionName={option_name}
            />
          )}
          &nbsp;
          <SearchInput onChange={(e) => _handleSearch(e)} />
        </Box>
      </Box>

      {materials && (
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
                  ADDED BY
                </Typography>
                <ListItemSecondaryAction></ListItemSecondaryAction>
              </ListItem>
            </List>
            {!getFilteredMaterials().length && (
              <Box
                width="100%"
                alignItems="center"
                justifyContent="center"
                display="flex"
                height="70%"
              >
                <Typography variant="h6" component="h2">
                  No Materials
                </Typography>
              </Box>
            )}
            <Grow in={true}>
              <List>
                {getPageItems(getFilteredMaterials(), page).map(
                  (item, index) => (
                    <ListItem
                      key={index}
                      onClick={() => _handleFileOption("view", item)}
                      className={styles.listItem}
                      style={{
                        borderColor:
                          item.status === "published"
                            ? theme.palette.success.main
                            : "#fff",
                      }}
                    >
                      {saving && savingId === item.id && (
                        <div className={styles.itemLoading}>
                          <CircularProgress />
                        </div>
                      )}
                      <ListItemIcon className={styles.hideonmobile}>
                        <InsertDriveFileOutlinedIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.title}
                        secondary={
                          item.resource_link
                            ? item.resource_link
                            : item.uploaded_file
                        }
                      />
                      <Typography
                        variant="body1"
                        style={{ marginRight: 10 }}
                        className={styles.hideonmobile}
                      >
                        {item.added_by.first_name} {item.added_by.last_name}
                      </Typography>
                      <ListItemSecondaryAction>
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
                            <StyledMenuItem
                              onClick={() => _handleFileOption("view", item)}
                            >
                              <ListItemText primary="View" />
                            </StyledMenuItem>
                            <StyledMenuItem disabled={!item.uploaded_file}>
                              <ListItemText
                                primary="Download"
                                onClick={() =>
                                  _handleFileOption("download", item)
                                }
                              />
                            </StyledMenuItem>
                            {isTeacher && (
                              <div>
                                <StyledMenuItem
                                  onClick={() =>
                                    _handleFileOption("publish", item)
                                  }
                                >
                                  <ListItemText primary="Publish" />
                                </StyledMenuItem>
                                <StyledMenuItem
                                  onClick={() =>
                                    _handleFileOption("unpublish", item)
                                  }
                                >
                                  <ListItemText primary="Unpublish" />
                                </StyledMenuItem>
                                <StyledMenuItem
                                  disabled={!item.resource_link}
                                  onClick={() =>
                                    _handleFileOption("edit", item)
                                  }
                                >
                                  <ListItemText primary="Edit" />
                                </StyledMenuItem>
                                <StyledMenuItem
                                  onClick={() =>
                                    _handleFileOption("delete", item)
                                  }
                                >
                                  <ListItemText primary="Delete" />
                                </StyledMenuItem>
                              </div>
                            )}
                          </StyledMenu>
                        )}
                      </ListItemSecondaryAction>
                    </ListItem>
                  )
                )}
              </List>
            </Grow>
          </Box>

          <Box p={2}>
            <Pagination
              optionName={option_name}
              page={page}
              classId={class_id}
              scheduleId={schedule_id}
              onChange={(p) => setPage(p)}
              length={getFilteredMaterials().length}
            />
          </Box>
        </Box>
      )}
      <Dialog
        open={modals[0]}
        keepMounted
        onClose={() => {
          setForm(null);
          setModals([!modals[0], modals[1]]);
        }}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">Web Link</DialogTitle>
        <DialogContent>
          <DialogContent id="alert-dialog-slide-description">
            <Box display="flex" flexWrap="wrap">
              <TextField
                label="Title"
                className={styles.textField}
                InputLabelProps={{
                  shrink: true,
                }}
                value={form && form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                fullWidth
              />
              <TextField
                label="link"
                InputLabelProps={{
                  shrink: true,
                }}
                value={form && form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                fullWidth
              />
            </Box>
          </DialogContent>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setForm(null);
              setModals([false, modals[1]]);
            }}
            variant="outlined"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={_handleMaterialAddLink}
            color="primary"
            disabled={saving}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={modals[1]}
        keepMounted
        onClose={() => {
          if (!saving) {
            FileUpload.removeFiles("materials");
            setHasFiles(false);
            setForm(null);
            setModals([modals[0], !modals[1]]);
          }
        }}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">Upload</DialogTitle>
        <DialogContent>
          <DialogContent id="alert-dialog-slide-description">
            <Box display="flex" flexWrap="wrap">
              <TextField
                label="Title"
                className={styles.textField}
                value={form && form.title}
                onChange={(e) => setForm({ title: e.target.value })}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
              />
            </Box>
          </DialogContent>
          {hasFiles &&
            FileUpload.getFiles("materials").map((f, i) => (
              <div key={i}>{f.uploaded_file}</div>
            ))}
        </DialogContent>
        <DialogActions style={{ justifyContent: "space-between" }}>
          <div>
            <input
              style={{ display: "none" }}
              type="file"
              id="materials-upload"
              onChange={(e) => {
                stageFiles("materials", e.target.files);
                setHasFiles(true);
              }}
              multiple
            />
            <Button
              onClick={() =>
                document.querySelector("#materials-upload").click()
              }
              variant="outlined"
              style={{ float: "left" }}
              disabled={saving ? true : false}
            >
              <AttachFileOutlinedIcon />
              Add
            </Button>
          </div>
          <DialogActions>
            <Button
              onClick={() => {
                if (!saving) {
                  FileUpload.removeFiles("materials");
                  setHasFiles(false);
                  setForm(null);
                  setModals([modals[0], false]);
                }
              }}
              disabled={saving ? true : false}
              variant="outlined"
            >
              Cancel
            </Button>
            <div style={{ position: "relative" }}>
              <Button
                variant="contained"
                onClick={_handleMaterialUpload}
                className={styles.wrapper}
                color="primary"
                disabled={saving ? true : false}
              >
                Upload
              </Button>
              {saving && (
                <CircularProgress size={24} className={styles.buttonProgress} />
              )}
            </div>
          </DialogActions>
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
  itemLoading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    zIndex: 5,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    "& > div": {
      position: "relative",
      zIndex: 2,
    },
    "&::before": {
      content: "''",
      position: "absolute",
      backgroundColor: theme.palette.type === "dark" ? "#111" : "#fff",
      opacity: 0.7,
      top: 0,
      zIndex: 0,
      left: 0,
      right: 0,
      bottom: 0,
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
  hideonmobile: {
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
  },
  listItem: {
    backgroundColor: theme.palette.grey[100],
    borderLeft: "4px solid",
    marginBottom: 7,
  },
}));

export default connect((states) => ({
  userInfo: states.userInfo,
  classDetails: states.classDetails,
}))(InstructionalMaterials);
