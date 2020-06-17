import React, { useEffect, useState } from "react";
import Drawer from "../components/Drawer";
import NavBar from "../components/NavBar";
import { useHistory } from "react-router-dom";
import {
  Box,
  makeStyles,
  Icon,
  Toolbar,
  Button,
  CircularProgress,
  Tooltip,
  useMediaQuery,
  useTheme,
  List,
  ListItem,
  Avatar,
  ListItemIcon,
  Paper,
  ListItemText,
  IconButton,
  Typography,
  Slide,
  Divider,
  LinearProgress,
} from "@material-ui/core";
import Skeleton from "react-loading-skeleton";
import CreateOutlined from "@material-ui/icons/CreateOutlined";
import QueryBuilderOutlinedIcon from "@material-ui/icons/QueryBuilderOutlined";
import CalendarTodayOutlinedIcon from "@material-ui/icons/CalendarTodayOutlined";
import VideocamOutlinedIcon from "@material-ui/icons/VideocamOutlined";
import VideoConference from "../containers/VideoConference";
import ArrowBackIosRoundedIcon from "@material-ui/icons/ArrowBackIosRounded";
import ArrowForwardIosRoundedIcon from "@material-ui/icons/ArrowForwardIosRounded";
import {
  makeLinkTo,
  rightPanelOptionsStudents,
  rightPanelOptions,
  getView,
  isValidOption,
} from "../components/router-dom";
import { connect } from "react-redux";
import Api from "../api";
import UserData from "../components/UserData";
import $ from "jquery";
import socket from "../components/socket.io";
import moment from "moment";

function ClassRightPanel(props) {
  const { option_name, class_id } = props.match.params;
  let [View, setView] = useState();
  const handleRefresh = async () => {
    props.loading(true);
    setView(null);
    await UserData.updateScheduleDetails(class_id, props.classSched);
    setView(getView(option_name.toLowerCase()));
  };
  useEffect(() => {
    if (isValidOption(option_name)) setView(getView(option_name.toLowerCase()));
    else props.loading(false);
  }, [option_name]);
  return View ? (
    <Box width="100%" height="100%">
      <View
        {...props}
        refresh={handleRefresh}
        onLoad={() => props.loading(false)}
        test={123}
      />
      <IconButton
        onClick={handleRefresh}
        style={{ position: "absolute", right: 10, bottom: 10 }}
      >
        <Icon>refresh</Icon>
      </IconButton>
    </Box>
  ) : null;
}

