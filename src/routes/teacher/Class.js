import React, { useEffect, useState } from "react";
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
import DashboardStudent from "../../components/student/Dashboard";
import NavBar from "../../components/NavBar";
import Jitsi from 'react-jitsi';

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

const useScript = url => {
  useEffect(() => {
    const script = document.createElement('script');

    script.src = url;
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    }
  }, [url]);
};

function Class() {

  const classes = useStyles();
  const sideBarLinks = createSidebar(classes, subjects);

  const domain = 'meet.jit.si';
  const options = {
      roomName: 'JitsiMeetAPIExample',
      width: 700,
      height: 700,
      parentNode: document.querySelector('#meet')
  };
  // useScript('https://meet.jit.si/external_api.js');
  // const api = new JitsiMeetExternalAPI(domain, options);
  // const displayName = 'Jacquelyn Amaya';
  const roomName = '123e4567-e89b-12d3-a456-426655440000';
  const password = 'zkw7tvbr';
  // const userFullName = 'Joseph Strawberry';

  const [displayName, setDisplayName] = useState('')
  // const [roomName, setRoomName] = useState('')
  // const [password, setPassword] = useState('')
  const [onCall, setOnCall] = useState(false)

  return (
    <NavBar title='My Class' sideBarLinks={sideBarLinks}>
      <Container 
        component="main" 
        maxWidth="lg" 
        className={classes.root}
      >
        {/* <Jitsi roomName={roomName} displayName={userFullName}/> */}
        {
          onCall
          ? (
              <Jitsi
                  roomName={roomName}
                  displayName={displayName}
                  // password={password}
                  // onAPILoad={JitsiMeetAPI => console.log('Good Morning everyone!')}
              />
          )
          : (
              <>
                  <h1>Create a Meeting</h1>
                  <input type='text' placeholder='Your name' value={displayName} onChange={e => setDisplayName(e.target.value)} />
                  <button onClick={() => setOnCall(true)}> Let&apos;s start!</button>
              </>
          )
        }
      </Container>
    </NavBar>
  )
  
}

export default Class;
