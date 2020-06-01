import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Divider,
  Drawer as MuiDrawer,
  List,
  ListItem,
  Box,
  Typography,
  Grow,
  Toolbar,
  makeStyles,
  useTheme,
  IconButton,
  Avatar,
} from "@material-ui/core";
import MailIcon from "@material-ui/icons/Mail";
import InboxIcon from "@material-ui/icons/MoveToInbox";
import MenuIcon from "@material-ui/icons/Menu";
import DashboardOutlined from "@material-ui/icons/DashboardOutlined";
import { connect } from "react-redux";
import actions from "./redux/actions";
import { Link as RouteLink, useHistory } from "react-router-dom";
import store from "./redux/store";
import { makeLinkTo } from "./router-dom";
import ExpandLessOutlinedIcon from "@material-ui/icons/ExpandLessOutlined";
import ExpandMoreOutlinedIcon from "@material-ui/icons/ExpandMoreOutlined";

function Drawer(props) {
  const styles = useStyles();
  const history = useHistory();
  const { class_id } = props.match.params;
  const [more, setMore] = useState(false);
  const drawer = (
    <div>
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
      <div style={{ textAlign: "center" }}>
        <Box
          {...listItem.container}
          borderLeft={5}
          borderColor={
            window.location.pathname == "/" ? "primary.main" : "transparent"
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
        {props.classes.slice(0, 5).map((item, index) => {
          return (
            <Box
              {...listItem.container}
              key={index}
              borderLeft={5}
              onClick={() => {
                history.push(
                  makeLinkTo([
                    "class",
                    item.id,
                    item.next_schedule.id,
                    "activity",
                  ])
                );
              }}
              borderColor={
                class_id && class_id == item.id ? "primary.main" : "transparent"
              }
              style={{ cursor: "pointer" }}
            >
              <Box
                {...listItem.item}
                {...item.props}
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  display: "flex",
                  transform: "translateX(-1.5px)",
                }}
                bgcolor="grey.700"
              >
                <Typography
                  variant="body1"
                  component="h2"
                  style={{ color: "#fff" }}
                >
                  {item.name[0].toUpperCase()}
                </Typography>
              </Box>
            </Box>
          );
        })}
        {more &&
          props.classes.slice(5, props.classes.length).map((item, index) => {
            return (
              <Grow in={more}>
                <Box
                  {...listItem.container}
                  key={index}
                  borderLeft={5}
                  onClick={() => {
                    history.push(
                      makeLinkTo([
                        "class",
                        item.id,
                        item.next_schedule.id,
                        "activity",
                      ])
                    );
                  }}
                  borderColor={
                    class_id && class_id == item.id
                      ? "primary.main"
                      : "transparent"
                  }
                  style={{ cursor: "pointer" }}
                >
                  <Box
                    {...listItem.item}
                    {...item.props}
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      display: "flex",
                      transform: "translateX(-1.5px)",
                    }}
                    bgcolor="grey.700"
                  >
                    <Typography
                      variant="body1"
                      component="h2"
                      style={{ color: "#fff" }}
                    >
                      {item.name[0].toUpperCase()}
                    </Typography>
                  </Box>
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
      </div>
      <Divider />
      <Avatar src="http://localhost:3000/deped-logo.png" />
    </div>
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
      <main className={styles.content} style={{ padding: 0 }}>
        {props.children}
      </main>
    </div>
  );
}

const listItem = {
  container: {
    display: "flex",
    justifyContent: "center",
    borderColor: "primary.main",
  },
  item: {
    borderRadius: "50%",
    borderRadius: "50%",
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
      width: "85%",
    },
    flexGrow: 1,
    padding: theme.spacing(3),
    width: "100%",
  },
}));

Drawer.propTypes = {
  window: PropTypes.func,
};

export default connect((states) => ({
  classes: states.classes,
}))(Drawer);
