import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  List,
  ListItem,
  Typography,
  Box,
  Grid,
  CircularProgress,
  ListItemText,
  ListItemSecondaryAction,
  useTheme,
  Icon,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Paper,
  useMediaQuery,
  FormControl,
  Select,
  Divider,
} from "@material-ui/core";
import { fetchData } from "../../screens/Admin/Dashboard";
import Rating from "@material-ui/lab/Rating";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import PopupState, {
  bindTrigger,
  bindPopover,
  bindMenu,
} from "material-ui-popup-state";
import { connect } from "react-redux";
import Api from "../../api";
import { Table as MTable } from "../../components/Table";
import Pagination, { getPageItems } from "../../components/Pagination";
import { SearchInput } from "../../components/Selectors";
import moment from "moment";
import Chart from "react-apexcharts";
import { DialogTitle } from "../../components/dialogs";
import { makeLinkTo } from "../../components/router-dom";
const qs = require("query-string");

const activityTypes = [
  "quizzes",
  "periodicals",
  "seatworks",
  "projects",
  "assignments",
];
const ScoreSummary = (props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const query = qs.parse(window.location.search);
  const { class_id } = props.match.params;
  const [currentActivity, setCurrentActivity] = useState(query.activity);
  const [scores, setScores] = useState();
  const { userInfo, parentData } = props;
  const [open, setOpen] = useState(false);
  const classes = useStyles(false);
  const rows = [
    "Assignments",
    "Periodical Exams",
    "Projects",
    "Quizzes",
    "Seatworks",
  ];
  const [loading, setLoading] = useState(true);
  const ratings = [5, 4, 3, 2, 1.3];

  const getScoreDetails = async (activity) => {};
  const getActivityScores = async () => {
    props.onLoad(true);
    setLoading(true);
    try {
      let res = await Api.get(
        "/api/reports/activity-scores?class_id=" + class_id
      );
      if (res.length) {
        setScores(
          res.find(
            (s) => s.id === userInfo.id || s.id === parentData?.childInfo?.id
          )
        );
      }
    } catch (e) {}
    props.onLoad(false);
    setLoading(false);
  };
  useEffect(() => {
    getActivityScores();
  }, [class_id]);
  useEffect(() => {
    if (query.activity && activityTypes.indexOf(query.activity) >= 0) {
      setCurrentActivity(query.activity);
    }
  }, [query.activity]);
  return (
    <React.Fragment>
      {loading && (
        <Box display="flex" justifyContent="center" width="100%" marginTop={4}>
          <CircularProgress />
        </Box>
      )}
      {!currentActivity && !loading && scores?.scores && (
        <Grid container direction="column" className={classes.parentWrapper}>
          <Grid item>
            <Box p={2} display="flex" alignItems="center">
              <Typography
                style={{ fontWeight: 500, fontSize: 18, marginRight: 13 }}
              >
                {props.parentData?.childInfo
                  ? props.parentData?.childInfo.first_name + "'s"
                  : "My"}{" "}
                Score Summmary
              </Typography>
            </Box>
            <Box
              p={2}
              display="flex"
              textAlign="center"
              justifyContent="center"
              position="relative"
              style={{
                flexWrap: isMobile ? "wrap" : "no-wrap",
              }}
            >
              <Paper
                style={{
                  marginRight: isMobile ? "0px" : "10px",
                  width: "100%",
                }}
              >
                {scores?.scores && (
                  <Chart
                    type="bar"
                    height={430}
                    options={{
                      theme: {
                        mode: theme.palette.type,
                      },
                      yaxis: {
                        title: {
                          text: "Average Scores",
                        },
                        max: 100,
                        labels: {
                          formatter: function (val, index) {
                            return val.toFixed(0) + "%";
                          },
                        },
                      },
                      xaxis: {
                        categories: Object.keys(scores.scores).map((k) =>
                          k.ucfirst()
                        ),
                      },
                      colors: [
                        "#7539ff",
                        "#FFD026",
                        "#7539ff",
                        "#FFD026",
                        "#7539ff",
                      ],
                      plotOptions: {
                        bar: {
                          horizontal: false,
                        },
                      },
                      dataLabels: {
                        enabled: true,
                        formatter: function (val) {
                          return val.toFixed(0) + "%";
                        },
                      },
                    }}
                    series={[
                      {
                        name: "Average",
                        data: Object.keys(scores.scores).map(
                          (k) => scores.scores[k] * 100
                        ),
                      },
                    ]}
                  />
                )}
              </Paper>
              <List
                style={{
                  minWidth: "30%",
                  maxWidth: "100%",
                  flex: "1 1 auto",
                  paddingBottom: "20px",
                }}
              >
                {Object.keys(scores.scores).map((activity, index) => {
                  return (
                    <ListItem
                      onClick={() =>
                        props.history.push(
                          window.location.search.replaceUrlParam(
                            "activity",
                            activity
                          )
                        )
                      }
                      button
                      component={Paper}
                      divider
                      key={index}
                      style={{
                        marginBottom: "7px",
                        background:
                          theme.palette.type === "dark" ? "#222" : "#fff",
                        width: "100%",
                      }}
                    >
                      <ListItemText
                        primary={activity.ucfirst()}
                        secondary={
                          <Rating
                            value={Math.map(
                              scores.scores[activity] * 100,
                              0,
                              100,
                              0,
                              5
                            )}
                            readOnly
                            size="small"
                            precision={0.1}
                          />
                        }
                        style={{
                          width: "100%",
                        }}
                      />
                      <p key="index" className={classes.scores}>
                        {(scores.scores[activity] * 100).toFixed(2)}%
                      </p>
                      <ListItemSecondaryAction>
                        <PopupState
                          variant="popover"
                          popupId={"details-" + index}
                        >
                          {(popupState) => (
                            <div>
                              <IconButton {...bindTrigger(popupState)}>
                                <MoreHorizIcon style={{ color: "#7539ff" }} />
                              </IconButton>
                              <Menu {...bindMenu(popupState)}>
                                <MenuItem
                                  onClick={() => {
                                    props.history.push(
                                      window.location.search.replaceUrlParam(
                                        "activity",
                                        activity
                                      )
                                    );
                                    popupState.close();
                                  }}
                                >
                                  Details
                                </MenuItem>
                              </Menu>
                            </div>
                          )}
                        </PopupState>
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          </Grid>
        </Grid>
      )}
      {currentActivity && (
        <DetailedScores
          {...props}
          match={props.match}
          activity={currentActivity}
          goBack={() => {
            props.history.push(
              window.location.search.replaceUrlParam("activity", "")
            );
            setCurrentActivity(null);
          }}
        />
      )}
    </React.Fragment>
  );
};
function DetailedScores(props) {
  const query = require("query-string").parse(window.location.search);

  const { userInfo, parentData } = props;
  const { class_id, schedule_id, option_name, room_name } = props.match.params;
  const [saving, setSaving] = useState();
  const [savingId, setSavingId] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [scores, setScores] = useState([]);

  const getFilteredData = (data = scores) =>
    [...scores].filter(
      (d) => JSON.stringify(d).toLowerCase().indexOf(search.toLowerCase()) >= 0
    );
  const getDetailedScores = async () => {
    setLoading(true);
    try {
      let id = userInfo.id;
      if (parentData?.childInfo) {
        id = parentData.childInfo.id;
      }
      let res = await Api.get(
        `/api/reports/${props.activity}?class_id=${class_id}&user_id=${id}`
      );
      setScores(res);
    } catch (e) {}
    setLoading(false);
  };
  useEffect(() => {
    getDetailedScores();
  }, []);
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
            "?q=" + props.userInfo.id,
          ])
        );
      }}
      {...props}
    />
  ) : (
    <Box>
      <Box
        justifyContent="space-between"
        display="flex"
        alignItems="center"
        width="100%"
        p={2}
      >
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => props.goBack()}>
            <Icon>arrow_back</Icon>
          </IconButton>
          <Typography style={{ fontSize: 18, fontWeight: 500, marginLeft: 13 }}>
            {props.activity?.ucfirst()}
          </Typography>
        </Box>
        <Box>
          <SearchInput onChange={(val) => setSearch(val)} />
        </Box>
      </Box>
      {loading && (
        <Box display="flex" justifyContent="center" width="100%">
          <CircularProgress />
        </Box>
      )}
      {!loading && (
        <MTable
          headers={[
            { id: "id", title: "ID", width: "33%" },
            { id: "title", title: "Title", width: "33%" },
            {
              id: "published_at",
              title: "Date",
              align: "center",
              width: "33%",
            },
            {
              id: "student_score",
              title: "Score",
              align: "flex-end",
              width: "33%",
            },
          ]}
          options={[
            {
              name: "View",
              value: "view",
            },
          ]}
          data={scores}
          saving={saving}
          savingId={savingId}
          pagination={{
            render: (
              <Pagination
                page={page}
                nolink
                match={props.match}
                onChange={(p) => setPage(p)}
                count={getFilteredData().length}
                emptyTitle={
                  search
                    ? "Nothing Found"
                    : "No " + props.activity.ucfirst() + " scores yet."
                }
                emptyMessage={
                  search ? (
                    "Try a different keyword"
                  ) : (
                    <Button onClick={props.goBack}>Go back</Button>
                  )
                }
                icon={
                  search ? (
                    <img
                      src="/hero-img/search.svg"
                      width={180}
                      style={{ padding: "50px 0" }}
                    />
                  ) : (
                    <img
                      src="/hero-img/undraw_Progress_tracking_re_ulfg.svg"
                      width={180}
                      style={{ padding: "50px 0" }}
                    />
                  )
                }
              />
            ),
            page,
            onChangePage: (p) => setPage(p),
          }}
          actions={{}}
          noOptions={true}
          filtered={(d) => getFilteredData(d)}
          rowRenderMobile={(item, { disabled = false }) => (
            <Box
              display="flex"
              flexWrap="wrap"
              width="90%"
              flexDirection="column"
              justifyContent="space-between"
              style={{ padding: "30px 0" }}
              onClick={(e) => {
                props.history.push(
                  makeLinkTo([
                    "class",
                    class_id,
                    schedule_id,
                    option_name,
                    room_name || "",
                    "?q=" + props.userInfo.id,
                    "&activity_id=" + item.id,
                  ])
                );
              }}
            >
              <Box width="100%" marginBottom={1}>
                <Typography
                  style={{
                    fontWeight: "bold",
                    color: "#38108d",
                    fontSize: "1em",
                  }}
                >
                  ID
                </Typography>
                <Typography variant="body1">{item.id}</Typography>
                <Typography
                  style={{
                    fontWeight: "bold",
                    color: "#38108d",
                    fontSize: "1em",
                  }}
                >
                  TITLE
                </Typography>
                <Typography variant="body1">{item.title}</Typography>
              </Box>
              <Box width="100%" marginBottom={1}>
                <Typography
                  style={{
                    fontWeight: "bold",
                    color: "#38108d",
                    fontSize: "1em",
                  }}
                >
                  DATE
                </Typography>
                <Typography
                  variant="body1"
                  style={{
                    fontWeight: "bold",
                    fontSize: "0.9em",
                  }}
                >
                  {moment(item.published_at).format("MMM DD, YYYY")}
                </Typography>
              </Box>
              <Box width="100%">
                <Typography
                  style={{
                    fontWeight: "bold",
                    color: "#38108d",
                    fontSize: "1em",
                  }}
                >
                  SCORE
                </Typography>
                <Box display="flex" alignItems="center">
                  <Typography>
                    {item.student_score} out of {item.perfect_score}
                  </Typography>
                  <Rating
                    value={Math.map(
                      item.student_score,
                      0,
                      item.perfect_score,
                      0,
                      5
                    )}
                    readOnly
                    size="small"
                    precision={0.1}
                  />
                </Box>
              </Box>
            </Box>
          )}
          rowRender={(item, { disabled = true }) => (
            <Box
              display="flex"
              width="100%"
              flexDirection="row"
              justifyContent="space-between"
              style={{ padding: "10px 0" }}
              onClick={(e) => {
                props.history.push(
                  makeLinkTo([
                    "class",
                    class_id,
                    schedule_id,
                    option_name,
                    room_name || "",
                    "?q=" + props.userInfo.id,
                    "&activity_id=" + item.id,
                  ])
                );
              }}
            >
              <Box width="33%">{item.id}</Box>
              <Box width="33%">{item.title}</Box>
              <Box width="33%" textAlign="center">
                {moment(item.published_at).format("MMM DD, YYYY")}
              </Box>
              <Box width="33%" textAlign="right">
                {item.student_score} out of {item.perfect_score}
                <Rating
                  value={Math.map(
                    item.student_score,
                    0,
                    item.perfect_score,
                    0,
                    5
                  )}
                  readOnly
                  size="small"
                  precision={0.1}
                />
              </Box>
            </Box>
          )}
        />
      )}
    </Box>
  );
}

