import React from "react";
import {
  Container,
  Grid,
} from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/core/styles';
import DashboardStudent from "../components/DashboardStudent";

const useStyles = makeStyles((theme) => ({
  root: {
    background: grey[400],
    minHeight: "100vh",
    padding: theme.spacing(5)
  }
}));

function StudentHome() {

  const classes = useStyles();

  return (
    <Container 
      component="main" 
      maxWidth="lg" 
      className={classes.root}
    >
      <DashboardStudent />
    </Container>
  )
  
}

export default StudentHome;
