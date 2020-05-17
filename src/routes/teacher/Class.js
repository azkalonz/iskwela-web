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
import PropTypes from 'prop-types';
import NavBar from "../../components/NavBar";
import Jitsi from 'react-jitsi';
import JitsiMeet from '../../components/JitsiMeetComponent';

const useStyles = makeStyles((theme) => ({
  root: {
    background: grey[300],
    minHeight: "100vh",
  },
}));

function Class() {
    const classes = useStyles();
  
    const displayName = 'Jacquelyn Amaya';
    const email = 'amaya.jacque@gmail.com'
    const roomName = '123e4567-e89b-12d3-a456-426655440000';
    const password = 'zkw7tvbr';
    const options = {
        roomName: roomName,
        width: 700,
        height: 700,
        parentNode: document.querySelector('#meet')
    };
  
    // const [displayName, setDisplayName] = useState('')
    // const [roomName, setRoomName] = useState('')
    // const [password, setPassword] = useState('')
    // const [onCall, setOnCall] = useState(false)
  
    return (
      <NavBar title='My Class'>
        <Container 
          component="main" 
          maxWidth="lg" 
          className={classes.root}
        >
          <JitsiMeet
            userName={displayName}
            userEmail={email}
            roomName={roomName}
          />
        </Container>
      </NavBar>
    )  
}

export default Class;
