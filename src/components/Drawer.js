import React, { useEffect } from "react";
import PropTypes from "prop-types";
import {
  Divider,
  Drawer as MuiDrawer,
  List,
  ListItem,
  Box,
  Typography,
  Toolbar,
  makeStyles,
  useTheme,
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

function Drawer(props) {
  const styles = useStyles();
  const history = useHistory();
  const theme = useTheme();
  const listItems = [
    {
      item: <DashboardOutlined />,
      link: "/",
      title: "Class",
    },
  ];
  useEffect(() => {
    listItems.forEach((item, index) => {
      if (window.location.pathname === item.link) {
        props.setRoute({ index, title: item.title });
      }
    });
  }, []);
  const drawer = (
    <div>
      <Toolbar style={{ minHeight: 50, paddingLeft: 0, paddingRight: 0 }}>
        <Typography
          variant="h6"
          align="center"
          style={{ width: "100%", cursor: "pointer" }}
          onClick={() => {
            props.setRoute({ index: 0, title: "Class" });
            history.push("/");
          }}
        >
          SH
        </Typography>
      </Toolbar>
      <List>
        {listItems.map((item, index) => (
          <Box
            {...listItem.container}
            key={index}
            borderLeft={5}
            onClick={() => props.setRoute({ index, title: item.title })}
            borderColor={
              item.link.indexOf("/" + window.location.pathname.split("/")[1]) >=
              0
                ? "primary.main"
                : "transparent"
            }
          >
            <Box
              onClick={() => {
                props.setRoute({ index: 0, title: "Class" });
                history.push(item.link);
              }}
              {...listItem.item}
              {...item.props}
              style={{
                alignItems: "center",
                cursor: "pointer",
                justifyContent: "center",
                display: "flex",
                transform: "translateX(-5px)",
              }}
            >
              {item.item}
            </Box>
          </Box>
        ))}
        {store.getState().classes.map((item, index) => {
          let scheds = store.getState().classDetails[item.id].schedules;
          let sched_id = "";
          for (let i in scheds) {
            sched_id = i;
            break;
          }
          return (
            <Box
              {...listItem.container}
              key={index}
              borderLeft={5}
              onClick={() => {
                props.setRoute({ index, title: item.title });
                history.push(makeLinkTo(["class", item.id, sched_id]));
              }}
              borderColor={
                (
                  "/class/" +
                  item.id +
                  "/" +
                  item.name.replace(" ", "-")
                ).indexOf(
                  "/" +
                    window.location.pathname.split("/")[1] +
                    "/" +
                    window.location.pathname.split("/")[2]
                ) >= 0
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
                  transform: "translateX(-5px)",
                }}
                bgcolor="grey.700"
              >
                <Typography
                  variant="body1"
                  component="h2"
                  style={{ color: "#fff" }}
                >
                  {item.name[0].toUpperCase()}
                  {item.name.split(" ")[1]}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </List>
    </div>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

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
  root: {
    display: "flex",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  toolbar: theme.mixins.toolbar,
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

export default connect(
  (states) => ({
    route: states.route,
  }),
  actions
)(Drawer);
