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
  Menu,
  MenuItem,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  DialogContent,
  DialogContentText,
  Slide,
  Snackbar,
  Paper,
  withStyles,
  Box,
  Button,
  TextField,
  IconButton,
  useTheme,
  Checkbox,
  useMediaQuery,
  ListItemSecondaryAction,
  makeStyles,
  Typography,
  Link,
  Toolbar,
  ListItemAvatar,
  Avatar,
  ExpansionPanelActions,
  Icon,
} from "@material-ui/core";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import MoreHorizOutlinedIcon from "@material-ui/icons/MoreHorizOutlined";
import ArrowDownwardOutlinedIcon from "@material-ui/icons/ArrowDownwardOutlined";
import ArrowUpwardOutlinedIcon from "@material-ui/icons/ArrowUpwardOutlined";
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
import UserData, { asyncForEach } from "../../components/UserData";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import $ from "jquery";
import MuiAlert from "@material-ui/lab/Alert";
import CloseIcon from "@material-ui/icons/Close";
import FullscreenIcon from "@material-ui/icons/Fullscreen";
import FullscreenExitIcon from "@material-ui/icons/FullscreenExit";
import socket from "../../components/socket.io";
import Api from "../../api";
import Pagination, { getPageItems } from "../../components/Pagination";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import {
  ScheduleSelector,
  StatusSelector,
  SearchInput,
} from "../../components/Selectors";
import { CheckBoxAction } from "../../components/CheckBox";
import Progress from "../../components/Progress";
import store from "../../components/redux/store";
import RefreshIcon from "@material-ui/icons/Refresh";
import StudentRating from "../../components/StudentRating";
const queryString = require("query-string");
function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});
const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

