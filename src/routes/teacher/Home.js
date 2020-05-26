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
import Dashboard from "../../components/teacher/Dashboard";
import NavBar from "../../components/NavBar";

const useStyles = makeStyles((theme) => ({
  root: {
    background: grey[300],
    minHeight: "100vh",
  },
}));

function Home() {

  const classes = useStyles();

  return (
    <NavBar title='Class'>
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
