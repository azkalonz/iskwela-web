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
  FormControl,
  Select,
  InputLabel,
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
import React, { useEffect, useState, useCallback } from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import Api from "../../api";
import {
  CreateDialog,
  GooglePicker,
  RecorderDialog,
} from "../../components/dialogs";
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
import { Rating as MuiRating } from "@material-ui/lab";

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
const filesForm = {};
function Project(props) {
  const theme = useTheme();
  const history = useHistory();
  const query = queryString.parse(window.location.search);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [saving, setSaving] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState({
    ACTIVITY_ANSWER: false,
    ACTIVITY_MATERIALS: false,
  });
  const { room_name, class_id, option_name, schedule_id } = props.match.params;
  const [activities, setActivities] = useState();
  const [dragover, setDragover] = useState(false);
  const [search, setSearch] = useState("");
  const [modals, setModals] = React.useState({});
  const isTeacher =
    props.userInfo.user_type === "t" || props.userInfo.user_type === "a";
  const styles = useStyles();
  const classSched = props.classSched;
  const [currentActivity, setCurrentActivity] = useState();
  const [errors, setErrors] = useState();
  const [newMaterial, setNewMaterial] = useState({});
  const [success, setSuccess] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [savingId, setSavingId] = useState([]);
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
    title: "",
    description: "",
    due_date: "2020-07-10 10:00:00",
    published: 0,
    total_score: 100,
    class_id: parseInt(class_id),
    grading_category:
      props.gradingCategories[0] && props.gradingCategories[0].id,
  };
  const [form, setForm] = useState(formTemplate);
  const cellheaders = [
    { id: "title", title: "Title", width: "50%" },
    { id: "status", title: "Status", align: "center", width: "15%" },
    { id: "due_date", title: "Date", align: "flex-end", width: "35%" },
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
        if (s[isTeacher ? "projects" : "publishedProjects"]) {
          s[isTeacher ? "projects" : "publishedProjects"].forEach((ss) => {
            allActivities.push({ ...ss, schedule_id: s.id });
          });
        }
      });
      setActivities(allActivities.sort((a, b) => a.id - b.id));
      if (currentActivity) {
        let newAct = allActivities.find((act) => act.id === currentActivity.id);
        if (!newAct) setCurrentActivity(null);
        else
          setCurrentActivity({
            ...currentActivity,
            ...newAct,
          });
      }
      if (query.project_id) {
        setCurrentActivity(
          allActivities.find((q) => q.id === parseInt(query.project_id))
        );
      }
    } catch (e) {}
  };
  const getFiles = (id) => {
    if (!filesForm[id]) filesForm[id] = new FormData();
    return filesForm[id];
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
  const handleRefreshAnswers = (save) => {
    if (save) {
      setCurrentActivity({
        ...currentActivity,
        answers: null,
        rateStudent: null,
      });
      getAnswers();
    } else {
      setCurrentActivity({
        ...currentActivity,
        rateStudent: null,
      });
    }
  };
  const getCategories = useCallback(() => {
    let sub = props.subjectGradingCategories || [];
    let cat = props.gradingCategories || [];
    cat = cat.map((q) => {
      let i = sub.findIndex(
        (qq) => parseInt(q.id) === parseInt(qq.category_id)
      );
      if (i >= 0) {
        return {
          ...q,
          category_percentage: parseFloat(sub[i].category_percentage),
        };
      } else return q;
    });
    return cat;
  }, [props.subjectGradingCategories, props.gradingCategories]);
  const getAnswers = async () => {
    currentActivity.answers = null;
    let a = await Api.get(
      "/api/teacher/project-answers/" +
        currentActivity.id +
        (props.childInfo ? "?student_id=" + props.childInfo.id : "")
    );
    let scores = await Api.get(
      "/api/class/project/get-score/" +
        currentActivity.id +
        (props.childInfo ? "?student_id=" + props.childInfo.id : "")
    );
    a = props.classDetails[class_id].students.map((s) => {
      let sa = a.filter((st) => st.student.id === s.id);
      return sa
        ? { answers: sa, student: s }
        : {
            student: s,
          };
    });
    a = a.map((q) => {
      let f = scores.find((qq) => q.student.id === qq.student_id);
      return f ? { ...q, score: f } : q;
    });
    setCurrentActivity({
      ...currentActivity,
      answers: a.sort((b, c) => (b.answers.length ? -1 : 0)),
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
        room_name || "",
        "?project_id=" + item.id,
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
        await Api.post("/api/class/project/publish/" + formData.data.id, {});
      } catch (e) {
        setErrors(["Oops! Something when wrong. Please try again."]);
      }
    }
    try {
      res = await formData.send("/api/class/project/save");
    } catch (e) {
      setErrors(["Oops! Something when wrong. Please try again."]);
    }
    if (res && !res.errors) {
      if (form.materials && newMaterial && Object.keys(newMaterial).length) {
        await asyncForEach(form.materials, async (m) => {
          if (m.uploaded_file) return;
          await Api.post("/api/class/project-material/save", {
            body: {
              ...(m.id ? { id: m.id } : {}),
              url: m.resource_link,
              title: m.title,
              activity_id: res.id,
            },
          });
        });
      }
      if (getFiles("activity-materials").getAll("files[]").length) {
        await asyncForEach(
          getFiles("activity-materials").getAll("files[]"),
          async (file) => {
            let body = new FormData();
            body.append("file", file);
            body.append("assignment_id", res.id);
            body.append("title", file.name);
            let a;
            try {
              a = await FileUpload.upload("/api/upload/project/material", {
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
          }
        );
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
        newform = props.classDetails[class_id].schedules[schedule_id][
          isTeacher ? "projects" : "publishedProjects"
        ].find((a) => a.id === res.id);
      } catch (e) {
        newform =
          props.classDetails[class_id].schedules[schedule_id][
            isTeacher ? "projects" : "publishedProjects"
          ];
        newform = newform[newform.length - 1];
      }
      if (newform) setForm(newform);
      removeFiles("activity-materials", "#activity-material");
      setNewMaterial({});
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
    delete filesForm[id];
    FileUpload.removeFiles(id);
    if (inputID && document.querySelector(inputID))
      document.querySelector(inputID).value = "";
  };
  const _markActivity = async (activity, mark) => {
    let done = mark === "done" ? true : false;
    setConfirmed({
      title: (done ? "Close " : "Open ") + " Project",
      message:
        "Are you sure to " + (done ? "Close" : "Open") + " this project?",
      yes: async () => {
        setErrors(null);
        setSaving(true);
        setConfirmed(null);
        setSavingId([...savingId, activity.id]);
        let res = await Api.post(
          "/api/class/project/mark-" + mark + "/" + activity.id
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
      title: stat + " Project",
      message: "Are you sure to " + stat + " this project?",
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
      message: "Are you sure to remove this project?",
      yes: async () => {
        setErrors(null);
        setSaving(true);
        setConfirmed(null);
        setSavingId([...savingId, activity.id]);
        let id = parseInt(activity.id);
        let res;
        try {
          res = await Api.post("/api/teacher/remove/class-project/" + id, {
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
      title: stat + " " + Object.keys(a).length + " Projects",
      message: "Are you sure to " + stat + " this projects?",
      yes: async () => {
        setErrors(null);
        setSaving(true);
        setConfirmed(null);
        setSavingId([...savingId, ...Object.keys(a).map((i) => a[i].id)]);
        await asyncForEach(Object.keys(a), async (i) => {
          try {
            await Api.post("/api/class/project/save", {
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
      title: "Remove " + Object.keys(activities).length + " Projects",
      message: "Are you sure to remove this projects?",
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
            res = await Api.post("/api/teacher/remove/class-project/" + id, {
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
          "/api/teacher/remove/class-project-material/" + material.id,
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
          for (
            let i = 0;
            i <
            newScheduleDetails[isTeacher ? "projects" : "publishedProjects"]
              .length;
            i++
          ) {
            if (
              newScheduleDetails[isTeacher ? "projects" : "publishedProjects"][
                i
              ].id === form.id
            ) {
              setForm({
                ...newScheduleDetails[
                  isTeacher ? "projects" : "publishedProjects"
                ][i],
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
    let filetoopen = {};
    filetoopen = {
      title: f.name,
      onCancel: () => controller.abort(),
    };
    props.openFile(filetoopen);
    let res = await Api.postBlob("/api/download/activity/answer/" + f.id, {
      config: {
        signal,
      },
    }).then((resp) => (resp.ok ? resp.blob() : null));
    if (res)
      filetoopen = {
        ...filetoopen,
        title: f.name,
        url: URL.createObjectURL(
          new File([res], f.name + "'s Activity Answer", { type: res.type })
        ),
        type: res.type,
      };
    else setErrors(["Cannot open file."]);
    props.openFile(filetoopen);
  };
  const _handleOpenFile = async (f) => {
    const controller = new AbortController();
    const signal = controller.signal;
    let filetoopen = {};
    if (!f.uploaded_file) {
      filetoopen = {
        ...filetoopen,
        title: f.title,
        url: f.resource_link,
        error: false,
      };
    } else {
      filetoopen = {
        title: f.title,
        error: false,
        onCancel: () => controller.abort(),
      };
      props.openFile(filetoopen);
      let res = await Api.postBlob("/api/download/activity/material/" + f.id, {
        config: {
          signal,
        },
      }).then((resp) => (resp.ok ? resp.blob() : null));
      if (res)
        filetoopen = {
          ...filetoopen,
          title: f.title,
          url: URL.createObjectURL(
            new File([res], "activity-material-" + f.id, { type: res.type })
          ),
          error: false,
          type: res.type,
        };
      else {
        setErrors(["Cannot open file."]);
        filetoopen = {
          ...filetoopen,
          title: f.title,
          error: true,
        };
      }
    }
    props.openFile(filetoopen);
  };

  const _handleAnswerUpload = async () => {
    setErrors(null);
    setSaving(true);
    let answers = getFiles("activity-answer").getAll("files[]");
    if (answers.length) {
      try {
        await asyncForEach(answers, async (file) => {
          let body = new FormData();
          body.append("file", file);
          body.append("assignment_id", currentActivity.id);
          let a = await FileUpload.upload("/api/upload/project/answer", {
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
        });
        setDragover(false);
        removeFiles("activity-answer", "#activity-answer");
      } catch (e) {}
      getAnswers();
    }
    setSavingId([]);
    setSaving(false);
  };
  const handleCreateContent = () => {
    window.open("/content-maker?callback=send_item&to=" + socket.id, "_blank");
  };
  const createContentAnswer = () => {
    window.open(
      "/content-maker?origin=ACTIVITY_ANSWER&callback=send_item&to=" +
        socket.id,
      "_blank"
    );
  };
  const saveAudio = (audio, fileId = "", fileStage = "") => {
    let title = prompt("Enter file name ");
    let file = new File([audio], title + " 🎧" || "Audio 🎧", {
      type: audio.type,
    });
    if (fileId) {
      getFiles(fileId).append("files[]", file);
      stageFiles(fileId, file);
      if (fileStage) {
        let f = { ...filesToUpload };
        f[fileStage] = true;
        setFilesToUpload(f);
      }
    }
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
    socket.off("get item");
    socket.on("get item", getItem);
    if (document.querySelector("#activity-material") && !saving)
      removeFiles("activity-materials", "#activity-material");
  }, []);
  useEffect(() => {
    _getActivities();
  }, [props.classDetails]);
  const getItem = async (details) => {
    const parsed = JSON.parse(details.data.b64);
    const blob = await fetch(parsed.blob).then((res) => res.blob());
    let file = new File([blob], details.data.title, { type: blob.type });
    if (details.type === "ATTACH_CONTENTCREATOR") {
      getFiles("activity-materials").append("files[]", file);
      stageFiles("activity-materials", file);
      setFilesToUpload({ ...filesToUpload, ACTIVITY_MATERIALS: true });
    } else if (details.type === "ACTIVITY_ANSWER") {
      getFiles("activity-answer").append("files[]", file);
      stageFiles("activity-answer", file);
      setFilesToUpload({ ...filesToUpload, ACTIVITY_ANSWER: true });
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
        endpoint="project"
        activity={currentActivity}
        open={currentActivity && currentActivity.rateStudent}
        onClose={(save = false) => {
          handleRefreshAnswers(save);
        }}
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
                if (confirmed.no) confirmed.no();
                else setConfirmed(null);
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
              Add New Project
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
                              room_name || "",
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
                        {moment(currentActivity.due_date).format("LL hh:mm A")}
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
                {!isTeacher && !props.childInfo && (
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
                          let isfiles = e.dataTransfer.files.length
                            ? true
                            : false;
                          let answerFiles = e.dataTransfer.files;
                          if (isfiles && answerFiles.length) {
                            stageFiles("activity-answer", answerFiles);
                            setFilesToUpload({
                              ...filesToUpload,
                              ACTIVITY_ANSWER: isfiles,
                            });
                            for (let i = 0; i < answerFiles.length; i++) {
                              getFiles("activity-answer").append(
                                "files[]",
                                answerFiles[i]
                              );
                            }
                          }
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
                            let answerFiles = document.querySelector(
                              "#activity-answer"
                            ).files;
                            if (isfiles && answerFiles.length) {
                              stageFiles("activity-answer", answerFiles);
                              setFilesToUpload({
                                ...filesToUpload,
                                ACTIVITY_ANSWER: isfiles,
                              });
                              for (let i = 0; i < answerFiles.length; i++) {
                                getFiles("activity-answer").append(
                                  "files[]",
                                  answerFiles[i]
                                );
                              }
                            }
                          }}
                        />
                        <Box className={styles.upload}>
                          {!filesToUpload.ACTIVITY_ANSWER ? (
                            <div>
                              {!dragover ? (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <PopupState
                                    variant="popover"
                                    popupId="add-file-btn"
                                  >
                                    {(popupState) => (
                                      <React.Fragment>
                                        <Link
                                          {...bindTrigger(popupState)}
                                          component="div"
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            cursor: "pointer",
                                            fontWeight: "bold",
                                          }}
                                        >
                                          <AttachFileOutlinedIcon fontSize="small" />
                                          Add file&nbsp;
                                        </Link>
                                        <Menu {...bindMenu(popupState)}>
                                          <MenuItem
                                            onClick={() => {
                                              document
                                                .querySelector(
                                                  "#activity-answer"
                                                )
                                                .click();
                                              popupState.close();
                                            }}
                                          >
                                            Files
                                          </MenuItem>
                                          <MenuItem
                                            onClick={() => {
                                              createContentAnswer();
                                              popupState.close();
                                            }}
                                          >
                                            Content Maker
                                          </MenuItem>
                                          <MenuItem
                                            onClick={() => {
                                              handleOpen("AUDIO_ANSWER");
                                              popupState.close();
                                            }}
                                          >
                                            Audio
                                          </MenuItem>
                                        </Menu>
                                      </React.Fragment>
                                    )}
                                  </PopupState>
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
                                  {FileUpload.getFiles("activity-answer").map(
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
                                      FileUpload.removeFiles("activity-answer");
                                      setDragover(false);
                                      setFilesToUpload({
                                        ...filesToUpload,
                                        ACTIVITY_ANSWER: false,
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
                                parseInt(props.userInfo.id) ||
                              parseInt(a.student.id) ===
                                parseInt(props.childInfo?.id)
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
                          <Box
                            p={2}
                            display="flex"
                            alignItems="flex-start"
                            position="relative"
                          >
                            <Box
                              style={{
                                position: "absolute",
                                left: 0,
                                right: 0,
                                top: 0,
                                bottom: 0,
                                cursor: "pointer",
                                zIndex: 11,
                              }}
                              onClick={() =>
                                i.answers.length &&
                                _handleOpenAnswer({
                                  id: i.answers.sort((a, b) => b.id - a.id)[0]
                                    .id,
                                  name:
                                    i.student.first_name +
                                    " " +
                                    i.student.last_name,
                                })
                              }
                            />
                            <Avatar
                              src={i.student.preferences.profile_picture}
                              alt={i.student.first_name}
                              style={{ marginRight: theme.spacing(2) }}
                            />
                            <Box maxWidth="80%">
                              {i.score && (
                                <React.Fragment>
                                  <MuiRating
                                    readOnly
                                    value={Math.map(
                                      i.score.score,
                                      0,
                                      currentActivity.total_score,
                                      0,
                                      5
                                    )}
                                  />
                                  ({i.score.score})
                                </React.Fragment>
                              )}
                              <Typography
                                style={{
                                  fontWeight: "bold",
                                  cursor: "pointer",
                                }}
                              >
                                {i.student.first_name +
                                  " " +
                                  i.student.last_name}
                              </Typography>
                              {i.answers.length > 1 && (
                                <PopupState
                                  variant="popover"
                                  popupId="view-answers"
                                >
                                  {(popupState) => (
                                    <React.Fragment>
                                      <IconButton
                                        {...bindTrigger(popupState)}
                                        id={"view-answer-" + index}
                                        style={{
                                          position: "absolute",
                                          right: 0,
                                          top: 0,
                                          zIndex: 12,
                                        }}
                                      >
                                        <Icon>expand_more</Icon>
                                      </IconButton>
                                      <Menu {...bindMenu(popupState)}>
                                        {i.answers
                                          .sort((a, b) => b.id - a.id)
                                          .map((a, ii) => (
                                            <MenuItem
                                              onClick={() =>
                                                _handleOpenAnswer({
                                                  id: a.id,
                                                  name:
                                                    i.student.first_name +
                                                    " " +
                                                    i.student.last_name,
                                                })
                                              }
                                            >
                                              {`Answer (ver. ${
                                                i.answers.length - ii
                                              })`}
                                            </MenuItem>
                                          ))}
                                      </Menu>
                                    </React.Fragment>
                                  )}
                                </PopupState>
                              )}
                              <Chip
                                size="small"
                                style={{
                                  background:
                                    theme.palette[
                                      i.answers.length ? "success" : "error"
                                    ].main,
                                  color: "#fff",
                                }}
                                label={
                                  i.answers.length
                                    ? "SUBMITTED"
                                    : "NOT SUBMITTED"
                                }
                              />
                              {isTeacher && i.answers.length ? (
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
                                    style={{ position: "relative", zIndex: 12 }}
                                  >
                                    ADD SCORE
                                  </Button>
                                </Box>
                              ) : null}
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
                      icon={
                        answersSearch ? (
                          <img
                            src="/hero-img/person-search.svg"
                            width={180}
                            style={{ padding: "50px 0" }}
                          />
                        ) : (
                          ""
                        )
                      }
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
                                  parseInt(props.userInfo.id) ||
                                parseInt(a.student.id) ===
                                  parseInt(props.childInfo?.id)
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
                icon={
                  search ? (
                    <img
                      src="/hero-img/search.svg"
                      width={180}
                      style={{ padding: "50px 0" }}
                    />
                  ) : (
                    <img
                      src="/hero-img/undraw_Progress_tracking_re_ulfg.svg"
                      width={180}
                      style={{ padding: "50px 0" }}
                    />
                  )
                }
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
                  {moment(item.due_date).format("LL hh:mm A")}
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
                  {moment(item.due_date).format("LL hh:mm A")}
                </Typography>
              </Box>
            </Box>
          )}
        />
      )}
      <RecorderDialog
        open={modals.VOICE_RECORDER}
        onClose={(done, cb = null) =>
          done
            ? handleClose("VOICE_RECORDER")
            : setConfirmed({
                title: "Cancel",
                message: "Do you want to cancel the voice recording?",
                yes: () => {
                  cb && cb();
                  handleClose("VOICE_RECORDER");
                  setConfirmed(null);
                },
              })
        }
        onSave={(a, cb = null) => {
          saveAudio(a, "activity-materials", "ACTIVITY_MATERIALS");
          cb && cb();
        }}
      />
      <RecorderDialog
        open={modals.AUDIO_ANSWER}
        onClose={(done, cb = null) =>
          done
            ? handleClose("AUDIO_ANSWER")
            : setConfirmed({
                title: "Cancel",
                message: "Do you want to cancel the voice recording?",
                yes: () => {
                  cb && cb();
                  handleClose("AUDIO_ANSWER");
                  setConfirmed(null);
                },
              })
        }
        onSave={(a, cb = null) => {
          saveAudio(a, "activity-answer", "ACTIVITY_ANSWER");
          cb && cb();
        }}
      />
      <CreateDialog
        title={form.id ? "Edit Project" : "Create Project"}
        open={modals.ACTIVITY || false}
        onClose={() => {
          setForm(formTemplate);
          handleClose("ACTIVITY");
          // setConfirmed({
          //   title: "Save Changes",
          //   message: "Would you like to save your changes before you exit?",
          //   no: () => {
          //     setForm(formTemplate);
          //     handleClose("ACTIVITY");
          //     setConfirmed(null);
          //   },
          //   yes: () => setConfirmed(null),
          // });
        }}
        leftContent={
          <React.Fragment>
            <TextField
              label="Title"
              variant="outlined"
              className={[
                styles.textField,
                props.theme === "dark" ? "themed-input light" : "themed-input",
              ].join(" ")}
              value={form.title}
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
                flexWrap={isMobile ? "wrap" : "nowrap"}
                style={{ marginTop: isMobile ? 30 : 0 }}
              >
                <Box width={isMobile ? "100%" : "50%"} display="flex">
                  <KeyboardDatePicker
                    disableToolbar
                    variant="inline"
                    format="MMM DD, YYYY"
                    margin="normal"
                    label="Due Date"
                    className={
                      (props.theme === "dark"
                        ? "themed-input light"
                        : "themed-input") + " date"
                    }
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
                      flex: 1,
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
                    style={{
                      flex: 1,
                      marginRight: isMobile ? 0 : theme.spacing(2),
                    }}
                    className={
                      (props.theme === "dark"
                        ? "themed-input light"
                        : "themed-input") + " date"
                    }
                    onChange={(date) => {
                      setForm({
                        ...form,
                        time: moment(date).format("LL hh:mm A"),
                      });
                    }}
                  />
                </Box>
                <Box
                  width={isMobile ? "100%" : "50%"}
                  display="flex"
                  flexWrap={isMobile ? "wrap" : "nowrap"}
                  alignItems="flex-end"
                >
                  <TextField
                    label="Total Score"
                    variant="outlined"
                    className={[
                      styles.textField,
                      props.theme === "dark"
                        ? "themed-input light"
                        : "themed-input",
                    ].join(" ")}
                    defaultValue={form.total_score}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        total_score: parseInt(e.target.value),
                      })
                    }
                    type="number"
                    style={{
                      flex: 1,
                      marginRight: theme.spacing(2),
                      ...(isMobile
                        ? {
                            minWidth: "100%",
                            marginBottom: 30,
                          }
                        : {}),
                    }}
                  />
                  <FormControl
                    variant="outlined"
                    fullWidth
                    className={
                      (props.theme === "dark"
                        ? "themed-input light"
                        : "themed-input") + " select"
                    }
                    style={{ flex: 1 }}
                  >
                    <InputLabel>Grading Category</InputLabel>
                    {getCategories() && (
                      <Select
                        label="Grading Category"
                        variant="outlined"
                        padding={10}
                        value={parseInt(form.grading_category)}
                        onChange={(e) => {
                          setForm({
                            ...form,
                            grading_category: e.target.value,
                          });
                        }}
                        style={{ paddingTop: 17 }}
                      >
                        {getCategories().map((c, index) => (
                          <MenuItem value={c.id} key={index}>
                            {c.category}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  </FormControl>
                </Box>
              </Box>
            </MuiPickersUtilsProvider>
            <TextField
              label="Description"
              className={[
                styles.textField,
                props.theme === "dark" ? "themed-input light" : "themed-input",
              ].join(" ")}
              variant="outlined"
              rows={10}
              style={{ marginTop: 13 }}
              value={form.description}
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
                    const projectFiles = document.querySelector(
                      "#activity-material"
                    ).files;
                    if (isfiles && projectFiles.length) {
                      stageFiles("activity-materials", projectFiles);
                      setFilesToUpload({
                        ...filesToUpload,
                        ACTIVITY_MATERIALS: isfiles,
                      });
                      for (let i = 0; i < projectFiles.length; i++) {
                        getFiles("activity-materials").append(
                          "files[]",
                          projectFiles[i]
                        );
                      }
                    }
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
                        <MenuItem
                          onClick={() => {
                            handleOpen("VOICE_RECORDER");
                            popupState.close();
                          }}
                        >
                          Audio
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
  gradingCategories: state.gradingCategories,
  childInfo: state.parentData?.childInfo,
}))(Project);
