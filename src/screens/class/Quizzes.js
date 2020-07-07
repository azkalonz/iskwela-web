import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  Icon,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  Menu,
  MenuItem,
  Select,
  Slide,
  Snackbar,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  withStyles,
  ButtonGroup,
  Paper,
  Divider,
  Toolbar,
} from "@material-ui/core";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import Grow from "@material-ui/core/Grow";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import CloseIcon from "@material-ui/icons/Close";
import MuiAlert from "@material-ui/lab/Alert";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import Api from "../../api";
import {
  AttachQuestionnaireDialog,
  CreateDialog,
} from "../../components/dialogs";
import Pagination from "../../components/Pagination";
import Progress from "../../components/Progress";
import { makeLinkTo } from "../../components/router-dom";
import socket from "../../components/socket.io";
import { Table as MTable } from "../../components/Table";
import UserData, { asyncForEach } from "../../components/UserData";
import AnswerQuiz from "./AnswerQuiz";
import { SearchInput } from "../../components/Selectors";
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

function Quizzes(props) {
  const theme = useTheme();
  const history = useHistory();
  const query = queryString.parse(window.location.search);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [currentItem, setCurrentItem] = useState();
  const [saving, setSaving] = useState(false);
  const { class_id, option_name, schedule_id } = props.match.params;
  const [ITEMS, setITEMS] = useState();
  const [search, setSearch] = useState("");
  const [modals, setModals] = React.useState({});
  const isTeacher = props.userInfo.user_type === "t" ? true : false;
  const styles = useStyles();
  const classSched = props.classSched;
  const [errors, setErrors] = useState();
  const [success, setSuccess] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [savingId, setSavingId] = useState([]);
  const [page, setPage] = useState(query.page ? parseInt(query.page) : 1);
  const [questionnairesToAnswer, setQuestionnairesToAnswer] = useState([]);

  const formTemplate = {
    title: "",
    instruction: "",
    duration: 60,
    category_id: props.gradingCategories[0] && props.gradingCategories[0].id,
  };
  const [form, setForm] = useState(formTemplate);
  const cellheaders = [
    { id: "title", title: "Title" },
    { id: "duration", title: "Duration", align: "flex-end" },
  ];
  const _handleFileOption = (option, file) => {
    switch (option) {
      case "view":
        handleViewItem(file);
        return;
      case "edit":
        handleOpen("CREATE_DIALOG");
        setForm({
          ...file,
          category_id: file.category.id,
        });
        return;
      case "publish":
        _handleUpdateStatus(file, true);
        return;
      case "unpublish":
        _handleUpdateStatus(file, false);
        return;
      case "delete":
        _handleDelete(file);
        return;
      default:
        return;
    }
  };
  const _getITEMS = async () => {
    props.onLoad(true);
    if (!classSched) return;
    try {
      let res;
      let published;
      if (isTeacher) {
        res = await Api.get("/api/quizzes?include=questionnaires");
        published = await Api.get(
          "/api/quizzes?include=questionnaires&class_id=" + class_id
        );
      } else {
        res = await Api.get(
          "/api/quizzes?include=questionnaires&class_id=" + class_id
        );
      }
      if (res) {
        setITEMS(
          res.map((c) =>
            published
              ? published.findIndex((cc) => c.id === cc.id) >= 0
                ? { ...c, published: true }
                : c
              : { ...c, published: true }
          )
        );
      } else {
        setITEMS([]);
      }
    } catch (e) {}
    props.onLoad(false);
  };
  useEffect(() => {
    socket.off("delete items");
    socket.off("add items");
    socket.on("delete items", (data) => {
      if (data.type === "QUIZ" && !isTeacher) {
        if (ITEMS) setITEMS(ITEMS.filter((q) => data.items.indexOf(q.id) < 0));
      }
    });
    socket.on("add items", (data) => {
      if (data.type === "QUIZ") {
        if (ITEMS) setITEMS([...ITEMS, data.items]);
      }
    });
  }, [ITEMS]);
  useEffect(() => {
    if (props.classDetails[class_id]) {
      _getITEMS();
    }
  }, [props.classDetails]);
  useEffect(() => {
    if (ITEMS) {
      if (!isNaN(parseInt(query.id))) {
        setCurrentItem(ITEMS.find((q) => q.id === parseInt(query.id)));
      }
      if (query.q && !isNaN(parseInt(query.q))) {
        let a = ITEMS.find((q) => q.id === parseInt(query.q)) || {};
        setQuestionnairesToAnswer(a.questionnaires);
      }
    }
  }, [ITEMS, query.id]);
  const _handleSearch = (e) => {
    setSearch(e.toLowerCase());
    setPage(1);
  };
  const handleOpen = (dialog_id) => {
    let m = { ...modals };
    m[dialog_id] = true;
    setModals(m);
  };
  const handleClose = (dialog_id) => {
    let m = { ...modals };
    m[dialog_id] = false;
    setModals(m);
  };
  const handleViewItem = (item) => {
    history.push("?id=" + item.id);
    setCurrentItem(item);
  };
  const handleAddQuestionnaires = async (id, questionnaires) => {
    setSaving(true);
    setSavingId([id]);
    try {
      await Api.post("/api/quiz/questionnaire/add", {
        body: {
          id,
          questionnaires: questionnaires.map((q) => ({ id: q.id })),
        },
      });
    } catch (e) {
      setErrors(["Oops! Something went wrong. Please try again."]);
    }
    setSaving(false);
    setSavingId([]);
  };
  const handleRemoveQuestionnaire = async (
    id,
    questionnaire_id,
    callback = null
  ) => {
    setSaving(true);
    setSavingId([questionnaire_id]);
    let res = await Api.post("/api/quiz/questionnaire/remove", {
      body: {
        id,
        questionnaire_id,
      },
    });
    setSaving(false);
    setSavingId([]);
    callback && callback();
  };
  const handleSave = async (params = {}, noupdate = false) => {
    setSaving(true);
    try {
      let res = await Api.post("/api/quiz/save?include=questionnaires", {
        body: {
          ...form,
          subject_id: props.classDetails[class_id].subject.id,
        },
      });
      setITEMS([...ITEMS, res]);
      setForm(res);
      setSuccess(true);
    } catch (e) {
      setErrors(["Oops! Something went wrong. Please try again."]);
    }

    setSaving(false);
  };

  const _handleUpdateStatus = async (a, s, confirmation = true) => {
    let stat = s ? "Publish" : "Unpublish";
    const update = async () => {
      await Api.post("/api/quiz/" + (s ? "publish" : "unpublish"), {
        body: {
          id: a.id,
          schedule_id,
          class_id,
        },
      });
      if (s) {
        socket.emit("add items", {
          type: "QUIZ",
          items: { ...a, published: true },
        });
      } else {
        socket.emit("delete items", {
          type: "QUIZ",
          items: [a.id],
        });
      }
    };
    if (!confirmation) {
      await update();
    } else {
      setConfirmed({
        title: stat + " Quiz",
        message: "Are you sure to " + stat + " this Quiz?",
        yes: async () => {
          setErrors(null);
          setSaving(true);
          setConfirmed(null);
          setSavingId([...savingId, a.id]);
          await update();
          setSavingId([]);
          setSaving(false);
        },
      });
    }
  };
  const _handleDelete = (item) => {
    setConfirmed({
      title: "Remove Quiz",
      message: "Are you sure to remove this Quiz?",
      yes: async () => {
        setErrors(null);
        setSaving(true);
        setConfirmed(null);
        setSavingId([...savingId, item.id]);
        let id = parseInt(item.id);
        let res;
        try {
          res = await Api.delete("/api/quiz/delete/" + id);
        } catch (e) {
          setErrors(["Oops! Something went wrong. Please try again later."]);
          setSavingId([]);
          setSaving(false);
          return;
        }
        if (res && !res.errors) {
          setITEMS(ITEMS.filter((q) => item.id !== q.id));
          socket.emit("delete items", {
            type: "QUIZ",
            items: [item.id],
          });
          setSuccess(true);
        } else if (res.errors) {
          setErrors(["Oops! Something went wrong. Please try again."]);
        }
        setSavingId([]);
        setSaving(false);
      },
    });
  };
  const _handleMultiUpdate = (a, s, done) => {
    let stat = s ? "Publish" : "Unpublish";
    setConfirmed({
      title: stat + " " + Object.keys(a).length + " Quiz",
      message: "Are you sure to " + stat + " this Quiz?",
      yes: async () => {
        setErrors(null);
        setSaving(true);
        setConfirmed(null);
        setSavingId([...savingId, ...Object.keys(a).map((i) => a[i].id)]);
        await asyncForEach(Object.keys(a), async (i) => {
          try {
            await _handleUpdateStatus(
              ITEMS.find((q) => q.id === a[i].id),
              s,
              false
            );
          } catch (e) {
            setErrors(["Oops! Something went wrong. Please try again later."]);
            setSaving(false);
            setSavingId([]);
            return;
          }
        });
        done();
        setSavingId([]);
        setSaving(false);
      },
    });
  };
  const _handleMultiDelete = (items, done) => {
    setConfirmed({
      title: "Remove " + Object.keys(items).length + " Quiz?",
      message: "Are you sure to remove this Quiz?",
      yes: async () => {
        setErrors(null);
        setSaving(true);
        setConfirmed(null);
        setSavingId([
          ...savingId,
          ...Object.keys(items).map((i) => items[i].id),
        ]);
        let err = [];
        await asyncForEach(Object.keys(items), async (i) => {
          let id = parseInt(i);
          let res;
          try {
            res = await Api.delete("/api/quiz/delete/" + id);
          } catch (e) {
            setErrors(["Oops! Something went wrong. Please try again later "]);
            setSaving(false);
            setSavingId([]);
            return;
          }
          if (res && res.errors) {
            setErrors(["Oops! Something went wrong. Please try again."]);
          }
        });
        if (!errors) {
          setITEMS(
            ITEMS.filter(
              (q) =>
                Object.keys(items).findIndex((qq) => items[qq].id === q.id) < 0
            )
          );
          socket.emit("delete items", {
            type: "QUIZ",
            items: Object.keys(items).map((id) => parseInt(id)),
          });
          done();
          setSuccess(true);
        }
        setSavingId([]);
        setSaving(false);
      },
    });
  };
  const handleStart = () => {
    if (!currentItem.questionnaires.length) return;
    history.push(
      makeLinkTo([
        "class",
        class_id,
        schedule_id,
        option_name,
        "?id=" + currentItem.questionnaires[0].id,
        "&q=" + currentItem.id + "#start",
      ])
    );
    setCurrentItem(null);
    setQuestionnairesToAnswer(currentItem.questionnaires);
  };

  const getFilteredITEMS = (ac = ITEMS) =>
    ac
      .filter((a) => JSON.stringify(a).toLowerCase().indexOf(search) >= 0)
      .filter((a) => (isTeacher ? true : a.published))
      .reverse();
  return (
    <Box width="100%" alignSelf="flex-start" height="100%">
      {props.dataProgress[option_name] && (
        <Progress id={option_name} data={props.dataProgress[option_name]} />
      )}
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
      {currentItem && !search && (
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
                      paddingLeft: 0,
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
                          setCurrentItem(null);
                        }}
                      >
                        <Icon color="primary">arrow_back</Icon>
                      </IconButton>
                    </Box>
                    <Box>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleStart()}
                      >
                        Start
                      </Button>
                    </Box>
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
                          {currentItem.title}
                        </Typography>
                      </Box>
                      <Box
                        display="flex"
                        alignItems="center"
                        style={{ whiteSpace: "nowrap" }}
                      >
                        <Typography style={{ whiteSpace: "pre-wrap" }}>
                          {currentItem.duration} mins
                        </Typography>
                      </Box>
                    </Box>
                    <Box p={2}>
                      <Typography style={{ whiteSpace: "pre-wrap" }}>
                        {currentItem.instruction}
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
                          Questions
                        </Typography>
                      </Box>
                      <Box width="100%">
                        <Divider />
                      </Box>
                    </Box>
                    <Box p={2}>
                      {currentItem.questionnaires.map((m, i) => (
                        <Typography
                          style={{ cursor: "pointer", fontWeight: "bold" }}
                          color="primary"
                          key={i}
                          onClick={() => {
                            history.push(
                              makeLinkTo([
                                "class",
                                class_id,
                                schedule_id,
                                option_name,
                                "?id=" + m.id,
                                "&q=" + currentItem.id + "#start",
                              ])
                            );
                          }}
                        >
                          {m.title}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </Box>
          </Grow>
        </React.Fragment>
      )}
      {ITEMS && props.location.hash !== "#start" && !currentItem && (
        <React.Fragment>
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
                  handleOpen("CREATE_DIALOG");
                  setForm(formTemplate);
                }}
              >
                Add New Quiz
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
              <SearchInput onChange={(e) => _handleSearch(e)} />
            </Box>
          </Box>
          <MTable
            page={page}
            headers={cellheaders}
            onPage={(p) => setPage(p)}
            data={ITEMS}
            saving={saving}
            savingId={savingId}
            pagination={{
              render: (
                <Pagination
                  page={page}
                  match={props.match}
                  icon={search ? "search" : ""}
                  emptyTitle={search ? "Nothing Found" : false}
                  emptyMessage={
                    search ? "Try a different keyword." : "There's no Quiz yet."
                  }
                  onChange={(p) => setPage(p)}
                  count={getFilteredITEMS().length}
                />
              ),
              page,
              onChange: (p) => setPage(p),
            }}
            actions={{
              onDelete: (i, done) => _handleMultiDelete(i, done),
              onUpdate: (a, s, done) => _handleMultiUpdate(a, s, done),
              _handleFileOption: (opt, file) => _handleFileOption(opt, file),
            }}
            options={[
              {
                name: "View",
                value: "view",
              },
            ]}
            teacherOptions={[
              { name: "Edit", value: "edit" },
              { name: "Publish", value: "publish" },
              { name: "Unpublish", value: "unpublish" },
              { name: "Delete", value: "delete" },
            ]}
            filtered={(a) => getFilteredITEMS(a)}
            rowRender={(item) => (
              <React.Fragment>
                <ListItemText
                  onClick={() => _handleFileOption("view", item)}
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
                  secondary={item.instruction.substr(0, 100)}
                />
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
                  {item.duration} mins
                </Typography>
              </React.Fragment>
            )}
          />
        </React.Fragment>
      )}
      <AttachQuestionnaireDialog
        selected={form.questionnaires}
        open={modals.QUESTIONNAIRE ? modals.QUESTIONNAIRE : false}
        title="Select Questionnaire"
        onClose={() => handleClose("QUESTIONNAIRE")}
        onSelect={async (s) => {
          if (!form.id) {
            setForm({ ...form, questionnaires: s });
          } else {
            if (s.length > form.questionnaires.length) {
              let newQ = s.filter(
                (q) => form.questionnaires.findIndex((qq) => qq.id === q.id) < 0
              );
              await handleAddQuestionnaires(form.id, newQ);
              setForm({
                ...form,
                questionnaires: [...form.questionnaires, ...newQ],
              });
              let newItems = [...ITEMS];
              let qs = newItems[ITEMS.findIndex((i) => i.id === form.id)];
              qs.questionnaires.push(...newQ);
              setITEMS(newItems);
            }
          }
        }}
        match={props.match}
        data={props.questionnaires}
      />
      {ITEMS && questionnairesToAnswer && props.location.hash === "#start" && (
        <AnswerQuiz
          id={query.id && parseInt(query.id)}
          noPaging={true}
          fullHeight
          match={props.match}
          questionsSet={questionnairesToAnswer}
          quiz={ITEMS.find(
            (q) => !isNaN(parseInt(query.q)) && q.id === parseInt(query.q)
          )}
        />
      )}
      <CreateDialog
        title={form.id ? "Edit Quiz" : "Create Quiz"}
        open={modals.CREATE_DIALOG ? modals.CREATE_DIALOG : false}
        onClose={() => handleClose("CREATE_DIALOG")}
        leftContent={
          <React.Fragment>
            <TextField
              label="Title"
              variant="outlined"
              className={[styles.textField, "themed-input"].join(" ")}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              fullWidth
            />
            <Box
              display="flex"
              width="100%"
              alignItems="flex-end"
              style={{ margin: "10px 0" }}
            >
              <Box flex={1} marginRight={0.5}>
                <TextField
                  label="Duration"
                  variant="outlined"
                  className={[styles.textField, "themed-input"].join(" ")}
                  value={form.duration.toString()}
                  onChange={(e) =>
                    setForm({ ...form, duration: parseInt(e.target.value) })
                  }
                  type="number"
                  fullWidth
                />
              </Box>
              <Box flex={1} marginLeft={0.5}>
                <FormControl
                  variant="outlined"
                  fullWidth
                  className="themed-input select"
                >
                  <InputLabel>Grading Category</InputLabel>
                  <Select
                    label="Grading Category"
                    variant="outlined"
                    padding={10}
                    value={
                      form.id
                        ? parseInt(form.category.id)
                        : parseInt(form.category_id)
                    }
                    onChange={(e) => {
                      setForm({
                        ...form,
                        category_id: e.target.value,
                      });
                    }}
                    style={{ paddingTop: 17 }}
                  >
                    {props.gradingCategories.map((c, index) => (
                      <MenuItem value={c.id} key={index}>
                        {c.category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
            <TextField
              label="Instruction"
              variant="outlined"
              className={[styles.textField, "themed-input"].join(" ")}
              rows={10}
              style={{ marginTop: theme.spacing(2) }}
              value={form.instruction}
              multiline={true}
              onChange={(e) =>
                setForm({ ...form, instruction: e.target.value })
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
                <ButtonGroup>
                  <Button
                    variant="outlined"
                    style={{
                      borderRadius: "5px 0 0 5px",
                      marginRight: 0,
                      boxShadow: "none",
                      position: "relative",
                    }}
                    onClick={() => handleOpen("QUESTIONNAIRE")}
                    className={styles.wrapper}
                    disabled={saving}
                  >
                    Add Questionnaire
                  </Button>
                  <PopupState variant="popover" popupId="publish-btn">
                    {(popupState) => (
                      <React.Fragment>
                        <Button
                          disabled={saving}
                          variant="outlined"
                          {...bindTrigger(popupState)}
                        >
                          <ArrowDropDownIcon />
                        </Button>
                        <Menu {...bindMenu(popupState)}>
                          <MenuItem
                            onClick={() => {
                              window.open(
                                makeLinkTo([
                                  "class",
                                  class_id,
                                  schedule_id,
                                  "questionnaire?hidepanel=true&callback=send_item&to=" +
                                    socket.id,
                                ]),
                                "_blank"
                              );
                            }}
                          >
                            Create
                          </MenuItem>
                        </Menu>
                      </React.Fragment>
                    )}
                  </PopupState>
                </ButtonGroup>
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
                    onClick={() => handleSave()}
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
                              handleSave({ published: 1 });
                              popupState.close();
                            }}
                          >
                            Publish
                          </MenuItem>
                          {form.id && (
                            <MenuItem
                              disabled={form.status === "unpublished"}
                              onClick={() => {
                                handleSave({ published: 0 });
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
            {form.questionnaires && (
              <Box style={{ marginTop: 7 }}>
                <List>
                  {form.questionnaires.map((q, index) => (
                    <ListItem
                      key={index}
                      component={Button}
                      variant="outlined"
                      onClick={() => history.push("?id=" + q.id + "#preview")}
                      style={{ paddingBottom: 7 }}
                      disabled={saving && savingId.indexOf(q.id) >= 0}
                    >
                      <ListItemText primary={q.title} secondary={q.intro} />
                      <ListItemSecondaryAction>
                        <IconButton
                          onClick={async () => {
                            if (form.id) {
                              await handleRemoveQuestionnaire(form.id, q.id);
                              setForm({
                                ...form,
                                questionnaires: form.questionnaires.filter(
                                  (qq) => qq.id !== q.id
                                ),
                              });
                              let newItems = [...ITEMS];
                              let qs =
                                newItems[
                                  ITEMS.findIndex((i) => i.id === form.id)
                                ];
                              qs.questionnaires.splice(
                                qs.questionnaires.findIndex(
                                  (qq) => qq.id === q.id
                                ),
                                1
                              );
                              setITEMS(newItems);
                            } else {
                              let s = [...form.questionnaires];
                              s.splice(
                                form.questionnaires.findIndex(
                                  (qq) => qq.id === q.id
                                ),
                                1
                              );
                              setForm({ ...form, questionnaires: s });
                            }
                          }}
                        >
                          <Icon>close</Icon>
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
    </Box>
  );
}
const useStyles = makeStyles((theme) => ({
  buttonProgress: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  wrapper: { position: "relative" },
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
  gradingCategories: state.gradingCategories,
}))(Quizzes);
