import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grow,
  Icon,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import Api from "../../api";
import store from "../../components/redux/store";
import { makeLinkTo } from "../../components/router-dom";
import socket from "../../components/socket.io";

function AnswerQuiz(props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { class_id, schedule_id, option_name, room_name } = props.match.params;
  const query = require("query-string").parse(window.location.search);
  const quiz_id = props.match.params.quiz_id || props.id || parseInt(query.id);
  const [quiz, setQuiz] = useState();
  const [isAvailable, setAvailable] = useState(true);
  const [answers, setAnswers] = useState({});
  const [quizScore, setQuizScore] = useState();
  const [saving, setSaving] = useState(false);
  const [quizState, setQuizState] = useState({});
  const [currentSlide, setCurrentSlide] = useState();
  const [flaggedQuestions, setFlagged] = useState([]);
  const student_id = store.getState().userInfo.id;
  const history = useHistory();

  const getProgress = (callback) => {
    socket.off("get progress");
    socket.emit("get progress", {
      student_id,
      type: props.type,
      id: props.quiz.id,
    });
    socket.on("get progress", (data = {}) => {
      if (data) {
        callback(data);
      } else {
        callback();
      }
    });
  };
  useEffect(() => {
    setCurrentSlide(0);
    if (quiz_id) {
      if (props.quiz) {
        getProgress((data = {}) => {
          if (data.date_started) getQuiz({ date_started: data.date_started });
          else getQuiz();
          setQuizState(data);
          setFlagged(
            data["flagged-items-" + quiz_id + "-" + query.q]
              ? JSON.parse(data["flagged-items-" + quiz_id + "-" + query.q])
              : []
          );
          setAnswers(
            data["answered-questions-" + quiz_id + "-" + query.q]
              ? JSON.parse(
                  data["answered-questions-" + quiz_id + "-" + query.q]
                )
              : {}
          );
        });
      } else {
        getQuiz();
      }
    }
  }, [props.questionsSet, quiz_id]);
  useEffect(() => {
    setCurrentSlide(query.question ? parseInt(query.question) : 0);
  }, [query.question]);
  useEffect(() => {
    if (quiz) {
      let i = document.querySelector("#question-image");
      if (i) {
        i.src = "";
        i.src = quiz.slides[currentSlide]?.media?.large;
      }
    }
  }, [currentSlide]);
  const getQuiz = (savedState = {}) => {
    let quiz = props.questionsSet.find((q) => q.id === parseInt(quiz_id));
    if (!quiz) return;
    if (!savedState.date_started) {
      savedState.date_started = new Date().toString();
      socket.emit("update progress", {
        type: props.type,
        student_id,
        item: {
          ...props.quiz,
          date_started: new Date().toString(),
        },
      });
    }
    quiz.slides = quiz.questions.map((q) => ({
      ...q,
      type: 1,
      media: {
        thumb: q.media_url,
        large: q.media_url,
      },
      score: q.weight,
    }));
    setQuiz({ ...quiz, ...savedState });
  };
  const navigateSlide = (index) => {
    if (!isAvailable) return;
    if (quiz.slides[index]) {
      setCurrentSlide(index);
      if (props.noPaging === undefined) {
        let qs = [];
        Object.keys(query).forEach((q) => {
          if (q !== "question") qs.push(`&${q}=${query[q]}`);
        });
        history.push(
          makeLinkTo(["?question=" + index, ...qs]).replace("/", "")
        );
      }
    }
  };
  const flag = (index) => {
    if (!isAvailable || !props.quiz) return;
    let flags = [...flaggedQuestions];
    if (flags.indexOf(index) >= 0) flags.splice(flags.indexOf(index), 1);
    else {
      flags.push(index);
      navigateSlide(index + 1);
    }
    setFlagged(flags);
    let flagID = "flagged-items-" + quiz_id + "-" + query.q;
    let progress = {};
    progress[flagID] = JSON.stringify(flags);
    socket.emit("update progress", {
      student_id,
      id: props.quiz.id,
      type: props.type,
      item: { ...progress, id: props.quiz.id },
    });
  };
  const handleSubmit = () => {
    if (!props.quiz) return;
    getProgress(async (data) => {
      setSaving(true);
      let answer = {
        activity_id: props.quiz.id,
        subject_id: props.quiz.subject.id,
        start_time: moment(quiz.date_started).format("YYYY-MM-DD hh:mm:ss"),
        end_time: moment(new Date().toString()).format("YYYY-MM-DD hh:mm:ss"),
        questionnaires: props.questionsSet.map((q) => {
          let answers = data[`answered-questions-${q.id}-${props.quiz.id}`];
          if (answers) {
            answers = JSON.parse(answers);
            answers = Object.keys(answers).map((qq) => ({
              question_id: parseInt(qq),
              status: 0,
              is_correct: answers[qq][0].is_correct ? true : false,
              answer: answers[qq][0].option,
            }));
          } else {
            answers = [];
          }
          return {
            questionnaire_id: q.id,
            answers,
          };
        }),
      };
      try {
        let res = await Api.post("/api/" + props.endpoint + "/answer/submit", {
          body: answer,
        });
        socket.emit("remove progress", {
          student_id,
          id: props.quiz.id,
          type: props.type,
        });
        setQuizScore(res);
      } catch (e) {
        alert("Please provide an answer to all questions");
      }
      setSaving(false);
    });
  };
  return (
    <React.Fragment>
      <Dialog
        open={quizScore ? true : false}
        onClose={() => setQuizScore(null)}
      >
        <DialogTitle>Result</DialogTitle>
        {quizScore && (
          <DialogContent>
            <List>
              <ListItem>
                <ListItemText
                  primary={
                    "You scored " +
                    quizScore.score +
                    " out of " +
                    quizScore.pefect_score
                  }
                  secondary="Score"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={moment
                    .utc(
                      moment
                        .duration(quizScore.duration * 1000)
                        .as("milliseconds")
                    )
                    .format(quizScore.duration >= 3600 ? "HH:mm:ss" : "mm:ss")}
                  secondary="Duration"
                />
              </ListItem>
            </List>
          </DialogContent>
        )}
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              history.push(
                makeLinkTo([
                  "class",
                  class_id,
                  schedule_id,
                  option_name,
                  room_name || "",
                ])
              );
            }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={saving}>
        <DialogContent>
          <Box display="flex" alignItems="center">
            <CircularProgress style={{ marginRight: 7 }} />
            <Typography>Submitting...</Typography>
          </Box>
        </DialogContent>
      </Dialog>
      {class_id &&
      schedule_id &&
      quiz &&
      props.questionsSet &&
      props.questionsSet[
        props.questionsSet.findIndex((q) => quiz.id === q.id) - 1
      ] ? (
        <IconButton
          onClick={() => {
            history.push(
              makeLinkTo([
                "class",
                class_id,
                schedule_id,
                option_name,
                room_name || "",
                "?id=" +
                  props.questionsSet[
                    props.questionsSet.findIndex((q) => quiz.id === q.id) - 1
                  ].id,
                "&q=" + query.q + "&start=true",
              ])
            );
          }}
        >
          <Icon color="primary">arrow_back</Icon>
        </IconButton>
      ) : (
        <IconButton
          onClick={() => {
            history.push(
              makeLinkTo(
                [
                  "class",
                  class_id,
                  schedule_id,
                  option_name,
                  room_name || "",
                  "q",
                ],
                {
                  q: query.q ? "?id=" + query.q : "",
                }
              )
            );
          }}
        >
          <Icon color="primary">arrow_back</Icon>
        </IconButton>
      )}
      <Box
        display="flex"
        alignItems="flex-start"
        flexWrap={isMobile ? "wrap" : ""}
        justifyContent="center"
        height={
          props.fullHeight === undefined && !query.height ? "100vh" : "auto"
        }
        overflow="auto"
      >
        {quiz && (
          <React.Fragment>
            <Box width={isMobile ? "100%" : "70%"}>
              {isMobile && (
                <Box textAlign="right" m={3}>
                  <Paper>
                    <Box p={2}>
                      <Typography color="textSecondary">
                        Time Remaining
                      </Typography>
                      <Typography variant="h5">
                        <CountDown
                          onTimesUp={() => setAvailable(false)}
                          time={
                            (props.quiz && props.quiz.duration * 60000) ||
                            60000 * 60
                          }
                          started={quiz.date_started || new Date()}
                        />
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              )}
              {quiz.slides[currentSlide].media &&
                quiz.slides[currentSlide].media.large && (
                  <Grow in={true}>
                    <Box
                      m={2}
                      height={470}
                      display="flex"
                      justifyContent="center"
                      position="relative"
                      style={{ background: "linear-gradient(#fff,#4f4f4f)" }}
                      overflow="hidden"
                    >
                      <img
                        id="question-image"
                        onError={() =>
                          (document.querySelector(
                            "#question-image"
                          ).parentElement.style.display = "none")
                        }
                        onLoad={() =>
                          (document.querySelector(
                            "#question-image"
                          ).parentElement.style.display = "flex")
                        }
                        src={quiz.slides[currentSlide].media.large}
                        height="100%"
                        style={{ position: "relative", zIndex: 2 }}
                      />
                      <div
                        style={{
                          background: `url('${quiz.slides[currentSlide].media.thumb}') 0% 0% / 100% no-repeat`,
                          position: "absolute",
                          top: 0,
                          right: 0,
                          left: 0,
                          bottom: 0,
                          transform: "scale(1.3)",
                          filter: "blur(8px)",
                          opacity: 0.4,
                          zIndex: 0,
                        }}
                      />
                    </Box>
                  </Grow>
                )}
              <Box m={2}>
                <Paper>
                  <Box p={2}>
                    <Typography color="textSecondary">Question</Typography>
                    <Box
                      display="flex"
                      alignItems="flex-start"
                      justifyContent="space-between"
                    >
                      <Box>
                        <Typography
                          variant="h4"
                          style={{ whiteSpace: "pre-wrap" }}
                        >
                          {currentSlide + 1}.{" "}
                          {quiz.slides[currentSlide].question}
                        </Typography>
                      </Box>
                      <Box>
                        <IconButton
                          onClick={() => flag(currentSlide)}
                          disabled={!isAvailable}
                        >
                          <Icon
                            color={
                              flaggedQuestions.indexOf(currentSlide) >= 0
                                ? "error"
                                : "disabled"
                            }
                          >
                            {flaggedQuestions.indexOf(currentSlide) >= 0
                              ? "flag"
                              : "outlined_flag"}
                          </Icon>
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                  <Box
                    m={2}
                    display="flex"
                    justifyContent="space-between"
                    flexWrap="wrap"
                  >
                    <Choices
                      onChooseAnwer={(a, combine = false) => {
                        if (!props.quiz) return;
                        setAnswers(() => {
                          let id = quiz.slides[currentSlide].id;
                          let e = { ...answers };
                          if (e[id] && e[id].indexOf(a) >= 0) {
                            let x = e[id];
                            x.splice(x.indexOf(a), 1);
                            e[id] = x;
                            if (!e[id].length || !a) delete e[id];
                          } else {
                            if (!combine) e[id] = [a];
                            else if (combine) {
                              if (e[id]) {
                                let aa = e[id];
                                e[id] = [...aa, a];
                              } else e[id] = [a];
                            }
                          }
                          if (!a) delete e[id];
                          let answerID =
                            "answered-questions-" + quiz_id + "-" + query.q;
                          let progress = {};
                          progress[answerID] = JSON.stringify(e);
                          socket.emit("update progress", {
                            student_id,
                            id: props.quiz.id,
                            type: props.type,
                            item: { ...progress, id: props.quiz.id },
                          });
                          return e;
                        });
                      }}
                      selected={
                        answers[quiz.slides[currentSlide].id]
                          ? answers[quiz.slides[currentSlide].id]
                          : []
                      }
                      question={quiz.slides[currentSlide]}
                    />
                  </Box>
                  <Box p={2} display="flex" justifyContent="space-between">
                    <Button
                      style={{ width: "auto" }}
                      variant="outlined"
                      disabled={currentSlide <= 0 || !isAvailable}
                      onClick={() => navigateSlide(currentSlide - 1)}
                    >
                      Previous Question
                    </Button>
                    {props.questionsSet &&
                    props.questionsSet.findIndex((q) => quiz.id === q.id) >=
                      props.questionsSet.length - 1 &&
                    currentSlide === quiz.slides.length - 1 ? (
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleSubmit()}
                      >
                        Submit
                      </Button>
                    ) : props.questionsSet &&
                      props.questionsSet.findIndex((q) => quiz.id === q.id) <
                        props.questionsSet.length - 1 &&
                      currentSlide === quiz.slides.length - 1 ? (
                      <Button
                        style={{ width: "auto" }}
                        variant="outlined"
                        color="primary"
                        onClick={() => {
                          history.push(
                            makeLinkTo([
                              "class",
                              class_id,
                              schedule_id,
                              option_name,
                              room_name || "",
                              "?id=" +
                                props.questionsSet[
                                  props.questionsSet.findIndex(
                                    (q) => quiz.id === q.id
                                  ) + 1
                                ].id,
                              "&q=" + query.q + "&start=true",
                            ])
                          );
                        }}
                      >
                        Next Stage
                      </Button>
                    ) : (
                      <Button
                        style={{ width: "auto" }}
                        variant="outlined"
                        onClick={() => navigateSlide(currentSlide + 1)}
                      >
                        Next Question
                      </Button>
                    )}
                  </Box>
                </Paper>
              </Box>
            </Box>
            <Box
              minWidth={isMobile ? "100%" : 330}
              width={isMobile ? "100%" : 330}
            >
              {!isMobile && (
                <Box textAlign="right" m={2}>
                  <Paper>
                    <Box p={2}>
                      <Typography color="textSecondary">
                        Time Remaining
                      </Typography>
                      <Typography variant="h5">
                        <CountDown
                          onTimesUp={() => setAvailable(false)}
                          time={
                            (props.quiz && props.quiz.duration * 60000) ||
                            60000 * 60
                          }
                          started={quiz.date_started || new Date()}
                        />
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              )}
              <Box m={2}>
                <Paper>
                  <Box p={2}>
                    <Typography color="textSecondary">Questions</Typography>
                    <Box
                      display="flex"
                      flexWrap="wrap"
                      justifyContent="flex-start"
                      alignItems="flex-start"
                    >
                      <QuestionsNavigator
                        onChange={(index) => navigateSlide(index)}
                        questions={quiz.slides}
                        selected={currentSlide}
                        flags={flaggedQuestions}
                        disabled={!isAvailable}
                        answered={answers}
                      />
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </Box>
          </React.Fragment>
        )}
      </Box>
    </React.Fragment>
  );
}

