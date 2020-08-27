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
  Menu,
  MenuItem,
} from "@material-ui/core";
import Grow from "@material-ui/core/Grow";
import VideocamIcon from "@material-ui/icons/Videocam";
import MuiAlert from "@material-ui/lab/Alert";
import moment from "moment";
import React, { useEffect, useState, useCallback } from "react";
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
import { motion } from "framer-motion";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import UserData from "../components/UserData";

const cardWidth = 340;
export const defaultClassScreen = {
  p: "scores",
  t: "posts",
  s: "posts",
  a: "posts",
};

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
  const cardRows = 3;
  const styles = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const query = require("query-string").parse(window.location.search);
  const [showClasses, setShowClasses] = useState(
    window.localStorage["show-classes"] || "today"
  );
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(false);

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
  const classItem = (c, index) => {
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
    let videoConferenceLink = `/class/${c.id}/${c.next_schedule.id}/posts/video-conference`;
    return (
      <Box
        key={c.id}
        className={styles.root}
        whileHover={{ scale: 1.1, translateY: -3 }}
        style={{
          flex: 1,
          marginBottom: Object.keys(c.next_schedule).length
            ? (!c.next_schedule.nosched ||
                c.next_schedule.status === "ONGOING") &&
              message
              ? 60
              : 20
            : 20,
          minWidth: cardWidth,
        }}
      >
        <Card
          style={{
            position: "relative",
            zIndex: 2,
            borderRadius: 17,
            width: "100%",
            overflow: "visible",
          }}
          className="shadowed card"
        >
          <CardActionArea
            style={{ position: "relative" }}
            onClick={() =>
              history.push(
                makeLinkTo(["class", c.id, c.next_schedule.id, "opt"], {
                  opt: c.next_schedule.id
                    ? defaultClassScreen[props.userInfo.user_type]
                    : "",
                })
              )
            }
          >
            <div
              style={{
                position: "relative",
                cursor: "pointer",
                width: "100%",
                overflow: "hidden",
                borderRadius: "20px 20px 0 0",
              }}
            >
              <Box
                className={[styles.media, "card-media"].join(" ")}
                style={{
                  background: `url(${c.bg_image || c.image}) no-repeat`,
                  backgroundColor: c.color,
                  backgroundPosition: "center",
                }}
              />
              {/* <div className={styles.mediaOverlay} /> */}
            </div>
            <CardContent
              style={{ position: "absolute", top: 0, left: 0, width: "100%" }}
            >
              <Typography
                gutterBottom
                variant="h5"
                component="h2"
                style={{
                  color: "#fff",
                  fontWeight: 600,
                  letterSpacing: "0.3px",
                }}
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

            <CardActions
              style={{
                background: "grey.300",
                padding: "8px 20px",
                position: "relative",
                zIndex: 1,
                background: theme.palette.type === "dark" ? "#222" : "#fff",
                borderRadius: "0 0 20px 20px",
              }}
            >
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
                    style={{ fontSize: 14, fontWeight: 400 }}
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
                    style={{ fontSize: "14px", fontWeight: 400 }}
                  >
                    {moment(c.next_schedule.from).format("MMM D, YYYY")}
                  </Typography>
                </Box>

                <div style={{ position: "absolute", top: -40, right: 0 }}>
                  <Box
                    borderRadius="50%"
                    width={60}
                    height={60}
                    overflow="hidden"
                    style={{
                      background: `${
                        theme.palette.type === "dark" ? "#444" : "#f4f4f4"
                      } url(${c.teacher.profile_picture}) no-repeat center`,
                      backgroundSize: "cover",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {!c.teacher.profile_picture && (
                      <Typography style={{ fontWeight: 600, fontSize: 18 }}>
                        {c.teacher.first_name.ucfirst()[0] +
                          " " +
                          c.teacher.last_name.ucfirst()[0]}
                      </Typography>
                    )}
                  </Box>
                </div>
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    bottom: 6,
                    maxWidth: "50%",
                  }}
                >
                  <Typography
                    variant="body1"
                    style={{ fontWeight: 600, fontSize: "16px" }}
                  >
                    {c.teacher.first_name} {c.teacher.last_name}
                  </Typography>
                </div>
              </Box>
            </CardActions>
            {Object.keys(c.next_schedule).length
              ? (!c.next_schedule.nosched ||
                  c.next_schedule.status === "ONGOING") &&
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
                    style={{ borderRadius: 13, zIndex: 0 }}
                  >
                    <Typography variant="body1">{message}</Typography>
                    {c.next_schedule.status === "ONGOING" && <VideocamIcon />}
                  </Paper>
                )
              : ""}
          </CardActionArea>
        </Card>
      </Box>
    );
  };
  const handleShowClasses = () => {
    if (showClasses === "today") {
      window.localStorage["show-classes"] = "all";
      setShowClasses("all");
    } else {
      window.localStorage["show-classes"] = "today";
      setShowClasses("today");
    }
  };
  useEffect(() => {
    let cardPerPage = () => {
      if (props.location.hash === "#meeting") return;
      let m = document.querySelector("main");
      if (m) {
        m = m.clientWidth;
        let p = (Math.round(m / cardWidth) - 1) * cardRows;
        setItemsPerPage(p >= 8 ? p : 10);
      }
    };
    cardPerPage();
    window.onresize = () => cardPerPage();
  }, []);
  const getFilteredClass = useCallback(() => {
    let r = props.classes
      .filter((q) => {
        if (showClasses === "today") {
          if (q.next_schedule?.from) {
            return (
              moment(q.next_schedule.from).format("MMM DD, YYYY") ===
              moment().format("MMM DD, YYYY")
            );
          } else {
            return false;
          }
        } else {
          return true;
        }
      })
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
    r = r
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
      .sort((a, b) => a.id - b.id)
      .sort((a, b) => (a.next_schedule.status === "ONGOING" ? -1 : 0));
    return r;
  }, [showClasses, props.classes, search]);
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
            <Box
              m={2}
              display="flex"
              flexWrap="wrap"
              justifyContent={isTablet || isMobile ? "center" : "flex-start"}
              style={
                !isMobile && !isTablet
                  ? {
                      width: "1140px",
                      margin: "16px auto",
                    }
                  : {}
              }
            >
              <Box
                width="100%"
                display={"flex"}
                justifyContent={props.childInfo ? "space-between" : "flex-end"}
                alignItems="center"
                style={{ paddingTop: 7, paddingBottom: 7 }}
              >
                {props.childInfo && !isMobile && (
                  <PopupState variant="popover" popupId="viewing-as">
                    {(popupState) => (
                      <React.Fragment>
                        <Box
                          onClick={() => {
                            popupState.open();
                          }}
                          display={"flex"}
                          justifyContent="flex-end"
                          alignItems="center"
                          style={{ cursor: "pointer" }}
                          {...bindTrigger(popupState)}
                        >
                          <Avatar
                            src={props.childInfo.preferences?.profile_picture}
                            alt={props.childInfo.first_name}
                          />
                          <Box marginLeft={2}>
                            <Typography style={{ fontSize: 12 }}>
                              Viewing as huehue
                            </Typography>
                            <Typography
                              style={{
                                fontWeight: 16,
                                fontWeight: 500,
                              }}
                            >
                              {props.childInfo.first_name +
                                " " +
                                props.childInfo.last_name}
                            </Typography>
                          </Box>
                          <IconButton
                            color="primary"
                            {...bindTrigger(popupState)}
                          >
                            <Icon>expand_more</Icon>
                          </IconButton>
                        </Box>
                        <Menu
                          {...bindMenu(popupState)}
                          style={{
                            maxWidth: 300,
                          }}
                        >
                          {props.parentData?.children?.map((child, index) => {
                            return (
                              <MenuItem
                                key={index}
                                selected={
                                  props.childInfo?.id === child.childInfo.id
                                }
                                onClick={async () => {
                                  popupState.close();
                                  if (
                                    props.childInfo?.id === child.childInfo.id
                                  ) {
                                    return;
                                  }
                                  setLoading(true);
                                  window.localStorage["chatID"] =
                                    child.childInfo.id;
                                  props.history.push(
                                    window.location.search.replaceUrlParam(
                                      "userId",
                                      child.childInfo.id
                                    )
                                  );
                                  await UserData.getUserData(props.userInfo);
                                  setLoading(false);
                                }}
                              >
                                <Avatar
                                  src={
                                    child.childInfo?.preferences
                                      ?.profile_picture
                                  }
                                  alt={child.childInfo.first_name}
                                />
                                <Typography style={{ marginLeft: 13 }}>
                                  {child.childInfo.first_name +
                                    " " +
                                    child.childInfo.last_name}
                                </Typography>
                              </MenuItem>
                            );
                          })}
                        </Menu>
                      </React.Fragment>
                    )}
                  </PopupState>
                )}
                <Box
                  display={"flex"}
                  justifyContent="flex-end"
                  alignItems="center"
                  width="100%"
                >
                  <Button
                    variant="outlined"
                    onClick={handleShowClasses}
                    style={{ width: "auto" }}
                    color="primary"
                  >
                    {showClasses === "today" ? "Show all" : "Today only"}
                  </Button>
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
              </Box>
              {loading &&
                (getFilteredClass().length
                  ? getPageItems(getFilteredClass(), page, itemsPerPage)
                  : [1, 1, 1, 1, 1, 1]
                ).map((c, i) => fakeLoader(i))}
              {!loading &&
                props.classes &&
                getPageItems(
                  getFilteredClass(),
                  page,
                  itemsPerPage
                ).map((c, index) => classItem(c, index))}
              {!loading && (
                <Box m={2} width="100%">
                  <Pagination
                    match={props.match}
                    count={getFilteredClass().length}
                    itemsPerPage={itemsPerPage}
                    nolink
                    icon={
                      <img
                        src="/hero-img/search.svg"
                        width={180}
                        style={{ padding: "50px 0" }}
                      />
                    }
                    emptyTitle={search ? "Nothing Found" : "No Classes"}
                    emptyMessage={
                      search ? (
                        "Try a different keyword."
                      ) : (
                        <Box textAlign="center">
                          <Typography>
                            No class is scheduled for today
                          </Typography>
                          <Button onClick={handleShowClasses}>
                            Show all classes
                          </Button>
                        </Box>
                      )
                    }
                    page={page}
                    onChange={(p) => setPage(p)}
                  />
                </Box>
              )}
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
    minWidth: cardWidth,
    maxWidth: cardWidth,
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
    backgroundSize: "100%!important",
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
  parentData: states.parentData,
  childInfo: states.parentData?.childInfo,
  classDetails: states.classDetails,
}))(Home);
