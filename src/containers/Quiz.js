import React, { useState, useEffect } from "react";
import Toolbar from "../components/quiz/Toolbar";
import SlideContainer, { Slide, SlideRenderer } from "../components/quiz/Slide";
import {
  Box,
  Button,
  IconButton,
  Icon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@material-ui/core";
import { connect } from "react-redux";
import moment from "moment";

function Quiz(props) {
  const [ID, setID] = useState(2);
  const [totalScore, setTotalScore] = useState(0);
  const [confirmed, setConfirmed] = useState();
  const slideTemplate = {
    choices: ["", "", "", ""],
    type: 1,
    score: 100,
  };
  const [quiz, setQuiz] = useState({
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
  });
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
    setTotalScore(total);
  }, [quiz.slides]);

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

  const handleSave = (s) => console.log(s);
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
          {quiz.slides.map((s, i) => (
            <Slide
              key={i}
              index={i + 1}
              onChange={(s, i) => setCurrentSlide(i)}
              item={{ ...s, index: i }}
              selected={currentSlide === i}
              onAddSlide={(i) => {
                let newSlide = { ...slideTemplate, id: ID };
                let oldslides = [...quiz.slides];
                oldslides.splice(i, 1, ...[oldslides[i], newSlide]);
                setID(ID + 1);
                setQuiz({ ...quiz, slides: oldslides });
              }}
              onReposition={(indexFrom, indexTo, pos = null) => {
                if (!quiz.slides[indexTo]) return;
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
          ))}
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
            onSave={() => handleSave(quiz)}
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
