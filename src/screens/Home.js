import {
  Avatar,
  Backdrop,
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle as MuiDialogTitle,
  Icon,
  IconButton,
  makeStyles,
  Paper,
  Snackbar,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  withStyles,
} from "@material-ui/core";
import Grow from "@material-ui/core/Grow";
import VideocamIcon from "@material-ui/icons/Videocam";
import MuiAlert from "@material-ui/lab/Alert";
import moment from "moment";
import React, { useEffect, useState } from "react";
import Jitsi from "react-jitsi";
import Skeleton from "react-loading-skeleton";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import Drawer from "../components/Drawer";
import NavBar from "../components/NavBar";
import Pagination, { getPageItems } from "../components/Pagination";
import { makeLinkTo } from "../components/router-dom";
import { SearchInput } from "../components/Selectors";
import Scrollbar from "../components/Scrollbar";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}
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
function Home(props) {
  const styles = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const query = require("query-string").parse(window.location.search);
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const [greeting, setGreeting] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (props.classes) setLoading(false);
  }, [props.classes]);
  const fakeLoader = (i) => (
    <Card key={i} className={styles.root}>
      <CardActionArea style={{ position: "relative" }}>
        <div style={{ position: "relative" }}>
          <div className={styles.media} />
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
        message =
          message.indexOf("ago") >= 0
            ? message.replace("Starts", "Ended")
            : message;
        break;
      default:
        message = "";
    }
    let videoConferenceLink = makeLinkTo([
      "class",
      c.id,
      c.next_schedule.id,
      "posts",
      "video-conference",
    ]);
    return (
      <Grow in={true} key={c.id}>
        <div
          className={styles.root}
          style={{
            flex: 1,
            marginBottom: Object.keys(c.next_schedule).length
              ? !c.next_schedule.nosched && message
                ? 60
                : 0
              : 0,
            minWidth: 300,
          }}
        >
          <Card
            style={{
              position: "relative",
              zIndex: 2,
              borderRadius: 17,
              width: "100%",
            }}
          >
            <CardActionArea
              style={{ position: "relative" }}
              onClick={() =>
                history.push(
                  makeLinkTo(["class", c.id, c.next_schedule.id, "opt"], {
                    opt: c.next_schedule.id ? "posts" : "",
                  })
                )
              }
            >
              <div
                style={{
                  position: "relative",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                <Box
                  className={styles.media}
                  style={{
                    background: `url(${c.bg_image || c.image}) no-repeat`,
                    backgroundColor: c.color,
                    backgroundPosition: "top",
                  }}
                />
                {/* <div className={styles.mediaOverlay} /> */}
              </div>
              <CardContent style={{ position: "absolute", top: 0, left: 0 }}>
                <Typography
                  gutterBottom
                  variant="h5"
                  component="h2"
                  style={{ color: "#fff", fontWeight: "bold" }}
                >
                  {c.name}
                </Typography>
                <Typography
                  gutterBottom
                  variant="body2"
                  component="h3"
                  style={{ color: "#fff" }}
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
                  >
                    <Typography
                      variant="body2"
                      style={{ fontSize: "0.75rem", marginLeft: 5 }}
                    >
                      {moment(c.next_schedule.from).format("hh:mm A") +
                        " - " +
                        moment(c.next_schedule.to).format("hh:mm A")}
                    </Typography>
                  </Box>
                  <Box
                    flex={1}
                    className={[styles.centered, styles.start].join(" ")}
                    style={{ marginBottom: 6 }}
                  >
                    <Typography
                      variant="body2"
                      style={{ fontSize: "0.8rem", marginLeft: 5 }}
                    >
                      {moment(c.next_schedule.from).format("MMM D, YYYY")}
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
                        alt={c.teacher.first_name}
                        style={{
                          width: "100%",
                          height: "100%",
                          background: "#fff",
                        }}
                        src={c.teacher.profile_picture}
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
          {Object.keys(c.next_schedule).length
            ? !c.next_schedule.nosched &&
              message && (
                <Paper
                  onClick={() =>
                    history.push(
                      c.next_schedule.status === "ONGOING"
                        ? videoConferenceLink
                        : "/"
                    )
                  }
                  className={[
                    styles.classStatus,
                    styles[c.next_schedule.status],
                  ].join(" ")}
                  style={{ borderRadius: 13 }}
                >
                  <Typography variant="body1">{message}</Typography>
                  {c.next_schedule.status === "ONGOING" && <VideocamIcon />}
                </Paper>
              )
            : ""}
        </div>
      </Grow>
    );
  };
  useEffect(() => {
    let cardPerPage = () => {
      if (props.location.hash === "#meeting") return;
      let m = document.querySelector("main");
      if (m) {
        m = m.clientWidth;
        let p = (Math.round(m / 300) - 1) * 2;
        setItemsPerPage(p >= 8 ? p : 10);
      }
    };
    cardPerPage();
    window.onresize = () => cardPerPage();
  }, []);
  const getFilteredClass = () => {
    let r = props.classes
      .filter(
        (c) =>
          JSON.stringify(c).toLowerCase().indexOf(search.toLowerCase()) >= 0
      )
      .sort((a, b) => {
        if (!a.next_schedule || !b.next_schedule) return;
        let ans = moment(a.next_schedule.from).diff(
          moment(b.next_schedule.from)
        );
        return ans;
      });
    return r
      .filter((a) =>
        moment(a.next_schedule.from).diff(moment(new Date())) > 0 ? true : false
      )
      .concat(
        r
          .filter((a) =>
            moment(a.next_schedule.from).diff(moment(new Date())) > 0
              ? false
              : true
          )
          .sort((a, b) => {
            if (!a.next_schedule || !b.next_schedule) return;
            let ans = moment(b.next_schedule.from).diff(
              moment(a.next_schedule.from)
            );
            return ans;
          })
      )
      .sort((a, b) => (a.next_schedule.status === "ONGOING" ? -1 : 0))
      .sort((a, b) => a.id - b.id);
  };
  const meeting = {
    open: () => {
      let id = document.querySelector("#room-name");
      if (id.value && id.value.length >= 7) {
        props.history.push(
          makeLinkTo(["id"], {
            id:
              id && id.value
                ? "?id=" + id.value.replace(" ", "-") + "#meeting"
                : "#meeting",
          })
        );
      } else {
        setErrors(["Room ID must be at least 7 characters long."]);
      }
    },
    close: () => props.history.push("/"),
    create: () => {
      let id = document.querySelector("#room-name");
      if (id.value && id.value.length >= 7) {
        history.push(
          makeLinkTo(["id"], {
            id: "?id=" + id.value.replace(" ", "-") + "#meeting",
          })
        );
      } else {
        setErrors(["Room ID must be at least 7 characters long."]);
      }
    },
  };
  function Conference(pp) {
    const { name, id } = pp;
    return (
      <Box
        m={2}
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        height="90%"
      >
        <Box width="100%" height="100%">
          <Jitsi
            domain="jts.iskwela.net"
            jwt={
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJqaXRzaSIsImlzcyI6InNjaG9vbGh1YiIsInN1YiI6Imp0cy5pc2t3ZWxhLm5ldCIsInJvb20iOiIqIn0.3BQBpXgHFM51Al1qjPz-sCFDPEnuKwKb47-h2Dctsqg"
            }
            displayName={name}
            roomName={id}
            containerStyle={{
              margin: "0 auto",
              width: "100%",
              display: "flex",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        </Box>
      </Box>
    );
  }
  return (
    <React.Fragment>
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert onClose={() => setSuccess(false)} severity="success">
          Success
        </Alert>
      </Snackbar>
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
      <Dialog
        fullScreen
        open={props.location.hash === "#meeting"}
        onClose={meeting.close}
      >
        <DialogTitle onClose={meeting.close}>iSkwela Meeting</DialogTitle>
        <DialogContent>
          {query.id ? (
            <Conference
              id={query.id}
              name={props.userInfo.first_name + " " + props.userInfo.last_name}
            />
          ) : (
            <Box m={2}>
              <TextField
                variant="filled"
                fullWidth
                id="room-name"
                fullWidth
                type="text"
                label="Meeting ID"
              />
              <Box display="flex" marginTop={2} alignItems="center">
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  onClick={meeting.open}
                >
                  Join
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={meeting.create}
                >
                  Create
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
      <div style={{ height: "100vh", overflow: "hidden auto" }}>
        <Drawer {...props}>
          <Scrollbar autoHide>
            <NavBar
              title="Classes"
              left={
                isTablet && (
                  <IconButton
                    aria-label="Collapse Panel"
                    onClick={() => {
                      props.history.push("#menu");
                    }}
                    style={{ marginLeft: -15 }}
                  >
                    <Icon>menu</Icon>
                  </IconButton>
                )
              }
            />
            <Box m={2} display="flex" flexWrap="wrap" justifyContent={"center"}>
              <Box
                width="100%"
                display={isMobile ? "block" : "flex"}
                justifyContent="flex-end"
                alignItems="center"
                p={4}
                style={{ paddingTop: 7, paddingBottom: 7 }}
              >
                <Box
                  p={0.3}
                  width={isMobile ? "100%" : 230}
                  style={{ display: "flex" }}
                >
                  <SearchInput
                    onChange={(s) => {
                      setPage(1);
                      setSearch(s);
                    }}
                  />
                </Box>
              </Box>
              {loading && [1, 1, 1].map((c, i) => fakeLoader(i))}
              {!loading &&
                props.classes &&
                getPageItems(getFilteredClass(), page, itemsPerPage).map((c) =>
                  classItem(c)
                )}
            </Box>
            <Box m={2}>
              <Pagination
                match={props.match}
                count={getFilteredClass().length}
                itemsPerPage={itemsPerPage}
                nolink
                emptyTitle={"Nothing Found"}
                emptyMessage={"Try a different keyword."}
                page={page}
                onChange={(p) => setPage(p)}
              />
            </Box>
          </Scrollbar>
        </Drawer>
        <Backdrop
          open={props.location.hash === "#menu" && isMobile ? true : false}
          style={{ zIndex: 16, backgroundColor: "rgba(0,0,0,0.7)" }}
          onClick={() => {
            props.history.push("#");
          }}
        />
      </div>
    </React.Fragment>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    [theme.breakpoints.down("xs")]: {
      maxWidth: "95%",
      width: "100%",
    },
    maxWidth: 345,
    position: "relative",
    margin: 20,
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
    height: 150,
    width: "100%",
    backgroundSize: "cover!important",
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
  classes: Object.keys(states.classes).map((k) => states.classes[k]),
  pics: states.pics,
  userInfo: states.userInfo,
  classDetails: states.classDetails,
}))(Home);
