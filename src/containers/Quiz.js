import React, { useState, useEffect } from "react";
import Toolbar from "../components/quiz/Toolbar";
import SlideContainer, { Slide, SlideRenderer } from "../components/quiz/Slide";
import {
  Box,
  Button,
  IconButton,
  Icon,
  Dialog,
  Typography,
  withStyles,
  DialogTitle as MuiDialogTitle,
  DialogContent,
  Slide as MuiSlide,
  DialogActions,
} from "@material-ui/core";
import { connect } from "react-redux";
import moment from "moment";
import AnswerQuiz from "../screens/class/AnswerQuiz";
import { useHistory } from "react-router-dom";
import { makeLinkTo } from "../components/router-dom";
const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});
const Transition = React.forwardRef(function Transition(props, ref) {
  return <MuiSlide direction="up" ref={ref} {...props} />;
});
const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <Icon>close</Icon>
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

function Quiz(props) {
  const { schedule_id, quiz_id } = props.match.params;
  const [ID, setID] = useState(2);
  const [totalScore, setTotalScore] = useState(0);
  const history = useHistory();
  const [confirmed, setConfirmed] = useState();
  const [modified, setModified] = useState(false);
  const [viewableSlide, setViewableSlide] = useState([0, 1, 2, 3]);
  const slideTemplate = {
    choices: ["", "", "", ""],
    type: 1,
    score: 100,
  };
  const [quiz, setQuiz] = useState(
    quiz_id &&
      JSON.parse(window.localStorage["quiz-items"]).filter(
        (i) => i.id === parseInt(quiz_id)
      )[0]
      ? JSON.parse(window.localStorage["quiz-items"]).filter(
          (i) => i.id === parseInt(quiz_id)
        )[0]
      : {
          title: "Untitled Quiz " + moment(new Date()).format("MM-DD-YYYY"),
          duration: 60000 * 10,
          slides: [
            {
              id: 1,
              choices: ["", "", "", ""],
              type: 1,
              score: 100,
            },
          ],
        }
  );
  const [currentSlide, setCurrentSlide] = useState(0);
  useEffect(() => {
    let s = document.querySelector("#slide-container");
    let x = document.querySelector("#selected-slide");
    if (x && s)
      s.scrollTop = x.offsetTop - (s.clientHeight / 2 - x.clientHeight / 2);
  }, [currentSlide]);
  useEffect(() => {
    let total = 0;
    quiz.slides.forEach((i) => {
      let score = i.score ? parseInt(i.score) : 0;
      total += score;
    });
    setModified(true);
    setTotalScore(total);
  }, [quiz.slides]);
  useEffect(() => {
    document
      .querySelector("#slide-container")
      .addEventListener("scroll", () => setViewableSlide(getViewableSlides()));
  }, []);
  const getViewableSlides = () => {
    let s = document.querySelector("#slide-container");
    let containerHeight = s.clientHeight;
    let slideHeight = 232;
    let totalViewableSlides = Math.ceil(containerHeight / slideHeight) + 2;
    let containerViewport = s.scrollTop + s.clientHeight;
    let range = Math.ceil(containerViewport / slideHeight);
    let viewable = [];
    for (let i = 0; i < totalViewableSlides; i++) {
      viewable.push(range - i);
    }
    return viewable;
  };
  const handleNavigate = (d) => {
    switch (d) {
      case "NEXT":
        if (currentSlide < quiz.slides.length - 1)
          setCurrentSlide(currentSlide + 1);
        else setCurrentSlide(0);
        break;
      case "BEFORE":
        if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
        else setCurrentSlide(quiz.slides.length - 1);
        break;
    }
  };
  const handleSave = (items, callback) => {
    setTimeout(() => {
      let storage = window.localStorage["quiz-items"];
      items.total_score = totalScore;
      items.schedule = schedule_id ? schedule_id : null;
      callback();
      if (storage) {
        let s = JSON.parse(storage);
        if (!items.id) {
          items.id = s.length + 1;
          s.push(items);
        } else
          s.map((ss, ii) => {
            if (ss.id === items.id) s[ii] = items;
          });

        window.localStorage["quiz-items"] = JSON.stringify(s);
      } else {
        if (!items.id) items.id = 1;

        window.localStorage["quiz-items"] = JSON.stringify([items]);
      }
      if (!quiz_id) {
        history.push(makeLinkTo(["quiz", schedule_id, items.id]));
      } else {
        setModified(false);
        setQuiz(items);
      }
    }, 2000);
  };
  const handleCreateSlide = () => {
    let s = [...quiz.slides, { ...slideTemplate, id: ID }];
    setID(ID + 1);
    setQuiz({ ...quiz, slides: s });
    setCurrentSlide(s.length - 1);
  };
  return (
    <Box
      overflow="auto"
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
    >
      {confirmed && (
        <Dialog
          open={confirmed ? true : false}
          onClose={() => setConfirmed(null)}
        >
          <DialogTitle>{confirmed.title}</DialogTitle>
          <DialogContent>{confirmed.message}</DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setConfirmed(null);
              }}
            >
              No
            </Button>

            <Button
              color="primary"
              variant="contained"
              onClick={() => confirmed.yes()}
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      )}
      <Dialog
        open={props.location.hash === "#preview"}
        onClose={() => history.push("#")}
        fullScreen={true}
        TransitionComponent={Transition}
      >
        <DialogTitle onClose={() => history.push("#")}>Preview</DialogTitle>
        <DialogContent>
          <AnswerQuiz noPaging={true} fullHeight match={props.match} />
        </DialogContent>
      </Dialog>
      <Box display="flex" alignItems="flex-start" height="100%" width="100%">
        <SlideContainer
          id="slide-container"
          onNavigate={(d) => handleNavigate(d)}
          style={{ outline: "none" }}
          onMouseOver={() => {
            document.querySelector("#add-slide").style.display = "block";
          }}
          onMouseOut={() => {
            document.querySelector("#add-slide").style.display = "none";
          }}
          onChange={(index) => setCurrentSlide(index)}
          slides={quiz.slides}
          selected={currentSlide}
          score={totalScore}
        >
          {quiz.slides.map((s, i) =>
            viewableSlide.indexOf(i) >= 0 ? (
              <Slide
                key={i}
                index={i + 1}
                onChange={(s, index) => {
                  setCurrentSlide(index);
                }}
                item={{ ...s, index: i }}
                selected={currentSlide === i}
                onAddSlide={(i) => {
                  let newSlide = { ...slideTemplate, id: ID };
                  let oldslides = [...quiz.slides];
                  oldslides.splice(i, 1, ...[oldslides[i], newSlide]);
                  setID(ID + 1);
                  setQuiz({ ...quiz, slides: oldslides });
                  setCurrentSlide(i + 1);
                }}
                onReposition={(indexFrom, indexTo, pos = null) => {
                  if (!quiz.slides[indexTo] || !quiz.slides[indexFrom]) return;
                  let oldSlides = [...quiz.slides];
                  oldSlides.splice(
                    indexTo,
                    1,
                    ...[oldSlides[indexFrom], oldSlides[indexTo]]
                  );
                  oldSlides.splice(indexFrom + 1, 1);
                  setQuiz({ ...quiz, slides: oldSlides });
                  console.log(indexFrom, indexTo);
                  setCurrentSlide(pos ? pos : indexTo);
                }}
                onDelete={(i) =>
                  setConfirmed({
                    title: "Delete Slide",
                    message: "Are you sure you want to delete this slide?",
                    yes: () => {
                      let s = [...quiz.slides];
                      s.splice(i, 1);
                      if (!s.length) {
                        setQuiz({
                          ...quiz,
                          slides: [{ ...slideTemplate, id: 1 }],
                        });
                      } else {
                        setQuiz(() => {
                          if (s[i]) setCurrentSlide(i);
                          return { ...quiz, slides: s };
                        });
                      }
                      setConfirmed(null);
                    },
                  })
                }
              />
            ) : (
              <div style={{ height: 232, width: "100%" }}></div>
            )
          )}
          <Slide
            id="add-slide"
            style={{
              position: "sticky",
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
            }}
            onClick={handleCreateSlide}
          />
        </SlideContainer>
        <Box
          width="100%"
          position="relative"
          height="100%"
          overflow="hidden"
          display="flex"
          flexDirection="column"
        >
          <Toolbar
            modified={modified}
            preview={quiz.id ? true : false}
            onSave={(callback) => handleSave(quiz, callback)}
            navigate={(d) => handleNavigate(d)}
            {...props}
          />
          <Box height="100%" overflow="auto">
            <SlideRenderer
              {...props}
              slide={quiz.slides[currentSlide]}
              quiz={quiz}
              onChange={(s, q = null) => {
                setQuiz(() => {
                  let ss = [...quiz.slides];
                  ss.forEach((i, ii) => {
                    if (i.id === s.id) ss[ii] = s;
                  });
                  return { ...quiz, ...(q ? q : {}), slides: ss };
                });
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default connect()(Quiz);
