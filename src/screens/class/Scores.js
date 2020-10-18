import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Icon,
  List,
  Divider,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Typography,
  useTheme,
  IconButton,
  Grow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  useMediaQuery,
  TextField,
  Checkbox,
} from "@material-ui/core";
import MaterialTable from "material-table";
import moment from "moment";
import React, { useEffect, useState, useMemo } from "react";
// import { Chart } from "react-charts";
import { connect } from "react-redux";
import Api from "../../api";
import Chart from "react-apexcharts";
import { SearchInput } from "../../components/Selectors";
import Pagination, { getPageItems } from "../../components/Pagination";
import { makeLinkTo } from "../../components/router-dom";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import { fetchData } from "../../screens/Admin/Dashboard";

function Scores(props) {
  const query = require("query-string").parse(window.location.search);
  const theme = useTheme();
  const [filterByDate, setFilterByDate] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { class_id, schedule_id, option_name, room_name } = props.match.params;
  const [loading, setLoading] = useState(true);
  const [compareData, setCompareData] = useState();
  const [modals, setModals] = useState({});
  const [currentStudent, setCurrentStudent] = useState();
  const [currentData, setCurrentData] = useState();
  const isTeacher =
    props.userInfo.user_type === "t" || props.userInfo.user_type === "a";
  const [table, setTable] = useState({
    columns: tableCells,
    data: [],
  });
  const sortedSched = useMemo(() => {
    if (!props.classDetails || !props.classDetails[class_id]) return [];
    let scheds = props.classDetails[class_id].schedules;
    if (!scheds.length) return [];
    let sorted = scheds
      .filter((q) => typeof q === "object")
      .sort((a, b) => new Date(b.from) - new Date(a.to))
      .map((q) => q.from);
    return sorted;
  }, [props.classDetails]);
  const [dateTo, setDateTo] = useState(
    moment(sortedSched[0]).format("YYYY-MM-DD") || moment().format("YYYY-MM-DD")
  );
  const [dateFrom, setDateFrom] = useState(
    moment(sortedSched[sortedSched.length - 1]).format("YYYY-MM-DD") ||
      moment().format("YYYY-MM-DD")
  );
  const graphData = useMemo(() => {
    let data, compare;
    if (currentData) {
      data = columnKeys.map((s, i) =>
        parseInt(table.data.find((q) => q.id === currentData.id)[s])
      );
      if (compareData) {
        compare = columnKeys.map((s, i) =>
          parseInt(table.data.find((q) => q.id === compareData.id)[s])
        );
      }
      if (compare) {
        return [
          { name: currentData.name, data },
          { name: compareData.name, data: compare },
        ];
      } else {
        return [{ data }];
      }
    }
  }, [currentData, compareData]);

  const getScores = async ({ to = dateTo, from = dateFrom } = {}) => {
    setLoading(true);
    try {
      let dateFilter = "";
      if (filterByDate) {
        dateFilter = `from=${from}&to=${to}&`;
      }
      let data = await Api.get(
        `/api/reports/activity-scores?${dateFilter}class_id=${class_id}`
      );
      data = data
        .filter((q) =>
          isTeacher
            ? true
            : q.id === props.userInfo.id || q.id === props.childInfo.id
        )
        .map((q) => {
          let scores = q.scores;
          Object.keys(scores).map((key) => {
            scores[key] = (scores[key] * 100).toFixed(2) + "%";
          });
          return {
            ...q,
            name: q.first_name + " " + q.last_name,
            ...scores,
          };
        });
      setTable({ ...table, data });
    } catch (e) {}
    setLoading(false);
  };
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
  useEffect(() => {
    if (table.data.length) {
      let student = null;
      if (query.q && !isNaN(parseInt(query.q))) {
        let id = parseInt(query.q);
        student = table.data.find((q) => q.id === id);
        if (!student)
          props.history.push(
            makeLinkTo([
              "class",
              class_id,
              schedule_id,
              option_name,
              room_name || "",
            ])
          );
      }
      setCurrentStudent(student);
      setCurrentData(student);
    }
  }, [query, table]);
  useEffect(() => {
    getScores();
  }, [filterByDate]);
  return (
    <Box marginTop={2} marginBottom={2}>
      <Dialog
        open={modals.COMPARE || false}
        onClose={() => handleClose("COMPARE")}
      >
        <DialogTitle>Compare to</DialogTitle>
        <DialogContent>
          <CompareList
            students={table.data}
            onClick={(s) => {
              setCompareData(s);
              handleClose("COMPARE");
              setTimeout(() => {
                document.querySelector("#right-panel").scrollTop = 0;
              }, 0);
            }}
          />
        </DialogContent>
      </Dialog>
      {!currentStudent && !currentData ? (
        <React.Fragment>
          <Box display="flex" justifyContent="flex-end" padding={2}>
            <Box display="flex" alignItems="center" display="flex">
              <TextField
                disabled={loading || !filterByDate}
                label="From"
                type="date"
                defaultValue={dateFrom}
                variant="outlined"
                className={
                  "themed-input no-margin small " +
                  (theme.palette.type === "dark" ? "light" : "dark")
                }
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  getScores({ from: e.target.value });
                }}
                style={{ height: 46, paddingRight: theme.spacing(2) }}
              />
              <TextField
                label="To"
                disabled={loading || !filterByDate}
                type="date"
                defaultValue={dateTo}
                variant="outlined"
                className={
                  "themed-input no-margin small " +
                  (theme.palette.type === "dark" ? "light" : "dark")
                }
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  getScores({ to: e.target.value });
                }}
                style={{ height: 46, paddingRight: theme.spacing(2) }}
              />
              <Checkbox
                checked={filterByDate}
                onChange={() => setFilterByDate(!filterByDate)}
              />
            </Box>
          </Box>
          <Grow in={true}>
            <Box
              width="100%"
              style={isMobile ? { padding: 0 } : { padding: "0 40px 0 40px" }}
            >
              <MaterialTable
                isLoading={loading}
                title={
                  props.userInfo.user_type === "t"
                    ? "Students Scores"
                    : "Score Summary"
                }
                style={{ marginBottom: 60 }}
                onRowClick={(e, row) => {
                  props.history.push(
                    makeLinkTo([
                      "class",
                      class_id,
                      schedule_id,
                      option_name,
                      room_name || "",
                      "?q=" + row.id,
                    ])
                  );
                }}
                columns={table.columns}
                data={table.data}
                options={tableOptions}
                actions={[
                  {
                    isFreeAction: true,
                    icon: "bar_chart",
                    tooltip: "Randomize Data",
                    onClick: (e, i) => {
                      setTable({
                        ...table,
                        data: table.data.map((q) => ({
                          ...q,
                          quizzes: Math.rand(0, 100),
                          seatworks: Math.rand(0, 100),
                          assignments: Math.rand(0, 100),
                          projects: Math.rand(0, 100),
                          periodicals: Math.rand(0, 100),
                        })),
                      });
                    },
                  },
                ]}
              />
            </Box>
          </Grow>
        </React.Fragment>
      ) : (
        currentStudent && (
          <Grow in={true}>
            <Box
              width="100%"
              style={isMobile ? { padding: 0 } : { padding: "0 40px 0 40px" }}
            >
              <ScoreDetails
                onClose={() => {
                  props.history.push(
                    makeLinkTo([
                      "class",
                      class_id,
                      schedule_id,
                      option_name,
                      room_name || "",
                    ])
                  );
                }}
                {...props}
                student={currentStudent}
              />
            </Box>
          </Grow>
        )
      )}
      {currentData && !query.activity_id && (
        <Grow in={true}>
          <Paper style={{ margin: isMobile ? 0 : 40 }}>
            <Box p={2}>
              {compareData && (
                <Box
                  marginBottom={2}
                  display="flex"
                  justifyContent="space-between"
                >
                  <Typography variant="h6">Performance</Typography>
                  <IconButton
                    onClick={() => {
                      setCompareData(null);
                    }}
                  >
                    <Icon color="primary" fontSize="small">
                      close
                    </Icon>
                  </IconButton>
                </Box>
              )}
              <Box
                display="flex"
                width="100%"
                justifyContent="space-between"
                alignItems="flex-start"
                flexWrap="wrap"
              >
                {currentData && (
                  <Box display="flex" width="100%" alignItems="center" flex={1}>
                    <Box marginRight={2}>
                      <Avatar
                        src={currentData.image_url}
                        style={{
                          width: 40,
                          height: 40,
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography style={{ fontSize: 18 }}>
                        {currentData.name}
                      </Typography>
                    </Box>
                  </Box>
                )}
                {compareData ? (
                  <Box
                    flex={1}
                    display="flex"
                    width="100%"
                    alignItems="center"
                    justifyContent="flex-end"
                    onClick={() => handleOpen("COMPARE")}
                    style={{ cursor: "pointer" }}
                  >
                    <Box marginRight={2}>
                      <Typography style={{ fontSize: 18 }}>
                        {compareData.name}
                      </Typography>
                    </Box>
                    <Box>
                      <Avatar
                        src={compareData.image_url}
                        style={{
                          width: 40,
                          height: 40,
                        }}
                      />
                    </Box>
                  </Box>
                ) : (
                  <Button onClick={() => handleOpen("COMPARE")}>Compare</Button>
                )}
              </Box>
              <Box m={2}>
                <Typography style={{ fontWeight: "bold" }}>
                  Performance
                </Typography>
                <Chart
                  options={{
                    ...chartOptions,
                    theme: {
                      mode: theme.palette.type,
                    },
                  }}
                  series={graphData}
                  type="bar"
                  width="100%"
                  height={320}
                />
              </Box>
            </Box>
          </Paper>
        </Grow>
      )}
    </Box>
  );
}
function CompareList(props) {
  const { students = [] } = props;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const filteredStudents = useMemo(
    () =>
      students.filter(
        (s) => JSON.stringify(s).toLowerCase().indexOf(search) >= 0
      ),
    [students, search]
  );
  return (
    <React.Fragment>
      <SearchInput onChange={(s) => setSearch(s.toLowerCase())} />
      <List>
        {getPageItems(filteredStudents, page).map((s) => (
          <ListItem onClick={() => props.onClick(s)}>
            <ListItemAvatar>
              <Avatar src={s.image_url} alt={s.name} />
            </ListItemAvatar>
            <ListItemText primary={s.name} />
          </ListItem>
        ))}
      </List>
      <Pagination
        count={filteredStudents.length}
        nolink
        noEmptyMessage
        page={page}
        onChange={(p) => setPage(p)}
      />
    </React.Fragment>
  );
}
function ScoreDetails(props) {
  const query = require("query-string").parse(window.location.search);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { student } = props;
  const { class_id, schedule_id, option_name, room_name } = props.match.params;
  const [activity, setActivity] = useState(columnKeys[0]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const sortedSched = useMemo(() => {
    if (!props.classDetails || !props.classDetails[class_id]) return [];
    let scheds = props.classDetails[class_id].schedules;
    if (!scheds.length) return [];
    let sorted = scheds
      .filter((q) => typeof q === "object")
      .sort((a, b) => new Date(b.from) - new Date(a.to))
      .map((q) => q.from);
    return sorted;
  }, [props.classDetails]);
  const [dateTo, setDateTo] = useState(
    moment(sortedSched[0]).format("YYYY-MM-DD") || moment().format("YYYY-MM-DD")
  );
  const [dateFrom, setDateFrom] = useState(
    moment(sortedSched[sortedSched.length - 1]).format("YYYY-MM-DD") ||
      moment().format("YYYY-MM-DD")
  );
  const title = useMemo(() => activity.ucfirst() + " Summary", [activity]);
  const getActivityScores = async ({ to = dateTo, from = dateFrom } = {}) => {
    setLoading(true);
    try {
      let res = await Api.get(
        `/api/reports/${activity}?from=${from}&to=${to}&class_id=${class_id}&user_id=${student.id}`
      );
      setData(
        res.map((r) => ({
          id: r.id,
          date: moment(r.published_at).format("MMM DD, YYYY"),
          title: r.title,
          perfect_score: parseFloat(r.perfect_score),
          achieved_score: parseFloat(r.student_score),
        }))
      );
    } catch (e) {
      setData([]);
    }
    setLoading(false);
  };
  useEffect(() => {
    if (activity) {
      getActivityScores();
    }
  }, [activity]);
  return query.q && query.activity_id ? (
    <ActivityDetails
      onClose={() => {
        props.history.push(
          makeLinkTo([
            "class",
            class_id,
            schedule_id,
            option_name,
            room_name || "",
            "?q=" + student.id,
          ])
        );
      }}
      {...props}
      student={student}
    />
  ) : (
    <React.Fragment>
      <Box
        width="100%"
        display="flex"
        justifyContent="space-between"
        padding={2}
        flexWrap="wrap"
      >
        <IconButton
          onClick={props.onClose}
          style={{
            order: isMobile ? 2 : 0,
            marginTop: isMobile ? theme.spacing(2) : 0,
          }}
        >
          <Icon color="primary" fontSize="small">
            arrow_back
          </Icon>
        </IconButton>
        <Box
          display="flex"
          alignItems="center"
          display="flex"
          flexWrap={isMobile ? "wrap" : "nowrap"}
          width={isMobile ? "100%" : "auto"}
        >
          <TextField
            label="From"
            disabled={loading}
            type="date"
            defaultValue={dateFrom}
            variant="outlined"
            className={
              "themed-input no-margin small " +
              (theme.palette.type === "dark" ? "light" : "dark")
            }
            InputLabelProps={{
              shrink: true,
            }}
            onChange={(e) => {
              setDateFrom(e.target.value);
              getActivityScores({ from: e.target.value });
            }}
            style={{
              height: 46,
              paddingRight: theme.spacing(2),
              ...(isMobile ? { width: "100%" } : {}),
            }}
          />
          <TextField
            disabled={loading}
            label="To"
            type="date"
            defaultValue={dateTo}
            variant="outlined"
            className={
              "themed-input no-margin small " +
              (theme.palette.type === "dark" ? "light" : "dark")
            }
            InputLabelProps={{
              shrink: true,
            }}
            onChange={(e) => {
              setDateTo(e.target.value);
              getActivityScores({ to: e.target.value });
            }}
            style={{
              height: 46,
              paddingRight: theme.spacing(2),
              ...(isMobile ? { width: "100%", marginTop: 32 } : {}),
            }}
          />
          <FormControl
            variant="outlined"
            className={
              "themed-input " +
              (theme.palette.type === "dark" ? "light" : "dark")
            }
            style={
              isMobile
                ? {
                    paddingRight: theme.spacing(2),
                    marginTop: 32,
                    width: "100%",
                  }
                : {}
            }
          >
            <InputLabel>Activity</InputLabel>
            <Select
              label="Activity"
              color="primary"
              defaultValue={columnKeys[0]}
              onChange={(e) => {
                let val = e.target.value;
                setActivity(val);
              }}
            >
              {columnKeys.map((key, i) => (
                <MenuItem value={key} key={i}>
                  <Typography>{key.ucfirst()}</Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
      <MaterialTable
        title={title}
        columns={table2cells}
        data={data}
        isLoading={loading}
        options={tableOptions}
        onRowClick={(e, row) => {
          props.history.push(
            window.location.search.replaceUrlParam("activity_id", row.id)
          );
        }}
      />
    </React.Fragment>
  );
}

function ActivityDetails(props) {
  const query = require("query-string").parse(window.location.search);
  const { class_id, schedule_id, option_name, room_name } = props.match.params;
  const [errors, setErrors] = useState();
  const [loading, setLoading] = useState(true);
  const { student } = props;
  const theme = useTheme();
  const [no, setNo] = useState(0);
  const [activity, setActivity] = useState([]);
  const [attempt, setAttempt] = useState([]);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const getActivityDetails = async () => {
    setLoading(true);
    let res, res2;
    fetchData({
      before: () => setLoading(true),
      send: async () => {
        try {
          res = await Api.get(
            "/api/activity/attempts?activity_id=" +
              query.activity_id +
              "&student_id=" +
              student.id
          );
          res2 = await Api.get(
            "/api/activity/attempt/show?attempt_id=" +
              res[no].attempt_id +
              "&activity_id=" +
              query.activity_id
          );
        } catch {
          alert(console.error());
          props.history.push(
            makeLinkTo([
              "class",
              class_id,
              schedule_id,
              option_name,
              room_name || "",
              "?q=" + student.id,
            ])
          );
          setErrors(true);
          setAttempt([]);
          setActivity([]);
        }
      },
      after: (data) => {
        setActivity(res);
        setAttempt(res2);
        setLoading(false);
      },
    });
  };
  useEffect(() => {
    getActivityDetails();
  }, [query?.activity_id, no]);
  return (
    <React.Fragment>
     
      {
        (!loading,
        !errors && (
          <Box>
            <Paper
              style={{
                padding: "10px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                width="100%"
                display="flex"
                justifyContent="space-between"
                flexWrap="wrap"
              >
                <IconButton onClick={props.onClose}>
                  <Icon color="primary" fontSize="small">
                    arrow_back
                  </Icon>
                </IconButton>
                <FormControl
                  variant="outlined"
                  className={
                    "themed-input " +
                    (theme.palette.type === "dark" ? "light" : "dark")
                  }
                  style={
                    isMobile
                      ? {
                          paddingRight: theme.spacing(2),
                          marginTop: 32,
                          width: "100%",
                        }
                      : {
                          marginTop: 32,
                          width: "10%",
                        }
                  }
                >
                  <InputLabel>Attempt</InputLabel>
                  <Select
                    label="Attempt"
                    color="primary"
                    defaultValue={no}
                    onChange={(e) => {
                      let val = e.target.value;
                      setNo(val);
                    }}
                  >
                    {activity.map((key, i) => (
                      <MenuItem value={i} key={i}>
                        <Typography>{(i = i + 1)}</Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box width="100%" style={{ marginTop: "10px" }}>
                <Divider />
              </Box>
              <Box width={isMobile ? "100%" : "auto"}>
                <Typography variant="h6">{attempt.title}</Typography>
              </Box>
              <Box p={2}>
                <Typography
                  color="textSecondary"
                  style={{ fontWeight: "bold" }}
                >
                  Duration: {attempt.duration}
                </Typography>
                <Typography
                  color="textSecondary"
                  style={{ fontWeight: "bold" }}
                >
                  Instructions:
                </Typography>
                <Typography
                  color="textSecondary"
                  style={{ fontWeight: "normal" }}
                >
                  {attempt.instruction}
                </Typography>
              </Box>
            </Paper>
            <Box>
              {attempt?.questionnaires &&
                attempt.questionnaires.map((data) => {
                  return (
                    <Typography key={data.id}>
                      {" "}
                      {data?.questions &&
                        data.questions.map((data, i) => {
                          return (
                            <Paper
                              elevation={3}
                              style={{
                                marginTop: 30,
                                padding: 20,
                                // borderTopLeftRadius: "5.5%",
                                // borderBottomLeftRadius: "5.5%",
                                borderLeft: "20px solid",
                                borderLeftColor: "#5DD583",
                              }}
                            >
                              <Typography key={data.id}>
                                {i + 1}. {data.question}
                                <br />
                                {data.media_url ? (
                                  <Box textAlign="center">
                                    <img
                                      src={data.media_url}
                                      style={{
                                        maxHeight: isMobile ? 200 : 400,
                                        maxWidth: isMobile ? 200 : 400,
                                      }}
                                    />
                                  </Box>
                                ) : (
                                  ""
                                )}
                                <br />
                                {data.choices.map((data, i) => {
                                  return (
                                    <ul>
                                      {String.fromCharCode(65 + i)}.{" "}
                                      {data.option}
                                    </ul>
                                  );
                                })}
                                <Typography
                                  color="textSecondary"
                                  style={{ fontWeight: "bold" }}
                                >
                                  Correct Answer:
                                  {data.choices.map((data, i) => {
                                    return (
                                      <div>
                                        {data.is_correct === 1 && (
                                          <ul
                                            style={{
                                              color: "green",
                                              fontWeight: "bold",
                                            }}
                                          >
                                            {data.option}
                                          </ul>
                                        )}
                                      </div>
                                    );
                                  })}
                                </Typography>
                                {data.student_answer && (
                                  <Typography
                                    color="textSecondary"
                                    style={{
                                      //  color:
                                      //    data.student_answer.is_correct === 1
                                      //      ? setBorder(["green"])
                                      //     : setBorder("red"),
                                      fontWeight: "bold",
                                    }}
                                  >
                                    Student's Answer:
                                    <ul
                                      style={{
                                        color:
                                          data.student_answer.is_correct === 1
                                            ? "green"
                                            : "red",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {data.student_answer.answer}
                                    </ul>
                                  </Typography>
                                )}
                              </Typography>
                            </Paper>
                          );
                        })}
                    </Typography>
                  );
                })}
            </Box>
          </Box>
        ))
      }
       {loading && (
        <Box
          fullWidth
          height="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <CircularProgress />
        </Box>
      )}
    </React.Fragment>
  );
}
const tableOptions = {
  pageSize: 10,
  actionsColumnIndex: 8,
  headerStyle: {
    fontWeight: "bold",
  },
};
const cellStyle = (cell) => {
  return {};
};
const tableCells = [
  { title: "Name", field: "name" },
  { title: "Assignments", field: "assignments" },
  { title: "Periodical Exams", field: "periodicals" },
  { title: "Projects", field: "projects" },
  { title: "Quizzes", field: "quizzes" },
  { title: "Seatworks", field: "seatworks" },
].map((q) => ({ ...q, cellStyle }));
const table2cells = [
  { title: "Activity ID", field: "id" },
  { title: "Quiz Date", field: "date" },
  { title: "Title", field: "title" },
  {
    title: "Total Score",
    field: "perfect_score",
  },
  {
    title: "Achieved Score",
    field: "achieved_score",
  },
].map((q) => ({ ...q, cellStyle }));
const columnKeys = [
  "assignments",
  "periodicals",
  "projects",
  "quizzes",
  "seatworks",
];
const chartOptions = {
  yaxis: {
    title: {
      text: "Score",
    },
  },
  labels: {
    formatter: function (val, index) {
      return val.toFixed(2) + "%";
    },
  },
  dataLabels: {
    enabled: true,
    formatter: function (val) {
      return val.toFixed(2) + "%";
    },
  },
  xaxis: {
    categories: columnKeys.map((q) => q.toUpperCase()),
  },
  colors: ["#7539ff", "#FFD026"],
  plotOptions: {
    bar: {
      horizontal: false,
    },
  },
};
export default connect((states) => ({
  childInfo: states.parentData?.childInfo,
  classDetails: states.classDetails,
  userInfo: states.userInfo,
}))(Scores);
