import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Divider,
  Drawer as MuiDrawer,
  Box,
  Typography,
  Grow,
  Tooltip,
  Toolbar,
  makeStyles,
  IconButton,
  Avatar,
  Icon,
  useTheme,
  useMediaQuery,
  Slide,
  Button,
  Paper,
} from "@material-ui/core";
import DashboardOutlined from "@material-ui/icons/DashboardOutlined";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import { makeLinkTo } from "./router-dom";
import ExpandLessOutlinedIcon from "@material-ui/icons/ExpandLessOutlined";
import ExpandMoreOutlinedIcon from "@material-ui/icons/ExpandMoreOutlined";
import Scrollbar from "./Scrollbar";

function Drawer(props) {
  const styles = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const history = useHistory();
  const { class_id, room_name, screen_name } = props.match.params;
  const [more, setMore] = useState(false);
  const classes = props.classes.sort((a, b) =>
    a.next_schedule.status === "ONGOING" ? -1 : 0
  );
  useEffect(() => {
    focusCurrentTab();
    if (!room_name)
      document
        .querySelectorAll(".safe-to-url")
        .forEach((i) => (i.style.display = "none"));
  }, [isTablet, props.location]);
  useEffect(() => {
    if (room_name) history.push(more ? "#more" : "#less");
  }, [more]);
  const focusCurrentTab = () => {
    let t = document.querySelector(".selected.tab");
    if (!t) {
      if (props.location.pathname.indexOf("class") >= 0) {
        setMore(true);
        setTimeout(() => focusCurrentTab(), 0);
      }
    } else {
      let cont = document.querySelector("#tabs-container");
      if (cont && !isTablet) {
        cont.parentElement.parentElement.parentElement.scrollTop =
          t.offsetTop - t.clientHeight * 2;
      } else t.parentElement.scrollTop = t.offsetTop - t.clientHeight * 2;
    }
  };
  const drawer = (
    <React.Fragment>
      <Box>
        <Box
          p={1}
          id="logo-drawer"
          className="sticky"
          style={{
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1,
            background: props.theme === "dark" ? "#1d1d1d" : "#ffffff",
          }}
        >
          <Typography
            variant="h6"
            align="center"
            style={{ width: "100%", cursor: "pointer" }}
          >
            <Box
              className="logo-btn"
              onClick={() => {
                history.push("/");
              }}
              style={{
                width: "100%",
                height: 50,
                transform: "scale(0.7)",
                ...(props.theme === "dark"
                  ? {
                      background: "url(/logo/logo192.png) no-repeat",
                      backgroundSize: "cover",
                    }
                  : {
                      background: "url(/logo/logo-full-colored.svg) no-repeat",
                      backgroundSize: 200,
                    }),
              }}
            />
          </Typography>
        </Box>
        <div style={{ textAlign: "center" }} id="tabs-container">
          <Box
            className={
              window.location.pathname === "/" ? "selected tab bordered" : "tab"
            }
          >
            <Box
              onClick={() => {
                history.push("/");
              }}
              className="tab-btn screen-btn"
              style={{
                alignItems: "center",
                cursor: "pointer",
                justifyContent: "center",
                display: "flex",
                transform: "translateX(-1.5px)",
              }}
            >
              <span
                className="icon-classes"
                style={{
                  color:
                    props.theme === "dark"
                      ? isTablet
                        ? "#282828"
                        : "#f1f1f1"
                      : "#38108d",
                  fontSize: "2em",
                }}
              />
            </Box>
          </Box>
          {classes.slice(0, 5).map((item, index) => {
            return (
              <Box
                key={index}
                className={
                  class_id && parseInt(class_id) === parseInt(item.id)
                    ? "selected tab"
                    : "tab"
                }
                style={{ cursor: "pointer" }}
              >
                <Tooltip title={item.name} placement="right">
                  <Box
                    {...item.props}
                    className="tab-btn"
                    style={{
                      backgroundColor: item.color,
                    }}
                    onClick={() => {
                      history.push(
                        makeLinkTo(
                          ["class", item.id, item.next_schedule.id, "opt"],
                          {
                            opt: item.next_schedule.id ? "posts" : "",
                          }
                        )
                      );
                    }}
                  >
                    <Typography variant="body1" component="h2">
                      <span style={{ fontWeight: "bold" }}>
                        {item.name[0].toUpperCase()}
                      </span>
                      <span style={{ fontSize: "0.8em" }}>
                        {item.name.substr(
                          item.name.search(/\d/),
                          item.name.length
                        )}
                      </span>
                    </Typography>
                  </Box>
                </Tooltip>
              </Box>
            );
          })}
          {more &&
            classes.slice(5, props.classes.length).map((item, index) => {
              return (
                <Grow in={more} key={index}>
                  <Box
                    className={
                      class_id && parseInt(class_id) === parseInt(item.id)
                        ? "selected tab"
                        : "tab"
                    }
                    key={index}
                    style={{ cursor: "pointer" }}
                  >
                    <Tooltip title={item.name} placement="right">
                      <Box
                        {...item.props}
                        className="tab-btn"
                        style={{
                          backgroundColor: item.color,
                        }}
                        onClick={() => {
                          history.push(
                            makeLinkTo(
                              ["class", item.id, item.next_schedule.id, "opt"],
                              {
                                opt: item.next_schedule.id ? "posts" : "",
                              }
                            )
                          );
                        }}
                      >
                        <Typography variant="body1" component="h2">
                          <span style={{ fontWeight: "bold" }}>
                            {item.name[0].toUpperCase()}
                          </span>
                          <span style={{ fontSize: "0.8em" }}>
                            {item.name.substr(
                              item.name.search(/\d/),
                              item.name.length
                            )}
                          </span>
                        </Typography>
                      </Box>
                    </Tooltip>
                  </Box>
                </Grow>
              );
            })}
          {classes && classes.length >= 6 && (
            <React.Fragment>
              {!more ? (
                <IconButton
                  onClick={() => setMore(true)}
                  className="sticky"
                  style={{
                    background: props.theme === "dark" ? "#282828" : "#ffffff",
                    bottom: 0,
                    zIndex: 1,
                  }}
                >
                  <ExpandMoreOutlinedIcon />
                </IconButton>
              ) : (
                <IconButton
                  onClick={() => setMore(false)}
                  className="sticky"
                  style={{
                    background: props.theme === "dark" ? "#282828" : "#ffffff",
                    bottom: 0,
                    zIndex: 1,
                  }}
                >
                  <ExpandLessOutlinedIcon />
                </IconButton>
              )}
            </React.Fragment>
          )}
          <Box m={2}>
            <Divider
              style={{ opacity: 0.14, backgroundColor: "rgb(55, 19, 138)" }}
            />
          </Box>
          <Box className={screen_name ? "selected tab bordered" : "tab"}>
            <Box
              onClick={() => {
                history.push("/explore/jumpstart");
              }}
              className="tab-btn screen-btn"
              style={{
                alignItems: "center",
                cursor: "pointer",
                justifyContent: "center",
                display: "flex",
                transform: "translateX(-1.5px)",
              }}
            >
              <span
                className="icon-explore"
                style={{
                  color:
                    props.theme === "dark"
                      ? isTablet
                        ? "#282828"
                        : "#f1f1f1"
                      : "#38108d",
                  fontSize: "2em",
                }}
              />
            </Box>
          </Box>
        </div>
      </Box>
      <Box textAlign="center">
        <Tooltip title="Help" placement="right">
          <IconButton
            onClick={() =>
              window.open(
                "https://files.iskwela.net/public/iSkwela_UserManual_Beta1.0.pdf",
                "_blank"
              )
            }
          >
            <Icon
              fontSize="inherit"
              style={{
                color:
                  props.theme === "dark"
                    ? isTablet
                      ? "#282828"
                      : "#f1f1f1"
                    : "#38108d",
              }}
            >
              help_outline
            </Icon>
          </IconButton>
        </Tooltip>
      </Box>
    </React.Fragment>
  );

  return (
    <div className={styles.root}>
      {!isTablet ? (
        <nav className={styles.drawer}>
          <Box
            id="drawer-container"
            style={{
              height: "100%",
              zIndex: 1200,
              position: "relative",
            }}
            variant="permanent"
          >
            <Paper style={{ height: "100%", width: "100%" }}>
              <Scrollbar
                autoHide
                onScroll={() => {
                  let $ = (a) => document.querySelector(a);
                  if ($("#drawer-container > div").scrollTop > 0)
                    $("#logo-drawer").style.borderBottom =
                      "1px solid rgba(0,0,0,0.17)";
                  else $("#logo-drawer").style.borderBottom = "none";
                }}
              >
                <Box
                  height="100%"
                  display="flex"
                  justifyContent="space-between"
                  flexDirection="column"
                >
                  {drawer}
                </Box>
              </Scrollbar>
            </Paper>
          </Box>
        </nav>
      ) : (
        <Slide
          direction="right"
          in={props.location.hash === "#menu"}
          mountOnEnter
          unmountOnExit
          style={{
            boxshadow:
              props.theme === "dark"
                ? "none"
                : "4px 0 10px rgba(143, 45, 253, 0.16)",
            height: "100vh",
            zIndex: 30,
            overflow: "auto",
            background: props.theme === "dark" ? "#282828" : "#ffffff",
            position: "fixed",
          }}
          id="mobile-drawer"
        >
          <Box
            width={345}
            minWidth={345}
            maxWidth={345}
            height="100%"
            onScroll={() => {
              let t = document.querySelector("#mobile-drawer-toolbar");
              if (document.querySelector("#mobile-drawer").scrollTop > 0) {
                t.style.borderColor = "rgba(0,0,0,0.12)";
                t.style.boxShadow = "rgba(167, 79, 248, 0.15) 0px 8px 23px";
              } else {
                t.style.borderColor = "transparent";
                t.style.boxShadow = "none";
              }
            }}
          >
            <Toolbar
              id="mobile-drawer-toolbar"
              className="sticky"
              style={{
                display: "flex",
                alignItems: "center",
                top: 0,
                borderColor: "transparent",
                left: 0,
                right: 0,
                background: props.theme === "dark" ? "#282828" : "#ffffff",
                zIndex: 1,
                justifyContent: "space-between",
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                <img
                  src="/logo/logo-full-colored.svg"
                  width={120}
                  alt="iSkwela"
                />
              </Box>
              <IconButton onClick={() => props.history.push("#")}>
                <Icon color="primary">close</Icon>
              </IconButton>
            </Toolbar>
            <Box
              className={
                window.location.pathname === "/"
                  ? "selected tab bordered"
                  : "tab"
              }
              onClick={() => {
                history.push("/");
              }}
            >
              <Box className="tab-btn screen-btn">
                <span
                  className="icon-classes"
                  style={{
                    color:
                      props.theme === "dark"
                        ? isTablet
                          ? "#282828"
                          : "#f1f1f1"
                        : "#38108d",
                    fontSize: "2em",
                  }}
                />
              </Box>
              <Typography
                style={{
                  color: props.theme === "dark" ? "#f1f1f1" : "#38108d",
                  fontWeight: "bold",
                }}
              >
                Classes
              </Typography>
            </Box>
            {classes.slice(0, 5).map((item, index) => {
              return (
                <Box
                  key={index}
                  className={
                    class_id && parseInt(class_id) === parseInt(item.id)
                      ? "selected tab"
                      : "tab"
                  }
                  style={{ cursor: "pointer" }}
                >
                  <Tooltip title={item.name} placement="right">
                    <Box
                      {...item.props}
                      className="tab-btn"
                      style={{
                        backgroundColor: item.color,
                      }}
                      onClick={() => {
                        history.push(
                          makeLinkTo(
                            ["class", item.id, item.next_schedule.id, "opt"],
                            {
                              opt: item.next_schedule.id ? "posts" : "",
                            }
                          )
                        );
                      }}
                    >
                      <Typography variant="body1" component="h2">
                        <span style={{ fontWeight: "bold" }}>
                          {item.name[0].toUpperCase()}
                        </span>
                        <span style={{ fontSize: "0.8em" }}>
                          {item.name.substr(
                            item.name.search(/\d/),
                            item.name.length
                          )}
                        </span>
                      </Typography>
                    </Box>
                  </Tooltip>
                  <Typography
                    style={{
                      color: props.theme === "dark" ? "#f1f1f1" : "#38108d",
                      fontWeight: "bold",
                    }}
                    onClick={() => {
                      history.push(
                        makeLinkTo(
                          ["class", item.id, item.next_schedule.id, "opt"],
                          {
                            opt: item.next_schedule.id ? "posts" : "",
                          }
                        )
                      );
                    }}
                  >
                    {item.name}
                  </Typography>
                  <Typography color="textSecondary">
                    {item.description}
                  </Typography>
                </Box>
              );
            })}
            {more &&
              classes.slice(5, props.classes.length).map((item, index) => {
                return (
                  <Grow in={more} key={index}>
                    <Box
                      className={
                        class_id && parseInt(class_id) === parseInt(item.id)
                          ? "selected tab"
                          : "tab"
                      }
                      key={index}
                      style={{ cursor: "pointer" }}
                    >
                      <Tooltip title={item.name} placement="right">
                        <Box
                          {...item.props}
                          className="tab-btn"
                          style={{
                            backgroundColor: item.color,
                          }}
                          onClick={() => {
                            history.push(
                              makeLinkTo(
                                [
                                  "class",
                                  item.id,
                                  item.next_schedule.id,
                                  "opt",
                                ],
                                {
                                  opt: item.next_schedule.id ? "posts" : "",
                                }
                              )
                            );
                          }}
                        >
                          <Typography variant="body1" component="h2">
                            <span style={{ fontWeight: "bold" }}>
                              {item.name[0].toUpperCase()}
                            </span>
                            <span style={{ fontSize: "0.8em" }}>
                              {item.name.substr(
                                item.name.search(/\d/),
                                item.name.length
                              )}
                            </span>
                          </Typography>
                        </Box>
                      </Tooltip>
                      <Typography
                        style={{
                          color: props.theme === "dark" ? "#f1f1f1" : "#38108d",
                          fontWeight: "bold",
                        }}
                        onClick={() => {
                          history.push(
                            makeLinkTo(
                              ["class", item.id, item.next_schedule.id, "opt"],
                              {
                                opt: item.next_schedule.id ? "posts" : "",
                              }
                            )
                          );
                        }}
                      >
                        {item.name}
                      </Typography>
                      <Typography color="textSecondary">
                        {item.description}
                      </Typography>
                    </Box>
                  </Grow>
                );
              })}
            {classes && classes.length >= 6 && (
              <React.Fragment>
                {!more ? (
                  <Button
                    onClick={() => setMore(true)}
                    style={{ width: "100%" }}
                  >
                    Show more
                    <ExpandMoreOutlinedIcon />
                  </Button>
                ) : (
                  <Button
                    onClick={() => setMore(false)}
                    style={{ width: "100%" }}
                  >
                    Show less
                    <ExpandLessOutlinedIcon />
                  </Button>
                )}
              </React.Fragment>
            )}
            <Divider
              style={{ opacity: 0.14, backgroundColor: "rgb(55, 19, 138)" }}
            />
            <Box className={screen_name ? "selected tab bordered" : "tab"}>
              <Box
                onClick={() => {
                  history.push("/explore/jumpstart");
                }}
                className="tab-btn screen-btn"
                style={{
                  alignItems: "center",
                  cursor: "pointer",
                  justifyContent: "center",
                  display: "flex",
                  transform: "translateX(-1.5px)",
                }}
              >
                <span
                  className="icon-explore"
                  style={{
                    color:
                      props.theme === "dark"
                        ? isTablet
                          ? "#282828"
                          : "#f1f1f1"
                        : "#38108d",
                    fontSize: "2em",
                  }}
                />
              </Box>
              <Typography
                style={{
                  color: props.theme === "dark" ? "#f1f1f1" : "#38108d",
                  fontWeight: "bold",
                }}
                onClick={() => {
                  history.push("/explore/jumpstart");
                }}
              >
                Explore
              </Typography>
            </Box>
            <Box
              className={"tab"}
              onClick={() => {
                window.open(
                  "https://files.iskwela.net/public/iSkwela_UserManual_Beta1.0.pdf",
                  "_blank"
                );
              }}
            >
              <Box className="tab-btn screen-btn">
                <Icon
                  fontSize="large"
                  style={{
                    color:
                      props.theme === "dark"
                        ? isTablet
                          ? "#282828"
                          : "#f1f1f1"
                        : "#38108d",
                  }}
                >
                  help_outline
                </Icon>
              </Box>
              <Typography
                style={{
                  color: props.theme === "dark" ? "#f1f1f1" : "#38108d",
                  fontWeight: "bold",
                }}
              >
                Help
              </Typography>
            </Box>
          </Box>
        </Slide>
      )}
      <main
        className={styles.content}
        style={{ padding: 0, minHeight: "100vh" }}
      >
        {props.children}
      </main>
    </div>
  );
}

const drawerWidth = 66;
const useStyles = makeStyles((theme) => ({
  toolbar: {
    minHeight: 50,
    paddingLeft: 0,
    paddingRight: 0,
    background: theme.palette.grey[100],
    zIndex: 2,
    top: 0,
    left: 0,
    right: 0,
  },
  root: {
    "& .tab .tab-btn": {
      alignItems: "center",
      justifyContent: "center",
      display: "flex",
      transform: "translateX(-1.5px)",
      borderRadius: 7,
      position: "relative",
      margin: "8px 15px",
      width: 50,
      minWidth: 50,
      height: 50,
      [theme.breakpoints.down("md")]: {
        marginRight: 16,
        "&.screen-btn": {
          borderRadius: 11,
          background: "rgb(231, 223, 250)",
          boxshadow:
            theme.palette.type === "dark"
              ? "none"
              : "0 2px 10px rgb(224, 224, 224)",
          color: "rgb(55, 19, 138)!important",
        },
      },
      "&:not(.screen-btn)": {
        boxshadow:
          theme.palette.type === "dark"
            ? "none"
            : "0 2px 4px rgb(241, 230, 255)",
        borderRadius: 6,
        opacity: 0.86,
        color: "#ffffff",
      },
    },
    "& .tab": {
      display: "flex",
      position: "relative",
      justifyContent: "center",
      [theme.breakpoints.down("md")]: {
        justifyContent: "flex-start",
        alignItems: "center",
      },
      "&.selected": {
        position: "relative",
        "&:not(.bordered)>div:first-of-type": {
          transform: "scale(0.9)",
          "&::before": {
            content: "''",
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
            borderRadius: 8,
            border: "4px solid " + theme.palette.primary.main,
            transform: "scale(1.3)",
          },
        },
        "&.bordered::after": {
          content: "''",
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 6,
          background: theme.palette.secondary.main,
          borderRadius: "6px 0 0 6px",
        },
      },
    },
    display: "flex",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    height: "100%",
    overflow: "hidden",
  },
  content: {
    [theme.breakpoints.down("xs")]: {
      width: "84%",
    },
    background: theme.palette.type === "dark" ? "#000" : "#f9f5fe",
    flexGrow: 1,
    padding: theme.spacing(3),
    width: "100%",
  },
}));

Drawer.propTypes = {
  window: PropTypes.func,
};

export default connect((states) => ({
  classes: Object.keys(states.classes).map((k) => states.classes[k]),
  theme: states.theme,
}))(Drawer);
