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
  ListItemSecondaryAction,
  Backdrop,
} from "@material-ui/core";
import Skeleton from "react-loading-skeleton";
import CreateOutlined from "@material-ui/icons/CreateOutlined";
import VideocamOutlinedIcon from "@material-ui/icons/VideocamOutlined";
import VideoConference from "../containers/VideoConference";
import ArrowBackIosRoundedIcon from "@material-ui/icons/ArrowBackIosRounded";
import ArrowForwardIosRoundedIcon from "@material-ui/icons/ArrowForwardIosRounded";
import {
  makeLinkTo,
  rightPanelOptionsStudents as studentPanel,
  rightPanelOptions as teacherPanel,
  getView,
  isValidOption,
} from "../components/router-dom";
import { connect } from "react-redux";
import Api from "../api";
import UserData from "../components/UserData";
import $ from "jquery";
import socket from "../components/socket.io";
import moment from "moment";

function setPanelIds(panel, i = 0) {
  panel.forEach((p) => {
    p.id = i;
    i++;
    if (p.children) {
      p.children = setPanelIds(p.children, i);
      i += p.children.length;
    }
  });
  return panel;
}
const rightPanelOptions = setPanelIds(teacherPanel);
const rightPanelOptionsStudents = setPanelIds(studentPanel);
console.log(rightPanelOptions);

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
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
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
    if (isMobile) setCollapsePanel(false);
  }, [isMobile]);
  useEffect(() => {
    if (class_id) {
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
      await UserData.updateClassDetails(class_id, null, (d) => {
        if (!schedule_id)
          history.push(makeLinkTo(["class", class_id, d.id, "activity"]));
      });
      setCLASS(undefined);
    }
    setRightPanelLoading(false);
    setLoading(false);
    return;
  };

  const panelOption = (p) => {
    const handleExpand = () => {
      if (p.link) {
        history.push(
          makeLinkTo(["class", CLASS.id, "sc", p.link, "room_name"], {
            room_name: room_name ? "/video-conference" : "",
            sc: schedule_id ? schedule_id : "",
          })
        );
      }
      if (isMobile && !p.children) setCollapsePanel(false);

      if (!p.children || !p.children.filter((c) => !c.hidden).length) return;
      let i = {
        expanded: document.querySelector("#is-expanded-" + p.id),
        notexpanded: document.querySelector("#not-expanded-" + p.id),
      };
      i.expanded.style.display = "none";
      i.notexpanded.style.display = "none";
      let o = document.querySelector("#panel-option-" + p.id);
      let h = o.firstElementChild.clientHeight;
      if (o.classList.value.indexOf("opened") < 0) {
        if (p.isChild) {
          let parent = o.parentElement.parentElement;
          let parentHeight = parent.clientHeight - 48;
          parent.style.height = parentHeight + h + "px";
        }
        o.style.height = h + "px";
        i.expanded.style.display = "block";
      } else {
        if (p.isChild) {
          let parent = o.parentElement.parentElement;
          let parentHeight = parent.firstElementChild.clientHeight - h + 48;
          parent.style.height = parentHeight + "px";
        }
        o.style.height = "48px";
        i.notexpanded.style.display = "block";
      }
      o.classList.toggle("opened");
    };
    return (
      <div
        key={p.id}
        id={"panel-option-" + p.id}
        className="panel-option-container"
        style={{ ...(p.children ? { height: 48, overflow: "hidden" } : {}) }}
      >
        <div
          className="wrapper"
          style={{ ...(p.isChild ? { background: "#5719dc" } : {}) }}
        >
          <Typography
            component="div"
            onClick={() => {
              handleExpand();
            }}
            style={{ cursor: "pointer" }}
          >
            <ListItem
              id={
                option_name === p.link ||
                (p.children &&
                  p.children.findIndex((q) => q.link === option_name) >= 0)
                  ? "selected-option"
                  : ""
              }
              className={
                option_name === p.link ||
                (p.children &&
                  p.children.findIndex((q) => q.link === option_name) >= 0)
                  ? "selected panel-option"
                  : "panel-option"
              }
              button
              style={{ ...(p.isChild ? { paddingLeft: 71 } : {}) }}
            >
              {!p.isChild && <ListItemIcon>{p.icon}</ListItemIcon>}
              <ListItemText primary={p.title} />
              {p.children && p.children.filter((c) => !c.hidden).length ? (
                <ListItemSecondaryAction>
                  <IconButton id={"not-expanded-" + p.id}>
                    <Icon style={{ color: "#fff" }}>navigate_next</Icon>
                  </IconButton>
                  <IconButton
                    id={"is-expanded-" + p.id}
                    style={{ display: "none" }}
                  >
                    <Icon style={{ color: "#fff" }}>expand_more</Icon>
                  </IconButton>
                </ListItemSecondaryAction>
              ) : null}
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
          {p.children &&
            Object.keys(p.children)
              .filter((s) => !p.children[s].hidden)
              .map((k, id) => panelOption({ ...p.children[k], isChild: true }))}
        </div>
      </div>
    );
  };
  const updateClass = async (status) => {
    setSaving(true);
    let updatedClassSched = {
      id: props.classDetails[class_id].schedules[schedule_id].id,
      date_from: props.classDetails[class_id].schedules[schedule_id].from,
      date_to: props.classDetails[class_id].schedules[schedule_id].to,
      teacher_id: props.userInfo.id,
      status: status,
    };
    await Api.post("/api/schedule/save", {
      body: updatedClassSched,
    });
    let newClassDetails = await UserData.updateClassDetails(class_id);
    newClassDetails[class_id] = {
      ...newClassDetails[class_id],
      next_schedule: {
        ...updatedClassSched,
        nosched:
          !Object.keys(props.classDetails[class_id].next_schedule).length ||
          props.classDetails[class_id].next_schedule.nosched
            ? true
            : false,
      },
    };
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
          if (isMobile) setCollapsePanel(false);
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
        if (isMobile) setCollapsePanel(false);
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
            <Box className={styles.panel} width="100vw">
              {CLASS !== undefined && props.classDetails[class_id] ? (
                <React.Fragment>
                  <Paper className="box-container">
                    <Toolbar className={styles.toolbar}>
                      {isTablet && (
                        <IconButton
                          aria-label="Collapse Panel"
                          onClick={() => {
                            props.history.push("#menu");
                          }}
                          style={{ marginLeft: -15 }}
                        >
                          <Icon>menu</Icon>
                        </IconButton>
                      )}
                      <Typography
                        variant="body1"
                        style={{ fontWeight: "bold" }}
                      >
                        {CLASS.name}
                      </Typography>
                      <Tooltip
                        title="Hide class panel"
                        placement="bottom-start"
                      >
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
                    <Box p={2.2} className={styles.centered}>
                      <Box
                        flex={1}
                        className={[styles.centered, styles.start].join(" ")}
                        width="50%"
                      >
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
                        <Typography
                          variant="body2"
                          style={{ fontSize: "0.75rem", marginLeft: 5 }}
                        >
                          {moment(
                            props.classDetails[class_id].schedules[schedule_id]
                              .from
                          ).format("hh:mm A")}
                          {" - "}
                          {moment(
                            props.classDetails[class_id].schedules[schedule_id]
                              .to
                          ).format("hh:mm A")}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                  <Paper className="box-container">
                    <Box
                      p={2.2}
                      className={[styles.centered, styles.start].join(" ")}
                      style={{ paddingBottom: 0 }}
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
                    <Box
                      p={2}
                      className={styles.centered}
                      style={{ paddingTop: 0 }}
                    >
                      <Box flex={1} style={{ width: "100%", margin: "0 13px" }}>
                        <div className={styles.wrapper}>
                          <Button
                            style={{
                              width: "100%",
                              fontWeight: "bold",
                            }}
                            className={
                              isTeacher &&
                              props.classDetails[class_id].schedules[
                                schedule_id
                              ].status === "ONGOING"
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
                  </Paper>
                  <Paper
                    className="box-container"
                    style={{ minHeight: "100%" }}
                  >
                    <List
                      component="nav"
                      aria-labelledby="nested-list-subheader"
                    >
                      {isTeacher
                        ? rightPanelOptions
                            .filter((s) => !s.hidden)
                            .map((r, id) =>
                              panelOption({ ...r, isChild: false })
                            )
                        : rightPanelOptionsStudents
                            .filter((s) => !s.hidden)
                            .map((r, id) =>
                              panelOption({ ...r, isChild: false })
                            )}
                    </List>
                  </Paper>
                </React.Fragment>
              ) : (
                <Paper className="box-container" style={{ minHeight: "100vh" }}>
                  <Skeleton width="100%" height={170} />
                  <Box m={2}>
                    <Skeleton width="100%" height={20} />
                  </Box>
                  <Box m={2}>
                    <Skeleton circle={true} width={70} height={70} />
                    <Skeleton width={100} height={20} />
                  </Box>
                </Paper>
              )}
            </Box>
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
                isValidOption(option_name)
                  ? isValidOption(option_name).title
                  : ""
              }
              routes={
                isTeacher
                  ? rightPanelOptions.filter(
                      (r) => r.children && r.children.indexOf(option_name) >= 0
                    )
                  : rightPanelOptionsStudents.filter(
                      (r) => r.children && r.children.indexOf(option_name) >= 0
                    )
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
              m={isMobile ? 0 : 4}
              style={{
                marginTop: isMobile ? 0 : 12,
              }}
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
                  flexWrap="nowrap"
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
      <Backdrop
        open={
          (collapsePanel || props.location.hash === "#menu") && isMobile
            ? true
            : false
        }
        style={{ zIndex: 10, backgroundColor: "rgba(0,0,0,0.7)" }}
        onClick={() => {
          props.history.push("#");
          setCollapsePanel(false);
        }}
      />
    </div>
  );
}
const useStyles = makeStyles((theme) => ({
  endClass: {
    background: theme.palette.error.main,
    color: theme.palette.common.white,
  },
  startClass: {
    color: "#000",
    background: theme.palette.secondary.main,
  },
  panel: {
    [theme.breakpoints.down("sm")]: {
      color: "#fff",
      zIndex: 20,
      position: "fixed",
      width: "80vw",
      maxWidth: 330,
      minWidth: 330,
    },
    [theme.breakpoints.down("md")]: {
      marginLeft: -8,
    },
    width: 320,
    position: "relative",
    // background: theme.palette.primary.main,
    // boxShadow: "0 0 5px rgba(0,0,0,0.3)",

    "& .box-container": {
      background: theme.palette.primary.main,
      color: "#fff",
      margin: theme.spacing(1),
      "&:first-of-type": {
        marginTop: 0,
      },
    },
    "& .panel-option-container": {
      transition: "all 0.2s ease-in-out",
    },
    "& .panel-option": {
      opacity: 0.6,
      "& svg": {
        color: "#fff",
      },
      "&.selected": {
        opacity: 1,
        background: "#5e20e4",
        "& svg": {
          color: theme.palette.secondary.main,
        },
      },
    },
  },
  toolbar: {
    position: "sticky",
    top: 0,
    left: 0,
    background: theme.palette.primary.main,
    right: 0,
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
