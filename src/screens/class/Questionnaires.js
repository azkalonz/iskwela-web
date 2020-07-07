import MomentUtils from "@date-io/moment";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Icon,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  Menu,
  MenuItem,
  Snackbar,
  TextField,
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
import MuiAlert from "@material-ui/lab/Alert";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
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
import Pagination from "../../components/Pagination";
import store from "../../components/redux/store";
import { makeLinkTo } from "../../components/router-dom";
import {
  ScheduleSelector,
  SearchInput,
  StatusSelector,
} from "../../components/Selectors";
import socket from "../../components/socket.io";
import { Table as MTable } from "../../components/Table";
import UserData, { asyncForEach } from "../../components/UserData";
import { idText } from "typescript";
import AnswerQuiz from "./AnswerQuiz";
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

function Questionnaires(props) {
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
    { id: "title", title: "Title", width: "80%" },
    { id: "subject_id", title: "Subject", align: "flex-end", width: "15%" },
  ];
  const _handleFileOption = (option, file) => {
    switch (option) {
      case "view":
        history.push(makeLinkTo(["?id=" + file.id + "#preview"], {}, true));
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
  const _getActivities = () => {
    setActivities(props.questionnaires);
  };
  useEffect(() => {
    if (props.classDetails[class_id]) {
      _getActivities();
    }
  }, [props.classDetails[class_id]]);
  const _handleSearch = (e) => {
    setSearch(e.toLowerCase());
    setPage(1);
  };
  const handleOpen = (name) => {
    let m = { ...modals };
    m[name] = true;
    setModals(m);
  };
  const _handleItemClick = (item) => {};
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
      title: "Remove Questionnaire",
      message: "Are you sure to remove this Questionnaire?",
      yes: async () => {
        setErrors(null);
        setSaving(true);
        setConfirmed(null);
        setSavingId([...savingId, activity.id]);
        let id = parseInt(activity.id);
        let res;
        try {
          res = await Api.delete("/api/questionnaire/delete/" + id);
        } catch (e) {
          setErrors(["Oops! Something went wrong. Please try again later."]);
          setSavingId([]);
          setSaving(false);
          return;
        }
        if (res && !res.errors) {
          setSuccess(true);
          UserData.removeQuiz(activity.id);
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
  const _handleRemoveActivities = (activities, callback = null) => {
    setConfirmed({
      title: "Remove " + Object.keys(activities).length + " Questionnaires",
      message: "Are you sure to remove this Questionnaires?",
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
            res = await Api.delete("/api/questionnaire/delete/" + id);
            UserData.removeQuiz(id);
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
        if (!errors) {
          setSuccess(true);
        }
        callback && callback();
        setSavingId([]);
        setSaving(false);
      },
    });
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
    _getActivities();
  }, [props.questionnaires]);
  const addNewMaterial = (material) => {
    let m = form.materials ? [material, ...form.materials] : [material];
    setForm({ ...form, materials: m });
    setNewMaterial(material);
  };
  return (
    <Box width="100%" alignSelf="flex-start" height="100%">
      <Dialog
        open={props.location.hash === "#preview"}
        onClose={() => history.push(query.id && "?id=" + query.id)}
        fullScreen={true}
      >
        <DialogTitle
          onClose={() => history.push(query.id && "?id=" + query.id)}
        >
          Preview
        </DialogTitle>
        <DialogContent>
          <AnswerQuiz noPaging={true} fullHeight match={props.match} />
        </DialogContent>
      </Dialog>
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
              props.history.push(makeLinkTo(["questionnaire"], {}, true));
            }}
          >
            Add New Questionnaire
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
      {activities && (
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
            _handleFileOption: (opt, file) => _handleFileOption(opt, file),
          }}
          options={[
            {
              name: "Preview",
              value: "view",
            },
          ]}
          teacherOptions={[{ name: "Delete", value: "delete" }]}
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
                  {item.intro}
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
                  SUBJECT
                </Typography>
                <Typography
                  variant="body1"
                  style={{
                    fontWeight: "bold",
                    fontSize: "0.9em",
                    color: theme.palette.success.main,
                  }}
                >
                  {item.subject_id}
                </Typography>
              </Box>
            </Box>
          )}
          rowRender={(item, { disabled = false }) => (
            <Box
              width="100%"
              display="flex"
              onClick={() => !disabled && _handleFileOption("view", item)}
            >
              <Box flex={1} overflow="hidden" width="80%" maxWidth="80%">
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
                  secondary={item.intro}
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
                    color: theme.palette.success.main,
                  }}
                >
                  {item.subject_id}
                </Typography>
              </Box>
            </Box>
          )}
        />
      )}
    </Box>
  );
}

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
  questionnaires: state.questionnaires,
  pics: state.pics,
  dataProgress: state.dataProgress,
  classDetails: state.classDetails,
}))(Questionnaires);
