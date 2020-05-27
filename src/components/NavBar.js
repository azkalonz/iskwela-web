import React from "react";
import {
  makeStyles,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  MenuItem,
  Menu,
} from "@material-ui/core";
import AccountCircle from "@material-ui/icons/AccountCircle";
import { connect } from "react-redux";
import actions from "./redux/actions";
import { useHistory } from "react-router-dom";
import Brightness6Icon from "@material-ui/icons/Brightness6";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    position: "sticky",
    top: 0,
    right: 0,
    zIndex: 10,
    left: 0,
  },
  appbar: {
    background: theme.palette.grey[200],
    boxShadow: "none",
  },
  title: {
    flexGrow: 1,
  },
}));

function NavBar(props) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const history = useHistory();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    localStorage.removeItem("auth");
    window.location = "/login";
  };
  const _handleThemeType = () => {
    let mode = window.localStorage["mode"];
    if (mode) mode = mode === "dark" ? "light" : "dark";
    else mode = "dark";
    window.localStorage["mode"] = mode;
    window.location.reload();
  };
  return (
    <div className={classes.root}>
      <AppBar position="static" className={classes.appbar}>
        <Toolbar style={{ minHeight: 51 }}>
          {props.left}
          <Typography
            variant="body1"
            color="textPrimary"
            className={classes.title}
            style={{ fontWeight: "bold" }}
          >
            {props.title || ""}
          </Typography>
          {props.right}
          {!props.right && (
            <div>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={_handleThemeType}
              >
                <Brightness6Icon />
              </IconButton>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={open}
                onClose={handleClose}
              >
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default connect(
  (states) => ({
    route: states.route,
  }),
  actions
)(NavBar);
