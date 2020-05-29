import React, { useEffect, useState } from "react";
import Drawer from "../components/Drawer";
import NavBar from "../components/NavBar";
import { Route, Link, useHistory } from "react-router-dom";
import {
  Box,
  makeStyles,
  Toolbar,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  Paper,
  ListItemText,
  IconButton,
  Typography,
  Slide,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  Divider,
} from "@material-ui/core";
import Skeleton from "react-loading-skeleton";
import CreateOutlined from "@material-ui/icons/CreateOutlined";
import QueryBuilderOutlinedIcon from "@material-ui/icons/QueryBuilderOutlined";
import CalendarTodayOutlinedIcon from "@material-ui/icons/CalendarTodayOutlined";
import VideocamOutlinedIcon from "@material-ui/icons/VideocamOutlined";
import ScreenShareOutlinedIcon from "@material-ui/icons/ScreenShareOutlined";
import VideoConference from "../containers/VideoConference";
import ArrowBackIosRoundedIcon from "@material-ui/icons/ArrowBackIosRounded";
import ArrowForwardIosRoundedIcon from "@material-ui/icons/ArrowForwardIosRounded";
import Activity from "../screens/class/Activity";
import LessonPlan from "../screens/class/LessonPlan";
import Schedule from "../screens/class/Schedule";
import Students from "../screens/class/Students";
import InstructionalMaterials from "../screens/class/InstructionalMaterials";
import moment from "moment";
import {
  makeLinkTo,
  rightPanelOptionsStudents,
  rightPanelOptions,
  isValidOption,
} from "../components/router-dom";
import { connect } from "react-redux";
import Api from "../api";
import getUserData from "../components/getUserData";
import $ from "jquery";

