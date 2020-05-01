import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import {
  Card,
  CardActions,
  CardContent,
  Collapse,
  IconButton,
  Typography,
  Container,
  Grid,
} from '@material-ui/core';
import { red, grey } from '@material-ui/core/colors';
import { 
  Add,
  CalendarToday,
  Schedule, 
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 345,
    marginTop: theme.spacing(3),
    borderRadius: 10,
  },
  addButton: {
    alignSelf: "center",
  },
  addCard: {
    padding: theme.spacing(5),
  },
  subject: {
    background: "white"
  },
  students: {
    marginTop: theme.spacing(3),
  },
  schedule: {
    color: "black",
    marginLeft: theme.spacing(1),
  },
  scheduleDate: {
    marginTop: theme.spacing(1),
  },
  footer: {
    background: grey[200],
    direction: "column",
  }
}));

export default function ClassCard(props) {
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState(false);

  if (props.new) {
    return (
      <Card className={[classes.root, classes.addCard]}>
        <IconButton 
          size="medium" 
          className={classes.addButton}
        >
          <Add />
        </IconButton>
      </Card>
    )
  }

  return (
    <Card className={classes.root}>
      <CardContent className={classes.subject}>
        <Typography variant="h5" color="primary" component="h5">
          {props.subjectName}
        </Typography>
        <Typography variant="body2" color="textSecondary" component="p">
          {props.subjectDescription}
        </Typography>
        <Typography 
          variant="body2" 
          color="textSecondary" 
          component="p"
          className={classes.students}
        >
          {props.numStudents + ' Students'}
        </Typography>
      </CardContent>
      <CardActions disableSpacing className={classes.footer}>
        <Grid container direction="column">
          <Grid container direction="row">
            <Schedule />
            <Typography 
              variant="body2" 
              color="textSecondary" 
              component="p"
              className={classes.schedule}
            >
              {props.schedule}
            </Typography>
          </Grid>
          <Grid container direction="row" className={classes.scheduleDate}>
            <CalendarToday />
            <Typography 
              variant="body2" 
              color="textSecondary" 
              component="p"
              className={classes.schedule}
            >
              { new Date().toDateString() }
            </Typography>
          </Grid>
        </Grid>
      </CardActions>
    </Card>
  );
}
