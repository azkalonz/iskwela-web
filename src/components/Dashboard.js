import React from "react";
import {
  Container,
  Grid,
  FormLabel,
} from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import ClassCard from './ClassCard';
import { makeStyles } from '@material-ui/core/styles';
import { 
  Apps,
  List,
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  grid: {
    display: 'flex',
    flexDirection: 'row',
    // alignItems: 'center',
  },
  root: {
    background: grey[400],
    minHeight: "100vh",
    padding: theme.spacing(5)
  }
}));

export default function Dashboard() {

  const classes = useStyles();

  return (
    <Container 
      component="main" 
      maxWidth="lg" 
      className={classes.root}
    >
      <Grid 
        container
        direction="row"
        justify="space-between"
        className={classes.grid}>
        <Grid item>
          <Apps />
          <List />
        </Grid>
        <Grid item>
          <FormLabel
            label={'Class'}
          >Class</FormLabel>
          <FormLabel
            label={'Date'}
          >Date</FormLabel>
        </Grid>
      </Grid>
      <Grid 
        container
        direction="row"
        spacing={3}
        className={classes.grid}>
        <Grid item xs>
          <ClassCard 
            subjectName={'Physics'}
            subjectDescription={'Fundamentals'}
            numStudents={2}
            schedule={'8:00AM - 9:00AM'}
          />
        </Grid>
        <Grid item xs>
          <ClassCard
            subjectName={'Mathematics'}
            subjectDescription={'Problem Solving'}
            numStudents={3}
            schedule={'9:00AM - 10:00AM'}
          />
        </Grid>
        <Grid item xs>
          <ClassCard 
            new={true}
          />
        </Grid>
      </Grid>
    </Container>
  )
  
}
