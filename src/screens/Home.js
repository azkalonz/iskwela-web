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
  InputBase,
  IconButton,
  Snackbar,
  Button,
  Typography,
  Box,
  Paper,
  Avatar,
} from "@material-ui/core";
import QueryBuilderOutlinedIcon from "@material-ui/icons/QueryBuilderOutlined";
import CalendarTodayOutlinedIcon from "@material-ui/icons/CalendarTodayOutlined";
import Skeleton from "react-loading-skeleton";
import moment from "moment";
import VideocamIcon from "@material-ui/icons/Videocam";
import Grow from "@material-ui/core/Grow";
import SearchIcon from "@material-ui/icons/Search";
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
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (props.classes) setLoading(false);
  }, [props.classes]);
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
    let message = "";
    switch (c.next_schedule.status) {
      case "ONGOING":
        message = "Class has started. Join Call?";
        break;
      case "CANCELED":
        message = "Canceled";
        break;
      case "PENDING":
        message = "Starts " + moment(c.next_schedule.from).fromNow();
        break;
    }
    let videoConferenceLink = makeLinkTo([
      "class",
      c.id,
      c.next_schedule.id,
      "activity",
      "video-conference",
    ]);
    return (
      <Grow in={true} key={c.id}>
        <div className={styles.root}>
          <Card style={{ position: "relative", zIndex: 2, borderRadius: 17 }}>
            <CardActionArea
              style={{ position: "relative" }}
              onClick={() =>
                history.push(
                  makeLinkTo(["class", c.id, c.next_schedule.id, "activity"])
                )
              }
            >
              <div style={{ position: "relative", cursor: "pointer" }}>
                <CardMedia
                  className={styles.media}
                  image="/bg.jpg"
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
                      {moment(c.next_schedule.from).format("MMM D, YYYY")}
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
                      {moment(c.next_schedule.from).format("hh:mm") +
                        " - " +
                        moment(c.next_schedule.to).format("hh:mm")}
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
                      <Avatar
                        alt={props.userInfo.first_name}
                        style={{ width: "100%", height: "100%" }}
                        src={props.userInfo.pic_url}
                      />
                      {/* <img
                        src="https://source.unsplash.com/random/500x500"
                        width="100%"
                        height="auto"
                      /> */}
                    </Box>
                  </div>
                  <div style={{ position: "absolute", right: 0, bottom: 6 }}>
                    <Typography variant="body1" style={{ fontWeight: "bold" }}>
                      {c.teacher.first_name} {c.teacher.last_name}
                    </Typography>
                  </div>
                </Box>
              </CardActions>
            </CardActionArea>
          </Card>
          <Paper
            onClick={() =>
              history.push(
                c.next_schedule.status === "ONGOING" ? videoConferenceLink : "/"
              )
            }
            className={[
              styles.classStatus,
              styles[c.next_schedule.status],
            ].join(" ")}
          >
            <Typography variant="body1">{message}</Typography>
            {c.next_schedule.status === "ONGOING" && <VideocamIcon />}
          </Paper>
        </div>
      </Grow>
    );
  };

  return (
    <div style={{ height: "100vh", overflow: "hidden auto" }}>
      <Drawer {...props}>
        <NavBar title="Classes" />
        <Box m={2} display="flex" flexWrap="wrap" justifyContent="center">
          <Box width="100%" p={4} style={{ paddingTop: 7, paddingBottom: 7 }}>
            <Box
              border={1}
              p={0.3}
              borderRadius={7}
              width={230}
              style={{ float: "right" }}
            >
              <InputBase
                placeholder="Search"
                inputProps={{ "aria-label": "search activity" }}
                onChange={(e) => setSearch(e.target.value)}
              />
              <IconButton
                type="submit"
                aria-label="search"
                style={{ padding: 0 }}
              >
                <SearchIcon />
              </IconButton>
            </Box>
          </Box>
          {loading && [1, 1, 1].map((c, i) => fakeLoader(i))}
          {!loading &&
            props.classes &&
            props.classes
              .filter(
                (c) =>
                  JSON.stringify(c)
                    .toLowerCase()
                    .indexOf(search.toLowerCase()) >= 0
              )
              .sort((a, b) => {
                if (!a.next_schedule || !b.next_schedule) return;
                return (
                  new Date(b.next_schedule.from) -
                  new Date(a.next_schedule.from)
                );
              })
              .map((c) => classItem(c))}
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
    margin: 20,
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
    background: theme.palette.grey[700],
  },
  CANCELED: {
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
    width: "90%",
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
