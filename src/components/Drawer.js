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
} from "@material-ui/core";
import DashboardOutlined from "@material-ui/icons/DashboardOutlined";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import { makeLinkTo } from "./router-dom";
import ExpandLessOutlinedIcon from "@material-ui/icons/ExpandLessOutlined";
import ExpandMoreOutlinedIcon from "@material-ui/icons/ExpandMoreOutlined";

function Drawer(props) {
  const styles = useStyles();
  const history = useHistory();
  const { class_id } = props.match.params;
  const [more, setMore] = useState(false);
  const classes = props.classes.sort((a, b) =>
    a.next_schedule.status === "ONGOING" ? -1 : 0
  );
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
      <Toolbar className={styles.toolbar}>
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
      </Toolbar>
      <div style={{ textAlign: "center" }} id="tabs-container">
        <Box
          {...listItem.container}
          borderLeft={5}
          className={window.location.pathname === "/" ? "selected tab" : "tab"}
          borderColor={
            window.location.pathname === "/" ? "primary.main" : "transparent"
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
            <DashboardOutlined />
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
              borderLeft={5}
              onClick={() => {
                history.push(
                  makeLinkTo(["class", item.id, item.next_schedule.id, "opt"], {
                    opt: item.next_schedule.id ? "activity" : "",
                  })
                );
              }}
              borderColor={
                class_id && parseInt(class_id) === parseInt(item.id)
                  ? "primary.main"
                  : "transparent"
              }
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
                  }}
                  bgcolor={
                    item.next_schedule.status === "ONGOING"
                      ? "primary.main"
                      : "grey.700"
                  }
                >
                  <Typography
                    variant="body1"
                    component="h2"
                    style={{ color: "#fff" }}
                  >
                    {item.name[0].toUpperCase()}
                  </Typography>
                  {/* <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: -5,
                      width: 15,
                      height: 15,
                      borderRadius: "50%",
                      borderWidth: 2,
                      borderStyle: "solid",
                      borderColor:
                        theme.palette.type === "dark" ? "#111" : "#fff",
                      background: theme.palette.primary.main,
                    }}
                  ></div> */}
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
                  borderLeft={5}
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
                  borderColor={
                    class_id && parseInt(class_id) === parseInt(item.id)
                      ? "primary.main"
                      : "transparent"
                  }
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
                      }}
                      bgcolor={
                        item.next_schedule.status === "ONGOING"
                          ? "primary.main"
                          : "grey.700"
                      }
                    >
                      <Typography
                        variant="body1"
                        component="h2"
                        style={{ color: "#fff" }}
                      >
                        {item.name[0].toUpperCase()}
                      </Typography>
                    </Box>
                  </Tooltip>
                </Box>
              </Grow>
            );
          })}
        {!more ? (
          <IconButton onClick={() => setMore(true)}>
            <ExpandMoreOutlinedIcon />
          </IconButton>
        ) : (
          <IconButton onClick={() => setMore(false)}>
            <ExpandLessOutlinedIcon />
          </IconButton>
        )}
        <Divider />
        <Box {...listItem.container}>
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
        </Box>
      </div>
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
          {drawer}
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

const listItem = {
  container: {
    display: "flex",
    position: "relative",
    justifyContent: "center",
    borderColor: "primary.main",
  },
  item: {
    borderRadius: "50%",
    position: "relative",
    border: 1,
    borderColor: "grey.500",
    m: 1,
    width: 40,
    height: 40,
  },
};
const drawerWidth = 60;
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
    background:
      theme.palette.type === "dark" ? "#222222" : theme.palette.grey[300],
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
