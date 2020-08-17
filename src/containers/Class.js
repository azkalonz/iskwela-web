import {
  Avatar,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Divider,
  Icon,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  Paper,
  Slide,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import CreateOutlined from "@material-ui/icons/CreateOutlined";
import VideocamOutlinedIcon from "@material-ui/icons/VideocamOutlined";
import moment from "moment";
import React, { useEffect, useState, useCallback } from "react";
import Skeleton from "react-loading-skeleton";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import Api from "../api";
import Drawer from "../components/Drawer";
import NavBar from "../components/NavBar";
import FileViewer from "../components/FileViewer";
import {
  getView,
  isValidOption,
  makeLinkTo,
  leftPanelTeacherMenu as teacherPanel,
  leftPanelNonTeacherMenu as studentPanel,
  reorderOptions,
  leftPanelAdminMenu,
} from "../components/router-dom";
import socket from "../components/socket.io";
import UserData from "../components/UserData";
import VideoConference from "../containers/VideoConference";
import { setTitle } from "../App";
import Scrollbar from "../components/Scrollbar";
import { defaultClassScreen } from "../screens/Home";
import { fetchData } from "../screens/Admin/Dashboard";

const classPanelWidth = 355;

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
const leftPanelTeacherMenu = setPanelIds(teacherPanel);
const leftPanelNonTeacherMenu = setPanelIds(studentPanel);

function ClassRightPanel(props) {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const { option_name, class_id, room_name } = props.match.params;
  const userType = props.userInfo.user_type;
  let [View, setView] = useState();
  const handleRefresh = async () => {
    props.loading(true);
    setView(null);
    await UserData.updateScheduleDetails(class_id, props.classSched);
    setView(getView(option_name.toLowerCase(), userType));
  };
  useEffect(() => {
    if (isValidOption(option_name)) {
      setView(getView(option_name.toLowerCase(), userType));
      if (props.classes[class_id])
        setTitle(
          [props.classes[class_id].name].concat([
            isValidOption(option_name).navTitle
              ? isValidOption(option_name).navTitle
              : isValidOption(option_name).title,
            room_name ? "Video Conference" : undefined,
          ])
        );
    } else props.loading(false);
  }, [option_name]);
  return View ? (
    <Box width="100%" height={props.isConferencing ? "100vh" : "auto"}>
      <View
        {...props}
        maxWidth={1040}
        refresh={handleRefresh}
        onLoad={(load = false) => props.loading(load)}
        test={123}
      />
    </Box>
  ) : null;
}

function Class(props) {
  const query = require("query-string").parse(window.location.search);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [subjectGradingCat, setSubjectGradingCat] = useState([]);
  const [draggable, setDraggable] = useState(false);
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const { room_name, class_id, schedule_id, option_name } = props.match.params;
  const history = useHistory();
  const styles = useStyles();
  const [collapsePanel, setCollapsePanel] = useState(true);
  const [loading, setLoading] = useState(true);
  const [CLASS, setCLASS] = useState();
  const userInfo = props.userInfo;
  const [file, setFile] = useState();
  const [openFileViewer, setOpenFileViewer] = useState();
  const isTeacher = userInfo.user_type === "t" || userInfo.user_type === "a";
  const [saving, setSaving] = useState(false);
  const [savingImg, setSavingImg] = useState(false);
  const [currentID, setCurrentID] = useState(class_id);
  const [rightPanelLoading, setRightPanelLoading] = useState(true);
  useEffect(() => {
    if (isMobile) setCollapsePanel(false);
    else setCollapsePanel(true);
    window.panelSlideTransition = setInterval(() => {
      let s = document.querySelector("#panel-slide");
      if (s) {
        s.style.transition =
          "width 225ms cubic-bezier(0, 0, 0.2, 1) 0ms,transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms";
        window.clearInterval(window.panelSlideTransition);
      }
    }, 500);
  }, [isMobile]);
  useEffect(() => {
    if (class_id) {
      if (!props.classDetails[class_id] || currentID !== class_id) {
        setCLASS(undefined);
        setLoading(true);
        setRightPanelLoading(true);
        setCurrentID(class_id);
        socket.off("get item");
      }
      _getClass();
    }
  }, [class_id, schedule_id, props.classDetails]);
  useEffect(() => {
    if (query.hidepanel) {
      setCollapsePanel(false);
    }
  }, []);
  useEffect(() => {
    if (CLASS) {
      if (CLASS.next_schedule.status !== "ONGOING" && room_name)
        history.push(makeLinkTo(["class", class_id, schedule_id, option_name]));
    }
  }, [CLASS]);
  const _getClass = async () => {
    try {
      let klass = props.classDetails[class_id];
      if (klass) {
        if (klass.subject?.id) {
          fetchData({
            send: async () =>
              await Api.get(
                "/api/schooladmin/subject-grading-categories/" +
                  klass.subject.id
              ),
            after: (data) => {
              setSubjectGradingCat(data);
            },
          });
        }
        setCLASS(klass);
        setTitle(
          [klass.name].concat([
            isValidOption(option_name)
              ? isValidOption(option_name).navTitle
                ? isValidOption(option_name).navTitle
                : isValidOption(option_name).title
              : "",
            room_name ? "Video Conference" : undefined,
          ])
        );
        if (!schedule_id) {
          await UserData.updateClassDetails(class_id, null, (d) => {
            if (!schedule_id)
              history.push(
                makeLinkTo([
                  "class",
                  class_id,
                  d.id,
                  defaultClassScreen[props.userInfo.user_type],
                ])
              );
          });
        }
      } else {
        await UserData.updateClassDetails(class_id, null, (d) => {
          if (!schedule_id)
            history.push(
              makeLinkTo([
                "class",
                class_id,
                d.id,
                defaultClassScreen[props.userInfo.user_type],
              ])
            );
        });
        // setCLASS(undefined);
      }
      setRightPanelLoading(false);
      setLoading(false);
    } catch (e) {
      // HTTP request is cancelled
    }
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
          let parentHeight = parent.clientHeight - 64;
          parent.style.height = parentHeight + h + "px";
        }
        o.style.height = h + "px";
        i.expanded.style.display = "block";
      } else {
        if (p.isChild) {
          let parent = o.parentElement.parentElement;
          let parentHeight = parent.firstElementChild.clientHeight - h + 64;
          parent.style.height = parentHeight + "px";
        }
        o.style.height = "64px";
        i.notexpanded.style.display = "block";
      }
      o.classList.toggle("opened");
    };
    return (
      <div
        key={p.id}
        id={"panel-option-" + p.id}
        className="panel-option-container"
        style={{ ...(p.children ? { height: 64, overflow: "hidden" } : {}) }}
      >
        <div
          className="wrapper"
          style={{ ...(p.isChild ? { background: "rgba(0,0,0,0.2)" } : {}) }}
        >
          <Typography
            component="div"
            onClick={() => {
              handleExpand();
            }}
            className={p.solo ? "warn-to-leave" : ""}
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
              style={{
                ...(p.isChild && !p.shrink ? { paddingLeft: 71 } : {}),
              }}
            >
              {!p.isChild && typeof p.icon === "string" ? (
                <ListItemIcon>
                  <span className={"panel-icon " + p.icon}></span>
                </ListItemIcon>
              ) : (
                p.icon
              )}
              <ListItemText
                primary={!p.shrink ? p.title : p.title[0]}
                primaryTypographyProps={{
                  style: { fontWeight: 500, fontSize: 18 },
                }}
                style={{ textAlign: !p.shrink ? "left" : "center" }}
              />
              {p.children && p.children.filter((c) => !c.hidden).length ? (
                <ListItemSecondaryAction style={{ opacity: !p.shrink ? 1 : 0 }}>
                  <Icon id={"not-expanded-" + p.id}>navigate_next</Icon>
                  <Icon id={"is-expanded-" + p.id} style={{ display: "none" }}>
                    expand_more
                  </Icon>
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
              .filter((k) =>
                p.children[k].hideToUserType
                  ? p.children[k].hideToUserType.indexOf(
                      props.userInfo.user_type
                    ) < 0
                  : true
              )
              .map((k, id) =>
                panelOption({
                  ...p.children[k],
                  isChild: true,
                  ...(p.shrink ? { shrink: p.shrink } : {}),
                })
              )}
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

  const editClassPicture = () => {
    let input = document.querySelector("#edit-class-pic-input");
    if (!input) {
      let x = document.createElement("input");
      x.setAttribute("accept", "image/x-png,image/gif,image/jpeg");
      x.setAttribute("type", "file");
      x.setAttribute("id", "edit-class-pic-input");
      document.querySelector("#root").appendChild(x);
    }
    input = document.querySelector("#edit-class-pic-input");
    let newinput = input.cloneNode(true);
    newinput.addEventListener("change", async () => {
      if (newinput.files.length && class_id !== undefined) {
        setSavingImg(true);
        try {
          let body = new FormData();
          body.append("image", newinput.files[0]);
          await Api.post("/api/upload/class/image/" + class_id, {
            body,
          });
          let newClassDetails = await UserData.updateClassDetails(class_id);
          UserData.updateClass(class_id, newClassDetails[class_id]);
          socket.emit(
            "new class details",
            JSON.stringify({ details: newClassDetails, id: class_id })
          );
        } catch (e) {}
      }
      setSavingImg(false);
    });
    input.parentNode.replaceChild(newinput, input);
    input = document.querySelector("#edit-class-pic-input");
    input.click();
  };

  const RightPanel = (opts = {}) => {
    return (
      <Slide
        id="panel-slide"
        direction="right"
        in={opts.open || collapsePanel}
        style={{
          height: "100vh",
          overflow: "auto",
          width: opts.mini === true ? 75 : classPanelWidth,
        }}
      >
        <Box className={styles.panel} width="100vw">
          <Scrollbar autoHide>
            {CLASS !== undefined && props.classDetails[class_id] ? (
              <React.Fragment>
                {!opts.mini && (
                  <React.Fragment>
                    <Paper
                      className="box-container"
                      style={{
                        background:
                          props.theme === "dark"
                            ? "#111"
                            : props.classes[class_id]?.color ||
                              theme.palette.primary.main,
                      }}
                    >
                      <Toolbar
                        className={[styles.toolbar, "sticky"].join(" ")}
                        style={{
                          background:
                            props.theme === "dark"
                              ? "#111"
                              : props.classes[class_id]?.color ||
                                theme.palette.primary.main,
                        }}
                      >
                        {isTablet && (
                          <IconButton
                            aria-label="Collapse Panel"
                            onClick={() => {
                              props.history.push("#menu");
                            }}
                            style={{ color: "#fff", marginLeft: -15 }}
                          >
                            <Icon>menu</Icon>
                          </IconButton>
                        )}
                        <Typography
                          variant="body1"
                          style={{ fontWeight: 600, fontSize: 18 }}
                        >
                          {CLASS.name}
                        </Typography>
                        <Tooltip
                          title="Hide class panel"
                          placement="bottom-start"
                        >
                          <IconButton
                            style={{
                              position: "absolute",
                              right: 0,
                              color: "#fff",
                            }}
                            aria-label="Collapse Panel"
                            onClick={() => setCollapsePanel(!collapsePanel)}
                          >
                            <span className="icon-menu-close"></span>
                          </IconButton>
                        </Tooltip>
                      </Toolbar>
                      <Box
                        width="100%"
                        height={219}
                        position="relative"
                        overflow="hidden"
                      >
                        {savingImg && (
                          <Box
                            style={{
                              position: "absolute",
                              left: 0,
                              right: 0,
                              top: 0,
                              bottom: 0,
                              background: "rgba(255,255,255,0.5)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <CircularProgress />
                          </Box>
                        )}
                        <Box
                          className="size-cover"
                          style={{
                            background: `url(${
                              props.classes[class_id].bg_image ||
                              props.classes[class_id].image ||
                              "https://www.iskwela.net/img/on-iskwela.svg"
                            })`,
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: props.classes[class_id].bg_image
                              ? "right top"
                              : "center",
                            width: "100%",
                            height: "100%",
                            backgroundSize: "cover",
                          }}
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
                              onClick={editClassPicture}
                            >
                              <CreateOutlined />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                      <Box
                        p={2.2}
                        className={styles.centered}
                        style={{ opacity: 0.8 }}
                      >
                        <Box
                          flex={1}
                          className={[styles.centered, styles.start].join(" ")}
                          width="50%"
                        >
                          <Typography
                            variant="body2"
                            style={{
                              fontSize: 14,
                              marginLeft: 5,
                              fontWeight: 500,
                            }}
                          >
                            {moment(
                              props.classDetails[class_id].schedules[
                                schedule_id
                              ]?.from
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
                            style={{
                              marginLeft: 5,
                              fontSize: 14,
                              fontWeight: 500,
                            }}
                          >
                            {moment(
                              props.classDetails[class_id].schedules[
                                schedule_id
                              ]?.from
                            ).format("hh:mm A")}
                            {" - "}
                            {moment(
                              props.classDetails[class_id].schedules[
                                schedule_id
                              ]?.to
                            ).format("hh:mm A")}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                    <Paper
                      className="box-container"
                      style={{
                        background:
                          props.theme === "dark"
                            ? "#111"
                            : props.classes[class_id]?.color ||
                              theme.palette.primary.main,
                      }}
                    >
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
                            src={CLASS.teacher?.profile_picture}
                            alt={
                              CLASS.teacher?.first_name +
                              " " +
                              CLASS.teacher?.last_name
                            }
                            style={{
                              width: "100%",
                              height: "100%",
                              background: "#fff",
                            }}
                          />
                        </Box>
                        <Box p={1} maxWidth="80%">
                          <Typography
                            variant="body1"
                            style={{ fontWeight: 500, fontSize: 18 }}
                          >
                            {CLASS.teacher?.first_name}{" "}
                            {CLASS.teacher?.last_name}
                          </Typography>
                          <Typography
                            variant="body1"
                            style={{
                              opacity: 0.8,
                              fontSize: 14,
                              fontWeight: 500,
                            }}
                          >
                            {CLASS.subject?.name} Teacher
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        p={4}
                        className={styles.centered}
                        style={{ paddingTop: 0 }}
                        paddingBottom={2}
                      >
                        <Box
                          flex={1}
                          style={{ width: "100%", margin: "0 13px" }}
                        >
                          <div className={styles.wrapper}>
                            <Button
                              style={{
                                width: "100%",
                                fontWeight: "bold",
                              }}
                              className={
                                isTeacher &&
                                props.classDetails[class_id]?.schedules[
                                  schedule_id
                                ]?.status === "ONGOING"
                                  ? room_name
                                    ? styles.endClass
                                    : styles.startClass
                                  : styles.startClass
                              }
                              size="small"
                              variant="contained"
                              disabled={
                                saving ||
                                (props.parentData?.childInfo && !isTeacher)
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
                              <span
                                className={
                                  props.classDetails[class_id]?.schedules[
                                    schedule_id
                                  ]?.status === "ONGOING"
                                    ? "icon-stop-conference"
                                    : "icon-start-conference"
                                }
                                style={{
                                  marginRight: 8,
                                  color: "inherit",
                                  fontSize: "2em",
                                }}
                              ></span>

                              {isTeacher
                                ? props.classDetails[class_id]?.schedules[
                                    schedule_id
                                  ]?.status === "ONGOING"
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
                  </React.Fragment>
                )}

                <Paper
                  className="box-container"
                  style={{
                    height: "100%",
                    overflow: "auto",
                    marginBottom: 0,
                    background:
                      props.theme === "dark"
                        ? "#111"
                        : props.classes[class_id]?.color ||
                          theme.palette.primary.main,
                  }}
                >
                  <Scrollbar autoHide>
                    {opts.mini && !collapsePanel && (
                      <Tooltip
                        title="Hide class panel"
                        placement="bottom-start"
                      >
                        <IconButton
                          style={{
                            width: "100%",
                            color: "#fff",
                          }}
                          aria-label="Collapse Panel"
                          onClick={() => setCollapsePanel(!collapsePanel)}
                        >
                          <span className="icon-menu-open"></span>
                        </IconButton>
                      </Tooltip>
                    )}
                    <List
                      component="nav"
                      aria-labelledby="nested-list-subheader"
                    >
                      {props.userInfo.user_type === "t"
                        ? reorderOptions(
                            props.userInfo.user_type,
                            leftPanelTeacherMenu
                          )
                            .filter((s) => !s.hidden)
                            .filter((s) =>
                              s.hideToUserType
                                ? s.hideToUserType.indexOf(
                                    props.userInfo.user_type
                                  ) < 0
                                : true
                            )
                            .map((r, id) =>
                              panelOption({
                                ...r,
                                isChild: false,
                                ...(opts.mini ? { shrink: true } : {}),
                              })
                            )
                        : props.userInfo?.user_type === "s" ||
                          props.userInfo?.user_type === "p"
                        ? reorderOptions(
                            props.userInfo.user_type,
                            leftPanelNonTeacherMenu
                          )
                            .filter((s) => !s.hidden)
                            .filter((s) =>
                              s.hideToUserType
                                ? s.hideToUserType.indexOf(
                                    props.userInfo.user_type
                                  ) < 0
                                : true
                            )
                            .map((r, id) =>
                              panelOption({
                                ...r,
                                isChild: false,
                                ...(opts.mini ? { shrink: true } : {}),
                              })
                            )
                        : props.userInfo?.user_type === "a"
                        ? reorderOptions(
                            props.userInfo.user_type,
                            leftPanelAdminMenu
                          )
                            .filter((s) => !s.hidden)
                            .filter((s) =>
                              s.hideToUserType
                                ? s.hideToUserType.indexOf(
                                    props.userInfo.user_type
                                  ) < 0
                                : true
                            )
                            .map((r, id) =>
                              panelOption({
                                ...r,
                                isChild: false,
                                ...(opts.mini ? { shrink: true } : {}),
                              })
                            )
                        : null}
                    </List>
                  </Scrollbar>
                </Paper>
              </React.Fragment>
            ) : (
              <Paper
                className="box-container"
                style={{
                  minHeight: "100vh",
                  background:
                    props.theme === "dark"
                      ? "#111"
                      : props.classes[class_id]?.color ||
                        theme.palette.primary.main,
                }}
              >
                {collapsePanel || isMobile ? (
                  <React.Fragment>
                    <Skeleton width="100%" height={170} />
                    <Box m={2}>
                      <Skeleton width="100%" height={20} />
                    </Box>
                    <Box m={2}>
                      <Skeleton circle={true} width={70} height={70} />
                      <Skeleton width={100} height={20} />
                    </Box>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    {[1, 1, 1, 1, 1, 1].map(() => (
                      <Box p={0.7}>
                        <Skeleton width="100%" height={45} />
                      </Box>
                    ))}
                  </React.Fragment>
                )}
              </Paper>
            )}
          </Scrollbar>
        </Box>
      </Slide>
    );
  };
  const isConferencing = () =>
    room_name &&
    !isValidOption(option_name)?.solo &&
    CLASS &&
    schedule_id &&
    props.classDetails[class_id]?.schedules[schedule_id]?.status === "ONGOING";
  return (
    <div>
      <Drawer {...props}>
        <Box
          flexDirection="row"
          alignContent="center"
          display="flex"
          minHeight="100vh"
        >
          {collapsePanel || isMobile
            ? RightPanel()
            : RightPanel({ mini: true, open: true })}
          <Box
            flex={1}
            overflow="hidden auto"
            height="100vh"
            id="right-panel"
            position="relative"
            display="flex"
            flexDirection="column"
            alignItems="stretch"
          >
            <Box
              flex={1}
              display="flex"
              alignItems="center"
              height="100%"
              justifyContent="center"
            >
              <Scrollbar
                autoHide
                onScroll={(e) => {
                  let d = document.querySelector("#react-jitsi-container");
                  if (!d || isMobile) return;
                  if (!d.getAttribute("data-initial-height"))
                    d.setAttribute("data-initial-height", d.clientHeight);
                  if (
                    e.target.scrollTop >=
                    parseFloat(d.getAttribute("data-initial-height"))
                  ) {
                    setDraggable(true);
                  } else {
                    setDraggable(false);
                  }
                }}
              >
                {isConferencing() && (
                  <VideoConference
                    {...props}
                    draggable={!isMobile ? draggable : false}
                    location={props.location}
                    room={{
                      name: CLASS.room_number,
                      displayName:
                        props.userInfo.first_name +
                        " " +
                        props.userInfo.last_name,
                    }}
                    updateClass={(e) => {
                      if (isTeacher) updateClass(e);
                      else if (e === "PENDING")
                        history.push(
                          makeLinkTo([
                            "class",
                            class_id,
                            schedule_id,
                            option_name ||
                              defaultClassScreen[props.userInfo.user_type],
                          ])
                        );
                    }}
                    left={
                      !collapsePanel && !isMobile ? (
                        <Tooltip
                          title="Show class panel"
                          placement="bottom-start"
                        >
                          <IconButton
                            aria-label="Collapse Panel"
                            onClick={() => setCollapsePanel(!collapsePanel)}
                          >
                            <span className="icon-menu-open"></span>
                          </IconButton>
                        </Tooltip>
                      ) : null
                    }
                  />
                )}
                <NavBar
                  title={
                    isValidOption(option_name)
                      ? isValidOption(option_name).navTitle
                        ? isValidOption(option_name).navTitle
                        : isValidOption(option_name).title
                      : ""
                  }
                  routes={
                    isTeacher
                      ? leftPanelTeacherMenu.filter(
                          (r) =>
                            r.children && r.children.indexOf(option_name) >= 0
                        )
                      : leftPanelNonTeacherMenu.filter(
                          (r) =>
                            r.children && r.children.indexOf(option_name) >= 0
                        )
                  }
                  left={
                    !collapsePanel && isMobile ? (
                      <Tooltip
                        title="Show class panel"
                        placement="bottom-start"
                      >
                        <IconButton
                          aria-label="Collapse Panel"
                          onClick={() => setCollapsePanel(!collapsePanel)}
                          color="primary"
                          style={{ marginRight: 13 }}
                        >
                          <span className="icon-menu-open"></span>
                        </IconButton>
                      </Tooltip>
                    ) : null
                  }
                />
                {(!CLASS || rightPanelLoading) && (
                  <Box
                    width="100%"
                    display="flex"
                    alignItems="flex-start"
                    flexDirection="column"
                    p={2}
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: 0,
                      zIndex: 10,
                      position: "relative",
                    }}
                    justifyContent="flex-start"
                    flexWrap="nowrap"
                  >
                    <Box style={{ padding: "6px 0" }} width={200}>
                      <Skeleton width="100%" height={50} />
                    </Box>
                    <Box style={{ padding: "6px 0" }} width="100%">
                      <Skeleton width="100%" height={40} />
                    </Box>
                    <Box style={{ padding: "6px 0" }} width="100%">
                      <Skeleton width="100%" height={40} />
                    </Box>
                    <Box style={{ padding: "6px 0" }} width="100%">
                      <Skeleton width="100%" height={300} />
                    </Box>
                  </Box>
                )}
                {CLASS && class_id && (
                  <ClassRightPanel
                    classSched={schedule_id}
                    isConferencing={isConferencing()}
                    loading={(e) => setRightPanelLoading(e)}
                    fullWidth={query.full_width ? true : false}
                    subjectGradingCategories={subjectGradingCat}
                    {...props}
                    openFile={(f) => {
                      setFile(f);
                      openFileViewer && openFileViewer();
                    }}
                  />
                )}
                {file && (
                  <FileViewer
                    file={file}
                    open={(openRef) => setOpenFileViewer(openRef)}
                    onClose={() => setFile(null)}
                    error={file.error}
                  />
                )}
              </Scrollbar>
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
        style={{ zIndex: 16, backgroundColor: "rgba(0,0,0,0.7)" }}
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
    color: "#fff",
    background: theme.palette.error.main,
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
      maxWidth: classPanelWidth,
      minWidth: classPanelWidth,
    },
    [theme.breakpoints.down("md")]: {
      marginLeft: -8,
    },
    width: 320,
    position: "relative",
    // background: theme.palette.primary.main,
    // boxShadow: "0 0 5px rgba(0,0,0,0.3)",

    "& .box-container": {
      borderRadius: 4,
      color: "#fff",
      margin: theme.spacing(1),
      "&:first-of-type": {
        marginTop: 0,
      },
    },
    "& .panel-option": {
      paddingTop: 15,
      paddingBottom: 15,
      "& .panel-icon": {
        color: "rgba(255,255,255,0.75)",
        fontSize: "1.4rem",
      },
      "&.selected + div span, &.selected svg": {
        color: "#fff!important",
      },
      "&, & + div span, & svg": {
        color: "rgba(255,255,255,0.75)",
      },
      "&.selected": {
        background: "rgba(0,0,0,0.2)",
        "&, & .panel-icon": {
          color: "#fff!important",
        },
      },
    },
    "& .panel-option-container": {
      transition: "all 0.2s ease-in-out",
      "& .wrapper .wrapper .selected": {
        background: "none",
      },
    },
  },
  toolbar: {
    top: 0,
    left: 0,
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
  parentData: states.parentData,
  userInfo: states.userInfo,
  classDetails: states.classDetails,
  pics: states.pics,
  classes: states.classes,
  theme: states.theme,
  dataProgress: states.dataProgress,
}))(Class);
