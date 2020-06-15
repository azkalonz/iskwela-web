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
  const getQuiz = () => {
    let quizList = window.localStorage["quiz-items"];

    if (quizList) {
      quizList = JSON.parse(quizList).filter(
        (q) => parseInt(q.id) === parseInt(quiz_id)
      )[0];
    }
    console.log("aaa", quizList, props.id);

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
                <Typography color="textSecondary">Time Remaining</Typography>
                <Typography variant="h5">
                  <CountDown
                    onTimesUp={() => setAvailable(false)}
                    time={quiz.duration}
                    started="Mon Jun 15 2020 15:50:50 GMT+0800 (Philippine Standard Time)"
                  />
                </Typography>
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
              <Typography color="textSecondary">Question</Typography>
              <Box
                display="flex"
                alignItems="flex-start"
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="h4">
                    {currentSlide + 1}. {quiz.slides[currentSlide].question}
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
              <Choices question={quiz.slides[currentSlide]} />
            </Box>
            <Box m={2} display="flex" justifyContent="space-between">
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
          </Box>
          <Box
            minWidth={isMobile ? "100%" : 330}
            width={isMobile ? "100%" : 330}
          >
            {!isMobile && (
              <Box textAlign="right" m={3}>
                <Typography color="textSecondary">Time Remaining</Typography>
                <Typography variant="h5">
                  <CountDown
                    onTimesUp={() => setAvailable(false)}
                    time={quiz.duration}
                    started={new Date()}
                  />
                </Typography>
              </Box>
            )}
            <Box>
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
                />
              </Box>
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
              minWidth: 40,
              width: 40,
              height: 40,
              position: "relative",
            }}
            disabled={props.disabled}
            onClick={() => props.onChange(i)}
            variant={props.selected === i ? "contained" : "outlined"}
            color={props.selected === i ? "primary" : "default"}
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
  return (
    <React.Fragment>
      {type === 1 || type === 2 || type === 3 ? (
        choices.map((c) => (
          <Box width="46%" m={2}>
            <Button fullWidth variant="outlined">
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
            border="1px dashed grey"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <div>{c}</div>
            <Checkbox />
          </Box>
        ))
      ) : (
        <TextField fullWidth variant="filled" multiline label="Your Answer" />
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