function Class(props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { room_name, class_id, schedule_id, option_name } = props.match.params;
  const history = useHistory();
  const styles = useStyles();
  const [collapsePanel, setCollapsePanel] = useState(true);
  const [loading, setLoading] = useState(true);
  const [CLASS, setCLASS] = useState();
  const userInfo = props.userInfo;
  const isTeacher = userInfo.user_type === "t" ? true : false;
  const [saving, setSaving] = useState(false);
  const [currentID, setCurrentID] = useState(class_id);
  const [rightPanelLoading, setRightPanelLoading] = useState(true);

  useEffect(() => {
    if (class_id && schedule_id) {
      if (!props.classDetails[class_id] || currentID !== class_id) {
        setCLASS(undefined);
        setLoading(true);
        setRightPanelLoading(true);
        setCurrentID(class_id);
      }
      _getClass();
    }
  }, [class_id, schedule_id, props.classDetails]);

  const _getClass = async () => {
    if (props.classDetails[class_id]) {
      setCLASS(props.classDetails[class_id]);
    } else {
      await UserData.updateClassDetails(class_id);
      setCLASS(undefined);
    }
    setRightPanelLoading(false);
    setLoading(false);
    return;
  };

  const panelOption = (p) => {
    return (
      <div key={p.id}>
        <Typography
          component="div"
          onClick={() => {
            if (isMobile) setCollapsePanel(false);
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
            <ListItemIcon>{p.icon}</ListItemIcon>
            <ListItemText primary={p.title} />
          </ListItem>
        </Typography>
        {props.dataProgress[p.link] &&
          p.link !== option_name &&
          Math.ceil(
            (props.dataProgress[p.link].loaded /
              props.dataProgress[p.link].total) *
              100
          ) < 100 && (
            <LinearProgress
              variant="determinate"
              value={Math.ceil(
                (props.dataProgress[p.link].loaded /
                  props.dataProgress[p.link].total) *
                  100
              )}
            />
          )}
        <Divider />
      </div>
    );
  };
  const updateClass = async (status) => {
    setSaving(true);
    await Api.post("/api/schedule/save", {
      body: {
        id: props.classDetails[class_id].schedules[schedule_id].id,
        date_from: props.classDetails[class_id].schedules[schedule_id].from,
        date_to: props.classDetails[class_id].schedules[schedule_id].to,
        teacher_id: props.userInfo.id,
        status: status,
      },
    });
    let newClassDetails = await UserData.updateClassDetails(class_id);
    UserData.updateClass(class_id, newClassDetails[class_id]);
    socket.emit(
      "new class details",
      JSON.stringify({ details: newClassDetails, id: class_id })
    );
    if (room_name)
      history.push(makeLinkTo(["class", class_id, schedule_id, option_name]));
    if (isMobile) setCollapsePanel(false);
    setSaving(false);
  };
  const _handleJoinClass = async () => {
    if (isTeacher) {
      let stat = props.classDetails[class_id].schedules[schedule_id].status;
      if (stat === "ONGOING" && !room_name) {
        history.push(
          makeLinkTo(
            ["class", CLASS.id, "sc", option_name, "video-conference"],
            {
              sc: schedule_id ? schedule_id : "",
            }
          )
        );
        if (isMobile) setCollapsePanel(false);
        return;
      }
      switch (stat) {
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
              ["class", CLASS.id, "sc", option_name, "video-conference"],
              {
                sc: schedule_id ? schedule_id : "",
              }
            )
          );
          if (isMobile) setCollapsePanel(false);
          return;
        default:
          return;
      }
    } else {
      if (
        props.classDetails[class_id].schedules[schedule_id].status === "ONGOING"
      ) {
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
    return {
      name: CLASS.room_number,
      displayName: props.userInfo.first_name + " " + props.userInfo.last_name,
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
              {CLASS !== undefined && props.classDetails[class_id] ? (
                <div>
                  <Toolbar className={styles.toolbar}>
                    <Typography variant="body1" style={{ fontWeight: "bold" }}>
                      {CLASS.name}
                    </Typography>
                    <Tooltip title="Hide class panel" placement="bottom-start">
                      <IconButton
                        style={{ position: "absolute", right: 0 }}
                        aria-label="Collapse Panel"
                        onClick={() => setCollapsePanel(!collapsePanel)}
                      >
                        <ArrowBackIosRoundedIcon />
                      </IconButton>
                    </Tooltip>
                  </Toolbar>
                  <Box
                    width="100%"
                    height={140}
                    position="relative"
                    overflow="hidden"
                  >
                    <img
                      alt="Class Wallpaper"
                      src="https://www.iskwela.net/img/on-iskwela.svg"
                      width="100%"
                      height="100%"
                    />
                    {isTeacher && (
                      <Tooltip
                        title="Edit class picture"
                        placement="left-start"
                      >
                        <IconButton
                          style={{
                            position: "absolute",
                            bottom: 10,
                            right: 10,
                          }}
                        >
                          <CreateOutlined />
                        </IconButton>
                      </Tooltip>
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
                        {moment(
                          props.classDetails[class_id].schedules[schedule_id]
                            .from
                        ).format("LL")}
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
                        {moment(
                          props.classDetails[class_id].schedules[schedule_id]
                            .from
                        ).format("H:mm A")}
                        {" - "}
                        {moment(
                          props.classDetails[class_id].schedules[schedule_id].to
                        ).format("H:mm A")}
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
                      <Avatar
                        src={props.pics[CLASS.teacher.id]}
                        alt={
                          CLASS.teacher.first_name +
                          " " +
                          CLASS.teacher.last_name
                        }
                        style={{
                          width: "100%",
                          height: "100%",
                          background: "#fff",
                        }}
                      />
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
                      <div className={styles.wrapper}>
                        <Button
                          style={{
                            width: "100%",
                          }}
                          className={
                            isTeacher &&
                            props.classDetails[class_id].schedules[schedule_id]
                              .status === "ONGOING"
                              ? room_name
                                ? styles.endClass
                                : styles.startClass
                              : styles.startClass
                          }
                          size="small"
                          variant="contained"
                          disabled={
                            saving
                              ? true
                              : isTeacher
                              ? false
                              : room_name
                              ? true
                              : props.classDetails[class_id].schedules[
                                  schedule_id
                                ].status !== "ONGOING"
                          }
                          onClick={() => _handleJoinClass()}
                        >
                          <VideocamOutlinedIcon
                            color="inherit"
                            style={{ marginRight: 8 }}
                          />
                          {isTeacher
                            ? props.classDetails[class_id].schedules[
                                schedule_id
                              ].status === "ONGOING"
                              ? room_name
                                ? "End Class"
                                : "Return to Class"
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
                      ? rightPanelOptions
                          .filter((s) => !s.hidden)
                          .map((r, id) => panelOption({ ...r, id }))
                      : rightPanelOptionsStudents
                          .filter((s) => !s.hidden)
                          .map((r, id) => panelOption({ ...r, id }))}
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
                x.css(
                  "opacity",
                  clamp(
                    p5map(top, 0, $("#activity-preview")[0].clientHeight, 1, 0),
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
              props.classDetails[class_id].schedules[schedule_id].status ===
                "ONGOING" && (
                <VideoConference
                  match={props.match}
                  getRoom={() => getRoom()}
                  updateClass={(e) => {
                    if (isTeacher) updateClass(e);
                  }}
                  left={
                    !collapsePanel ? (
                      <Tooltip
                        title="Show class panel"
                        placement="bottom-start"
                      >
                        <IconButton
                          aria-label="Collapse Panel"
                          onClick={() => setCollapsePanel(!collapsePanel)}
                        >
                          <ArrowForwardIosRoundedIcon />
                        </IconButton>
                      </Tooltip>
                    ) : null
                  }
                />
              )}

            <NavBar
              title={
                isValidOption(option_name) && !isMobile
                  ? isValidOption(option_name).title
                  : ""
              }
              left={
                !collapsePanel ? (
                  <Tooltip title="Show class panel" placement="bottom-start">
                    <IconButton
                      aria-label="Collapse Panel"
                      onClick={() => setCollapsePanel(!collapsePanel)}
                    >
                      <ArrowForwardIosRoundedIcon />
                    </IconButton>
                  </Tooltip>
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
              {rightPanelLoading && (
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
              {CLASS && class_id && (
                <ClassRightPanel
                  classSched={schedule_id}
                  loading={(e) => setRightPanelLoading(e)}
                  {...props}
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
    width: "100vw",
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
  pics: states.pics,
  classes: states.classes,
  dataProgress: states.dataProgress,
}))(Class);
