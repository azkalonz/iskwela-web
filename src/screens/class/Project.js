import MomentUtils from "@date-io/moment";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Icon,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  Menu,
  MenuItem,
  Paper,
  Slide,
  Snackbar,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  withStyles,
} from "@material-ui/core";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import Grow from "@material-ui/core/Grow";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import AttachFileOutlinedIcon from "@material-ui/icons/AttachFileOutlined";
import CloseIcon from "@material-ui/icons/Close";
import RefreshIcon from "@material-ui/icons/Refresh";
import MuiAlert from "@material-ui/lab/Alert";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
} from "@material-ui/pickers";
import $ from "jquery";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import Api from "../../api";
import { CreateDialog, GooglePicker } from "../../components/dialogs";
import FileUpload, { stageFiles } from "../../components/FileUpload";
import FileViewer from "../../components/FileViewer";
import Form from "../../components/Form";
import Pagination, { getPageItems } from "../../components/Pagination";
import Progress from "../../components/Progress";
import store from "../../components/redux/store";
import { makeLinkTo } from "../../components/router-dom";
import {
  ScheduleSelector,
  SearchInput,
  StatusSelector,
} from "../../components/Selectors";
import socket from "../../components/socket.io";
import StudentRating from "../../components/StudentRating";
import { Table as MTable } from "../../components/Table";
import UserData, { asyncForEach } from "../../components/UserData";
const queryString = require("query-string");
function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

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

