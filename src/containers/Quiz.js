import React, { useState, useEffect } from "react";
import Toolbar from "../components/quiz/Toolbar";
import SlideContainer, { Slide, SlideRenderer } from "../components/quiz/Slide";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  IconButton,
  Icon,
  Dialog,
  Typography,
  Tab,
  Tabs,
  withStyles,
  DialogTitle as MuiDialogTitle,
  DialogContent,
  Slide as MuiSlide,
  DialogActions,
  ListItemSecondaryAction,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from "@material-ui/core";
import { connect } from "react-redux";
import moment from "moment";
import AnswerQuiz from "../screens/class/AnswerQuiz";
import { useHistory } from "react-router-dom";
import { makeLinkTo } from "../components/router-dom";
import Api from "../api";
import Pagination, { getPageItems } from "../components/Pagination";
import { SearchInput } from "../components/Selectors";
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
  const handleCreateSlide = (items = null) => {
    let s = [...quiz.slides, { ...(items ? items : slideTemplate), id: ID }];
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
      <Dialog
        maxWidth="md"
        fullWidth
        open={props.location.hash === "#question-bank"}
        onClose={() => history.push("#")}
      >
        <DialogTitle onClose={() => history.push("#")}>Trivia</DialogTitle>
        <DialogContent>
          <QuestionBank
            match={props.match}
            onChange={(e) => {
              handleCreateSlide({
                choices: [e.answer, "", "", ""],
                answers: [e.answer],
                question: e.question,
                type: 1,
                score: 100,
              });
              history.push("#");
            }}
          />
        </DialogContent>
      </Dialog>
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
            document.querySelector("#add-slide").style.display = "flex";
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
          <Box
            justifyContent="space-between"
            alignItems="space-between"
            width="100%"
            id="add-slide"
            style={{
              position: "sticky",
              left: 0,
              display: "none",
              right: 0,
              bottom: 0,
              zIndex: 10,
            }}
          >
            <Slide onClick={() => handleCreateSlide()} />
            <Slide onClick={() => history.push("#question-bank")} />
          </Box>
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
function QuestionBank(props) {
  const [categories, setCategories] = useState([
    {
      id: 42,
      title: "Sports",
      clues_count: 275,
    },
    {
      id: 21,
      title: "Animals",
      clues_count: 260,
    },
    {
      id: 25,
      title: "Science",
      clues_count: 275,
    },
    {
      id: 103,
      title: "Transportation",
      clues_count: 245,
    },
    {
      id: 442,
      title: "People",
      clues_count: 240,
    },
    {
      id: 7,
      title: "US Cities",
      clues_count: 245,
    },
    {
      id: 109,
      title: "State Capitals",
      clues_count: 230,
    },
    {
      id: 114,
      title: "History",
      clues_count: 230,
    },
    {
      id: 1114,
      title: "Annual Events",
      clues_count: 217,
    },
    {
      id: 49,
      title: "Food",
      clues_count: 215,
    },
    {
      id: 530,
      title: "World History",
      clues_count: 150,
    },
  ]);
  const [page, setPage] = useState(1);
  const [qPage, setQPage] = useState(1);
  const [offset, setOffset] = useState(0);
  const [tabValue, setTab] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [cSearch, setCSearch] = useState("");
  const [qSearch, setQSearch] = useState("");
  useEffect(() => {
    getCategories();
  }, []);
  const getCategories = async () => {
    let c = await Api.questions.get("categories?count=100&offset=" + offset);
    setCategories([...categories, ...c]);
    setOffset(offset + 100);
  };
  const getTrivia = async (id = 42) => {
    setTab(1);
    setQuestions({});
    let t = await Api.questions.get("category?id=" + id);
    setQuestions(t);
    setCSearch("");
  };
  const handleChange = (event, newValue) => {
    setTab(newValue);
    if (!questions.clues) getTrivia();
  };
  return (
    <React.Fragment>
      <Tabs value={tabValue} onChange={handleChange}>
        <Tab label="Categories" />
        <Tab label="Trivias" />
      </Tabs>
      <TabPanel value={tabValue} index={0}>
        {!categories && <CircularProgress />}
        {categories && (
          <React.Fragment>
            <SearchInput onChange={(e) => setCSearch(e)} />
            <List>
              {getPageItems(
                categories.filter(
                  (c) => JSON.stringify(c).toLowerCase().indexOf(cSearch) >= 0
                ),
                page
              ).map((c) => (
                <ListItem
                  onClick={() => getTrivia(c.id)}
                  onMouseOver={(e) => (e.target.style.opacity = 0.7)}
                  onMouseOut={(e) => (e.target.style.opacity = 1)}
                >
                  <ListItemText primary={c.title} />
                  <ListItemSecondaryAction>
                    {c.clues_count}
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </React.Fragment>
        )}
        <Pagination
          page={page}
          onChange={(p) => {
            if (p >= Math.ceil(categories.length / 16)) {
              getCategories();
            }
            setPage(p);
          }}
          nolink
          match={props.match}
          noEmptyMessage
          count={categories ? categories.length : 1}
          itemsPerPage={16}
        />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        {!questions.clues && <CircularProgress />}
        {questions.clues && (
          <React.Fragment>
            <SearchInput onChange={(e) => setQSearch(e)} />
            <List>
              {getPageItems(
                questions.clues.filter(
                  (c) => JSON.stringify(c).toLowerCase().indexOf(qSearch) >= 0
                ),
                qPage
              ).map(
                (c) =>
                  c.question && (
                    <ListItem
                      onClick={() => props.onChange(c)}
                      onMouseOver={(e) => (e.target.style.opacity = 0.7)}
                      onMouseOut={(e) => (e.target.style.opacity = 1)}
                    >
                      <ListItemText primary={c.question} />
                    </ListItem>
                  )
              )}
            </List>
          </React.Fragment>
        )}
        <Pagination
          page={qPage}
          onChange={(p) => {
            setQPage(p);
          }}
          nolink
          match={props.match}
          noEmptyMessage
          count={questions.clues ? questions.clues.length : 1}
          itemsPerPage={16}
        />
      </TabPanel>
    </React.Fragment>
  );
}
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <React.Fragment>
      {value === index && <React.Fragment>{children}</React.Fragment>}
    </React.Fragment>
  );
}
TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};
export default connect()(Quiz);
