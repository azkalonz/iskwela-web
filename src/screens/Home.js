import React, { useState, useEffect } from "react";
import Drawer from "../components/Drawer";
import NavBar from "../components/NavBar";
import { Link, useHistory } from "react-router-dom";
import {
  makeStyles,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Button,
  Typography,
  Box,
  Paper,
} from "@material-ui/core";
import QueryBuilderOutlinedIcon from "@material-ui/icons/QueryBuilderOutlined";
import CalendarTodayOutlinedIcon from "@material-ui/icons/CalendarTodayOutlined";
import Skeleton from "react-loading-skeleton";
import moment from "moment";
import VideocamIcon from "@material-ui/icons/Videocam";

const classes = require("../components/classes.json");

function Home(props) {
  const styles = useStyles();
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState();
  const history = useHistory();
  useEffect(() => {
    if (localStorage["user"]) setUserInfo(JSON.parse(localStorage["user"]));
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);
  const fakeLoader = () => (
    <Card className={styles.root}>
      <CardActionArea style={{ position: "relative" }}>
        <div style={{ position: "relative" }}>
          <CardMedia className={styles.media} />
          <div className={styles.mediaOverlay} />
        </div>
        <CardContent style={{ position: "absolute", top: 0, left: 0 }}>
          <Typography gutterBottom variant="h5" component="h2" color="primary">
            <Skeleton width={270} height={40} />
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions style={{ background: "grey.300" }}>
        <Box
          p={1}
          className={styles.start}
          width="100%"
          flexDirection="column"
          position="relative"
        >
          <Skeleton width={"50%"} height={54} />
          <div style={{ position: "absolute", top: -40, right: 0 }}>
            <Skeleton width={60} height={60} circle={true} />
          </div>
          <div style={{ position: "absolute", right: 0, bottom: 6 }}>
            <Skeleton width={100} height={20} />
          </div>
        </Box>
      </CardActions>
    </Card>
  );
  const classItem = (c) => {
    let videoConferenceLink =
      "/class/" +
      c.id +
      "/" +
      c.name.replace(" ", "-") +
      "/activity/video-conference/roomid";
    let upcomingSched = c.schedules[0];
    c.schedules.forEach((s) => {
      let a = moment(s.date + " " + c.time_from).diff(new Date());
      let b = moment(upcomingSched.date + " " + c.time_from).diff(new Date());
      if (a > b) {
        upcomingSched = s;
      }
    });
    let message = "started";
    let diff = moment(upcomingSched.date).diff(new Date());

    if (upcomingSched.status) {
      if (diff > 0) message = "starts";
      else if (!upcomingSched.is_active) message = "ended";
    } else {
      message = "cancelled";
    }
    let status = {
      time: moment(upcomingSched.date + " " + c.time_from).fromNow(),
      diff: diff,
      message,
    };

    return (
      <div className={styles.root} key={c.id}>
        <Card style={{ position: "relative", zIndex: 2, borderRadius: 17 }}>
          <CardActionArea style={{ position: "relative" }}>
            <div
              style={{ position: "relative", cursor: "pointer" }}
              onClick={() =>
                history.push(
                  "/class/" +
                    c.id +
                    "/" +
                    c.name.replace(" ", "-") +
                    "/activity"
                )
              }
            >
              <CardMedia
                className={styles.media}
                image="https://source.unsplash.com/random/600x500"
                title={c.name}
              />
              <div className={styles.mediaOverlay} />
            </div>
            <CardContent style={{ position: "absolute", top: 0, left: 0 }}>
              <Typography
                gutterBottom
                variant="h5"
                component="h2"
                color="primary"
              >
                {c.name}
              </Typography>
              <Typography
                gutterBottom
                variant="body2"
                component="h3"
                style={{ color: "#222" }}
              >
                {c.description}
              </Typography>
            </CardContent>
          </CardActionArea>
          <CardActions style={{ background: "grey.300" }}>
            <Box
              p={1}
              className={styles.start}
              width="100%"
              flexDirection="column"
              position="relative"
            >
              <Box
                flex={1}
                className={[styles.centered, styles.start].join(" ")}
                style={{ marginBottom: 6 }}
              >
                <CalendarTodayOutlinedIcon />
                <Typography
                  variant="body2"
                  style={{ fontSize: "0.8rem", marginLeft: 5 }}
                >
                  {c.schedules[0].date}
                </Typography>
              </Box>
              <Box
                flex={1}
                className={[styles.centered, styles.start].join(" ")}
              >
                <QueryBuilderOutlinedIcon />
                <Typography
                  variant="body2"
                  style={{ fontSize: "0.75rem", marginLeft: 5 }}
                >
                  {c.time_from} - {c.time_to}
                </Typography>
              </Box>
              <div style={{ position: "absolute", top: -40, right: 0 }}>
                <Box
                  borderRadius="50%"
                  width={60}
                  height={60}
                  bgcolor="grey.500"
                  overflow="hidden"
                >
                  <img
                    src="https://source.unsplash.com/random/500x500"
                    width="100%"
                    height="auto"
                  />
                </Box>
              </div>
              <div style={{ position: "absolute", right: 0, bottom: 6 }}>
                <Typography variant="body1" style={{ fontWeight: "bold" }}>
                  {c.teacher.name}
                </Typography>
              </div>
            </Box>
          </CardActions>
        </Card>
        {userInfo && userInfo.type === "student" && (
          <Paper
            onClick={() =>
              history.push(
                status.message === "started" ? videoConferenceLink : "/"
              )
            }
            className={[styles.classStatus, styles[status.message]].join(" ")}
          >
            <Typography variant="body1">
              {status.message === "ended"
                ? "Ended " + status.time
                : status.message === "starts"
                ? "Starts " + status.time
                : status.message === "cancelled"
                ? "Class was cancelled"
                : "Class has started join call?"}
            </Typography>
            {status.message === "started" && <VideocamIcon />}
          </Paper>
        )}
      </div>
    );
  };

  return (
    <div style={{ height: "100vh", overflow: "hidden auto" }}>
      <Drawer {...props}>
        <NavBar title="Classes" />
        <Box m={2} display="flex" flexWrap="wrap">
          {loading
            ? [1, 1, 1].map((c) => fakeLoader())
            : classes.map((c) => classItem(c))}
        </Box>
      </Drawer>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    [theme.breakpoints.down("xs")]: {
      maxWidth: "95%",
    },
    maxWidth: 345,
    position: "relative",
    margin: 7,
    marginBottom: 60,
    borderRadius: 20,
  },
  started: {
    background: theme.palette.primary.main,
    color: "#fff",
  },
  ended: {
    background: theme.palette.common.white,
    color: theme.palette.common.black,
  },
  starts: {
    color: theme.palette.common.white,
    background: theme.palette.common.black,
  },
  cancelled: {
    color: theme.palette.common.white,
    background: theme.palette.error.main,
  },
  media: {
    height: 120,
    width: 300,
  },
  mediaOverlay: {
    background: theme.palette.common.white,
    opacity: 0.7,
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
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
  classStatus: {
    position: "absolute",
    cursor: "pointer",
    left: 0,
    bottom: -45,
    zIndex: 0,
    height: 30,
    width: "80%",
    textDecoration: "none",
    padding: 7,
    paddingLeft: 13,
    paddingTop: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 13,
  },
}));

export default Home;
