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

export default function DashboardStudent() {

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
            classStatus={'Class has started'}
            notifColor={'purple'}
            teacherStatus={'2px solid green'}
            teacherName={'Tom Cruise'}
            teacherAvatar={"https://upload.wikimedia.org/wikipedia/commons/3/33/Tom_Cruise_by_Gage_Skidmore_2.jpg"}
          />
        </Grid>
        <Grid item xs>
          <ClassCard
            subjectName={'Logistics'}
            subjectDescription={'How to manage 1 million elves'}
            numStudents={3}
            classStatus={'Class has been cancelled'}
            notifColor={'red'}
            schedule={'9:00AM - 10:00AM'}
            teacherStatus={'2px solid red'}
            teacherName={'Santa'}
            teacherAvatar={'https://upload.wikimedia.org/wikipedia/commons/4/49/Jonathan_G_Meath_portrays_Santa_Claus.jpg'}
          />
        </Grid>
        <Grid item xs>
          <ClassCard
            subjectName={'Mathematics'}
            subjectDescription={'Geometry'}
            numStudents={3}
            // classStatus={'Class has been cancelled'}
            // notifColor={'red'}
            schedule={'4:00PM - 5:00PM'}
            teacherStatus={'2px solid red'}
            teacherName={'Pythagoras'}
            teacherAvatar={'https://upload.wikimedia.org/wikipedia/commons/1/1a/Kapitolinischer_Pythagoras_adjusted.jpg'}
          />
        </Grid>
      </Grid>
    </Container>
  )
  
}