function ClassScheduleNavigator(props) {
  const { class_id, schedule_id } = props.match.params;
  const styles = useStyles();
  const [sched, setSched] = useState(props.classSched);
  const [classid, setClassId] = useState(class_id);
  useEffect(() => {
    console.log(sched, schedule_id);
    if (eval(sched != schedule_id)) {
      setSched(sched);
      props.changeClassSched(sched);
    }
    if (eval(class_id != classid)) {
      setSched(schedule_id);
      setClassId(class_id);
    }
  }, [sched, class_id]);
  return (
    <div>
      {props.classDetails[class_id] && (
        <FormControl variant="outlined" className={styles.formControl}>
          <InputLabel style={{ top: -8 }}>Schedule</InputLabel>
          <Select
            label="Schedule"
            value={sched}
            onChange={(e) => setSched(e.target.value)}
            padding={10}
          >
            {props.classDetails[class_id].schedules.map((k, i) => {
              return (
                <MenuItem value={k.id} key={i}>
                  {moment(k.from).format("LLLL")}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      )}
    </div>
  );
}

function ClassRightPanel(props) {
  const { option_name } = props.match.params;
  if (!isValidOption(option_name)) {
    return null;
  }
  let View = null;
  switch (option_name.toLowerCase()) {
    case "activity":
      View = Activity;
      break;
    case "lesson-plan":
      View = LessonPlan;
      break;
    case "schedule":
      View = Schedule;
      break;
    case "students":
      View = Students;
      break;
    case "instructional-materials":
      View = InstructionalMaterials;
  }
  return <View {...props} />;
}

function Class(props) {
  const { room_name, class_id, schedule_id, option_name } = props.match.params;
  const history = useHistory();
  const styles = useStyles();
  const [collapsePanel, setCollapsePanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [CLASS, setCLASS] = useState();
  const userInfo = props.userInfo;
  const isTeacher = userInfo.user_type === "t" ? true : false;
  const classSched = props.classDetails[class_id].schedules[schedule_id];
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let s = props.classDetails[class_id];
    if (!s.schedules[schedule_id] && schedule_id) {
      window.location = "/";
    } else if (!option_name && schedule_id) {
      history.push(makeLinkTo(["class", class_id, schedule_id, "activity"]));
    }
  }, [class_id, schedule_id]);

  useEffect(() => {
    setCLASS(undefined);
    const path = window.location.pathname.split("/");
    setLoading(true);
    _getClass();
  }, [window.location.pathname]);

  useEffect(() => {
    if (props.width === "sm" || props.width === "xs") setCollapsePanel(false);
    else setCollapsePanel(true);
  }, [props.width]);

  const _getClass = async () => {
    if (props.classDetails) setCLASS(props.classDetails[class_id]);
    else setCLASS(undefined);
    if (classSched.status === "ONGOING" && !room_name)
      history.push(
        makeLinkTo(
          ["class", class_id, schedule_id, "opt", "video-conference"],
          {
            opt: option_name ? option_name : "activity",
          }
        )
      );
    setLoading(false);
    return;
  };
  useEffect(() => {
    _getClass();
  }, [props.classDetails]);

  const panelOption = (p) => {
    return (
      <div key={p.id}>
        <Typography
          component="div"
          onClick={() => {
            history.push(
              makeLinkTo(["class", CLASS.id, "sc", p.link, "room_name"], {
                room_name: room_name ? "/video-conference" : "",
                sc: schedule_id ? schedule_id : "",
              })
            );
          }}
          style={{ cursor: "pointer" }}
        >
          <ListItem id={option_name === p.link ? "selected-option" : ""} button>
            <ListItemIcon>
              <VideocamOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary={p.title} />
          </ListItem>
        </Typography>
        <Divider />
      </div>
    );
  };
  const updateClass = async (status) => {
    setSaving(true);
    let user = await Api.auth();
    if (!user.error) {
      let res = await Api.post("/api/schedule/save", {
        body: {
          id: classSched.id,
          date_from: classSched.from,
          date_to: classSched.to,
          teacher_id: user.id,
          status: status,
        },
      });
      await getUserData(user);
      if (room_name)
        history.push(makeLinkTo(["class", class_id, schedule_id, option_name]));
    }
    setSaving(false);
  };
  const _handleJoinClass = async () => {
    if (isTeacher) {
      switch (classSched.status) {
        case "ONGOING":
          await updateClass("PENDING");
          history.push(
            makeLinkTo(["class", CLASS.id, "sc", option_name], {
              sc: schedule_id ? schedule_id : "",
            })
          );
          return;
        case "PENDING":
          await updateClass("ONGOING");
          history.push(
            makeLinkTo(
              ["class", CLASS.id, "sc", option_name, "video-conferece"],
              {
                sc: schedule_id ? schedule_id : "",
              }
            )
          );
          return;
        default:
          return;
      }
    } else {
      if (classSched.status === "ONGOING") {
        history.push(
          makeLinkTo(
            ["class", CLASS.id, "sc", option_name, "video-conference"],
            {
              sc: schedule_id ? schedule_id : "",
            }
          )
        );
      }
    }
  };
  const getRoom = () => {
    let s = props.classDetails[CLASS.id].schedules[schedule_id];
    let n = CLASS.name + "-" + moment(s.from).format("YYYY-MM-DD-H-mm-ss");
    return {
      name: n.replace(" ", "-"),
      displayName: s.teacher.first_name + " " + s.teacher.last_name,
    };
  };

  return (
    <div>
      <Drawer {...props}>
        <Box
          flexDirection="row"
          alignContent="center"
          display="flex"
          minHeight="100vh"
        >
          <Slide
            direction="right"
            in={collapsePanel}
            mountOnEnter
            unmountOnExit
            style={{ height: "100vh", overflow: "auto" }}
          >
            <Paper className={styles.panel} width="100vw">
              {CLASS !== undefined ? (
                <div>
                  <Toolbar className={styles.toolbar}>
                    <Typography variant="body1" style={{ fontWeight: "bold" }}>
                      {CLASS.name}
                    </Typography>
                    <IconButton
                      style={{ position: "absolute", right: 0 }}
                      aria-label="Collapse Panel"
                      onClick={() => setCollapsePanel(!collapsePanel)}
                    >
                      <ArrowBackIosRoundedIcon />
                    </IconButton>
                  </Toolbar>
                  <Box
                    width="100%"
                    height={140}
                    position="relative"
                    overflow="hidden"
                  >
                    <img
                      src="https://source.unsplash.com/random/1000x1000"
                      width="100%"
                      height="auto"
                    />
                    {isTeacher && (
                      <CreateOutlined
                        style={{ position: "absolute", bottom: 10, right: 10 }}
                      />
                    )}
                  </Box>
                  <Divider />
                  <Box p={2.2} className={styles.centered}>
                    <Box
                      flex={1}
                      className={[styles.centered, styles.start].join(" ")}
                      width="50%"
                    >
                      <CalendarTodayOutlinedIcon />
                      <Typography
                        variant="body2"
                        style={{ fontSize: "0.8rem", marginLeft: 5 }}
                      >
                        {CLASS.date_from}
                      </Typography>
                    </Box>
                    <Divider
                      orientation="vertical"
                      style={{ marginRight: 5 }}
                      flexItem
                    />
                    <Box
                      flex={1}
                      className={[styles.centered, styles.start].join(" ")}
                      width="50%"
                    >
                      <QueryBuilderOutlinedIcon />
                      <Typography
                        variant="body2"
                        style={{ fontSize: "0.75rem", marginLeft: 5 }}
                      >
                        {CLASS.time_from} - {CLASS.time_to}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider />
                  <Box
                    p={2.2}
                    className={[styles.centered, styles.start].join(" ")}
                  >
                    <Box
                      width={50}
                      height={50}
                      borderRadius="50%"
                      bgcolor="grey.500"
                      overflow="hidden"
                    >
                      {/* <img src={userInfo.avatar} width="100%" height="auto" /> */}
                    </Box>
                    <Box p={1}>
                      <Typography
                        variant="body1"
                        style={{ fontWeight: "bold" }}
                      >
                        {CLASS.teacher.first_name} {CLASS.teacher.last_name}
                      </Typography>
                      <Typography variant="body1">
                        {CLASS.subject.name} Teacher
                      </Typography>
                    </Box>
                  </Box>
                  <Divider />
                  <Box p={2} className={styles.centered}>
                    <Box flex={1} style={{ width: "100%" }}>
                      <Box>
                        <ClassScheduleNavigator
                          {...props}
                          classSched={schedule_id}
                          changeClassSched={(s) =>
                            history.push(
                              makeLinkTo(
                                [
                                  "class",
                                  CLASS.id,
                                  s,
                                  "option_name",
                                  "room_name",
                                ],
                                {
                                  option_name: option_name ? option_name : "",
                                  room_name: room_name ? room_name : "",
                                }
                              )
                            )
                          }
                        />
                      </Box>
                      <div className={styles.wrapper}>
                        <Button
                          style={{
                            width: "100%",
                          }}
                          className={
                            isTeacher && classSched.status === "ONGOING"
                              ? styles.endClass
                              : styles.startClass
                          }
                          size="small"
                          variant="contained"
                          disabled={
                            saving
                              ? true
                              : isTeacher
                              ? classSched.status !== "ONGOING" &&
                                classSched.status !== "PENDING"
                              : classSched.status !== "ONGOING"
                          }
                          onClick={() => _handleJoinClass()}
                        >
                          <VideocamOutlinedIcon
                            color="inherit"
                            style={{ marginRight: 8 }}
                          />
                          {isTeacher
                            ? classSched.status === "ONGOING"
                              ? "End Class"
                              : "Start Class"
                            : "Join Class"}
                        </Button>
                        {saving && (
                          <CircularProgress
                            className={styles.buttonProgress}
                            size={24}
                          />
                        )}
                      </div>
                    </Box>
                  </Box>
                  <Divider />
                  <List component="nav" aria-labelledby="nested-list-subheader">
                    {isTeacher
                      ? rightPanelOptions.map((r, id) =>
                          panelOption({ ...r, id })
                        )
                      : rightPanelOptionsStudents.map((r, id) =>
                          panelOption({ ...r, id })
                        )}
                  </List>
                </div>
              ) : (
                <div>
                  <Skeleton width="100%" height={170} />
                  <Box m={2}>
                    <Skeleton width="100%" height={20} />
                  </Box>
                  <Box m={2}>
                    <Skeleton circle={true} width={70} height={70} />
                    <Skeleton width={100} height={20} />
                  </Box>
                </div>
              )}
            </Paper>
          </Slide>
          <Box
            flex={1}
            overflow="hidden auto"
            height="100vh"
            id="right-panel"
            onScroll={(e) => {
              const clamp = (v, min = 0, max = 1) =>
                Math.min(max, Math.max(min, v));
              function p5map(n, start1, stop1, start2, stop2) {
                return (
                  ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2
                );
              }

              if ($("#activity-preview")[0]) {
                let x = $("#activity-preview");
                let offset = $("#video-conference-container");
                offset = offset[0] ? offset[0].offsetHeight : 0;
                let top = e.target.scrollTop - offset;
                let height = e.target.scrollHeight;
                x.css(
                  "opacity",
                  clamp(
                    p5map(
                      top,
                      0,
                      $("#activity-preview")[0].clientHeight - 50,
                      1,
                      0
                    ),
                    0,
                    1
                  )
                );
              }
            }}
          >
            {room_name &&
              CLASS &&
              schedule_id &&
              classSched.status === "ONGOING" && (
                <VideoConference
                  match={props.match}
                  getRoom={() => getRoom()}
                  updateClass={(e) => updateClass(e)}
                  left={
                    !collapsePanel ? (
                      <IconButton
                        aria-label="Collapse Panel"
                        onClick={() => setCollapsePanel(!collapsePanel)}
                      >
                        <ArrowForwardIosRoundedIcon />
                      </IconButton>
                    ) : null
                  }
                />
              )}

            <NavBar
              title={
                isValidOption(option_name)
                  ? isValidOption(option_name).title
                  : ""
              }
              left={
                !collapsePanel ? (
                  <IconButton
                    aria-label="Collapse Panel"
                    onClick={() => setCollapsePanel(!collapsePanel)}
                  >
                    <ArrowForwardIosRoundedIcon />
                  </IconButton>
                ) : null
              }
            />
            <Box
              flex={1}
              display="flex"
              alignItems="center"
              height="86%"
              justifyContent="center"
            >
              {loading && (
                <Box
                  width="100%"
                  height="100%"
                  display="flex"
                  alignItems="flex-start"
                  flexDirection="column"
                  p={2}
                  justifyContent="flex-start"
                  flexWrap="wrap"
                >
                  <Box style={{ padding: "6px 0" }} width={200}>
                    <Skeleton width="100%" height={50} />
                  </Box>
                  <Box style={{ padding: "6px 0" }} width="100%">
                    <Skeleton width="100%" height={70} />
                  </Box>
                  <Box style={{ padding: "6px 0" }} width="100%">
                    <Skeleton width="100%" height={70} />
                  </Box>
                  <Box style={{ padding: "6px 0" }} width="100%">
                    <Skeleton width="100%" height={300} />
                  </Box>
                </Box>
              )}
              {!loading && !CLASS && (
                //handle invalid class id
                <div>
                  <Typography variant="h2" fontWeight="bold" component="h2">
                    404
                  </Typography>
                  <Typography variant="h5" component="h2">
                    PAGE NOT FOUND
                  </Typography>
                </div>
              )}
              {!loading && CLASS && class_id && (
                <Route
                  path="/class/:class_id/:schedule_id/:option_name"
                  component={(p) => (
                    <ClassRightPanel classSched={schedule_id} {...p} />
                  )}
                />
              )}
            </Box>
          </Box>
        </Box>
      </Drawer>
    </div>
  );
}
const useStyles = makeStyles((theme) => ({
  endClass: {
    background: theme.palette.error.main,
    color: theme.palette.common.white,
  },
  startClass: {
    color: theme.palette.primary.main,
    background: theme.palette.common.white,
  },
  panel: {
    [theme.breakpoints.up("sm")]: {
      width: 320,
    },
    background: theme.palette.grey[100],
    boxShadow: "0 0 5px rgba(0,0,0,0.3)",
    zIndex: 12,
    position: "relative",
    width: "calc(100vw-0px)",
  },
  toolbar: {
    position: "sticky",
    top: 0,
    left: 0,
    right: 0,
    background: theme.palette.grey[200],
    zIndex: 9,
  },
  buttonProgress: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  wrapper: { margin: theme.spacing(1), position: "relative" },
  formControl: {
    width: "100%",
    marginBottom: theme.spacing(1),
  },
  centered: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  spaceBetween: {
    justifyContent: "space-between",
  },
  start: {
    justifyContent: "flex-start",
  },
}));
export default connect((states) => ({
  userInfo: states.userInfo,
  classDetails: states.classDetails,
}))(Class);
