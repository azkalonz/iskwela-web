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
  const history = useHistory();
  const { class_id } = props.match.params;
  const [more, setMore] = useState(false);
  const classes = props.classes.sort((a, b) =>
    a.next_schedule.status === "ONGOING" ? -1 : 0
  );
  const listItem = {
    container: {
      display: "flex",
      position: "relative",
      justifyContent: "center",
      borderColor: "primary.main",
    },
    item: {
      position: "relative",
      m: 1,
      width: 50,
      height: 50,
    },
  };
  useEffect(() => {
    focusCurrentTab();
  }, []);
  const focusCurrentTab = () => {
    let t = document.querySelector(".selected.tab");
    if (!t) {
      setMore(true);
      setTimeout(() => focusCurrentTab(), 0);
    } else {
      let cont = document.querySelector("#tabs-container");
      if (cont) {
        cont.parentElement.scrollTop = t.offsetTop - t.clientHeight;
      }
    }
  };
  const drawer = (
    <React.Fragment>
      <Box>
        <Box p={2}>
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
            {...listItem.container}
            className={
              window.location.pathname === "/" ? "selected tab bordered" : "tab"
            }
          >
            <Box
              onClick={() => {
                history.push("/");
              }}
              {...listItem.item}
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
                {...listItem.container}
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
                    {...listItem.item}
                    {...item.props}
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      display: "flex",
                      transform: "translateX(-1.5px)",
                      borderRadius: 7,
                      ...(item.next_schedule.status === "ONGOING"
                        ? {
                            backgroundColor: theme.palette.primary.main,
                            color: "#fff",
                          }
                        : {
                            backgroundColor: theme.palette.primary.main + "15",
                            color: "#38108d",
                          }),
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
                    {...listItem.container}
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
                        {...listItem.item}
                        {...item.props}
                        style={{
                          alignItems: "center",
                          justifyContent: "center",
                          display: "flex",
                          transform: "translateX(-1.5px)",
                          borderRadius: 7,
                          ...(item.next_schedule.status === "ONGOING"
                            ? {
                                backgroundColor: theme.palette.primary.main,
                              }
                            : {
                                backgroundColor:
                                  theme.palette.primary.main + "15",
                                color: "#38108d",
                              }),
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
                <IconButton onClick={() => setMore(true)}>
                  <ExpandMoreOutlinedIcon />
                </IconButton>
              ) : (
                <IconButton onClick={() => setMore(false)}>
                  <ExpandLessOutlinedIcon />
                </IconButton>
              )}
            </React.Fragment>
          )}
          <Box m={2}>
            <Divider />
          </Box>
          <Box
            {...listItem.container}
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
              {...listItem.item}
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
          {/* <Box {...listItem.container}>
          <Tooltip title="DepEd Commons" placement="right">
            <Box
              onClick={() =>
                window.open("https://commons.deped.gov.ph/", "_blank")
              }
              {...listItem.item}
              style={{
                alignItems: "center",
                cursor: "pointer",
                justifyContent: "center",
                display: "flex",
                transform: "translateX(-1.5px)",
              }}
            >
              <Avatar
                src="/deped-logo.png"
                imgProps={{
                  style: {
                    width: "100%",
                    height: "auto",
                  },
                }}
                style={{
                  margin: "0 auto",
                  border: "1px solid rgb(172, 172, 172)",
                  padding: 2,
                  background: "#fff",
                }}
              />
            </Box>
          </Tooltip>
        </Box> */}
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
      <nav className={styles.drawer} aria-label="mailbox folders">
        <MuiDrawer
          styles={{
            paper: styles.drawerPaper,
          }}
          variant="permanent"
          open
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
    "& .selected.tab": {
      position: "relative",
      "&:not(.bordered)>div": {
        backgroundColor: theme.palette.secondary.main + "!important",
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
