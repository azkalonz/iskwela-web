import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Icon,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Typography,
  useTheme,
} from "@material-ui/core";
import MaterialTable from "material-table";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Chart } from "react-charts";
import { connect } from "react-redux";

function Scores(props) {
  const { class_id, schedule_id } = props.match.params;
  const [graphData, setGraphData] = useState({ left: [], right: [] });
  const theme = useTheme();
  const [compareData, setCompareData] = useState();
  const [modals, setModals] = useState({});
  const [currentStudent, setCurrentStudent] = useState();
  const [currentData, setCurrentData] = useState();
  const [table, setTable] = useState({
    columns: [
      { title: "Image", field: "image" },
      { title: "Name", field: "name" },
      { title: "Quizzes", field: "quizzes" },
      { title: "Activities", field: "activities" },
      { title: "Assignments", field: "assignments" },
      { title: "Periodical Exams", field: "periodical_exams" },
      {
        title: "Performnce Tasks",
        field: "performance_tasks",
      },
      { title: "Grades", field: "grades" },
    ],
    data: [],
  });
  const randomScore = () => (Math.random() * (99 - 75 + 1) + 75).toFixed(2);
  function randomDate(start, end) {
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
  }
  const randomData = (count, title) => {
    let x = [];
    for (let i = 0; i < count; i++) {
      x[i] = {
        date: moment(randomDate(new Date(2020, 0, 1), new Date())).format(
          "MMM DD, YYYY"
        ),
        title: title + " " + (i + 1),
        total_score: 100,
        achieved_score: randomScore(),
      };
    }
    return x;
  };
  const ScoreSummaryLink = (props) => {
    const { s, title, activity } = props;
    return (
      <span
        style={{ cursor: "pointer", textDecoration: "underline" }}
        onClick={() => {
          document.querySelector("#right-panel").scrollTop = 0;
          setCurrentStudent({
            ...s,
            summary_title: title + " Summary",
            columns: table2headers,
            data: randomData(10, activity),
          });
          setCompareData(null);
          setGraphData({ ...graphData, right: [] });
          setCurrentData({
            ...s,
            name: s.first_name + " " + s.last_name,
          });
        }}
      >
        {randomScore()}
      </span>
    );
  };
  useEffect(() => {
    setTable({
      ...table,
      data: props.classDetails[class_id].students.map((s) => ({
        id: s.id,
        image_url: s.preferences.profile_picture,
        image: <Avatar src={s.preferences.profile_picture} alt={s.last_name} />,
        name: s.last_name + ", " + s.first_name,
        quizzes: <ScoreSummaryLink s={s} title="Quizzes" activity="Quiz" />,
        assignments: (
          <ScoreSummaryLink s={s} title="Assignments" activity="Assignment" />
        ),
        activities: (
          <ScoreSummaryLink s={s} title="Activities" activity="Activity" />
        ),
        periodical_exams: (
          <ScoreSummaryLink s={s} title="Periodical Exams" activity="Exam" />
        ),
        performance_tasks: (
          <ScoreSummaryLink s={s} title="Performance Tasks" activity="Task" />
        ),
        grades: randomScore(),
        nquizzes: randomScore(),
        nassignments: randomScore(),
        nactivities: randomScore(),
        nperiodical_exams: randomScore(),
        nperformance_tasks: randomScore(),
        ngrades: randomScore(),
      })),
    });
  }, []);
  useEffect(() => {
    if (currentData) {
      let x = {
        label: currentData.name.toUpperCase(),
        data: [
          "nquizzes",
          "nactivities",
          "nassignments",
          "nperiodical_exams",
          "nperformance_tasks",
          "ngrades",
        ].map((s, i) => [
          i,
          parseInt(table.data.find((q) => q.id === currentData.id)[s]),
        ]),
      };
      setGraphData({ ...graphData, left: [x] });
    }
    if (compareData) {
      let x = {
        label: compareData.name.toUpperCase(),
        data: [
          "nquizzes",
          "nactivities",
          "nassignments",
          "nperiodical_exams",
          "nperformance_tasks",
          "ngrades",
        ].map((s, i) => [
          i,
          parseInt(table.data.find((q) => q.id === compareData.id)[s]),
        ]),
      };
      setGraphData({ ...graphData, right: [x] });
    }
  }, [currentData, compareData]);
  const handleOpen = (name) => {
    let m = { ...modals };
    m[name] = true;
    setModals(m);
  };
  const handleClose = (name) => {
    let m = { ...modals };
    m[name] = false;
    setModals(m);
  };
  return (
    <Box marginTop={2} marginBottom={2}>
      <Dialog open={modals.COMPARE} onClose={() => handleClose("COMPARE")}>
        <DialogTitle>Compare to</DialogTitle>
        <DialogContent>
          <List>
            {table &&
              table.data &&
              table.data.map((s) => (
                <ListItem
                  onClick={() => {
                    setCompareData(s);
                    handleClose("COMPARE");
                    setTimeout(() => {
                      document.querySelector("#right-panel").scrollTop = 0;
                    }, 0);
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={s.image_url} alt={s.name} />
                  </ListItemAvatar>
                  <ListItemText primary={s.name} />
                </ListItem>
              ))}
          </List>
        </DialogContent>
      </Dialog>
      {currentData && (
        <Paper>
          <Box p={2}>
            {currentStudent && (
              <Button
                onClick={() => {
                  setCurrentStudent(null);
                  setCurrentData(null);
                }}
              >
                <Icon color="primary" fontSize="small">
                  arrow_back
                </Icon>
                Back
              </Button>
            )}
            <Box
              display="flex"
              width="100%"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              {currentData && (
                <Box display="flex" width="100%" alignItems="center">
                  <Box marginRight={2}>
                    <Avatar
                      src={currentData.image_url}
                      style={{
                        width: 100,
                        height: 100,
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography style={{ fontSize: 21 }}>
                      {currentData.name}
                    </Typography>
                  </Box>
                </Box>
              )}
              {compareData && (
                <Box
                  display="flex"
                  width="100%"
                  alignItems="center"
                  justifyContent="flex-end"
                >
                  <Box marginRight={2}>
                    <Typography style={{ fontSize: 21 }}>
                      {compareData.name}
                    </Typography>
                  </Box>
                  <Box>
                    <Avatar
                      src={compareData.image_url}
                      style={{
                        width: 100,
                        height: 100,
                      }}
                    />
                  </Box>
                </Box>
              )}
            </Box>
            <Box height={300} m={2}>
              <Typography style={{ fontWeight: "bold" }}>
                Performance
              </Typography>
              <Chart
                data={graphData.left.concat(graphData.right)}
                axes={[
                  { primary: true, type: "linear", position: "bottom" },
                  { type: "linear", position: "left" },
                ]}
                tooltip
              />
            </Box>
          </Box>
        </Paper>
      )}
      {!currentStudent ? (
        <MaterialTable
          title="Students Scores"
          columns={table.columns}
          data={table.data}
          options={{
            pageSize: 10,
            actionsColumnIndex: 8,
            rowStyle: (data) => {
              if (currentData && currentData.id === data.id) {
                return {
                  background: theme.palette.primary.main,
                  color: "#fff",
                };
              } else if (compareData && compareData.id === data.id) {
                return {
                  background: theme.palette.secondary.main,
                  color: "#222",
                };
              }
            },
          }}
          actions={[
            {
              icon: "compare_arrows",
              tooltip: "Compare",
              onClick: (e, row) => {
                setCurrentData(row);
                handleOpen("COMPARE");
              },
            },
          ]}
        />
      ) : (
        <MaterialTable
          title={currentStudent.summary_title}
          columns={currentStudent.columns}
          data={currentStudent.data}
          options={{
            pageSize: 10,
            actionsColumnIndex: 8,
          }}
        />
      )}
    </Box>
  );
}
const table2headers = [
  { title: "Quiz Date", field: "date", type: "date" },
  { title: "Title", field: "title" },
  {
    title: "Total Score",
    field: "total_score",
    type: "numeric",
  },
  {
    title: "Achieved Score",
    field: "achieved_score",
    type: "numeric",
  },
];
export default connect((states) => ({
  classDetails: states.classDetails,
}))(Scores);
