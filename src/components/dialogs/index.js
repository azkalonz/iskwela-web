import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle as MuiDialogTitle,
  FormControl,
  Icon,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Slide,
  Typography,
  useMediaQuery,
  useTheme,
  withStyles,
  Avatar,
} from "@material-ui/core";
import React, {
  useEffect,
  useState,
  Children,
  isValidElement,
  cloneElement,
} from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import socket from "../../components/socket.io";
import Pagination, { getPageItems } from "../Pagination";
import { makeLinkTo } from "../router-dom";
import { SearchInput } from "../Selectors";
import Recorder from "../../components/Recorder";
import Messages from "../Messages";
import moment from "moment";

function VideoCall(props) {
  const { caller = {}, receiver = {}, status } = props;
  const isCaller = props.userInfo.id === caller.id;
  const { first_name, last_name, preferences } = isCaller ? receiver : caller;
  const openVideoChat = () => {
    if (!window.videochat)
      window.videochat = window.open(
        "/videocall?chat=" + caller.id + "-" + receiver.id,
        "_blank"
      );
    else if (window.videochat) {
      window.videochat.close();
      window.videochat = null;
      openVideoChat();
    }
  };
  useEffect(() => {
    if (status === "ACCEPTED") openVideoChat();
  }, [status]);
  return Object.keys(caller).length && Object.keys(receiver).length ? (
    <Dialog open={props.open && caller} onClose={props.onClose}>
      <DialogTitle onClose={props.onClose}>
        {isCaller && "Calling "} {first_name + " " + last_name}{" "}
        {!isCaller && "wants to video call with you"}
      </DialogTitle>
      <DialogContent>
        <Box className="call-animation">
          <img src={preferences?.profile_picture} alt={first_name} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => Messages.vc.decline(caller, receiver)}>
          {isCaller ? "Cancel" : "Decline"}
        </Button>
        {!isCaller && (
          <Button onClick={() => Messages.vc.accept(caller, receiver)}>
            Accept
          </Button>
        )}
      </DialogActions>
    </Dialog>
  ) : null;
}
const ConnectedVideoCall = connect((states) => ({
  userInfo: states.userInfo,
}))(VideoCall);
export { ConnectedVideoCall as VideoCall };

