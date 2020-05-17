import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import {
  Avatar,
  Card,
  CardActions,
  CardContent,
  Collapse,
  IconButton,
  Paper,
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
import { useHistory } from 'react-router-dom';

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
    /*marginTop: theme.spacing(1),*/
    display: 'flex',
  },
  teacherAvatar:{
    marginLeft: "auto", 
    float: 'right',
  },
  teacherName: {
    color: "black",
    marginLeft: 'auto',
  },
  footer: {
    background: grey[200],
    direction: "column",
  },
  notif: {
    color: 'white',
    marginLeft: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  }
}));

export default function ClassCard(props) {
  const classes = useStyles();
  const history = useHistory();
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

  const handleClick = () => {
    history.push('/teacher/class/join');
  }

  return (
    <Card className={classes.root} onClick={handleClick}>
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
          <Grid container direction="row" style={{ display: "flex" }}>
            <Schedule />
            <Typography 
              variant="body2" 
              color="textSecondary" 
              component="p"
              className={classes.schedule}
            >
              {props.schedule}
            </Typography>
            <Avatar src={props.teacherAvatar} style={{border:props.teacherStatus}} className={classes.teacherAvatar}/>
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
            <Typography
              variant="body2" 
              color="textSecondary" 
              component="h5"
              className={classes.teacherName}
              style={{float: 'right'}}
            >
              {props.teacherName}
            </Typography>
          </Grid>
        </Grid>
      </CardActions>
      { (!props.classStatus) ? null :
        (<div style={{backgroundColor:props.notifColor}}>
          <Typography variant="body2" component='p' className={classes.notif}>
            {props.classStatus}
          </Typography>
        </div>)
      }
    </Card>
  );
}
