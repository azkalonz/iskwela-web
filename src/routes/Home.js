import React from "react";
import {
  AppBar,
  Avatar,
  Container,
  Grid,
  Typography,
} from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/core/styles';
import {
  Add,
  Apps,
  Face,
  LibraryBooks,
  SettingsApplications,
} from '@material-ui/icons';
import Dashboard from "../components/Dashboard";
import NavBar from "../components/NavBar";

const useStyles = makeStyles((theme) => ({
  root: {
    background: grey[300],
    minHeight: "100vh",
  },
  navbar: {
    marginLeft: theme.spacing(2)
  },
  avatar: {
    background: grey[300],
  },
  sidebarIcon: {
    color: "black",
    fontWeight: theme.typography.fontWeightBold,
  }
}));

const subjects = [
  {
    title: 'Physics'
  },
  {
    title: 'Logistics'
  }
]

const createSidebar = (styles, subjects) => {
  let links =[
    {
      title: "Me",
      icon: (
        <Avatar 
          className={styles.avatar}
        >
          <Apps className={styles.sidebarIcon} />
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
          className={styles.avatar}
        >
            <Typography className={styles.sidebarIcon}>
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
  links.push({
    title: "Me",
    icon: (
      <Avatar 
        className={styles.avatar}
      >
          <Add className={styles.sidebarIcon} />
      </Avatar>
    ),
    auth: true,
  });
  return links;
}

function Home() {

  const classes = useStyles();
  const sideBarLinks = createSidebar(classes, subjects);

  return (
    <NavBar title='My Class' sideBarLinks={sideBarLinks}>
      <Container 
        component="main" 
        maxWidth="lg" 
        className={classes.root}
      >
        <Dashboard />
      </Container>
    </NavBar>
  )
  
}

export default Home;
