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
} from "@material-ui/core";
import DashboardOutlined from "@material-ui/icons/DashboardOutlined";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import { makeLinkTo } from "./router-dom";
import ExpandLessOutlinedIcon from "@material-ui/icons/ExpandLessOutlined";
import ExpandMoreOutlinedIcon from "@material-ui/icons/ExpandMoreOutlined";

function Drawer(props) {
  const styles = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const history = useHistory();
  const { class_id } = props.match.params;
  const [more, setMore] = useState(false);
  const classes = props.classes.sort((a, b) =>
    a.next_schedule.status === "ONGOING" ? -1 : 0
  );
  useEffect(() => {
    focusCurrentTab();
  }, [isTablet, props.location.hash]);
  const focusCurrentTab = () => {
    let t = document.querySelector(".selected.tab");
    if (!t) {
      setMore(true);
      setTimeout(() => focusCurrentTab(), 0);
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
          p={2}
          id="logo-drawer"
          style={{
            position: "sticky",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1,
            background: "#fff",
          }}
        >
          <Typography
            variant="h6"
            align="center"
            style={{ width: "100%", cursor: "pointer" }}
            onClick={() => {
              history.push("/");
            }}
          >
            SH
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
              <DashboardOutlined color="#38108d" />
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
                onClick={() => {
                  history.push(
                    makeLinkTo(
                      ["class", item.id, item.next_schedule.id, "opt"],
                      {
                        opt: item.next_schedule.id ? "activity" : "",
                      }
                    )
                  );
                }}
                style={{ cursor: "pointer" }}
              >
                <Tooltip title={item.name} placement="right">
                  <Box
                    {...item.props}
                    className="tab-btn"
                    style={{
                      backgroundColor: item.theme,
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
                <Grow in={more}>
                  <Box
                    className={
                      class_id && parseInt(class_id) === parseInt(item.id)
                        ? "selected tab"
                        : "tab"
                    }
                    key={index}
                    onClick={() => {
                      history.push(
                        makeLinkTo(
                          ["class", item.id, item.next_schedule.id, "opt"],
                          {
                            opt: item.next_schedule.id ? "activity" : "",
                          }
                        )
                      );
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <Tooltip title={item.name} placement="right">
                      <Box
                        {...item.props}
                        className="tab-btn"
                        style={{
                          backgroundColor: item.theme,
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
                  style={{
                    position: "sticky",
                    background: "#fff",
                    bottom: 0,
                    zIndex: 1,
                  }}
                >
                  <ExpandMoreOutlinedIcon />
                </IconButton>
              ) : (
                <IconButton
                  onClick={() => setMore(false)}
                  style={{
                    position: "sticky",
                    background: "#fff",
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
            <Divider />
          </Box>
          <Box
            className={
              window.location.pathname === "/improvement"
                ? "selected tab bordered"
                : "tab"
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
              <Icon style={{ color: "#38108d" }}>school</Icon>
            </Box>
          </Box>
        </div>
      </Box>
      <Box>
        <Tooltip title="Help" placement="right">
          <IconButton
            onClick={() =>
              window.open(
                "https://files.iskwela.net/public/iSkwela_UserManual_Beta1.0.pdf",
                "_blank"
              )
            }
          >
            <Icon fontSize="large" style={{ color: "#38108d" }}>
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
          <MuiDrawer
            id="drawer-container"
            styles={{
              paper: styles.drawerPaper,
            }}
            variant="permanent"
            open
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
          </MuiDrawer>
        </nav>
      ) : (
        <Slide
          direction="right"
          in={props.location.hash === "#menu"}
          mountOnEnter
          unmountOnExit
          style={{
            boxShadow: "4px 0 10px rgba(143, 45, 253, 0.16)",
            height: "100vh",
            zIndex: 30,
            overflow: "auto",
            background: "#fff",
            position: "fixed",
          }}
          id="mobile-drawer"
        >
          <Box
            width={315}
            minWidth={315}
            maxWidth={315}
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
              style={{
                display: "flex",
                alignItems: "center",
                position: "sticky",
                top: 0,
                borderColor: "transparent",
                left: 0,
                right: 0,
                background: "#fff",
                zIndex: 1,
                justifyContent: "space-between",
              }}
            >
              <Box>iSkwela</Box>
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
                <DashboardOutlined color="#38108d" />
              </Box>
              <Typography style={{ color: "#38108d", fontWeight: "bold" }}>
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
                  onClick={() => {
                    history.push(
                      makeLinkTo(
                        ["class", item.id, item.next_schedule.id, "opt"],
                        {
                          opt: item.next_schedule.id ? "activity" : "",
                        }
                      )
                    );
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <Tooltip title={item.name} placement="right">
                    <Box
                      {...item.props}
                      className="tab-btn"
                      style={{
                        backgroundColor: item.theme,
                        marginRight: 7,
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
                  <Typography style={{ color: "#38108d", fontWeight: "bold" }}>
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
                  <Grow in={more}>
                    <Box
                      className={
                        class_id && parseInt(class_id) === parseInt(item.id)
                          ? "selected tab"
                          : "tab"
                      }
                      key={index}
                      onClick={() => {
                        history.push(
                          makeLinkTo(
                            ["class", item.id, item.next_schedule.id, "opt"],
                            {
                              opt: item.next_schedule.id ? "activity" : "",
                            }
                          )
                        );
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <Tooltip title={item.name} placement="right">
                        <Box
                          {...item.props}
                          className="tab-btn"
                          style={{
                            backgroundColor: item.theme,
                            marginRight: 7,
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
                        style={{ color: "#38108d", fontWeight: "bold" }}
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
            <Divider />
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
                <Icon fontSize="large" style={{ color: "#38108d" }}>
                  help_outline
                </Icon>
              </Box>
              <Typography style={{ color: "#38108d", fontWeight: "bold" }}>
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
    position: "sticky",
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
      margin: theme.spacing(1),
      width: 50,
      minWidth: 50,
      height: 50,
      [theme.breakpoints.down("md")]: {
        marginRight: 2,
      },
      "&:not(.screen-btn)": {
        color: "#fff",
        boxShadow: "0px 0px 11px rgba(0,0,0,0.1)",
      },
    },
    "& .tab": {
      display: "flex",
      position: "relative",
      justifyContent: "center",
      borderColor: "primary.main",
      [theme.breakpoints.down("md")]: {
        justifyContent: "flex-start",
        alignItems: "center",
      },
      "&.selected": {
        position: "relative",
        "&:not(.bordered)>div": {
          backgroundColor: "#000!important",
          opacity: 0.5,
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
    overflow: "hidden",
  },
  content: {
    [theme.breakpoints.down("xs")]: {
      width: "84%",
    },
    background: theme.palette.type === "dark" ? "#222222" : "#f9f5fe",
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
}))(Drawer);