function QuestionsNavigator(props) {
  return (
    <React.Fragment>
      {props.questions.map((q, i) => (
        <Box m={1} key={i}>
          <Button
            style={{
              borderRadius: "50%",
              minWidth: 35,
              width: 35,
              height: 35,
              position: "relative",
            }}
            disabled={props.disabled}
            onClick={() => props.onChange(i)}
            variant={
              props.selected === i || props.answered[q.id]
                ? "contained"
                : "outlined"
            }
            color={
              props.selected === i || props.answered[q.id]
                ? "primary"
                : "default"
            }
          >
            {i + 1}
            {props.flags.indexOf(i) >= 0 && (
              <Icon
                style={{
                  position: "absolute",
                  right: -7,
                  bottom: -7,
                }}
                color="error"
              >
                flag
              </Icon>
            )}
          </Button>
        </Box>
      ))}
    </React.Fragment>
  );
}

function Choices(props) {
  const { choices, type } = props.question;
  const theme = useTheme();
  return (
    <React.Fragment>
      {type === 1 || type === 2 || type === 3 ? (
        choices.map((c, i) => {
          return (
            <Box width="44%" key={i} m={2}>
              <Button
                fullWidth
                variant={
                  props.selected &&
                  props.selected.find((q) => q.option === c.option)
                    ? "contained"
                    : "outlined"
                }
                color={
                  props.selected
                    ? props.selected.find((q) => q.option === c.option)
                      ? "primary"
                      : "default"
                    : "default"
                }
                onClick={() => props.onChooseAnwer(c)}
              >
                {c.option}
              </Button>
            </Box>
          );
        })
      ) : type === 4 ? (
        choices.map((c, i) => (
          <Box
            key={i}
            width="100%"
            m={2}
            p={2}
            border={
              "2px " + props.selected && props.selected.indexOf(c) >= 0
                ? "solid"
                : "dashed grey"
            }
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderColor={
              props.selected && props.selected.indexOf(c) >= 0
                ? theme.palette.primary.main
                : "default"
            }
          >
            <div>{c}</div>
            <Checkbox
              checked={
                props.selected && props.selected.indexOf(c) >= 0 ? true : false
              }
              color="primary"
              onChange={() => props.onChooseAnwer(c, true)}
            />
          </Box>
        ))
      ) : (
        <TextField
          fullWidth
          variant="filled"
          multiline
          value={props.selected ? props.selected[0] : ""}
          label="Your Answer"
          onChange={(e) => props.onChooseAnwer(e.target.value)}
        />
      )}
    </React.Fragment>
  );
}

function CountDown(props) {
  const timeRemaining = () => {
    let timeDiff = moment().diff(dateStarted);
    let remaining;
    if (props.time - timeDiff <= 0) return 0;
    else remaining = props.time - timeDiff;
    return moment
      .utc(moment.duration(remaining).as("milliseconds"))
      .format("HH:mm:ss");
  };
  const dateStarted = props.started;
  const [duration, setDuration] = useState(timeRemaining());
  const updateTime = () => {
    if (timeRemaining()) {
      setDuration(timeRemaining());
      setTimeout(updateTime, 1000);
    } else {
      setDuration("Time's Up!");
      if (props.onTimesUp) props.onTimesUp();
    }
  };
  useEffect(() => {
    updateTime();
  }, []);
  return <React.Fragment>{duration}</React.Fragment>;
}

export default connect((states) => ({
  questionnaires: states.questionnaires,
}))(AnswerQuiz);