export function RecorderDialog(props) {
  const [audio, setAudio] = useState();
  const theme = useTheme();
  const [stream, setStream] = useState();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const handleClose = (e = false) => {
    if (audio) {
      props.onSave &&
        props.onSave(
          audio,
          stream
            ? () =>
                stream.getTracks().forEach(function (track) {
                  track.stop();
                })
            : null
        );
    }
    if (stream)
      props.onClose(e, () =>
        stream.getTracks().forEach(function (track) {
          track.stop();
        })
      );
    else props.onClose(e);
  };
  return (
    <Dialog
      open={props.open || false}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      onClose={() => handleClose()}
    >
      <DialogTitle onClose={() => handleClose()}>
        <Typography>Voice Recorder</Typography>
      </DialogTitle>
      <DialogContent>
        <Recorder onSave={(a) => setAudio(a)} getStream={(r) => setStream(r)} />
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => handleClose(true)}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function AttachQuestionnaireDialog(props) {
  const history = useHistory();
  const theme = useTheme();
  const { class_id, schedule_id } = props.match.params;
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [filter, setFilter] = useState({
    SUBJECT: -1,
    SEARCH: "",
  });
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const getFilteredQuestionnaires = () =>
    props.questionnaires
      .filter((q) => selected.findIndex((qq) => qq.id === q.id) < 0)
      .filter(
        (q) =>
          JSON.stringify(q)
            .toLowerCase()
            .indexOf(filter.SEARCH.toLowerCase()) >= 0
      )
      .filter((q) =>
        filter.SUBJECT >= 0 ? q.subject_id === filter.SUBJECT : true
      );
  useEffect(() => {
    if (props.selected) setSelected(props.selected);
  }, [props.selected]);
  useEffect(() => {
    socket.off("get item");
    socket.on("get item", (details) => {
      if (details.type === "ATTACH_QUESTIONNAIRE") {
        let s = [...selected, details.data];
        setSelected(s);
        props.onSelect(s);
      }
    });
  }, []);
  const getPagination = () => (
    <Pagination
      page={page}
      onChange={(p) => setPage(p)}
      icon={filter.SEARCH ? "person_search" : ""}
      emptyTitle={filter.SEARCH ? "Nothing Found" : "No Questionnaires"}
      emptyMessage={
        <Button
          onClick={() =>
            history.push(
              makeLinkTo(["class", class_id, schedule_id, "questionnaire"])
            )
          }
        >
          Create Questionnaire
        </Button>
      }
      count={getFilteredQuestionnaires().length}
      nolink
    />
  );
  const handleClose = () => {
    if (selected) props.onSelect(selected);
    props.onClose();
    setFilter({ ...filter, SEARCH: "" });
  };
  return (
    <Dialog
      open={props.open}
      onClose={handleClose}
      fullScreen={isMobile}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle onClose={handleClose}>{props.title}</DialogTitle>
      <DialogContent>
        {props.data && (
          <React.Fragment>
            <Box width="100%" display="flex" flexWrap="wrap">
              <Box width={isMobile ? "100%" : "70%"}>
                <SearchInput
                  onChange={(s) => {
                    setFilter({ ...filter, SEARCH: s });
                    setPage(1);
                  }}
                />
              </Box>
              <Box
                width={isMobile ? "100%" : "30%"}
                style={{
                  ...(isMobile ? { paddingTop: 10 } : { paddingLeft: 10 }),
                }}
              >
                <FormControl style={{ width: "100%" }} variant="outlined">
                  <InputLabel>Subject</InputLabel>
                  <Select
                    style={{ background: "#efe7ff" }}
                    label="Subject"
                    value={filter.SUBJECT}
                    onChange={(e) => {
                      setFilter({ ...filter, SUBJECT: e.target.value });
                    }}
                    padding={10}
                  >
                    <MenuItem value={-1}>All</MenuItem>
                    {Object.keys(props.classes)
                      .filter((k, i) => {
                        let c = Object.keys(props.classes);
                        let index = c.findIndex(
                          (key) =>
                            props.classes[key].subject.id ===
                            props.classes[k].subject.id
                        );
                        return index === i;
                      })
                      .map((k, index) => (
                        <MenuItem
                          value={props.classes[k].subject.id}
                          key={index}
                        >
                          {props.classes[k].subject.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
            <List>
              {getPageItems(getFilteredQuestionnaires(), page).map(
                (q, index) => (
                  <ListItem ContainerComponent={Paper} key={index}>
                    <ListItemText primary={q.title} secondary={q.intro} />
                    <ListItemSecondaryAction>
                      <Button
                        onClick={() =>
                          setSelected(() => {
                            let s = [...selected];
                            let i = selected.findIndex((qq) => qq.id === q.id);
                            if (i >= 0) s.splice(i, 1);
                            else s.push(q);
                            return s;
                          })
                        }
                        variant="contained"
                        color={
                          selected.findIndex((qq) => qq.id === q.id) >= 0
                            ? "default"
                            : "primary"
                        }
                      >
                        {selected.findIndex((qq) => qq.id === q.id) >= 0
                          ? "REMOVE"
                          : "SELECT"}
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                )
              )}
            </List>
            {!getFilteredQuestionnaires().length && getPagination()}
          </React.Fragment>
        )}
      </DialogContent>
      <DialogActions style={{ flexWrap: isMobile ? "wrap" : "nowrap" }}>
        {getFilteredQuestionnaires().length ? getPagination() : null}
        <Button variant="contained" color="secondary" onClick={handleClose}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
const ConnectedAttachQuestionnaireDialog = connect((states) => ({
  classes: states.classes,
  questionnaires: states.questionnaires,
}))(AttachQuestionnaireDialog);
export { ConnectedAttachQuestionnaireDialog as AttachQuestionnaireDialog };

export function CreateDialog(props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const handleClose = () => props.onClose();
  return (
    <Dialog
      open={props.open}
      TransitionComponent={Transition}
      keepMounted
      fullScreen={true}
      onClose={handleClose}
    >
      <DialogTitle onClose={handleClose}>{props.title}</DialogTitle>
      <DialogContent
        style={{
          display: "flex",
          flexWrap: isMobile ? "wrap" : "nowrap",
          ...(isMobile ? { padding: "8px 0" } : {}),
        }}
      >
        <Box display="block" width={isMobile ? "100%" : "70%"} m={2}>
          {props.leftContent}
        </Box>
        <Box flex={1} m={2} width={isMobile ? "100%" : "30%"}>
          {props.rightContent}
        </Box>
      </DialogContent>
    </Dialog>
  );
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
export function SetAttendanceDialog(props) {
  const { onClose, isLoading, eventSchedule } = props;
  return onClose && eventSchedule ? (
    <Dialog open={eventSchedule.opened || false} onClose={onClose}>
      <DialogTitle onClose={onClose}>
        {eventSchedule.status?.ucfirst()}
      </DialogTitle>
      <DialogContent>
        <Typography>
          Schedule: {moment(eventSchedule.date).format("MMM DD, YYYY hh:mm A")}
        </Typography>
        {typeof eventSchedule.reason === "string" &&
        eventSchedule.reason.length ? (
          <Typography>Remarks: {eventSchedule.reason}</Typography>
        ) : (
          eventSchedule.reason
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {Children.map(eventSchedule.actions, (child) => {
          if (isValidElement(child)) {
            return cloneElement(child, { disabled: isLoading || false });
          }
          return child;
        })}
      </DialogActions>
    </Dialog>
  ) : null;
}
export const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h2" style={{ fontSize: 21, fontWeight: 600 }}>
        {children}
      </Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <Icon>close</Icon>
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

export function GooglePicker(props) {
  const loadApi = () => {
    let pickerApiLoaded = false;
    let oauthToken;
    var scope = ["https://www.googleapis.com/auth/drive.file"];
    function onAuthApiLoad() {
      window.gapi.auth.authorize(
        {
          client_id:
            "449233625863-1r4lkn9jq0gppnru23lo0uehmgjju06b.apps.googleusercontent.com",
          scope: scope,
          immediate: false,
        },
        handleAuthResult
      );
    }
    function handleAuthResult(authResult) {
      if (authResult && !authResult.error) {
        oauthToken = authResult.access_token;
        createPicker();
      }
    }
    function onPickerApiLoad() {
      pickerApiLoaded = true;
      createPicker();
    }
    function pickerCallback(data) {
      var url;
      var name;
      var thumb;
      var type;
      if (
        data[window.google.picker.Response.ACTION] ===
        window.google.picker.Action.PICKED
      ) {
        var doc = data[window.google.picker.Response.DOCUMENTS][0];
        url = doc[window.google.picker.Document.URL];
        thumb = doc[window.google.picker.Document.THUMBNAILS];
        name = doc[window.google.picker.Document.NAME];
        type = doc[window.google.picker.Document.TYPE];
      }
      if (url && name) {
        if (props.type ? props.type === type : true)
          props.onSelect({
            url,
            name,
            thumb,
          });
      }
    }
    function createPicker() {
      if (pickerApiLoaded && oauthToken) {
        var view = new window.google.picker.DocsView()
          .setParent("root")
          .setIncludeFolders(true)
          .setEnableDrives(true)
          .setMode(window.google.picker.DocsViewMode.GRID);
        var picker = new window.google.picker.PickerBuilder()
          .enableFeature(window.google.picker.Feature.SUPPORT_DRIVES)
          .enableFeature(window.google.picker.Feature.SUPPORT_TEAM_DRIVES)
          .setAppId(
            "449233625863-1r4lkn9jq0gppnru23lo0uehmgjju06b.apps.googleusercontent.com"
          )
          .setOAuthToken(oauthToken)
          .addView(view)
          .addView(new window.google.picker.DocsUploadView())
          .setDeveloperKey("AIzaSyCMaV_zOzBTWn7LdiaiOMrWuoBo6DiBZPM")
          .setCallback(pickerCallback)
          .build();
        picker.setVisible(true);
      }
    }

    window.gapi.load("auth", { callback: onAuthApiLoad });
    window.gapi.load("picker", { callback: onPickerApiLoad });
  };
  useEffect(() => {
    if (props.auth) props.auth(loadApi);
  }, [props.form]);
  return <div></div>;
}
