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
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import socket from "../../components/socket.io";
import Pagination, { getPageItems } from "../Pagination";
import { makeLinkTo } from "../router-dom";
import { SearchInput } from "../Selectors";

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
                            ? theme.palette.error.main
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
      if (
        data[window.google.picker.Response.ACTION] ===
        window.google.picker.Action.PICKED
      ) {
        var doc = data[window.google.picker.Response.DOCUMENTS][0];
        url = doc[window.google.picker.Document.URL];
        name = doc[window.google.picker.Document.NAME];
      }
      if (url && name) {
        props.onSelect({
          url,
          name,
        });
      }
    }
    function createPicker() {
      if (pickerApiLoaded && oauthToken) {
        var view = new window.google.picker.View(
          window.google.picker.ViewId.DOCS
        );
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
