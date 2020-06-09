import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Typography,
  Box,
  useTheme,
  Input,
  Slider,
  TextField,
  Icon,
  IconButton,
  Tooltip,
} from "@material-ui/core";
import Skeleton from "react-loading-skeleton";

const durationValues = [
  {
    value: 1000 * 20,
    label: "20s",
  },
  {
    value: 1000 * 30,
    label: "30s",
  },
  {
    value: 1000 * 60,
    label: "60s",
  },
];
const scoreValues = [
  {
    value: 100,
    label: "100pts",
  },
  {
    value: 500,
    label: "500pts",
  },
  {
    value: 1000,
    label: "1000pts",
  },
];

const useStyles = makeStyles((theme) => ({
  container: {
    height: "100%",
    display: "inline-block",
    background: theme.palette.grey[100],
    borderRight: "2px solid rgba(0, 0, 0, 0.12)",
    padding: theme.spacing(2),
    overflow: "auto",
    minWidth: 290,
  },
  slideAnswer: {
    width: "100%",
    display: "flex",
    flexWrap: "wrap",
    alignContent: "center",
    justifyContent: "space-between",
    "&>div": {
      width: "49%",
      marginBottom: theme.spacing(2),
    },
  },
  slideContainer: {
    background: theme.palette.type === "dark" ? "#111" : "#fff",
    border: "2px solid",
    position: "relative",
    borderColor: theme.palette.grey[300],
    width: 250,
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: 7,
    "&:hover": {
      background: theme.palette.primary.main + "3f",
      cursor: "pointer",
    },
    "& > div": {
      marginBottom: 8,
    },
    "& > .slide-actions": {
      opacity: 0,
      transition: "opacity 0.2s ease-in-out",
    },
    "&:hover > .slide-actions": {
      opacity: 1,
    },
  },
  answerprev: {
    "& > div": {
      padding: 4,
      margin: 4,
      borderRadius: 4,
      width: "45%",
      background: theme.palette.grey[200],
    },
  },
  valuePicker: {
    "&:hover": {
      transform: "scale(1.1)",
    },
  },
}));
export function SlideRenderer(props) {
  const [slide, setSlide] = useState();
  const theme = useTheme();
  const styles = useStyles();
  useEffect(() => {
    if (props.slide) {
      if (slide && props.slide.id !== slide.id) props.onChange(slide);
      setSlide(props.slide);
    }
  }, [props.slide]);
  const handleChangeAnswer = (index, value) => {
    let s = { ...slide };
    if (!s.answers) s.answers = [];
    s.answers[index] = value;
    setSlide(s);
    props.onChange(s);
  };
  return (
    <React.Fragment>
      {slide && (
        <Box
          p={2}
          width="100%"
          style={{
            background: theme.palette.type === "dark" ? "#111" : "#fff",
          }}
        >
          <TextField
            fullWidth
            value={slide.question ? slide.question : ""}
            label="Question"
            multiline
            variant="filled"
            onChange={(e) => {
              let s = { ...slide, question: e.target.value };
              setSlide(s);
              props.onChange(s);
            }}
          />
          <Box display="flex">
            <Box m={2} width={200} style={{ marginRight: 43 }}>
              <Typography variant="body1" color="textSecondary">
                Score
              </Typography>
              <Slider
                value={slide.score ? slide.score.toString() : ""}
                getAriaValueText={(v) => v}
                aria-labelledby="discrete-slider-custom"
                step={100}
                min={100}
                max={1000}
                valueLabelDisplay="auto"
                marks={scoreValues}
                onChange={(e, v) => {
                  setSlide({ ...slide, score: v });
                  props.onChange(slide);
                }}
              />
            </Box>
            <Box m={2}>
              <Typography variant="body1" color="textSecondary">
                Duration
              </Typography>
              <ValuePicker
                size={60}
                value={
                  slide.duration
                    ? {
                        value: slide.duration,
                        label: slide.duration / 1000 + "s",
                      }
                    : {
                        value: 20000,
                        label: "20s",
                      }
                }
                onChange={(d) => {
                  setSlide({ ...slide, duration: d });
                  props.onChange({ ...slide, duration: d });
                }}
                values={durationValues}
              />
            </Box>
          </Box>
          <Box
            width="100%"
            height={400}
            p={2}
            style={{ margin: "14px 0" }}
            display="flex"
            justifyContent="center"
            alignItems="center"
            overflow="hidden"
            border={"2px solid " + theme.palette.grey[300]}
          >
            {slide.media ? (
              <img src="http://localhost:3000/logo192.png" width="700" />
            ) : (
              <React.Fragment>
                <Typography variant="h5" color="textSecondary">
                  Insert Media
                </Typography>
              </React.Fragment>
            )}
          </Box>
          <Box className={styles.slideAnswer}>
            {[0, 1, 2, 3].map((a, i) => (
              <Box key={i}>
                <TextField
                  type="text"
                  label={"Answer " + String.fromCharCode(65 + i)}
                  value={
                    slide.answers && slide.answers[i] ? slide.answers[i] : ""
                  }
                  variant="filled"
                  fullWidth
                  onChange={(e) => handleChangeAnswer(i, e.target.value)}
                />
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </React.Fragment>
  );
}
function SlideContainer(props) {
  const styles = useStyles();
  return (
    <div
      tabIndex={0}
      className={styles.container}
      onKeyDown={(e) => {
        let d = e.which;
        if (d === 38 || d === 37) props.onNavigate("BEFORE");
        if (d === 40 || d === 39) props.onNavigate("NEXT");
      }}
      {...props}
    >
      {props.children}
    </div>
  );
}
export function Slide(props) {
  const theme = useTheme();
  const styles = useStyles();
  return (
    <div
      className={styles.slideContainer}
      id={props.selected ? "selected-slide" : ""}
      style={
        props.selected
          ? {
              borderColor: theme.palette.primary.main,
              ...(props.style ? props.style : {}),
            }
          : {
              ...(props.style ? props.style : {}),
            }
      }
      {...props}
      onClick={() => {
        if (props.item) props.onChange(props.item, props.item.index);
        else if (props.onClick) props.onClick();
      }}
    >
      {props.item ? (
        <React.Fragment>
          <div
            style={{
              position: "absolute",
              top: 7,
              right: 7,
            }}
          >
            <Typography color={props.selected ? "primary" : "textSecondary"}>
              {props.item.score ? props.item.score + "pts" : ""}
            </Typography>
          </div>
          <div>
            <Box width="70%">
              <Typography variant="body2" style={{ fontWeight: "bold" }}>
                {props.item.question ? props.item.question : ""}
              </Typography>
            </Box>
          </div>
          <div>
            <Box
              width="100%"
              height={80}
              display="flex"
              alignItems="center"
              justifyContent="center"
              position="relative"
              overflow="hidden"
            >
              {props.item.media ? (
                <img src="http://localhost:3000/logo192.png" width="70%" />
              ) : (
                <div
                  style={{
                    width: "70%",
                    height: "100%",
                    background: theme.palette.grey[200],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon color="disabled" style={{ fontSize: 60 }}>
                    insert_photo
                  </Icon>
                </div>
              )}
              {props.item.duration && (
                <div style={{ position: "absolute", right: 30, bottom: 0 }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      color: props.selected ? "#fff" : "#888",
                      background: props.selected
                        ? theme.palette.primary.main
                        : theme.palette.grey[300],
                      display: "flex",
                      fontSize: 11,
                      fontWeight: "bold",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {props.item.duration / 1000}s
                  </div>
                </div>
              )}
            </Box>
          </div>
          <div style={{ marginBottom: 0 }}>
            <Box
              display="flex"
              width="100%"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              className={styles.answerprev}
            >
              {[0, 1, 2, 3].map((i) => (
                <Box key={i}>
                  {props.item.answers && props.item.answers[i]
                    ? props.item.answers[i]
                    : " "}
                </Box>
              ))}
            </Box>
          </div>
        </React.Fragment>
      ) : (
        <Box width="100%" textAlign="center">
          <Icon>add</Icon>
        </Box>
      )}
      {props.onDelete && (
        <div
          style={{ position: "absolute", bottom: 0, right: 0 }}
          className="slide-actions"
        >
          <Tooltip title="Duplicate">
            <IconButton onClick={() => props.onDelete(props.item.index)}>
              <Icon color="default">file_copy</Icon>
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => props.onDelete(props.item.index)}>
              <Icon color="error">delete</Icon>
            </IconButton>
          </Tooltip>
        </div>
      )}
    </div>
  );
}
export function ValuePicker(props) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const classes = useStyles();
  const size = props.size ? props.size : 50;
  const styles = {
    container: {
      width: size,
      display: "flex",
      alignItems: "center",
      border: "1px solid " + theme.palette.grey[300],
      justifyContent: "center",
      height: size,
      borderRadius: "50%",
      cursor: "pointer",
    },
    value: {
      background: props.color ? props.color : theme.palette.primary.main,
      color: props.textColor ? props.textColor : "#fff",
      boxShadow: "0px 2px 0px 2px rgba(0,0,0,0.1)",
      zIndex: 10,
    },
    values: {
      position: "absolute",
      transition: "left 0.5s cubic-bezier(1, 0.01, 0, 1)",
      top: 0,
      background: "#fff",
      color: "#222",
      zIndex: 5,
    },
  };
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{
        position: "relative",
        transition: "width 0.5s cubic-bezier(1, -0.07, 0, 1.38) ",
        height: size,
        width: open ? props.values.length * (size + 8) : 50,
      }}
    >
      {props.values.map((s, i) => (
        <div
          key={i}
          onClick={() => props.onChange(s.value)}
          className={classes.valuePicker}
          style={{
            left: open ? i * (size + 8) : 0,
            zIndex: 1,
            ...styles.container,
            ...styles.values,
            ...(props.value.value === s.value && styles.value),
          }}
        >
          {s.label}
        </div>
      ))}
    </div>
  );
}
export default SlideContainer;
