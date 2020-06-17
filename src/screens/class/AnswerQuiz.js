import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Divider,
  IconButton,
  Grow,
  Icon,
  Button,
  TextField,
  useMediaQuery,
  useTheme,
  Checkbox,
  Paper,
} from "@material-ui/core";
import moment from "moment";
import { useHistory } from "react-router-dom";
import { makeLinkTo } from "../../components/router-dom";

function AnswerQuiz(props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { quiz_id } = props.match.params;
  const [quiz, setQuiz] = useState();
  const [isAvailable, setAvailable] = useState(true);
  const [answers, setAnswers] = useState(
    window.localStorage["answered-questions-" + quiz_id]
      ? JSON.parse(window.localStorage["answered-questions-" + quiz_id])
      : {}
  );
  const query = require("query-string").parse(window.location.search);
  const [currentSlide, setCurrentSlide] = useState(
    query.question ? parseInt(query.question) : 0
  );
  const [flaggedQuestions, setFlagged] = useState(
    window.localStorage["flagged-items"]
      ? JSON.parse(window.localStorage["flagged-items"])
      : []
  );
  const history = useHistory();
  useEffect(() => {
    getQuiz();
  }, []);
  useEffect(() => {
    setCurrentSlide(query.question ? parseInt(query.question) : 0);
  }, [query.question]);
  const getQuiz = () => {
    let quizList = window.localStorage["quiz-items"];

    if (quizList) {
      quizList = JSON.parse(quizList).filter(
        (q) => parseInt(q.id) === parseInt(quiz_id)
      )[0];
    }

    setQuiz(quizList);
  };
  const navigateSlide = (index) => {
    if (!isAvailable) return;
    if (quiz.slides[index]) {
      setCurrentSlide(index);
      if (props.noPaging === undefined)
        history.push(makeLinkTo(["?question=" + index]).replace("/", ""));
    }
  };
  const flag = (index) => {
    if (!isAvailable) return;
    let flags = [...flaggedQuestions];
    if (flags.indexOf(index) >= 0) flags.splice(flags.indexOf(index), 1);
    else {
      flags.push(index);
      navigateSlide(index + 1);
    }
    setFlagged(flags);
    window.localStorage["flagged-items"] = JSON.stringify(flags);
  };
  return (
    <Box
      display="flex"
      alignItems="flex-start"
      flexWrap={isMobile ? "wrap" : ""}
      justifyContent="space-between"
      height={props.fullHeight === undefined ? "100vh" : "auto"}
      overflow="auto"
    >
      {quiz && (
        <React.Fragment>
          <Box width="100%">
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
                        time={quiz.duration}
                        started={new Date()}
                      />
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            )}
            {quiz.slides[currentSlide].media && (
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
                    src={quiz.slides[currentSlide].media.large}
                    height="100%"
                    style={{ position: "relative", zIndex: 2 }}
                  />
                  <div
                    style={{
                      background: `url('${quiz.slides[currentSlide].media.thumb}') no-repeat`,
                      backgroundSize: "cover",
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
                                : "default"
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
                          window.localStorage[
                            "answered-questions-" + quiz_id
                          ] = JSON.stringify(e);
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
                      variant="outlined"
                      disabled={currentSlide <= 0 || !isAvailable}
                      onClick={() => navigateSlide(currentSlide - 1)}
                    >
                      Previous Question
                    </Button>
                    {currentSlide === quiz.slides.length - 1 || !isAvailable ? (
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => navigateSlide(currentSlide + 1)}
                      >
                        Submit
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        onClick={() => navigateSlide(currentSlide + 1)}
                      >
                        Next Question
                      </Button>
                    )}
                  </Box>
                </Paper>
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
                        time={quiz.duration}
                        started={new Date()}
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
  );
}

function QuestionsNavigator(props) {
  return (
    <React.Fragment>
      {props.questions.map((q, i) => (
        <Box m={1}>
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
        choices.map((c) => (
          <Box width="46%" m={2}>
            <Button
              fullWidth
              variant="outlined"
              color={
                props.selected
                  ? props.selected.indexOf(c) >= 0
                    ? "primary"
                    : "default"
                  : "default"
              }
              onClick={() => props.onChooseAnwer(c)}
            >
              {c}
            </Button>
          </Box>
        ))
      ) : type === 4 ? (
        choices.map((c) => (
          <Box
            width="100%"
            m={2}
            p={2}
            border={
              "2px " + props.selected && props.selected.indexOf(c) >= 0
                ? "solid"
                : "dashed" + " grey"
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
          value={props.selected ? props.selected[0] : ""}
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

export default AnswerQuiz;