function Project(props) {
  const theme = useTheme();
  const history = useHistory();
  const query = queryString.parse(window.location.search);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [openFileViewer, setOpenFileViewer] = useState();
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
  const isTeacher = props.userInfo.user_type === "t" ? true : false;
  const styles = useStyles();
  const classSched = props.classSched;
  const [currentActivity, setCurrentActivity] = useState();
  const [errors, setErrors] = useState();
  const [newMaterial, setNewMaterial] = useState({});
  const [success, setSuccess] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [savingId, setSavingId] = useState([]);
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
    title: "",
    description: "",
    due_date: "2020-07-10 10:00:00",
    published: 0,
    total_score: 100,
    class_id: parseInt(class_id),
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
    if (currentActivity) {
      if (!currentActivity.answers) getAnswers();
    }
  }, [currentActivity]);
  const getAnswers = async () => {
    currentActivity.answers = null;
    let a = await Api.get(
      "/api/teacher/seatwork-answers/" + currentActivity.id
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
      due_date:
        moment(form.date).format("YYYY-MM-DD") +
        " " +
        moment(form.time).format("HH:mm:ss"),
      subject_id: props.classDetails[class_id].subject.id,
      schedule_id:
        selectedSched >= 0 ? parseInt(selectedSched) : parseInt(classSched),
      ...params,
    });
    if (formData.data.published && formData.data.id) {
      try {
        await Api.post("/api/class/seatwork/publish/" + formData.data.id, {});
      } catch (e) {
        setErrors(["Oops! Something when wrong. Please try again."]);
      }
    }
    try {
      res = await formData.send("/api/class/seatwork/save");
    } catch (e) {
      setErrors(["Oops! Something when wrong. Please try again."]);
    }
    if (res && !res.errors) {
      let materialFiles = document.querySelector("#activity-material");
      if (form.materials && newMaterial && Object.keys(newMaterial).length) {
        await asyncForEach(form.materials, async (m) => {
          if (m.uploaded_file) return;
          await Api.post("/api/class/seatwork-material/save", {
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
        body.append("file", contentCreatorFile.file);
        body.append("assignment_id", res.id);
        body.append("title", contentCreatorFile.title);
        let a = await FileUpload.upload("/api/upload/seatwork/material", {
          body,
          onUploadProgress: (event, source) =>
            store.dispatch({
              type: "SET_PROGRESS",
              id: option_name,
              data: {
                title: contentCreatorFile.title,
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
            a = await FileUpload.upload("/api/upload/seatwork/material", {
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
        ].activities.find((a) => a.id === res.id);
      } catch (e) {
        newform =
          props.classDetails[class_id].schedules[schedule_id].activities;
        newform = newform[newform.length - 1];
      }
      if (newform) setForm(newform);
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
          "/api/class/seatwork/mark-" + mark + "/" + activity.id
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
          res = await Api.post("/api/teacher/remove/class-seatwork/" + id, {
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
  const _handleUpdateActivitiesStatus = (a, s, callback = null) => {
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
            await Api.post("/api/class/seatwork/save", {
              body: {
                ...a[i],
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
        callback && callback();
        setSavingId([]);
        setSaving(false);
      },
    });
  };
  const _handleRemoveActivities = (activities, callback = null) => {
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
            res = await Api.post("/api/teacher/remove/class-seatwork/" + id, {
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
        callback && callback();
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
          "/api/teacher/remove/class-seatwork-material/" + material.id,
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
    const controller = new AbortController();
    const signal = controller.signal;
    setFile({
      title: f.name,
      onCancel: () => controller.abort(),
    });
    if (openFileViewer) {
      openFileViewer();
    }
    let res = await Api.postBlob("/api/download/activity/answer/" + f.id, {
      config: {
        signal,
      },
    }).then((resp) => (resp.ok ? resp.blob() : null));
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
    const controller = new AbortController();
    const signal = controller.signal;
    if (!f.uploaded_file) {
      setFile({
        ...file,
        title: f.title,
        url: f.resource_link,
        error: false,
      });
    } else {
      setFile({
        title: f.title,
        error: false,
        onCancel: () => controller.abort(),
      });
      let res = await Api.postBlob("/api/download/activity/material/" + f.id, {
        config: {
          signal,
        },
      }).then((resp) => (resp.ok ? resp.blob() : null));
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
    }
    if (openFileViewer) {
      openFileViewer();
    }
  };

  const _handleAnswerUpload = async () => {
    setErrors(null);
    setSaving(true);
    let body = new FormData();
    body.append("file", FileUpload.files["answers"][0]);
    body.append("assignment_id", currentActivity.id);
    let a = await FileUpload.upload("/api/upload/seatwork/answer", {
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
    socket.on("get item", getItem);
    if (document.querySelector("#activity-material") && !saving)
      removeFiles("activity-materials");
  }, []);
  useEffect(() => {
    _getActivities();
  }, [props.classDetails]);
  const getItem = async (details) => {
    if (details.type === "ATTACH_CONTENTCREATOR") {
      const parsed = JSON.parse(details.data.b64);
      const blob = await fetch(parsed.blob).then((res) => res.blob());
      let file = new File([blob], details.data.title, { type: blob.type });
      setContentCreatorFile({ file, title: details.data.title });
      stageFiles("activity-materials", file);
      console.log(file, contentCreatorFile);
      setFilesToUpload({ ...filesToUpload, ACTIVITY_MATERIALS: true });
    }
  };
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
      {file && (
        <FileViewer
          file={file}
          open={(openRef) => setOpenFileViewer(openRef)}
          onClose={() => setFile(null)}
          error={file.error}
        />
      )}
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
                        <Icon color="primary">arrow_back</Icon>
                      </IconButton>
                    </Box>
                    {isTeacher && (
                      <Box>
                        <IconButton
                          onClick={() =>
                            _handleFileOption("publish", currentActivity)
                          }
                        >
                          <span
                            className="icon-publish"
                            style={{
                              color: theme.palette.primary.main,
                              fontSize: "0.8em",
                            }}
                          ></span>
                        </IconButton>
                        <IconButton
                          onClick={() =>
                            _handleFileOption("unpublish", currentActivity)
                          }
                        >
                          <span
                            className="icon-unpublish"
                            style={{
                              color: theme.palette.primary.main,
                              fontSize: "0.8em",
                            }}
                          ></span>
                        </IconButton>
                        <IconButton
                          onClick={() =>
                            _handleFileOption("edit", currentActivity)
                          }
                        >
                          <Icon color="primary">create_outline</Icon>
                        </IconButton>
                        <IconButton
                          onClick={() =>
                            _handleFileOption("delete", currentActivity)
                          }
                        >
                          <Icon color="primary">delete_outline</Icon>
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
                      <Icon color="primary">refresh</Icon>
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
            onDelete: (i, done = null) => _handleRemoveActivities(i, done),
            onUpdate: (a, s, done = null) =>
              _handleUpdateActivitiesStatus(a, s, done),
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
                      whiteSpace: "pre-wrap",
                    },
                  }}
                  primaryTypographyProps={{
                    style: {
                      whiteSpace: "pre-wrap",
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
        title={form.id ? "Edit Seatwork" : "Create Seatwork"}
        open={modals.ACTIVITY || false}
        onClose={() => handleClose("ACTIVITY")}
        leftContent={
          <React.Fragment>
            <TextField
              label="Title"
              variant="outlined"
              className={[styles.textField, "themed-input"].join(" ")}
              defaultValue={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              fullWidth
            />
            <MuiPickersUtilsProvider utils={MomentUtils}>
              <Box
                display="flex"
                width="100%"
                justifyContent="space-between"
                alignItems="flex-end"
                marginBottom={2}
              >
                <Box width="49%" display="flex">
                  <KeyboardDatePicker
                    disableToolbar
                    variant="inline"
                    format="MMM DD, YYYY"
                    margin="normal"
                    label="Due Date"
                    className="themed-input date"
                    value={form.date || new Date()}
                    onChange={(date) =>
                      setForm({
                        ...form,
                        date: moment(date).format("YYYY-MM-DD"),
                      })
                    }
                    KeyboardButtonProps={{
                      "aria-label": "change date",
                    }}
                    style={{
                      marginRight: theme.spacing(2),
                    }}
                  />
                  <KeyboardTimePicker
                    margin="normal"
                    format="hh:mm A"
                    label={String.fromCharCode(160)}
                    value={form.time || new Date()}
                    KeyboardButtonProps={{
                      "aria-label": "change time",
                    }}
                    className="themed-input date"
                    onChange={(date) => {
                      setForm({
                        ...form,
                        time: moment(date).format("LL hh:mm A"),
                      });
                    }}
                  />
                </Box>
                <TextField
                  label="Total Score"
                  variant="outlined"
                  className={[styles.textField, "themed-input"].join(" ")}
                  defaultValue={form.total_score}
                  onChange={(e) =>
                    setForm({ ...form, total_score: parseInt(e.target.value) })
                  }
                  type="number"
                  style={{ width: "49%" }}
                />
              </Box>
            </MuiPickersUtilsProvider>
            <TextField
              label="Description"
              className={[styles.textField, "themed-input"].join(" ")}
              variant="outlined"
              rows={10}
              style={{ marginTop: 13 }}
              defaultValue={form.description}
              multiline={true}
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
              value={(newMaterial && newMaterial.title) || ""}
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
              value={(newMaterial && newMaterial.resource_link) || ""}
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
}))(Project);
