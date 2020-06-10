import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Typography,
  Box,
  useTheme,
  Input,
  Slide as MuiSlide,
  DialogActions,
  DialogTitle as MuiDialogTitle,
  withStyles,
  Slider,
  TextField,
  Icon,
  IconButton,
  Tooltip,
  Link,
  Dialog,
  DialogContent,
  CircularProgress,
  Button,
} from "@material-ui/core";
import Skeleton from "react-loading-skeleton";
import { useHistory } from "react-router-dom";
import Api from "../../api";
import { SearchInput } from "../../components/Selectors";
import { makeLinkTo } from "../../components/router-dom";
import Pagination, { getPageItems } from "../../components/Pagination";
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
  const history = useHistory();
  const [mediaResult, setMediaResult] = useState({});
  const [errors, setErrors] = useState({});
  useEffect(() => {
    if (props.slide) {
      if (slide && props.slide.id !== slide.id) props.onChange(slide);
      setSlide(props.slide);
    }
  }, [props.slide]);
  const handleChangeAnswer = (index, value) => {
    let s = { ...slide };
    if (!s.answers) s.answers = [];
    if (value) s.answers[index] = value;
    else s.answers[index] = null;
    checkErrors(index, value, s);
    setSlide(s);
    props.onChange(s);
  };
  useEffect(() => {
    searchMedia("school", 1);
  }, []);
  const searchMedia = async (s, p) => {
    setMediaResult(null);
    let r = await Api.pixabay.get({ search: s, page: p });
    if (r) {
      setMediaResult({ ...r, page: p });
    }
  };
  const checkErrors = (index, value = "", s = slide) => {
    let err = { ...errors };
    if (s.answers) {
      if (s.answers.filter((i) => i === value).length > 1)
        err[index] = "Duplicate";
      else delete err[index];
    }

    setErrors(err);
  };
  return (
    <React.Fragment>
      <Dialog
        TransitionComponent={Transition}
        fullScreen={true}
        open={props.location.hash === "#insert_media"}
        onClose={() => history.push("#")}
      >
        <DialogTitle onClose={() => history.push("#")}>
          Insert Media
        </DialogTitle>
        <DialogContent>
          <div
            style={{
              position: "sticky",
              top: 0,
              right: 0,
              left: 0,
              background: "#fff",
              zIndex: 10,
            }}
          >
            <SearchInput
              onChange={(e) => {
                searchMedia(e, 1);
              }}
            />
          </div>
          {!mediaResult && (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress />
            </Box>
          )}
          {mediaResult && mediaResult.total > 0 && mediaResult.hits && (
            <React.Fragment>
              <Box
                display="flex"
                justifyContent="space-around"
                alignItems="center"
                flexWrap="wrap"
                p={2}
              >
                {mediaResult.hits.map((i, ii) => (
                  <Box
                    key={ii}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    overflow="hidden"
                    width={200}
                    position="relative"
                    height={200}
                    onClick={() =>
                      setMediaResult({ ...mediaResult, selected: i })
                    }
                    tabIndex={ii}
                    style={{
                      cursor: "pointer",
                      border:
                        "2px solid " +
                        (mediaResult &&
                        mediaResult.selected &&
                        mediaResult.selected.id === i.id
                          ? theme.palette.primary.main
                          : "transparent"),
                    }}
                  >
                    <img src={i.previewURL} width="100%" />
                  </Box>
                ))}
              </Box>
            </React.Fragment>
          )}
        </DialogContent>
        <DialogActions>
          <Box p={2}>
            {mediaResult && (
              <Pagination
                match={props.match}
                icon="image_search"
                emptyTitle="Nothing Found"
                emptyMessage="Try a different keyword"
                count={mediaResult.total > 0 ? 26 * 20 : 0}
                page={mediaResult.page}
                nolink
                itemsPerPage={20}
                onChange={(p) => {
                  searchMedia("school", p);
                  setMediaResult({ ...mediaResult, page: p });
                }}
              />
            )}
          </Box>
          <Button variant="outlined" onClick={() => history.push("#")}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={mediaResult && mediaResult.selected ? false : true}
            onClick={() => {
              let r = {
                ...slide,
                media: {
                  thumb: mediaResult.selected.previewURL,
                  large: mediaResult.selected.largeImageURL,
                },
              };
              setSlide(r);
              props.onChange(r);
              history.push("#");
            }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
      {slide && (
        <Box
          p={2}
          width="100%"
          style={{
            background: theme.palette.type === "dark" ? "#111" : "#fff",
          }}
        >
          <Box display="flex" alignItems="center">
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
          </Box>

          <Box
            width="100%"
            height={200}
            p={2}
            style={{ margin: "14px 0" }}
            display="flex"
            justifyContent="center"
            alignItems="center"
            overflow="hidden"
            border={"2px solid " + theme.palette.grey[300]}
          >
            {slide.media ? (
              <img src={slide.media.large} height="100%" />
            ) : (
              <React.Fragment>
                <Typography variant="h6" color="textSecondary">
                  <Link href="#insert_media">Insert Media</Link>
                </Typography>
              </React.Fragment>
            )}
          </Box>
          <Box p={2}>
            <Typography variant="body2" color="textSecondary">
              Type
            </Typography>
          </Box>
          <Box className={styles.slideAnswer}>
            {[0, 1, 2, 3].map((a, i) => (
              <Box key={i} style={{ position: "relative" }}>
                <TextField
                  type="text"
                  label={"Answer " + String.fromCharCode(65 + i)}
                  value={
                    slide.answers && slide.answers[i] ? slide.answers[i] : ""
                  }
                  variant="filled"
                  fullWidth
                  onChange={(e) => handleChangeAnswer(i, e.target.value)}
                  error={errors && errors[i] ? true : false}
                  helperText={errors && errors[i] ? errors[i] : ""}
                />
                <IconButton
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 5,
                  }}
                  onClick={() => {
                    if (!slide.answers || (slide.answers && !slide.answers[i]))
                      checkErrors(i);
                    let correct_answers = slide.correct_answers
                      ? [...slide.correct_answers]
                      : [];
                    if (slide.answers && slide.answers[i]) {
                      if (correct_answers.indexOf(slide.answers[i]) >= 0)
                        correct_answers.splice(
                          correct_answers.indexOf(slide.answers[i]),
                          1
                        );
                      else correct_answers.push(slide.answers[i]);
                    }
                    let s = { ...slide, correct_answers };
                    setSlide(s);
                    props.onChange(s);
                  }}
                >
                  <Icon
                    color={
                      slide.correct_answers &&
                      slide.answers &&
                      slide.answers[i] &&
                      slide.correct_answers.indexOf(slide.answers[i]) >= 0
                        ? "primary"
                        : "disabled"
                    }
                  >
                    check_circle
                  </Icon>
                </IconButton>
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
                <img src={props.item.media.thumb} width="70%" />
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
          tabIndex={i}
          onKeyDown={(e) => e.which === 27 && setOpen(false)}
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
