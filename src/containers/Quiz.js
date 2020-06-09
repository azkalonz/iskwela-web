import React, { useState, useEffect } from "react";
import Toolbar from "../components/quiz/Toolbar";
import SlideContainer, { Slide, SlideRenderer } from "../components/quiz/Slide";
import { Box, Button, IconButton, Icon } from "@material-ui/core";
import { connect } from "react-redux";

function Quiz(props) {
  const [slides, setSlides] = useState([
    {
      id: 1,
      question: "test",
      duration: 20000,
      score: 500,
    },
    {
      id: 2,
      duration: 60000,
      score: 100,
    },
    {
      id: 3,
      duration: 60000,
      score: 600,
    },
  ]);
  const [currentSlide, setCurrentSlide] = useState();
  useEffect(() => {
    let s = document.querySelector("#slide-container");
    let x = document.querySelector("#selected-slide");
    if (x && s)
      s.scrollTop = x.offsetTop - (s.clientHeight / 2 - x.clientHeight / 2);
  }, [currentSlide]);
  const handleNavigate = (d) => {
    switch (d) {
      case "NEXT":
        if (!currentSlide && slides[1]) {
          setCurrentSlide({ ...slides[1], index: 1 });
        } else if (slides[currentSlide.index + 1]) {
          let s = currentSlide.index + 1;
          setCurrentSlide({
            ...slides[s],
            index: s,
          });
        } else
          setCurrentSlide({
            ...slides[0],
            index: 0,
          });
        break;
      case "BEFORE":
        if (!currentSlide) {
          setCurrentSlide({
            ...slides[slides.length - 1],
            index: slides.length - 1,
          });
        } else if (slides[currentSlide.index - 1])
          setCurrentSlide({
            ...slides[currentSlide.index - 1],
            index: currentSlide.index - 1,
          });
        else
          setCurrentSlide({
            ...slides[slides.length - 1],
            index: slides.length - 1,
          });
        break;
    }
  };
  return (
    <Box
      overflow="auto"
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
    >
      <Box display="flex" alignItems="flex-start" height="100%" width="100%">
        <SlideContainer
          id="slide-container"
          onNavigate={handleNavigate}
          style={{ outline: "none" }}
          onMouseOver={() => {
            document.querySelector("#add-slide").style.display = "block";
          }}
          onMouseOut={() => {
            document.querySelector("#add-slide").style.display = "none";
          }}
        >
          {slides.map((s, i) => (
            <Slide
              key={i}
              onChange={(s, i) => setCurrentSlide({ ...s, index: i })}
              item={{ ...s, index: i }}
              selected={
                !currentSlide
                  ? i === 0
                  : currentSlide.id === s.id
                  ? true
                  : false
              }
              onDelete={(i) => {
                setSlides(() => {
                  let s = [...slides];
                  s.splice(i, 1);
                  return s;
                });
                setTimeout(() => {
                  if (slides[i + 1])
                    setCurrentSlide({ ...slides[i + 1], index: i + 1 });
                  else if (slides[i - 1])
                    setCurrentSlide({ ...slides[i - 1], index: i - 1 });
                  else if (slides[slides.length - 1])
                    setCurrentSlide({
                      ...slides[slides.length - 1],
                      index: slides.length - 1,
                    });
                }, 0);
              }}
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
            onClick={() => {
              setSlides([...slides, { id: slides.length + 1 }]);
            }}
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
          <Toolbar />
          <Box height="100%" overflow="auto">
            <SlideRenderer
              slide={currentSlide ? currentSlide : slides[0]}
              onChange={(s) => {
                setSlides(() => {
                  let ss = [...slides];
                  ss.forEach((i, ii) => {
                    if (i.id === s.id) ss[ii] = s;
                  });
                  return ss;
                });
              }}
            />
            <Box display="flex" justifyContent="space-between" p={2}>
              <IconButton onClick={() => handleNavigate("BEFORE")}>
                <Icon>navigate_before</Icon>
              </IconButton>
              <IconButton onClick={() => handleNavigate("NEXT")}>
                <Icon>navigate_next</Icon>
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default connect()(Quiz);
