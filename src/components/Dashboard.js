import React from "react";
import {
  Container,
  Grid,
  FormLabel,
} from '@material-ui/core';
import PropTypes from 'prop-types';
import { grey } from '@material-ui/core/colors';
import ClassCard from './ClassCard';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { 
  Apps,
  List,
} from '@material-ui/icons';
import "../../node_modules/react-grid-layout/css/styles.css"
import "../../node_modules/react-resizable/css/styles.css"
import GridLayout, { Responsive as ResponsiveLayout } from 'react-grid-layout';
import _ from "lodash";

const useStyles = theme => ({
  grid: {
    display: 'flex',
    flexDirection: 'row',
    // alignItems: 'center',
  },
  root: {
    background: grey[300],
    minHeight: "100vh",
    padding: theme.spacing(4)
  }
});

const subjects = [
  {
    name: 'Physics',
    description: 'Fundamentals',
    numStudents: 2,
    schedule: '8:00AM - 9:00AM',
    teacherStatus: '2px solid green',
    teacherName: 'Santa',
    teacherAvatar: 'https://upload.wikimedia.org/wikipedia/commons/4/49/Jonathan_G_Meath_portrays_Santa_Claus.jpg'
  },
  {
    name: 'Logistics 1',
    description: 'How to manage 1 million elves',
    numStudents: 3,
    schedule: '9:00AM - 10:00AM',
    teacherStatus: '2px solid green',
    teacherName: 'Santa',
    teacherAvatar: 'https://upload.wikimedia.org/wikipedia/commons/4/49/Jonathan_G_Meath_portrays_Santa_Claus.jpg'
  },
  {
    name: 'Logistics 2',
    description: 'How to manage 1 million elves',
    numStudents: 3,
    schedule: '9:00AM - 10:00AM',
    teacherStatus: '2px solid green',
    teacherName: 'Santa',
    teacherAvatar: 'https://upload.wikimedia.org/wikipedia/commons/4/49/Jonathan_G_Meath_portrays_Santa_Claus.jpg'
  },
  {
    name: 'Logistics 3',
    description: 'How to manage 1 million elves',
    numStudents: 3,
    schedule: '9:00AM - 10:00AM',
    teacherStatus: '2px solid green',
    teacherName: 'Santa',
    teacherAvatar: 'https://upload.wikimedia.org/wikipedia/commons/4/49/Jonathan_G_Meath_portrays_Santa_Claus.jpg'
  },
  {
    name: 'Logistics 4',
    description: 'How to manage 1 million elves',
    numStudents: 3,
    schedule: '9:00AM - 10:00AM',
    teacherStatus: '2px solid green',
    teacherName: 'Santa',
    teacherAvatar: 'https://upload.wikimedia.org/wikipedia/commons/4/49/Jonathan_G_Meath_portrays_Santa_Claus.jpg'
  },
  {
    name: 'Logistics 5',
    description: 'How to manage 1 million elves',
    numStudents: 3,
    schedule: '9:00AM - 10:00AM',
    teacherStatus: '2px solid green',
    teacherName: 'Santa',
    teacherAvatar: 'https://upload.wikimedia.org/wikipedia/commons/4/49/Jonathan_G_Meath_portrays_Santa_Claus.jpg'
  },
  {
    name: 'Logistics 6',
    description: 'How to manage 1 million elves',
    numStudents: 3,
    schedule: '9:00AM - 10:00AM',
    teacherStatus: '2px solid green',
    teacherName: 'Santa',
    teacherAvatar: 'https://upload.wikimedia.org/wikipedia/commons/4/49/Jonathan_G_Meath_portrays_Santa_Claus.jpg'
  },
];

class Dashboard extends React.Component {

  constructor(props) {
    super(props);
    const layout = this.generateLayout();
    this.state = { layout };
  }
  
  generateDOM() {
    return subjects.map((subject, i) => {
      return (
        <Grid item key={i}>
          <ClassCard 
            subjectName={subject.name}
            subjectDescription={subject.description}
            numStudents={subject.numStudents}
            schedule={subject.schedule}
            teacherStatus={subject.teacherStatus}
            teacherName={subject.teacherName}
            teacherAvatar={subject.teacherAvatar}
          />
      </Grid>
      );
    })
  }

  generateLayout() {
    return subjects.map((subject, i) => {
      var y = Math.floor(i / 3);
      var x = i % 3;
      return {
        x: x,
        y: y,
        w: 1,
        h: 1.5,
        i: i.toString()
      };
    })
  }
  render() {
    console.log(this.state.layout);
    const { classes } = this.props;
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
        {/* <ResponsiveLayout  */}
        <GridLayout
          className="layout"
          layout={this.state.layout} 
          // cols={{lg: 3, md: 3, sm: 3, xs: 3, xxs: 1}} 
          cols={3}
          // rowHeight={0}
          width={1200}
          breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}}
          isResizable={false}
          isDraggable={false}>
          {this.generateDOM()}
        {/* </ResponsiveLayout> */}
        </GridLayout>
      </Container>
    )
  }
  
}

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(useStyles)(Dashboard);