function Activity(props) {
  const theme = useTheme();
  const query = queryString.parse(window.location.search);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [saving, setSaving] = useState(false);
  const [hasFiles, setHasFiles] = useState([false, false]);
  const { class_id, option_name, schedule_id } = props.match.params;
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
  const [confirmed, setConfirmed] = useState(false);
  const [savingId, setSavingId] = useState([]);
  const [fileFullScreen, setFileFullScreen] = useState(false);
  const [selectedItems, setSelectedItems] = useState({});
  const [progressData, setProgressData] = useState([]);
  const [answersSearch, setAnswersSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(
    isTeacher
      ? query.status && query.status !== "all"
        ? query.status
        : null
      : "published"
  );
  const [page, setPage] = useState(query.page ? parseInt(query.page) : 1);
  const [answerPage, setAnswerPage] = useState(1);
  const [selectedSched, setSelectedSched] = useState(
    query.date && query.date !== -1 ? parseInt(query.date) : -1
  );
  const formTemplate = {
    activity_type: 1,
    title: "",
    description: "",
    available_from: moment(new Date()).format("YYYY-MM-DD"),
    available_to: moment(new Date()).format("YYYY-MM-DD"),
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
        console.log({
          ...file,
          activity_type: file.activity_type === "class activity" ? 1 : 2,
          published: file.status === "unpublished" ? 0 : 1,
          subject_id: props.classDetails[class_id].subject.id,
          id: file.id,
          class_id,
        });
        setForm({
          ...file,
          activity_type: file.activity_type === "class activity" ? 1 : 2,
          published: file.status === "unpublished" ? 0 : 1,
          subject_id: props.classDetails[class_id].subject.id,
          id: file.id,
          class_id,
        });
        return;
      case "publish":
        _handleUpdateActivityStatus(file, 1);
        return;
      case "unpublish":
        _handleUpdateActivityStatus(file, 0);
        return;
      case "delete":
        _handleRemoveActivity(file);
        return;
      default:
        return;
    }
  };
  useEffect(
    () =>
      setSelectedSched(
        query.date && query.date !== -1 ? parseInt(query.date) : -1
      ),
    [query.date]
  );
  useEffect(() => {
    if (currentActivity) {
      let offset = $("#video-conference-container");
      offset = offset[0] ? offset[0].offsetHeight : 0;
      document.querySelector("#right-panel").scrollTop = offset;
      $("#navbar-title").text(currentActivity.title);
    } else {
      setAnswersSearch("");
    }
  }, [currentActivity]);
  const _getActivities = () => {
    if (!classSched) return;
    try {
      let a = props.classDetails[class_id].schedules;
      let allActivities = [];
      a.forEach((s) => {
        if (s.activities) {
          s.activities.forEach((ss) => {
            allActivities.push({ ...ss, schedule_id: s.id });
          });
        }
      });
      setActivities(allActivities);
      setAnchorEl(() => {
        let a = {};
        allActivities.forEach((i) => {
          a[i.id] = null;
        });
        return a;
      });
    } catch (e) {}
  };
  useEffect(() => {
    if (props.classDetails[class_id]) {
      _getActivities();
    }
  }, [props.classDetails[class_id]]);

  useEffect(() => {
    if (!fileViewerOpen) setFile();
  }, [fileViewerOpen]);
  useEffect(() => {
    if (currentActivity) {
      if (!currentActivity.answers) getAnswers();
    }
  }, [currentActivity]);
  const getAnswers = async () => {
    currentActivity.answers = null;
    let a = await Api.get(
      "/api/teacher/activity-answers/" + currentActivity.id
    );
    await asyncForEach(a, async (s, index, arr) => {
      if (store.getState().pics[s.student.id]) {
        a[index].student.pic = store.getState().pics[s.student.id];
        return;
      }
      try {
        let pic = await Api.postBlob("/api/download/user/profile-picture", {
          body: { id: s.student.id },
        }).then((resp) => (resp.ok ? resp.blob() : null));
        if (pic) {
          var picUrl = URL.createObjectURL(pic);
          let userpic = {};
          userpic[s.student.id] = picUrl;
          store.dispatch({
            type: "SET_PIC",
            userpic,
          });
          a[index].student.pic = picUrl;
        }
      } catch (e) {
        a[index].student.pic = "/logo192.png";
      }
    });
    console.log({ ...currentActivity, answers: a });
    setCurrentActivity({ ...currentActivity, answers: a });
  };
  const _handleSort = (sortBy) => {
    if (sortType === "ASCENDING") {
      setActivities(() => {
        if (sortBy !== "available_from")
          return activities.sort(
            (a, b) => "" + a[sortBy].localeCompare(b[sortBy])
          );
        else
          return activities.sort(
            (a, b) => new Date(a[sortBy]) - new Date(b[sortBy])
          );
      });
      setSortType("DESCENDING");
    } else {
      setActivities(() => {
        if (sortBy !== "available_from")
          return activities.sort(
            (b, a) => "" + a[sortBy].localeCompare(b[sortBy])
          );
        else
          return activities.sort(
            (b, a) => new Date(a[sortBy]) - new Date(b[sortBy])
          );
      });
      setSortType("ASCENDING");
    }
  };
  const _handleSearch = (e) => {
    setSearch(e.toLowerCase());
    setPage(1);
  };

  const handleClickOpen = () => {
    setModals([true, modals[1]]);
  };

  const handleClose = () => {
    setModals([false, modals[1]]);
    setHasFiles([hasFiles[0], false]);
    window.contentMakerFile = null;
    FileUpload.removeFiles("activity-materials");
  };
  const _handleItemClick = (item) => {
    setCurrentActivity(
      currentActivity && parseInt(item.id) === parseInt(currentActivity.id)
        ? undefined
        : item
    );
  };
  const _handleCreateActivity = async (params = {}, noupdate = false) => {
    setErrors(null);
    setSaving(true);
    let err = [];
    let res;
    let newScheduleDetails;
    let formData = new Form({
      ...form,
      subject_id: props.classDetails[class_id].subject.id,
      schedule_id: selectedSched >= 0 ? selectedSched : classSched,
      ...params,
    });
    if (formData.data.published && formData.data.id) {
      try {
        await Api.post("/api/class/activity/publish/" + formData.data.id, {});
      } catch (e) {
        setErrors(["Oops! Something when wrong. Please try again."]);
      }
    }
    try {
      res = await formData.send("/api/class/activity/save");
    } catch (e) {
      setErrors(["Oops! Something when wrong. Please try again."]);
    }
    if (res) {
      if (!res.errors) {
        let materialFiles = document.querySelector("#activity-material");
        if (form.materials && Object.keys(newMaterial).length) {
          await asyncForEach(form.materials, async (m) => {
            if (m.uploaded_file) return;
            await Api.post("/api/class/activity-material/save", {
              body: {
                ...(m.id ? { id: m.id } : {}),
                url: m.resource_link,
                title: m.title,
                activity_id: res.id,
              },
            });
          });
        }
        if (window.contentMakerFile) {
          let body = new FormData();
          body.append("file", window.contentMakerFile);
          body.append("assignment_id", res.id);
          body.append("title", window.contentMakerFile.name);
          let a = await FileUpload.upload("/api/upload/activity/material", {
            body,
            onUploadProgress: (event, source) =>
              store.dispatch({
                type: "SET_PROGRESS",
                id: option_name,
                data: {
                  title: window.contentMakerFile.name,
                  loaded: event.loaded,
                  total: event.total,
                  onCancel: source,
                },
              }),
          });
          if (a.errors) {
            for (let e in a.errors) {
              err.push(a.errors[e][0]);
            }
          }
        }
        if (materialFiles.files.length) {
          await asyncForEach(materialFiles.files, async (file) => {
            let body = new FormData();
            body.append("file", file);
            body.append("assignment_id", res.id);
            body.append("title", file.name);
            let a = await FileUpload.upload("/api/upload/activity/material", {
              body,
              onUploadProgress: (event, source) =>
                store.dispatch({
                  type: "SET_PROGRESS",
                  id: option_name,
                  data: {
                    title: file.name,
                    loaded: event.loaded,
                    total: event.total,
                    onCancel: source,
                  },
                }),
            });
            if (a.errors) {
              for (let e in a.errors) {
                err.push(a.errors[e][0]);
              }
            }
          });
        }
        if (!noupdate) {
          newScheduleDetails = await UserData.updateScheduleDetails(
            class_id,
            selectedSched >= 0 ? selectedSched : schedule_id
          );
          socket.emit("update schedule details", {
            id: class_id,
            details: newScheduleDetails,
          });
        }
      } else {
        for (let e in res.errors) {
          err.push(res.errors[e][0]);
        }
        setErrors(err);
      }
    }
    if (!errors && res) {
      setSuccess(true);
      for (let i = 0; i < newScheduleDetails.activities.length; i++) {
        if (newScheduleDetails.activities[i].id === res.id) {
          setForm({
            ...newScheduleDetails.activities[i],
            schedule_id: newScheduleDetails.id,
            activity_type: res.activity_type === "class activity" ? 1 : 2,
            published: res.status === "unpublished" ? 0 : 1,
            subject_id: props.classDetails[class_id].subject.id,
            class_id,
          });
          FileUpload.removeFiles("activity-materials");
          if (document.querySelector("#activity-material"))
            document.querySelector("#activity-material").value = "";
          setNewMaterial({});
          window.contentMakerFile = null;
          setSaving(false);
        }
      }
    } else {
      setSaving(false);
    }
    setSavingId([]);
    setProgressData([]);
  };

  const _handleUpdateActivityStatus = async (a, s) => {
    let stat = s ? "Publish" : "Unpublish";
    setConfirmed({
      title: stat + " Activity",
      message: "Are you sure to " + stat + " this activity?",
      yes: async () => {
        setErrors(null);
        setSaving(true);
        setConfirmed(null);
        setSavingId([...savingId, a.id]);
        await _handleCreateActivity({
          ...a,
          activity_type: a.activity_type === "class activity" ? 1 : 2,
          published: s,
          schedule_id: a.schedule_id,
          subject_id: props.classDetails[class_id].subject.id,
          id: a.id,
          class_id,
        });
        let newScheduleDetails = await UserData.updateScheduleDetails(
          class_id,
          a.schedule_id
        );
        console.log("update", newScheduleDetails);
        socket.emit("update schedule details", {
          id: class_id,
          details: newScheduleDetails,
        });
        setSavingId([]);

        setSaving(false);
      },
    });
  };
  const _handleRemoveActivity = (activity) => {
    setConfirmed({
      title: "Remove Activity",
      message: "Are you sure to remove this activity?",
      yes: async () => {
        setErrors(null);
        setSaving(true);
        setConfirmed(null);
        setSavingId([...savingId, activity.id]);
        let id = parseInt(activity.id);
        let res;
        try {
          res = await Api.post("/api/teacher/remove/class-activity/" + id, {
            body: {
              id,
            },
          });
        } catch (e) {
          setErrors(["Oops! Something went wrong. Please try again later."]);
          setSavingId([]);
          setSaving(false);
          return;
        }
        if (res && !res.errors) {
          setSuccess(true);
          let newScheduleDetails = await UserData.updateScheduleDetails(
            class_id,
            activity.schedule_id
          );
          socket.emit("update schedule details", {
            id: class_id,
            details: newScheduleDetails,
          });
        } else if (res.errors) {
          let err = [];
          for (let e in res.errors) {
            err.push(res.errors[e][0]);
          }
          setErrors(err);
        }
        setSavingId([]);

        setSaving(false);
      },
    });
  };
  const _handleUpdateActivitiesStatus = (a, s) => {
    let stat = s ? "Publish" : "Unpublish";
    setConfirmed({
      title: stat + " " + Object.keys(a).length + " Activities",
      message: "Are you sure to " + stat + " this activities?",
      yes: async () => {
        setErrors(null);
        setSaving(true);
        setConfirmed(null);
        setSavingId([...savingId, ...Object.keys(a).map((i) => a[i].id)]);
        await asyncForEach(Object.keys(a), async (i) => {
          try {
            await Api.post("/api/class/activity/save", {
              body: {
                ...a[i],
                activity_type: a[i].activity_type === "class activity" ? 1 : 2,
                published: s,
                schedule_id: a[i].schedule_id,
                subject_id: props.classDetails[class_id].subject.id,
                id: a[i].id,
                class_id,
              },
            });
          } catch (e) {
            setErrors(["Oops! Something went wrong. Please try again later."]);
            setSaving(false);
            setSavingId([]);
            return;
          }
        });
        if (selectedSched < 0) {
          let newClassDetails = await UserData.updateClassDetails(class_id);
          UserData.updateClass(class_id, newClassDetails[class_id]);
          socket.emit(
            "new class details",
            JSON.stringify({ details: newClassDetails, id: class_id })
          );
        } else {
          let newScheduleDetails = await UserData.updateScheduleDetails(
            class_id,
            selectedSched
          );
          socket.emit("update schedule details", {
            id: class_id,
            details: newScheduleDetails,
          });
        }

        setSavingId([]);

        setSaving(false);
      },
    });
  };
  const _handleRemoveActivities = (activities) => {
    setConfirmed({
      title: "Remove " + Object.keys(activities).length + " Activities",
      message: "Are you sure to remove this activities?",
      yes: async () => {
        setErrors(null);
        setSaving(true);
        setConfirmed(null);
        setSavingId([
          ...savingId,
          ...Object.keys(activities).map((i) => activities[i].id),
        ]);
        let err = [];
        await asyncForEach(Object.keys(activities), async (i) => {
          let id = parseInt(i);
          let res;
          try {
            res = await Api.post("/api/teacher/remove/class-activity/" + id, {
              body: {
                id,
              },
            });
          } catch (e) {
            setErrors(["Oops! Something went wrong. Please try again later "]);
            setSavingId([]);
            setSaving(false);
            return;
          }
          if (res && res.errors) {
            for (let e in res.errors) {
              err.push(res.errors[e][0]);
            }
            setErrors(err);
          }
        });
        if (selectedSched < 0) {
          let newClassDetails = await UserData.updateClassDetails(class_id);
          UserData.updateClass(class_id, newClassDetails[class_id]);
          socket.emit(
            "new class details",
            JSON.stringify({ details: newClassDetails, id: class_id })
          );
        } else {
          let newScheduleDetails = await UserData.updateScheduleDetails(
            class_id,
            selectedSched
          );
          socket.emit("update schedule details", {
            id: class_id,
            details: newScheduleDetails,
          });
        }
        if (!errors) {
          setSuccess(true);
        }
        setSavingId([]);

        setSaving(false);
      },
    });
  };
  const _handleRemoveMaterial = (material, index) => {
    setConfirmed({
      title: "Remove Material",
      message: "Are you sure to remove this material?",
      yes: async () => {
        if (!material.id) {
          let m = [...form.materials];
          m.splice(index, 1);
          setForm({ ...form, materials: m });
          setConfirmed(null);
          return;
        }
        setSaving(true);
        setErrors(null);
        setConfirmed(null);
        let res = await Api.post(
          "/api/teacher/remove/class-activity-material/" + material.id,
          {
            body: {
              id: material.id,
            },
          }
        );
        if (!res.errors) {
          setSuccess(true);
          let newScheduleDetails = await UserData.updateScheduleDetails(
            class_id,
            selectedSched >= 0 ? selectedSched : schedule_id
          );
          socket.emit("update schedule details", {
            id: class_id,
            details: newScheduleDetails,
          });
          for (let i = 0; i < newScheduleDetails.activities.length; i++) {
            if (newScheduleDetails.activities[i].id === form.id) {
              setForm({
                ...newScheduleDetails.activities[i],
                schedule_id: newScheduleDetails.id,
                activity_type: form.activity_type,
                published: form.status === "unpublished" ? 0 : 1,
                subject_id: props.classDetails[class_id].subject.id,
                class_id,
              });
              setSaving(false);
            }
          }
        } else {
          let err = [];
          for (let e in res.errors) {
            err.push(res.errors[e][0]);
          }
          setErrors(err);
        }
        setSavingId([]);
        setSaving(false);
      },
    });
  };
  const _handleOpenAnswer = async (f) => {
    setFile({
      title: f.name,
    });
    setfileViewerOpen(true);
    let res = await Api.postBlob(
      "/api/download/activity/answer/" + f.id
    ).then((resp) => (resp.ok ? resp.blob() : null));
    if (res)
      setFile({
        ...file,
        url: URL.createObjectURL(
          new File([res], f.name + "'s Activity Answer", { type: res.type })
        ),
        type: res.type,
      });
    else setErrors(["Cannot open file."]);
  };
  const _handleOpenFile = async (f) => {
    setFile({
      title: f.resource_link ? f.resource_link : f.uploaded_file,
    });
    setfileViewerOpen(true);
    if (!f.uploaded_file) {
      setFile({
        ...file,
        url: f.resource_link,
      });
      return;
    }
    let res = await Api.postBlob(
      "/api/download/activity/material/" + f.id
    ).then((resp) => (resp.ok ? resp.blob() : null));
    if (res)
      setFile({
        ...file,
        url: URL.createObjectURL(
          new File([res], "activity-material-" + f.id, { type: res.type })
        ),
        type: res.type,
      });
    else setErrors(["Cannot open file."]);
  };

  const _handleAnswerUpload = async () => {
    setErrors(null);
    setSaving(true);
    let err = [];
    let body = new FormData();
    body.append("file", FileUpload.files["answers"][0]);
    body.append("assignment_id", currentActivity.id);
    let a = await FileUpload.upload("/api/upload/activity/answer", {
      body,
      onUploadProgress: (event, source) =>
        store.dispatch({
          type: "SET_PROGRESS",
          id: option_name,
          data: {
            title: FileUpload.files["answers"][0].name,
            loaded: event.loaded,
            total: event.total,
            onCancel: source,
          },
        }),
    });
    if (a.errors) {
      for (let e in a.errors) {
        err.push(a.errors[e][0]);
      }
      setErrors(err);
    } else {
      setSuccess(true);
      FileUpload.removeFiles("answer");
      setHasFiles([false, false]);
    }

    getAnswers();
    setProgressData([]);
    setSavingId([]);

    setSaving(false);
  };
  const handleGooglePicker = () => {
    let { width, height } = window.screen;
    var top = height;
    top = top > 0 ? top / 2 : 0;
    var left = width;
    left = left > 0 ? left / 2 : 0;
    let picker = window.open(
      "/picker",
      "Google Drive Picker",
      "width=" + width + ",height=" + width + +",top=" + top + ",left=" + left
    );
    picker.onload = () => {
      picker.onunload = () => {
        if (picker.file_url && picker.title) {
          let l = picker.file_url;
          l = l.replace(l.substr(l.indexOf("/view"), l.length), "/preview");
          let newmaterial = {
            title: picker.title,
            resource_link: l,
          };
          let m = form.materials
            ? [newmaterial, ...form.materials]
            : [newmaterial];
          setForm({ ...form, materials: m });
        }
      };
    };
  };
  const handleCreateContent = () => {
    let { width, height } = window.screen;
    var top = height;
    top = top > 0 ? top / 2 : 0;
    var left = width;
    left = left > 0 ? left / 2 : 0;
    var contentMaker = window.open(
      "/content-maker",
      "Content Maker",
      "width=" + width + ",height=" + width + +",top=" + top + ",left=" + left
    );
    contentMaker.onunload = () => {
      if (contentMaker.file) {
        stageFiles("activity-materials", contentMaker.file);
        window.contentMakerFile = contentMaker.file;
        setHasFiles([hasFiles[0], true]);
      }
    };
  };

  const _handleSelectOption = (item) => {
    if (selectedItems[item.id]) {
      let b = { ...selectedItems };
      delete b[item.id];
      setSelectedItems(b);
      return;
    }
    let newitem = {};
    newitem[item.id] = item;
    setSelectedItems({ ...selectedItems, ...newitem });
  };

  const getFilteredActivities = () =>
    activities
      .filter((a) => JSON.stringify(a).toLowerCase().indexOf(search) >= 0)
      .filter((a) => (isTeacher ? true : a.status === "published"))
      .filter((a) =>
        parseInt(selectedSched) >= 0
          ? parseInt(selectedSched) === parseInt(a.schedule_id)
          : true
      )
      .filter((a) => (selectedStatus ? selectedStatus === a.status : true))
      .reverse();
  const _selectAll = () => {
    let filtered = getPageItems(getFilteredActivities(), page);
    if (Object.keys(selectedItems).length === filtered.length) {
      setSelectedItems({});
      return;
    }
    let b = {};
    filtered.forEach((a) => {
      b[a.id] = a;
    });
    setSelectedItems(b);
  };
  useEffect(() => {
    if (document.querySelector("#activity-material") && !saving)
      document.querySelector("#activity-material").value = "";
  }, []);
  useEffect(() => {
    _getActivities();
    props.onLoad();
  }, [props.classDetails]);
  return (
    <Box width="100%" alignSelf="flex-start" height="100%">
      {props.dataProgress[option_name] && (
        <Progress id={option_name} data={props.dataProgress[option_name]} />
      )}
      <StudentRating
        activity={currentActivity}
        open={currentActivity && currentActivity.rateStudent}
        onClose={() =>
          setCurrentActivity({ ...currentActivity, rateStudent: null })
        }
      />
      {confirmed && (
        <Dialog
          open={confirmed ? true : false}
          onClose={() => setConfirmed(null)}
        >
          <DialogTitle>{confirmed.title}</DialogTitle>
          <DialogContent>{confirmed.message}</DialogContent>
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
      )}
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
      <Dialog
        open={fileViewerOpen}
        keepMounted
        id="file-viewer-container"
        fullWidth
        onClose={() => setfileViewerOpen(false)}
        maxWidth="xl"
        fullScreen={fileFullScreen}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        {file && (
          <DialogContent style={{ height: "100vh" }}>
            <Toolbar
              style={{
                position: "sticky",
                zIndex: 10,
                background: "#fff",
                top: 0,
                height: "6%",
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
                {/* {file.title} */}
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
            style={{ order: isMobile ? 2 : 0 }}
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
          <ScheduleSelector
            onChange={(schedId) => setSelectedSched(schedId)}
            schedule={selectedSched >= 0 ? selectedSched : -1}
            match={props.match}
          />
          &nbsp;
          {isTeacher && (
            <StatusSelector
              onChange={(statusId) => setSelectedStatus(statusId)}
              status={selectedStatus ? selectedStatus : "all"}
              match={props.match}
            />
          )}
          &nbsp;
          <SearchInput onChange={(e) => _handleSearch(e)} />
        </Box>
      </Box>
      {currentActivity && !search && (
        <Grow in={true}>
          <Box p={2}>
            <Paper id="activity-preview">
              <Box p={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography style={{ fontWeight: "bold" }} variant="body1">
                    {currentActivity.title}
                  </Typography>
                  <IconButton onClick={() => setCurrentActivity(null)}>
                    <CloseIcon />
                  </IconButton>
                </Box>
                <Box m={2} style={{ marginLeft: 0, marginRight: 0 }}>
                  <Typography component="div">
                    {moment(currentActivity.available_from).format("LL")} -{" "}
                    {moment(currentActivity.available_to).format("LL")}
                  </Typography>
                  <Typography style={{ whiteSpace: "pre-wrap" }}>
                    {currentActivity.description}
                  </Typography>
                </Box>
                <Box display="inline-block">
                  <Typography color="textSecondary">Resources</Typography>
                  {currentActivity.materials.map((m, i) => (
                    <Typography component="div" key={i}>
                      <Link
                        component="div"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          _handleOpenFile(m);
                        }}
                      >
                        {m.title}
                        <LaunchIcon fontSize="small" />
                      </Link>
                    </Typography>
                  ))}
                </Box>
              </Box>
            </Paper>
            <Box marginTop={2}>
              <ExpansionPanel
                onChange={(e, v) =>
                  setCurrentActivity({
                    ...currentActivity,
                    expanded: currentActivity.expanded
                      ? !currentActivity.expanded
                      : true,
                  })
                }
              >
                <ExpansionPanelSummary>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexDirection: "row",
                      width: "100%",
                    }}
                  >
                    <Typography
                      style={{ fontWeight: "bold", marginBottom: 7 }}
                      color="textSecondary"
                    >
                      {!isTeacher && "Your "}Answers
                    </Typography>
                    <Icon>
                      {currentActivity.expanded ? "expand_less" : "expand_more"}
                    </Icon>
                  </div>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails style={{ flexWrap: "wrap" }}>
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      textAlign: "right",
                    }}
                  >
                    <IconButton
                      onClick={() => {
                        setCurrentActivity({
                          ...currentActivity,
                          answers: null,
                        });
                        getAnswers();
                      }}
                    >
                      <RefreshIcon />
                    </IconButton>
                    <SearchInput
                      onChange={(e) => {
                        setAnswersSearch(e.toLowerCase());
                        setAnswerPage(1);
                      }}
                    />
                  </div>
                  {currentActivity.answers && !currentActivity.answers.length && (
                    <div>
                      <Typography variant="body1" color="textPrimary">
                        NO SUBMISSIONS YET
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Students' submissions will be shown in a table once they
                        submit the papers
                      </Typography>
                    </div>
                  )}
                  {currentActivity.answers ? (
                    <List style={{ width: "100%" }}>
                      {getPageItems(
                        currentActivity.answers
                          .filter((a) =>
                            isTeacher
                              ? true
                              : parseInt(a.student.id) ===
                                parseInt(props.userInfo.id)
                          )
                          .filter(
                            (a) =>
                              JSON.stringify(a)
                                .toLowerCase()
                                .indexOf(answersSearch) >= 0
                          ),
                        answerPage
                      ).map((i) => {
                        return (
                          <ListItem>
                            <ListItemAvatar>
                              <Avatar
                                src={i.student.pic}
                                alt={i.student.first_name}
                              />
                            </ListItemAvatar>
                            <ListItemText
                              onClick={() =>
                                _handleOpenAnswer({
                                  id: i.id,
                                  name:
                                    i.student.first_name +
                                    " " +
                                    i.student.last_name,
                                })
                              }
                              primary={
                                i.student.first_name + " " + i.student.last_name
                              }
                            />
                            <ListItemSecondaryAction>
                              <IconButton
                                onClick={() =>
                                  setCurrentActivity({
                                    ...currentActivity,
                                    rateStudent: true,
                                    student: {
                                      ...i.student,
                                    },
                                  })
                                }
                              >
                                <MoreHorizOutlinedIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        );
                      })}
                    </List>
                  ) : (
                    <Box
                      display="flex"
                      justifyContent="center"
                      flexDirection="row"
                    >
                      <CircularProgress />
                    </Box>
                  )}
                  {currentActivity.answers && (
                    <Box p={2} width="100%">
                      <Pagination
                        nolink
                        noEmptyMessage={answersSearch ? false : true}
                        icon={answersSearch ? "person_search" : ""}
                        emptyTitle={"Nothing Found"}
                        emptyMessage={"Try a different keyword."}
                        page={answerPage}
                        match={props.match}
                        onChange={(p) => setAnswerPage(p)}
                        count={
                          currentActivity.answers
                            .filter((a) =>
                              isTeacher
                                ? true
                                : parseInt(a.student.id) ===
                                  parseInt(props.userInfo.id)
                            )
                            .filter(
                              (a) =>
                                JSON.stringify(a)
                                  .toLowerCase()
                                  .indexOf(answersSearch) >= 0
                            ).length
                        }
                      />
                    </Box>
                  )}
                </ExpansionPanelDetails>
              </ExpansionPanel>
            </Box>
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
                    <input
                      type="file"
                      id="activity-answer"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        let isfiles = document.querySelector("#activity-answer")
                          .files.length
                          ? true
                          : false;
                        stageFiles(
                          "answers",
                          document.querySelector("#activity-answer").files
                        );
                        setHasFiles([isfiles, hasFiles[1]]);
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
                                  document
                                    .querySelector("#activity-answer")
                                    .click()
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
                            {saving && (
                              <div
                                style={{
                                  position: "absolute",
                                  left: 0,
                                  right: 0,
                                  zIndex: 5,
                                  top: 0,
                                  bottom: 0,
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  background: "rgba(255,255,255,0.5)",
                                }}
                              >
                                <CircularProgress size={24} />
                              </div>
                            )}
                            <div>
                              {FileUpload.getFiles("answers").map((f, i) => (
                                <Typography
                                  variant="body1"
                                  color="primary"
                                  key={i}
                                >
                                  {f.uploaded_file}
                                </Typography>
                              ))}
                            </div>
                            <div>
                              <Button onClick={_handleAnswerUpload}>
                                Upload
                              </Button>
                              <Button
                                onClick={() => {
                                  FileUpload.removeFiles("answers");
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
      {activities && (
        <Box width="100%" alignSelf="flex-start">
          <Box m={2}>
            {!Object.keys(selectedItems).length ? (
              <List>
                <ListItem
                  ContainerComponent="li"
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    backgroundColor: "transparent",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {isTeacher && (
                      <ListItemIcon>
                        <Checkbox
                          checked={
                            Object.keys(selectedItems).length ===
                            getPageItems(getFilteredActivities(), page).length
                              ? getPageItems(getFilteredActivities(), page)
                                  .length > 0
                                ? true
                                : false
                              : false
                          }
                          onChange={() => {
                            _selectAll();
                          }}
                        />
                      </ListItemIcon>
                    )}
                    <Button size="small" onClick={() => _handleSort("title")}>
                      <ListItemText primary="Title" />
                      {sortType === "ASCENDING" ? (
                        <ArrowUpwardOutlinedIcon />
                      ) : (
                        <ArrowDownwardOutlinedIcon />
                      )}
                    </Button>
                  </div>
                  <Typography
                    variant="body1"
                    style={{ marginRight: 10 }}
                    onClick={() => _handleSort("available_from")}
                  >
                    DATE
                  </Typography>
                  <ListItemSecondaryAction></ListItemSecondaryAction>
                </ListItem>
              </List>
            ) : (
              <CheckBoxAction
                checked={
                  Object.keys(selectedItems).length ===
                  getFilteredActivities().length
                }
                onSelect={_selectAll}
                onDelete={() => _handleRemoveActivities(selectedItems)}
                onCancel={() => setSelectedItems({})}
                onUnpublish={() =>
                  _handleUpdateActivitiesStatus(selectedItems, 0)
                }
                onPublish={() =>
                  _handleUpdateActivitiesStatus(selectedItems, 1)
                }
              />
            )}
            <Grow in={activities ? true : false}>
              <List>
                {getPageItems(getFilteredActivities(), page).map(
                  (item, index) => (
                    <ListItem
                      key={index}
                      className={styles.listItem}
                      style={{
                        borderColor:
                          item.status === "published"
                            ? theme.palette.success.main
                            : "#fff",
                        ...(currentActivity &&
                        parseInt(item.id) === parseInt(currentActivity.id)
                          ? {
                              background:
                                props.theme === "dark" ? "#111" : "#fff",
                            }
                          : {}),
                      }}
                    >
                      {isTeacher && (
                        <ListItemIcon>
                          <Checkbox
                            checked={selectedItems[item.id] ? true : false}
                            onChange={() => {
                              _handleSelectOption(item);
                            }}
                          />
                        </ListItemIcon>
                      )}
                      {saving && savingId.indexOf(item.id) >= 0 && (
                        <div className={styles.itemLoading}>
                          <CircularProgress />
                        </div>
                      )}

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
                          <ListItemText
                            primary={item.title}
                            primaryTypographyProps={{
                              style: {
                                width: isMobile ? "80%" : "100%",
                              },
                            }}
                            secondaryTypographyProps={{
                              style: {
                                width: isMobile ? "80%" : "100%",
                              },
                            }}
                            secondary={item.description.substr(0, 100) + "..."}
                          />
                          <Typography
                            className={styles.hideonmobile}
                            variant="body1"
                            component="div"
                            style={{ marginRight: 55 }}
                          >
                            {moment(item.available_from).format("LL")}
                            &nbsp;-&nbsp;
                            {moment(item.available_to).format("LL")}
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
                            {item.materials.map((m, i) => (
                              <Typography key={i} component="div">
                                <Link
                                  component="div"
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    _handleOpenFile(m);
                                  }}
                                >
                                  {m.title}
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
                            <StyledMenuItem
                              onClick={() => _handleFileOption("view", item)}
                            >
                              <ListItemText
                                primary={isTeacher ? "View" : "Upload Answer"}
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
                                  onClick={() =>
                                    _handleFileOption("edit", item)
                                  }
                                >
                                  <ListItemText primary="Edit" />
                                </StyledMenuItem>
                                <StyledMenuItem
                                  onClick={() => {
                                    _handleFileOption("delete", item);
                                  }}
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
              page={page}
              match={props.match}
              icon={search ? "search" : ""}
              emptyTitle={search ? "Nothing Found" : false}
              emptyMessage={search ? "Try a different keyword." : false}
              onChange={(p) => setPage(p)}
              count={getFilteredActivities().length}
            />
          </Box>
        </Box>
      )}
      <Dialog
        open={modals[0]}
        TransitionComponent={Transition}
        keepMounted
        fullScreen={true}
        onClose={handleClose}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title" onClose={handleClose}>
          {form.id ? "Edit Activity" : "Create Activity"}
        </DialogTitle>
        <DialogContent
          style={{ display: "flex", flexWrap: isMobile ? "wrap" : "nowrap" }}
        >
          <Box display="block" width={isMobile ? "100%" : "70%"} m={2}>
            <TextField
              label="Title"
              variant="filled"
              className={styles.textField}
              InputLabelProps={{
                shrink: true,
              }}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
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
                  style={{ width: "49%" }}
                  margin="normal"
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
                  style={{ width: "49%" }}
                  format="MMM DD, YYYY"
                  margin="normal"
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
            <TextField
              label="Description"
              variant="filled"
              rows={10}
              style={{ marginTop: 13 }}
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
          </Box>
          <Box flex={1} m={isMobile ? 0 : 2} width={isMobile ? "100%" : "30%"}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              flexDirection="row"
            >
              <Box>
                <input
                  type="file"
                  id="activity-material"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    let isfiles = document.querySelector("#activity-material")
                      .files.length
                      ? true
                      : false;
                    stageFiles(
                      "activity-materials",
                      document.querySelector("#activity-material").files
                    );
                    setHasFiles([hasFiles[0], isfiles]);
                  }}
                  multiple
                />
                <PopupState variant="popover" popupId="publish-btn">
                  {(popupState) => (
                    <React.Fragment>
                      <Button variant="outlined" {...bindTrigger(popupState)}>
                        <AttachFileOutlinedIcon />
                        Attach Material
                      </Button>
                      <Menu {...bindMenu(popupState)}>
                        <MenuItem
                          onClick={() => {
                            document
                              .querySelector("#activity-material")
                              .click();
                            popupState.close();
                          }}
                        >
                          File
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            setModals([modals[0], true]);
                            popupState.close();
                          }}
                        >
                          Link
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            handleGooglePicker();
                            popupState.close();
                          }}
                        >
                          Google Drive
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            handleCreateContent();
                            popupState.close();
                          }}
                        >
                          Content Maker
                        </MenuItem>
                      </Menu>
                    </React.Fragment>
                  )}
                </PopupState>
              </Box>
              <Box>
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Button
                    variant="contained"
                    style={{
                      borderRadius: "5px 0 0 5px",
                      marginRight: 0,
                      boxShadow: "none",
                      position: "relative",
                    }}
                    onClick={() => _handleCreateActivity()}
                    color="primary"
                    className={styles.wrapper}
                    disabled={saving}
                  >
                    Save
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
                        <CircularProgress size={15} />
                      </div>
                    )}
                  </Button>
                  <PopupState variant="popover" popupId="publish-btn">
                    {(popupState) => (
                      <React.Fragment>
                        <Button
                          style={{
                            width: 30,
                            borderRadius: "0 5px 5px 0",
                            marginLeft: 1,
                            boxShadow: "none",
                            minWidth: "auto",
                            paddingLeft: 7,
                            paddingRight: 7,
                          }}
                          disabled={saving}
                          variant="contained"
                          color="primary"
                          {...bindTrigger(popupState)}
                        >
                          <ArrowDropDownIcon />
                        </Button>
                        <Menu {...bindMenu(popupState)}>
                          <MenuItem
                            disabled={form.status !== "unpublished"}
                            onClick={() => {
                              _handleCreateActivity({ published: 1 });
                              popupState.close();
                            }}
                          >
                            Publish
                          </MenuItem>
                          {form.id && (
                            <MenuItem
                              disabled={form.status === "unpublished"}
                              onClick={() => {
                                _handleCreateActivity({ published: 0 });
                                popupState.close();
                              }}
                            >
                              Unpublish
                            </MenuItem>
                          )}
                        </Menu>
                      </React.Fragment>
                    )}
                  </PopupState>
                </div>
              </Box>
            </Box>
            {hasFiles[1] && (
              <Box style={{ marginTop: 7 }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  width="100%"
                  alignItems="center"
                >
                  <Typography variant="body1" color="textSecondary">
                    Files ({FileUpload.getFiles("activity-materials").length})
                  </Typography>
                </Box>
                <List dense={true}>
                  {FileUpload.getFiles("activity-materials").map((f, i) => (
                    <ListItem key={i}>
                      <ListItemText primary={f.uploaded_file} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            {!hasFiles[1] && !form.materials && (
              <Typography color="textSecondary" variant="body1" align="center">
                No attachments
              </Typography>
            )}
            {form.materials && (
              <Box style={{ marginTop: 7 }}>
                <Typography variant="body1" color="textSecondary">
                  Activity Materials ({form.materials.length})
                </Typography>
                <List dense={true}>
                  {form.materials.map((f, i) => (
                    <ListItem key={i}>
                      <ListItemText primary={f.title} />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => {
                            if (!saving) _handleRemoveMaterial(f, i);
                          }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        </DialogContent>
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
          <DialogContent id="alert-dialog-slide-description">
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
          </DialogContent>
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
  expansionSummary: {
    "& > div": {
      alignItems: "center",
      width: "100%",
    },
  },
  expansionDetails: {
    flexWrap: "wrap",
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
    borderLeft: "4px solid",
    marginBottom: 7,
  },
}));

export default connect((state) => ({
  userInfo: state.userInfo,
  theme: state.theme,
  pics: state.pics,
  dataProgress: state.dataProgress,
  classDetails: state.classDetails,
}))(Activity);