function ActivityDetails(props) {
  const query = require("query-string").parse(window.location.search);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const [no, setNo] = useState(0);
  const [errors, setErrors] = useState();
  const [activity, setActivity] = useState([]);
  const [attempt, setAttempt] = useState([]);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const getActivityDetails = async () => {
    let res, res2;
    fetchData({
      before: () => setLoading(true),
      send: async () => {
        try {
          res = await Api.get(
            "/api/activity/attempts?activity_id=" +
              query.activity_id +
              "&student_id=" +
              props.userInfo.id
          );
          res2 = await Api.get(
            "/api/activity/attempt/show?attempt_id=" +
              res[no].attempt_id +
              "&activity_id=" +
              query.activity_id
          );
        } catch {
          alert(console.error());
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
                          width: "10%",
                        }
                  }
                >
                  <Typography
                    style={{ textAlign: "center", fontWeight: "bold" }}
                  >
                    Attempt
                  </Typography>
                  <Select
                    label="Attempt"
                    color="primary"
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
              <Paper style={{ padding: 20, marginTop: 30 }}>
                {" "}
                {attempt?.questionnaires &&
                  attempt.questionnaires.map((data) => {
                    return (
                      <Typography key={data.id}>
                        {" "}
                        {data?.questions &&
                          data.questions.map((data, i) => {
                            return (
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
                                    style={{ fontWeight: "bold" }}
                                  >
                                    Student's Answer:{" "}
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
                                <hr />
                              </Typography>
                            );
                          })}
                      </Typography>
                    );
                  })}
              </Paper>
            </Box>
          </Box>
        ))
      }
    </React.Fragment>
  );
}

const useStyles = makeStyles((theme) => ({
  parentWrapper: {
    width: "100%",
    margin: "0 auto",
  },
  title: {
    fontWeight: "bold",
  },
  scores: {
    textAlign: "right",
    width: "45%",
    marginRight: theme.spacing(3),
    fontWeight: "normal",
    fontSize: "20px",
  },
  btnMore: {
    boxShadow: "0px 0px 0px 0px",
    backgroundColor: "transparent",
    padding: "5px",
    color: "#7539ff",
  },
}));
export default connect((states) => ({
  userInfo: states.userInfo,
  parentData: states.parentData,
}))(ScoreSummary);
