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
  FormControl,
  InputLabel,
  Select,
  Chip,
  Divider,
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
import { useHistory } from "react-router-dom";
import { Table as MTable } from "../../components/Table";
import { CreateDialog, GooglePicker } from "../../components/dialogs";
import { makeLinkTo } from "../../components/router-dom";
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
  const history = useHistory();
  const query = queryString.parse(window.location.search);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [saving, setSaving] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState({
    UPLOAD_ANSWER: false,
    ACTIVITY_MATERIALS: false,
  });
  const { class_id, option_name, schedule_id } = props.match.params;
  const [activities, setActivities] = useState();
  const [dragover, setDragover] = useState(false);
  const [search, setSearch] = useState("");
  const [modals, setModals] = React.useState({});
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
  const [fileFullScreen, setFileFullScreen] = useState(true);
  const [answersSearch, setAnswersSearch] = useState("");
  const [contentCreatorFile, setContentCreatorFile] = useState();
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
    rating_type: "none",
    class_id,
  };
  const [form, setForm] = useState(formTemplate);
  const cellheaders = [
    { id: "title", title: "Title", width: "50%" },
    { id: "status", title: "Status", align: "center", width: "15%" },
    { id: "available_from", title: "Date", align: "flex-end", width: "35%" },
  ];
  const _handleFileOption = (option, file) => {
    switch (option) {
      case "view":
        _handleItemClick(file);
        return;
      case "edit":
        handleOpen("ACTIVITY");
        setForm({
          ...file,
          rating_type: "none",
          activity_type: file.activity_type === "class activity" ? 1 : 2,
          published: file.status === "unpublished" ? 0 : 1,
          subject_id: props.classDetails[class_id].subject.id,
          id: file.id,
          class_id,
        });
        return;
      case "open-activity":
        _markActivity(file, "not-done");
        return;
      case "close-activity":
        _markActivity(file, "done");
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
      if (currentActivity) {
        let newAct = allActivities.find((act) => act.id === currentActivity.id);
        if (!newAct) setCurrentActivity(null);
        else
          setCurrentActivity({
            ...currentActivity,
            ...newAct,
          });
      }
      if (query.activity_id) {
        setCurrentActivity(
          allActivities.find((q) => q.id === parseInt(query.activity_id))
        );
      }
    } catch (e) {}
  };
  useEffect(() => {
    if (props.classDetails[class_id]) {
      _getActivities();
      setCurrentActivity(null);
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
    a = props.classDetails[class_id].students.map((s) => {
      let sa = a.find((st) => st.student.id === s.id);

      return sa
        ? { ...sa, student: s }
        : {
            student: s,
          };
    });
    // await asyncForEach(a, async (s, index, arr) => {
    //   if (store.getState().pics[s.student.id]) {
    //     a[index].student.pic = store.getState().pics[s.student.id];
    //     return;
    //   }
    //   try {
    //     let pic = await Api.postBlob("/api/download/user/profile-picture", {
    //       body: { id: s.student.id },
    //     }).then((resp) => (resp.ok ? resp.blob() : null));
    //     if (pic) {
    //       var picUrl = URL.createObjectURL(pic);
    //       let userpic = {};
    //       userpic[s.student.id] = picUrl;
    //       store.dispatch({
    //         type: "SET_PIC",
    //         userpic,
    //       });
    //       a[index].student.pic = picUrl;
    //     }
    //   } catch (e) {
    //     a[index].student.pic = "/logo192.png";
    //   }
    // });
    setCurrentActivity({
      ...currentActivity,
      answers: a.sort((b, c) => (b.answer_media ? -1 : 0)),
    });
  };
  const _handleSearch = (e) => {
    setSearch(e.toLowerCase());
    setPage(1);
  };

  const handleOpen = (name) => {
    let m = { ...modals };
    m[name] = true;
    setModals(m);
  };

  const handleClose = (name) => {
    let m = { ...modals };
    m[name] = false;
    setModals(m);
    if (name === "ACTIVITY") {
      removeFiles("activity-materials", "#activity-material");
    }
  };
  const _handleItemClick = (item) => {
    props.history.push(
      makeLinkTo([
        "class",
        class_id,
        schedule_id,
        option_name,
        "?activity_id=" + item.id,
      ])
    );
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
    if (res && !res.errors) {
      let materialFiles = document.querySelector("#activity-material");
      if (form.materials && newMaterial && Object.keys(newMaterial).length) {
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
      if (contentCreatorFile) {
        let body = new FormData();
        body.append("file", contentCreatorFile);
        body.append("assignment_id", res.id);
        body.append("title", "Activity Material");
        let a = await FileUpload.upload("/api/upload/activity/material", {
          body,
          onUploadProgress: (event, source) =>
            store.dispatch({
              type: "SET_PROGRESS",
              id: option_name,
              data: {
                title: "Activity Material",
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
          let a;
          try {
            a = await FileUpload.upload("/api/upload/activity/material", {
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
              setErrors(["Oops! Something went wrong. Please try again."]);
            }
          } catch (e) {
            setErrors(["Oops! Something went wrong. Please try again."]);
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
      setErrors(["Oops! Something went wrong. Please try again."]);
    }
    let newform;
    if (res && !errors) {
      setSuccess(true);
      try {
        newform = props.classDetails[class_id].schedules[
          schedule_id
        ].activities.filter((a) => a.id === form.id)[0];
        newform.activity_type =
          newform.activity_type === "class activity" ? 1 : 2;
      } catch (e) {
        newform =
          props.classDetails[class_id].schedules[schedule_id].activities;
        newform = newform[newform.length - 1];
        if (newform)
          newform.activity_type =
            newform.activity_type === "class activity" ? 1 : 2;
      }
      removeFiles("activity-materials");
      setNewMaterial({});
      setContentCreatorFile(null);
      setSavingId([]);
    }
    setForm({
      ...form,
      ...(newform ? newform : {}),
    });
    setSaving(false);
  };
  const removeFiles = (id, inputID = null) => {
    setFilesToUpload({});
    FileUpload.removeFiles(id);
    if (inputID && document.querySelector(inputID))
      document.querySelector(inputID).value = "";
  };
  const _markActivity = async (activity, mark) => {
    let done = mark === "done" ? true : false;
    setConfirmed({
      title: (done ? "Close " : "Open ") + " Activity",
      message:
        "Are you sure to " + (done ? "Close" : "Open") + " this activity?",
      yes: async () => {
        setErrors(null);
        setSaving(true);
        setConfirmed(null);
        setSavingId([...savingId, activity.id]);
        let res = await Api.post(
          "/api/class/activity/mark-" + mark + "/" + activity.id
        );
        if (res) {
          let newScheduleDetails = await UserData.updateScheduleDetails(
            class_id,
            schedule_id
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
          setErrors(["Oops! Something went wrong. Please try again."]);
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
            setErrors(["Oops! Something went wrong. Please try again."]);
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
        title: f.name,
        url: URL.createObjectURL(
          new File([res], f.name + "'s Activity Answer", { type: res.type })
        ),
        type: res.type,
      });
    else setErrors(["Cannot open file."]);
  };
  const _handleOpenFile = async (f) => {
    setFile({
      title: f.title,
      error: false,
    });
    setfileViewerOpen(true);
    if (!f.uploaded_file) {
      setFile({
        ...file,
        title: f.title,
        url: f.resource_link,
        error: false,
      });
      return;
    }
    let res = await Api.postBlob(
      "/api/download/activity/material/" + f.id
    ).then((resp) => (resp.ok ? resp.blob() : null));
    if (res)
      setFile({
        ...file,
        title: f.title,
        url: URL.createObjectURL(
          new File([res], "activity-material-" + f.id, { type: res.type })
        ),
        error: false,
        type: res.type,
      });
    else {
      setErrors(["Cannot open file."]);
      setFile({
        ...file,
        title: f.title,
        error: true,
      });
    }
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
      setErrors(["Oops! Something went wrong. Please try again."]);
    } else {
      setSuccess(true);
      removeFiles("answers", "#activity-answer");
    }
    getAnswers();
    setSavingId([]);
    setSaving(false);
  };
  const handleCreateContent = () => {
    window.open("/content-maker?callback=send_item&to=" + socket.id, "_blank");
  };

  const getFilteredActivities = (ac = activities) =>
    ac
      .filter((a) => JSON.stringify(a).toLowerCase().indexOf(search) >= 0)
      .filter((a) => (isTeacher ? true : a.status === "published"))
      .filter((a) =>
        parseInt(selectedSched) >= 0
          ? parseInt(selectedSched) === parseInt(a.schedule_id)
          : true
      )
      .filter((a) => (selectedStatus ? selectedStatus === a.status : true))
      .reverse();

  useEffect(() => {
    socket.on("get item", async (details) => {
      if (details.type === "ATTACH_CONTENTCREATOR") {
        const parsed = JSON.parse(details.data);
        const blob = await fetch(parsed.blob).then((res) => res.blob());
        let file = new File([blob], "Activity Material", { type: blob.type });
        setContentCreatorFile(file);
        stageFiles("activity-materials", file);
        console.log(file, contentCreatorFile);
        setFilesToUpload({ ...filesToUpload, ACTIVITY_MATERIALS: true });
      }
    });
    if (document.querySelector("#activity-material") && !saving)
      removeFiles("activity-materials");
  }, []);
  useEffect(() => {
    _getActivities();
  }, [props.classDetails]);
  const addNewMaterial = (material) => {
    let m = form.materials ? [material, ...form.materials] : [material];
    setForm({ ...form, materials: m });
    setNewMaterial(material);
  };
  return (
    <Box width="100%" alignSelf="flex-start" height="100%">
      <GooglePicker
        auth={(s) => (modals.OPEN_GDRIVE = s)}
        form={form}
        onSelect={({ url, name }) => {
          if (url && name) {
            let l = url;
            l = l.replace(l.substr(l.indexOf("/view"), l.length), "/preview");
            let newM = {
              title: name,
              resource_link: l,
            };
            addNewMaterial(newM);
          }
        }}
      />
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
              error={file.error}
            />
          </DialogContent>
        )}
      </Dialog>
      {!currentActivity && (
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
              style={{ order: isMobile ? 2 : 0, fontWeight: "bold" }}
              color="secondary"
              onClick={() => {
                handleOpen("ACTIVITY");
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
            style={{ width: isMobile ? "100%" : "auto" }}
          >
            <Box
              style={{
                ...(isMobile
                  ? {
                      order: 2,
                      width: "100%",
                      justifyContent: "space-between",
                      margin: "10px 0",
                    }
                  : {}),
                ...{
                  display: "flex",
                },
              }}
            >
              <Box flex={1}>
                <ScheduleSelector
                  onChange={(schedId) => setSelectedSched(schedId)}
                  schedule={selectedSched >= 0 ? selectedSched : -1}
                  match={props.match}
                />
              </Box>
              {!isMobile && String.fromCharCode(160)}
              {isTeacher && (
                <Box flex={1} style={{ marginLeft: 10 }}>
                  <StatusSelector
                    onChange={(statusId) => setSelectedStatus(statusId)}
                    status={selectedStatus ? selectedStatus : "all"}
                    match={props.match}
                  />
                </Box>
              )}
              {!isMobile && String.fromCharCode(160)}
            </Box>
            <SearchInput onChange={(e) => _handleSearch(e)} />
          </Box>
        </Box>
      )}
      {currentActivity && !search && (
        <React.Fragment>
          <Grow in={true}>
            <Box
              p={2}
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
              flexWrap={isMobile ? "wrap" : "nowrap"}
            >
              <Box
                id="activity-preview"
                style={{
                  width: "100%",
                  marginRight: isMobile ? 0 : theme.spacing(2),
                }}
              >
                <Paper>
                  <Toolbar
                    style={{
                      padding: 0,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <IconButton
                        onClick={() => {
                          history.push(
                            makeLinkTo([
                              "class",
                              class_id,
                              schedule_id,
                              option_name,
                            ])
                          );
                          setCurrentActivity(null);
                        }}
                      >
                        <Icon>arrow_back</Icon>
                      </IconButton>
                    </Box>
                    {isTeacher && (
                      <Box>
                        <IconButton
                          onClick={() =>
                            _handleFileOption("publish", currentActivity)
                          }
                        >
                          <Icon>visibility</Icon>
                        </IconButton>
                        <IconButton
                          onClick={() =>
                            _handleFileOption("publish", currentActivity)
                          }
                        >
                          <Icon>visibility</Icon>
                        </IconButton>
                        <IconButton
                          onClick={() =>
                            _handleFileOption("unpublish", currentActivity)
                          }
                        >
                          <Icon>visibility_off</Icon>
                        </IconButton>
                        <IconButton
                          onClick={() =>
                            _handleFileOption("edit", currentActivity)
                          }
                        >
                          <Icon>create</Icon>
                        </IconButton>
                        <IconButton
                          onClick={() =>
                            _handleFileOption("delete", currentActivity)
                          }
                        >
                          <Icon>delete</Icon>
                        </IconButton>
                      </Box>
                    )}
                  </Toolbar>
                  <Box>
                    <Box
                      p={2}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      flexWrap={isMobile ? "wrap" : "nowrap"}
                    >
                      <Box width={isMobile ? "100%" : "auto"}>
                        <Typography
                          style={{ whiteSpace: "pre-wrap", fontWeight: "bold" }}
                          variant="body1"
                        >
                          {currentActivity.title}
                        </Typography>
                      </Box>
                      <Box
                        display="flex"
                        alignItems="center"
                        style={{ whiteSpace: "nowrap" }}
                      >
                        {moment(currentActivity.available_from).format("LL")}
                        <Icon>arrow_right_alt</Icon>
                        {moment(currentActivity.available_to).format("LL")}
                      </Box>
                    </Box>
                    <Box p={2}>
                      <Typography style={{ whiteSpace: "pre-wrap" }}>
                        {currentActivity.description}
                      </Typography>
                    </Box>
                    <Box
                      display="flex"
                      width="100%"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Box p={2}>
                        <Typography
                          color="textSecondary"
                          style={{ fontWeight: "bold" }}
                        >
                          Resources
                        </Typography>
                      </Box>
                      <Box width="100%">
                        <Divider />
                      </Box>
                    </Box>
                    <Box p={2}>
                      {currentActivity.materials.map((m, i) => (
                        <Typography
                          style={{ cursor: "pointer", fontWeight: "bold" }}
                          color="primary"
                          key={i}
                          onClick={() => _handleOpenFile(m)}
                        >
                          {m.title}
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
                          stageFiles(
                            "answers",
                            e.dataTransfer.files,
                            (files) => {
                              setFilesToUpload({
                                ...filesToUpload,
                                UPLOAD_ANSWER: true,
                              });
                            }
                          );
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
                            let isfiles = document.querySelector(
                              "#activity-answer"
                            ).files.length
                              ? true
                              : false;
                            stageFiles(
                              "answers",
                              document.querySelector("#activity-answer").files
                            );
                            setFilesToUpload({
                              ...filesToUpload,
                              UPLOAD_ANSWER: isfiles,
                            });
                            if (!isfiles) removeFiles("activity-answer");
                          }}
                        />
                        <Box className={styles.upload}>
                          {!filesToUpload.UPLOAD_ANSWER ? (
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
                                  {FileUpload.getFiles("answers").map(
                                    (f, i) => (
                                      <Typography
                                        variant="body1"
                                        color="primary"
                                        key={i}
                                      >
                                        {f.uploaded_file}
                                      </Typography>
                                    )
                                  )}
                                </div>
                                <div>
                                  <Button onClick={_handleAnswerUpload}>
                                    Upload
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      FileUpload.removeFiles("answers");
                                      setDragover(false);
                                      setFilesToUpload({
                                        ...filesToUpload,
                                        UPLOAD_ANSWER: false,
                                      });
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
              <Box
                style={{
                  ...(isMobile
                    ? { width: "100%" }
                    : { maxWidth: 300, minWidth: 300, width: 300 }),
                }}
                marginTop={isMobile ? 2 : 0}
              >
                <Paper>
                  <Toolbar
                    style={{
                      width: "100%",
                      display: "flex",
                      paddingLeft: 10,
                      paddingRight: 10,
                      alignItems: "center",
                      justifyContent: "center",
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
                    <Box width="100%">
                      <SearchInput
                        onChange={(e) => {
                          setAnswersSearch(e.toLowerCase());
                          setAnswerPage(1);
                        }}
                      />
                    </Box>
                  </Toolbar>
                </Paper>
                {currentActivity.answers && !currentActivity.answers.length && (
                  <div>
                    <Typography variant="body1" color="textPrimary">
                      NO SUBMISSIONS YET
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      Students' submissions will be shown in a table once they
                      submit the papers
                    </Typography>
                  </div>
                )}
                {currentActivity.answers ? (
                  <Box className={styles.answerList}>
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
                    ).map((i, index) => {
                      return (
                        <Paper
                          key={index}
                          style={{
                            ...(index % 2
                              ? { background: "rgb(248, 248, 248)" }
                              : {}),
                          }}
                        >
                          <Box p={2} display="flex" alignItems="flex-start">
                            <Avatar
                              src="/profile-pic"
                              alt={i.student.first_name}
                              style={{ marginRight: theme.spacing(2) }}
                            />
                            <Box maxWidth="80%">
                              <Typography
                                style={{
                                  fontWeight: "bold",
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  i.answer_media &&
                                  _handleOpenAnswer({
                                    id: i.id,
                                    name:
                                      i.student.first_name +
                                      " " +
                                      i.student.last_name,
                                  })
                                }
                              >
                                {i.student.first_name +
                                  " " +
                                  i.student.last_name}
                              </Typography>
                              <Chip
                                size="small"
                                style={{
                                  background:
                                    theme.palette[
                                      i.answer_media ? "success" : "error"
                                    ].main,
                                  color: "#fff",
                                }}
                                label={
                                  i.answer_media ? "SUBMITTED" : "NOT SUBMITTED"
                                }
                              />
                              {isTeacher && i.answer_media && (
                                <Box>
                                  <Button
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
                                    ADD SCORE
                                  </Button>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        </Paper>
                      );
                    })}
                  </Box>
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
              </Box>
            </Box>
          </Grow>
        </React.Fragment>
      )}
      {activities && !currentActivity && (
        <MTable
          headers={cellheaders}
          data={activities}
          saving={saving}
          savingId={savingId}
          pagination={{
            render: (
              <Pagination
                page={page}
                match={props.match}
                icon={search ? "search" : ""}
                emptyTitle={search ? "Nothing Found" : false}
                emptyMessage={search ? "Try a different keyword." : false}
                onChange={(p) => setPage(p)}
                count={getFilteredActivities().length}
              />
            ),
            page,
            onChangePage: (p) => setPage(p),
          }}
          actions={{
            onDelete: (i) => _handleRemoveActivities(i),
            onUpdate: (a, s) => _handleUpdateActivitiesStatus(a, s),
            _handleFileOption: (opt, file) => _handleFileOption(opt, file),
          }}
          options={[
            {
              name: "View",
              value: "view",
            },
          ]}
          teacherOptions={[
            { name: "Close Activity", value: "close-activity" },
            { name: "Open Activity", value: "open-activity" },
            { name: "Edit", value: "edit" },
            { name: "Publish", value: "publish" },
            { name: "Unpublish", value: "unpublish" },
            { name: "Delete", value: "delete" },
          ]}
          filtered={(a) => getFilteredActivities(a)}
          rowRenderMobile={(item, { disabled = false }) => (
            <Box
              onClick={() => !disabled && _handleFileOption("view", item)}
              display="flex"
              flexWrap="wrap"
              width="90%"
              flexDirection="column"
              justifyContent="space-between"
              style={{ padding: "30px 0" }}
            >
              <Box width="100%" marginBottom={1}>
                <Typography
                  style={{
                    fontWeight: "bold",
                    color: "#38108d",
                    fontSize: "1em",
                  }}
                >
                  TITLE
                </Typography>
                <Typography variant="body1">{item.title}</Typography>
                <Typography variant="body1" color="textSecondary">
                  {item.description}
                </Typography>
              </Box>
              <Box width="100%" marginBottom={1}>
                <Typography
                  style={{
                    fontWeight: "bold",
                    color: "#38108d",
                    fontSize: "1em",
                  }}
                >
                  STATUS
                </Typography>
                <Typography
                  variant="body1"
                  style={{
                    fontWeight: "bold",
                    fontSize: "0.9em",
                    color:
                      item.done !== "true"
                        ? theme.palette.success.main
                        : theme.palette.error.main,
                  }}
                >
                  {item.done !== "true" ? "OPEN" : "CLOSED"}
                </Typography>
              </Box>
              <Box width="100%">
                <Typography
                  style={{
                    fontWeight: "bold",
                    color: "#38108d",
                    fontSize: "1em",
                  }}
                >
                  DATE
                </Typography>
                <Box display="flex" alignItems="center">
                  {moment(item.available_from).format("LL")}
                  <Icon>arrow_right_alt</Icon>
                  {moment(item.available_to).format("LL")}
                </Box>
              </Box>
            </Box>
          )}
          rowRender={(item, { disabled = false }) => (
            <Box
              width="100%"
              display="flex"
              onClick={() => !disabled && _handleFileOption("view", item)}
            >
              <Box flex={1} overflow="hidden" width="50%" maxWidth="50%">
                <ListItemText
                  primary={item.title}
                  secondaryTypographyProps={{
                    style: {
                      width: isMobile ? "80%" : "100%",
                    },
                  }}
                  secondary={item.description.substr(0, 100) + "..."}
                />
              </Box>
              <Box
                flex={1}
                overflow="hidden"
                width="15%"
                maxWidth="15%"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Typography
                  variant="body1"
                  style={{
                    fontWeight: "bold",
                    fontSize: "0.9em",
                    color:
                      item.done !== "true"
                        ? theme.palette.success.main
                        : theme.palette.error.main,
                  }}
                >
                  {item.done !== "true" ? "OPEN" : "CLOSED"}
                </Typography>
              </Box>
              <Box
                overflow="hidden"
                width="35%"
                maxWidth="35%"
                justifyContent="flex-end"
                display="flex"
              >
                <Typography
                  variant="body1"
                  component="div"
                  style={{
                    marginRight: 45,
                    display: "flex",
                    alignItems: "center",
                    textAlign: "right",
                  }}
                >
                  {moment(item.available_from).format("LL")}
                  <Icon>arrow_right_alt</Icon>
                  {moment(item.available_to).format("LL")}
                </Typography>
              </Box>
            </Box>
          )}
        />
      )}
      <CreateDialog
        title={form.id ? "Edit Activity" : "Create Activity"}
        open={modals.ACTIVITY || false}
        onClose={() => handleClose("ACTIVITY")}
        leftContent={
          <React.Fragment>
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
            {/* <FormControl
              style={{ width: isMobile ? "100%" : 160, marginTop: 23 }}
              variant="outlined"
            >
              <InputLabel>Choose a Rating Type</InputLabel>
              <Select
                label="Choose a Rating Type"
                padding={10}
                value={form.rating_type}
                onChange={(e) => {
                  setForm({
                    ...form,
                    rating_type: e.target.value,
                  });
                }}
              >
                <MenuItem value="score">Score</MenuItem>
                <MenuItem value="star">Star Rating</MenuItem>
                <MenuItem value="none">None</MenuItem>
              </Select>
            </FormControl> */}
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
          </React.Fragment>
        }
        rightContent={
          <React.Fragment>
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
                    setFilesToUpload({
                      ...filesToUpload,
                      ACTIVITY_MATERIALS: isfiles,
                    });
                    if (!isfiles) removeFiles("activity-materials");
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
                            handleOpen("WEB_LINK");
                            popupState.close();
                          }}
                        >
                          Link
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            if (modals.OPEN_GDRIVE) modals.OPEN_GDRIVE();
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
            {filesToUpload.ACTIVITY_MATERIALS && (
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
            {!filesToUpload.ACTIVITY_MATERIALS && !form.materials && (
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
                    <ListItem
                      key={i}
                      onClick={() => {
                        _handleOpenFile(f);
                        setModals({ ...modals, ACTIVITY: false });
                      }}
                    >
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
          </React.Fragment>
        }
      />

      <Dialog
        open={modals.WEB_LINK || false}
        keepMounted
        onClose={() => {
          setNewMaterial(null);
          handleClose("WEB_LINK");
        }}
      >
        <DialogTitle id="alert-dialog-slide-title">Web Link</DialogTitle>
        <DialogContent>
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
        <DialogActions>
          <Button
            onClick={() => {
              setNewMaterial(null);
              handleClose("WEB_LINK");
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
              handleClose("WEB_LINK");
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
  answerList: {
    width: "100%",
    marginTop: -3,
    "& > div": {
      marginBottom: theme.spacing(1),
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
}));

export default connect((state) => ({
  userInfo: state.userInfo,
  theme: state.theme,
  pics: state.pics,
  dataProgress: state.dataProgress,
  classDetails: state.classDetails,
}))(Activity);
