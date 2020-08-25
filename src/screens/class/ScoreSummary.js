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
} from "@material-ui/core";
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
  const { userInfo, parentData } = props;
  const { class_id } = props.match.params;
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
  return (
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
            >
              <Box width="100%" marginBottom={1}>
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
          rowRender={(item, { disabled = false }) => (
            <React.Fragment>
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
            </React.Fragment>
          )}
        />
      )}
    </Box>
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
