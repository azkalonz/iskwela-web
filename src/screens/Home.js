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
  Snackbar,
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
import Grow from "@material-ui/core/Grow";
import { makeLinkTo } from "../components/router-dom";
import { connect } from "react-redux";
import MuiAlert from "@material-ui/lab/Alert";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function Home(props) {
  const styles = useStyles();
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const [greeting, setGreeting] = useState(true);
  const [classes, setClasses] = useState();

  useEffect(() => {
    _getClasses();
  }, []);
  const _getClasses = () => {
    if (props.classes) setClasses(props.classes);
    setLoading(false);
  };
  const fakeLoader = (i) => (
    <Card key={i} className={styles.root}>
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
    let cd = props.classDetails[c.id].schedules;
    let status = {
      ongoing: Object.keys(cd).filter((s) => cd[s].status === "ONGOING"),
      pending: Object.keys(cd).filter((s) => cd[s].status === "PENDING"),
      cancelled: Object.keys(cd).filter((s) => cd[s].status === "CANCELLED"),
    };
    status = status.ongoing.length
      ? cd[status.ongoing[0]]
      : status.pending.length
      ? cd[status.pending[0]]
      : status.cancelled.length
      ? cd[status.cancelled[0]]
      : null;
    if (status) {
      let diff = moment(new Date()).diff(moment(status.from));
      switch (status.status) {
        case "ONGOING":
          status.message = "Class has started. Join Call?";
          break;
        case "CANCELLED":
          status.message = "Cancelled";
          break;
        case "PENDING":
          status.message =
            diff < 0
              ? "Starts " + moment(status.from).fromNow()
              : "Ended " + moment(status.from).fromNow();
          break;
      }
    }
    let videoConferenceLink = makeLinkTo(
      ["class", c.id, "sched", "activity", "video-conference"],
      {
        sched: status ? status.id : "",
      }
    );
    return (
      <Grow in={true} key={c.id}>
        <div className={styles.root}>
          <Card style={{ position: "relative", zIndex: 2, borderRadius: 17 }}>
            <CardActionArea
              style={{ position: "relative" }}
              onClick={() =>
                history.push(
                  status.status === "ONGOING"
                    ? videoConferenceLink
                    : makeLinkTo(["class", c.id, "sched", "activity"], {
                        sched: status ? status.id : "",
                      })
                )
              }
            >
              <div style={{ position: "relative", cursor: "pointer" }}>
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
                    {status
                      ? moment(status.from).format("MMM D, YYYY")
                      : moment(c.date_from + " " + c.time_from).format(
                          "MMM D,YYYY"
                        )}
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
                    {status
                      ? moment(status.from).format("hh:mm") +
                        " - " +
                        moment(status.to).format("hh:mm")
                      : moment(c.date_from + " " + c.time_from).format(
                          "hh:mm"
                        ) +
                        " - " +
                        moment(c.date_to + " " + c.time_to).format("hh:mm")}
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
                    {c.teacher.first_name} {c.teacher.last_name}
                  </Typography>
                </div>
              </Box>
            </CardActions>
          </Card>
          {status && (
            <Paper
              onClick={() =>
                history.push(
                  status.status === "ONGOING" ? videoConferenceLink : "/"
                )
              }
              className={[styles.classStatus, styles[status.status]].join(" ")}
            >
              <Typography variant="body1">{status.message}</Typography>
              {status.status === "ONGOING" && <VideocamIcon />}
            </Paper>
          )}
        </div>
      </Grow>
    );
  };

  return (
    <div style={{ height: "100vh", overflow: "hidden auto" }}>
      <Drawer {...props}>
        <NavBar title="Classes" />
        <Box m={2} display="flex" flexWrap="wrap">
          {loading && [1, 1, 1].map((c, i) => fakeLoader(i))}
          {!loading && classes && classes.map((c) => classItem(c))}
        </Box>
        <Snackbar
          open={greeting}
          autoHideDuration={12000}
          onClose={() => setGreeting(false)}
        >
          <Alert severity="info" onClose={() => setGreeting(false)}>
            Welcome back! <b>{props.userInfo.first_name}!</b>
          </Alert>
        </Snackbar>
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
  ONGOING: {
    background: theme.palette.primary.main,
    color: "#fff",
  },
  DONE: {
    background: theme.palette.common.white,
    color: theme.palette.common.black,
  },
  PENDING: {
    color: theme.palette.common.white,
    background: theme.palette.common.black,
  },
  CANCELLED: {
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
    bottom: -40,
    zIndex: 0,
    height: 70,
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

export default connect((states) => ({
  classes: states.classes,
  userInfo: states.userInfo,
  classDetails: states.classDetails,
}))(Home);
