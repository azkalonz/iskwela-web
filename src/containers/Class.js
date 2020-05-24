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
  Divider,
  withWidth,
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
import Activity from "../screens/Teacher/Activity";
import LessonPlan from "../screens/Teacher/LessonPlan";
import Schedule from "../screens/Teacher/Schedule";
import Students from "../screens/Teacher/Students";
import InstructionalMaterials from "../screens/Teacher/InstructionalMaterials";
import PrivateRoute from "../components/PrivateRoute";

const CLASSES = require("../components/classes.json");
const ASYNC_TIME_DURATION = 1000;

function ClassRightPanel(props) {
  let View = null;
  switch (props.match.params.option.toLowerCase()) {
    case "activity":
      View = <Activity />;
      break;
    case "lesson-plan":
      View = <LessonPlan />;
      break;
    case "schedule":
      View = <Schedule />;
      break;
    case "students":
      View = <Students />;
      break;
    case "instructional-materials":
      View = <InstructionalMaterials />;
  }
  return View;
}

function Class(props) {
  const history = useHistory();
  const styles = useStyles();
  const [collapsePanel, setCollapsePanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [CLASS, setCLASS] = useState();
  const [currentOption, setCurrentOption] = useState();
  const userInfo = JSON.parse(window.localStorage["user"]);
  const isTeacher = userInfo.type === "teacher" ? true : false;

  useEffect(() => {
    const path = window.location.pathname.split("/");
    setLoading(true);
    if (CLASS) {
      if (parseInt(props.match.params.id) === parseInt(CLASS.id)) {
        setTimeout(() => {
          setLoading(false);
        }, ASYNC_TIME_DURATION);
        return;
      }
    }
    let opt = rightPanelOptions.find(
      (o) =>
        o.title.toLowerCase() ===
        path[path.length - 1].replace("-", " ").toLowerCase()
    );
    setCurrentOption(opt ? opt.title : "Activity");
    setCLASS(undefined);
    _getClassInfo(props.match.params.id).then((res) => {
      setTimeout(() => {
        if (res !== undefined) setCLASS(res);
        setLoading(false);
      }, ASYNC_TIME_DURATION);
    });
  }, [window.location.pathname]);
  useEffect(() => {
    if (props.width === "sm" || props.width === "xs") setCollapsePanel(false);
    else setCollapsePanel(true);
  }, [props.width]);

  const _getClassInfo = async () => {
    return CLASSES.find(
      (c) => c.name.replace(" ", "-") === props.match.params.name
    );
  };
  const panelOption = (p) => (
    <div key={p.id}>
      <Typography
        onClick={() => {
          setCurrentOption(p.title);
          history.push(
            "/class/" +
              CLASS.id +
              "/" +
              CLASS.name.replace(" ", "-") +
              "/" +
              p.link +
              (window.location.pathname.indexOf("video-conference") >= 0
                ? "/video-conference/roomid"
                : "")
          );
        }}
        style={{ cursor: "pointer" }}
      >
        <ListItem
          style={{
            backgroundColor:
              currentOption === p.title ? "rgba(98, 0, 239,0.1)" : "",
          }}
          button
        >
          <ListItemIcon>
            <VideocamOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary={p.title} />
        </ListItem>
      </Typography>
      <Divider />
    </div>
  );
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
            <Paper alignSelf="stretch" className={styles.panel} width="100vw">
              {CLASS !== undefined ? (
                <div>
                  <Toolbar
                    style={{
                      minHeight: 50,
                      position: "sticky",
                      top: 0,
                      left: 0,
                      right: 0,
                      zIndex: 9,
                    }}
                  >
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
                    height={170}
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
                        {CLASS.schedules[0].date}
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
                      <img src={userInfo.avatar} width="100%" height="auto" />
                    </Box>
                    <Box p={1}>
                      <Typography
                        variant="body1"
                        style={{ fontWeight: "bold" }}
                      >
                        {userInfo.first_name} {userInfo.last_name}
                      </Typography>
                      <Typography variant="body1">
                        #{userInfo.user_id}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider />
                  <Box p={2} className={styles.centered}>
                    <Box flex={1}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => {
                          history.push(
                            "/class/" +
                              props.match.params.id +
                              "/" +
                              props.match.params.name.replace(" ", "-") +
                              (currentOption
                                ? "/" +
                                  currentOption.replace(" ", "-").toLowerCase()
                                : "") +
                              "/video-conference/roomid"
                          );
                        }}
                      >
                        <VideocamOutlinedIcon color="primary" />
                        {userInfo.type === "teacher"
                          ? "Start Class"
                          : "Join Class"}
                      </Button>
                    </Box>
                    <Box flex={1}>
                      <Button
                        size="small"
                        variant="contained"
                        disabled={userInfo.type !== "teacher"}
                      >
                        <ScreenShareOutlinedIcon color="primary" /> Share Screen
                      </Button>
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
          <Box flex={1} overflow="hidden auto" height="100vh">
            <PrivateRoute
              authed={localStorage["user"]}
              path="/class/:id/:name/:option/video-conference/:id"
              component={(p) => (
                <VideoConference
                  {...p}
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
            />
            <NavBar
              title={currentOption}
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
              height="100%"
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
                <div>
                  <Typography variant="h2" fontWeight="bold" component="h2">
                    404
                  </Typography>
                  <Typography variant="h5" component="h2">
                    PAGE NOT FOUND
                  </Typography>
                </div>
              )}
              {!loading && CLASS && (
                <Route
                  path="/class/:id/:name/:option"
                  component={ClassRightPanel}
                />
              )}
            </Box>
          </Box>
        </Box>
      </Drawer>
    </div>
  );
}
const rightPanelOptions = [
  {
    title: "Activity",
    link: "activity",
  },
  {
    title: "Lesson Plan",
    link: "lesson-plan",
  },
  {
    title: "Instructional Materials",
    link: "instructional-materials",
  },
  {
    title: "Schedule",
    link: "schedule",
  },
  {
    title: "Students",
    link: "students",
  },
];
const rightPanelOptionsStudents = [
  {
    title: "Activity",
    link: "activity",
  },
  {
    title: "Lesson Materials",
    link: "lesson-materials",
  },
  {
    title: "Schedule",
    link: "schedule",
  },
];
const useStyles = makeStyles((theme) => ({
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
export default withWidth()(Class);
