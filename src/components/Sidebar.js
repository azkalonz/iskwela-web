import React, { useState } from "react";
import clsx from "clsx";
import { makeStyles, useTheme, withStyles } from "@material-ui/core/styles";
import {
  Avatar,
  Divider,
  Drawer,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@material-ui/core";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import { grey } from "@material-ui/core/colors";
import {
  Apps,
  Face,
  LibraryBooks,
  SettingsApplications,
} from '@material-ui/icons';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9) + 1,
    },
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  content: {
    position: "relative",
    flexGrow: 1,
    // padding: theme.spacing(3),
  },
  title: {
    flexGrow: 1,
  },
  link: {
    color: "#fff",
  },
  avatarLight: {
    background: grey[300],
  },
  avatarDark: {
    background: grey[800],
  },
  sideBarIconLight: {
    color: "black",
    fontWeight: theme.typography.fontWeightBold,
  },
  sidebarIconDark: {
    color: grey[50],
    fontWeight: theme.typography.fontWeightBold,
  }
}));
const StyledMenu = withStyles({
  paper: {
    border: "1px solid #d3d4d5",
    minWidth: "150px",
    maxWidth: "220px",
  },
})((props) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "center",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "center",
    }}
    {...props}
  />
));

const StyledMenuItem = withStyles((theme) => ({
  root: {
    "&:focus": {
      "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
        color: "#222",
      },
    },
  },
}))(MenuItem);
export default function NavBar(props) {
  const classes = useStyles();
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  // const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
  
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDialogClose = () => {
    setOpenDialog(false);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const makeSidebar = (link, index) => {
    let buffer = [];
    if (!link.sub) {
      // if (link.auth && !isAuthenticated) return;
      buffer.push(
        <Link
          key={index}
          href={link.href}
          style={{ color: grey[50], backgroundColor: grey[800] }}
          onClick={link.onClick || null}
        >
          <ListItem button key={index}>
            <ListItemIcon>{link.icon}</ListItemIcon>
            <ListItemText primary={link.title} />
          </ListItem>
        </Link>
      );
    } else {
      // if (link.auth && !isAuthenticated) return;
      buffer.push(
        <div key={index}>
          <Link style={{ color: grey[50], backgroundColor: grey[800] }} onClick={link.onClick || null}>
            <ListItem
              button
              key={index}
              aria-controls="customized-menu"
              aria-haspopup="true"
              variant="contained"
              color="primary"
              onClick={handleClick}
            >
              <ListItemIcon>{link.icon}</ListItemIcon>
              <ListItemText primary={link.title} />
            </ListItem>
          </Link>
          <StyledMenu
            id="customized-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            {/* sublink.auth && !isAuthenticated ? null :  */}
            {link.sub.map((sublink, subindex) =>
              (
                <StyledMenuItem
                  key={subindex}
                  onClick={sublink.onClick || null}
                >
                  <Link
                    href={sublink.href}
                    style={{
                      color: "#222",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <ListItemIcon style={{ minWidth: "37px" }}>
                      {sublink.icon}
                    </ListItemIcon>
                    <ListItemText primary={sublink.title} />
                  </Link>
                </StyledMenuItem>
              )
            )}
          </StyledMenu>
        </div>
      );
    }
    return buffer;
  };

  const createSidebar = (styles, subjects) => {
    let links =[
      {
        title: "Me",
        icon: (
          <Avatar 
            className={styles.avatarLight}
          >
            <Apps className={styles.sideBarIconLight} />
          </Avatar>
        ),
        auth: true,
      },
    ];
    subjects.forEach(subject => {
      links.push({
        title: "Me",
        icon: (
          <Avatar 
            className={styles.avatarDark}
          >
              <Typography className={styles.sidebarIconDark}>
                {subject.title.charAt(0).toUpperCase()}
              </Typography>
          </Avatar>
        ),
        auth: true,
        sub: [
          {
            title: "View Profile",
            href: "/view-profile",
            icon: <Face />,
          },
          {
            title: "Join Class",
            href: "#",
            onClick: () => {
              // setOpenDialog(true);
            },
            icon: <LibraryBooks />,
          },
          {
            title: "Account Settings",
            href: "/settings",
            icon: <SettingsApplications />,
          },
        ],
      });
    });
    return links;
  }

  const subjects = [
    {
      title: 'Physics'
    },
    {
      title: 'Logistics'
    }
  ];
  
  const sideBarLinks = createSidebar(classes, subjects);

  return (
    <div>
        <Drawer
            variant="permanent"
            className={clsx(classes.drawer, {
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
            })}
            classes={{
            paper: clsx({
                [classes.drawerOpen]: open,
                [classes.drawerClose]: !open,
            }),
            }}
        >
            <div className={classes.toolbar}>
            <IconButton onClick={handleDrawerClose}>
                {theme.direction === "rtl" ? (
                <ChevronRightIcon />
                ) : (
                <ChevronLeftIcon />
                )}
            </IconButton>
            </div>
            <Divider />
            <List>
            {sideBarLinks.map((link, index) => makeSidebar(link, index))}
            </List>
        </Drawer>
        <Drawer
            variant="permanent"
            className={clsx(classes.drawer, {
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
            })}
            classes={{
            paper: clsx({
                [classes.drawerOpen]: open,
                [classes.drawerClose]: !open,
            }),
            }}
        >
            <div className={classes.toolbar}>
            <IconButton onClick={handleDrawerClose}>
                {theme.direction === "rtl" ? (
                <ChevronRightIcon />
                ) : (
                <ChevronLeftIcon />
                )}
            </IconButton>
            </div>
            <Divider />
            <List>
            {sideBarLinks.map((link, index) => makeSidebar(link, index))}
            </List>
        </Drawer>
    </div>
  );
}
