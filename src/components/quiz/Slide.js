import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Typography,
  Box,
  useTheme,
  Input,
  Slide as MuiSlide,
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
  DialogTitle as MuiDialogTitle,
  withStyles,
  Slider,
  TextField,
  Icon,
  IconButton,
  Tooltip,
  Select,
  Link,
  Dialog,
  DialogContent,
  CircularProgress,
  Button,
  Toolbar,
} from "@material-ui/core";
import Skeleton from "react-loading-skeleton";
import { useHistory } from "react-router-dom";
import Api from "../../api";
import { SearchInput } from "../../components/Selectors";
import { makeLinkTo } from "../../components/router-dom";
import Pagination, { getPageItems } from "../../components/Pagination";
import { MultipleChoice, TrueOrFalse, ShortAnswer } from "./questionTypes";

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

const scoreValues = [
  {
    value: 100,
    label: "100",
  },
  {
    value: 500,
    label: "500",
  },
  {
    value: 1000,
    label: "1000",
  },
];

const useStyles = makeStyles((theme) => ({
  container: {
    height: "100%",
    display: "inline-block",
    background: theme.palette.grey[100],
    overflow: "auto",
    minWidth: 290,
    width: 290,
  },

  slideContainer: {
    background: theme.palette.type === "dark" ? "#111" : "#fff",
    border: "2px solid",
    position: "relative",
    margin: theme.spacing(2),
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
  const [hasUpload, setHasUpload] = useState(false);
  useEffect(() => {
    if (props.slide) {
      if (slide && props.slide.id !== slide.id) props.onChange(slide);
      setSlide(props.slide);
    } else setSlide(null);
  }, [props.slide]);
  const handleChangeChoice = (index, value) => {
    let s = { ...slide };
    if (!s.choices) s.choices = [];
    if (value) s.choices[index] = value;
    else s.choices[index] = "";
    checkErrors(index, value, s);
    setSlide(s);
    props.onChange(s);
  };
  useEffect(() => {
    searchMedia("school", 1);
  }, []);
  useEffect(() => {
    if (slide)
      if (slide.choices) slide.choices.forEach((c, i) => checkErrors(i, c));
  }, [slide]);
  const searchMedia = async (s, p) => {
    setMediaResult(null);
    let r = await Api.pixabay.get({ search: s, page: p });
    if (r) {
      setMediaResult({ ...r, search: s, page: p });
    }
  };
  const checkErrors = (index, value = "", s = slide) => {
    let err = { ...errors };
    if (s.choices) {
      if (s.choices.filter((i) => i === value).length > 1 && value !== "")
        err[index] = "Duplicate";
      else delete err[index];
    }
    setErrors(err);
  };
  const handleSelectMedia = () => {
    let r = {
      ...slide,
      media: {
        thumb: !hasUpload ? mediaResult.selected.previewURL : hasUpload,
        large: !hasUpload ? mediaResult.selected.previewURL : hasUpload,
      },
    };
    setSlide(r);
    props.onChange(r);
    document.querySelector("#upload-file").value = "";
    setHasUpload(false);
    history.push("#");
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
              display: "flex",
              alignItems: "center",
              width: "100%",
              zIndex: 10,
            }}
          >
            <SearchInput
              quickSearch={false}
              style={{ width: "100%" }}
              onChange={(e) => {
                searchMedia(e, 1);
              }}
            />
            <input
              type="file"
              id="upload-file"
              style={{ display: "none" }}
              accept="image/x-png,image/gif,image/jpeg"
              onChange={(e) =>
                setHasUpload(URL.createObjectURL(e.target.files[0]))
              }
            />
            <Box m={2}>
              <Button
                variant="contained"
                onClick={() => document.querySelector("#upload-file").click()}
              >
                Upload<Icon>publish</Icon>
              </Button>
            </Box>
          </div>
          {hasUpload && (
            <Box textAlign="center" height="100%" position="relative">
              <img src={hasUpload} height="100%" width="auto" />
              <IconButton
                style={{ position: "absolute", top: 0, right: 0 }}
                onClick={() => {
                  document.querySelector("#upload-file").value = "";
                  setHasUpload(false);
                }}
              >
                <Icon>close</Icon>
              </IconButton>
            </Box>
          )}
          {!hasUpload && !mediaResult && (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress />
            </Box>
          )}
          {!hasUpload &&
            mediaResult &&
            mediaResult.total > 0 &&
            mediaResult.hits && (
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
                      onDoubleClick={handleSelectMedia}
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
          <Box p={2}>
            {mediaResult && mediaResult.hits && !mediaResult.hits.length && (
              <React.Fragment>
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
                    searchMedia(mediaResult.search, p);
                  }}
                />
              </React.Fragment>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Box p={2}>
            {mediaResult && mediaResult.hits && mediaResult.hits.length && (
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
                  searchMedia(mediaResult.search, p);
                }}
              />
            )}
          </Box>
          <Button
            variant="outlined"
            onClick={() => {
              document.querySelector("#upload-file").value = "";
              setHasUpload(false);
              history.push("#");
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={
              mediaResult && mediaResult.selected
                ? false
                : hasUpload
                ? false
                : true
            }
            onClick={handleSelectMedia}
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
            minHeight: "100%",
          }}
        >
          <Dialog
            TransitionComponent={Transition}
            maxWidth="md"
            fullWidth
            onClose={() => history.push("#")}
            open={props.location.hash === "#settings"}
          >
            <DialogTitle onClose={() => history.push("#")}>
              Quiz Settings
            </DialogTitle>
            <DialogContent>
              <Box p={2} style={{ width: "100%", position: "relative" }}>
                <TextField
                  type="text"
                  label="Title"
                  value={props.quiz.title}
                  onChange={(e) =>
                    props.onChange({}, { title: e.target.value })
                  }
                  variant="filled"
                  fullWidth
                />
              </Box>
              <Box p={2}>
                <Typography variant="body1" color="textSecondary">
                  Duration
                </Typography>
                <ValuePicker
                  size={50}
                  color="#fff"
                  textColor={theme.palette.primary.main}
                  value={props.quiz.duration ? props.quiz.duration : 10 * 60000}
                  onChange={(d) => {
                    props.onChange({}, { duration: d });
                  }}
                  values={() =>
                    [10, 20, 30, 40, 50, 60].map((m) => ({
                      value: 6000 * m,
                      label: m + "mins",
                    }))
                  }
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => history.push("#")}
                color="primary"
                variant="contained"
              >
                Done
              </Button>
            </DialogActions>
          </Dialog>
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
                Score
              </Typography>
              <ValuePicker
                size={50}
                value={slide.score ? slide.score : 100}
                onChange={(d) => {
                  let s = { ...slide, score: d };
                  setSlide(s);
                  props.onChange(s);
                }}
                values={scoreValues}
              />
            </Box>
          </Box>
          <Box
            width="100%"
            minHeight={100}
            p={2}
            style={{ margin: "14px 0" }}
            display="flex"
            justifyContent="center"
            alignItems="center"
            overflow="hidden"
            position="relative"
            border={"1px dashed " + theme.palette.grey[300]}
          >
            {slide.media ? (
              <React.Fragment>
                <IconButton
                  style={{ position: "absolute", top: 0, right: 0 }}
                  onClick={() => {
                    let s = {
                      ...slide,
                      media: null,
                    };
                    setSlide(s);
                    props.onChange(s);
                  }}
                >
                  <Icon>close</Icon>
                </IconButton>
                <img src={slide.media.thumb} height={300} />
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Button
                  variant="outlined"
                  onClick={() => history.push("#insert_media")}
                >
                  Insert Media
                </Button>
                {/* <Typography variant="h6" color="textSecondary">
                  <Link href="#insert_media"></Link>
                </Typography> */}
              </React.Fragment>
            )}
          </Box>
          <Box marginBottom={2}>
            <FormControl variant="filled">
              <Typography variant="body1" color="textSecondary">
                Question Type
              </Typography>
              <Select
                value={parseInt(slide.type)}
                padding={10}
                onChange={(e) => {
                  let s = {
                    ...{ ...slide, answers: null, choices: ["", "", "", ""] },
                    type: parseInt(e.target.value),
                  };
                  setSlide(s);
                  props.onChange(s);
                }}
              >
                <MenuItem value={1}>Multiple Choice</MenuItem>
                <MenuItem value={2}>True or False</MenuItem>
                <MenuItem value={3}>Yes or No</MenuItem>
                <MenuItem value={4}>Checkbox</MenuItem>
                <MenuItem value={5}>Short Answer</MenuItem>
              </Select>
            </FormControl>
          </Box>
          {slide.type === 1 ? (
            <MultipleChoice
              onChange={(question) => {
                let s = {
                  ...slide,
                  ...(question.choices && { choices: [...question.choices] }),
                  ...(question.answers && {
                    answers: question.answers,
                  }),
                };
                setSlide(s);
                props.onChange(s);
              }}
              answers={slide.answers ? slide.answers : []}
              errors={errors}
              choices={slide.choices}
              onChoiceChange={(index, ans) => handleChangeChoice(index, ans)}
            />
          ) : slide.type === 2 ? (
            <TrueOrFalse
              values={["True", "False"]}
              onChange={(question) => {
                let s = {
                  ...slide,
                  ...(question.choices && { choices: [...question.choices] }),
                  ...(question.answers && {
                    answers: question.answers,
                  }),
                };
                setSlide(s);
                props.onChange(s);
              }}
              answers={slide.answers ? slide.answers : []}
              errors={errors}
              onChoiceChange={(index, ans) => handleChangeChoice(index, ans)}
            />
          ) : slide.type === 3 ? (
            <TrueOrFalse
              values={["Yes", "No"]}
              onChange={(question) => {
                let s = {
                  ...slide,
                  ...(question.choices && { choices: [...question.choices] }),
                  ...(question.answers && {
                    answers: question.answers,
                  }),
                };
                setSlide(s);
                props.onChange(s);
              }}
              answers={slide.answers ? slide.answers : []}
              errors={errors}
              onChoiceChange={(index, ans) => handleChangeChoice(index, ans)}
            />
          ) : slide.type === 4 ? (
            <MultipleChoice
              icon="check_box"
              fullWidth
              onChange={(question) => {
                let s = {
                  ...slide,
                  ...(question.choices && { choices: [...question.choices] }),
                  ...(question.answers && {
                    answers: question.answers,
                  }),
                };
                setSlide(s);
                props.onChange(s);
              }}
              answers={slide.answers ? slide.answers : []}
              errors={errors}
              choices={slide.choices}
              onChoiceChange={(index, ans) => handleChangeChoice(index, ans)}
            />
          ) : (
            <ShortAnswer />
          )}
        </Box>
      )}
    </React.Fragment>
  );
}
function SlideContainer(props) {
  const theme = useTheme();
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
      <Toolbar
        style={{
          position: "sticky",
          top: 0,
          display: "flex",
          alignItems: "center",
          left: 0,
          justifyContent: "space-between",
          right: 0,
          zIndex: 10,
          background: theme.palette.grey[200],
        }}
      >
        <div
          style={{
            position: "sticky",
            display: "flex",
            alignItems: "center",
            color: theme.palette.primary.main,
          }}
        >
          <Icon>star</Icon>
          {props.score}
        </div>
        <div>
          <IconButton onClick={() => props.onNavigate("BEFORE")}>
            <Icon>navigate_before</Icon>
          </IconButton>
          <IconButton onClick={() => props.onNavigate("NEXT")}>
            <Icon>navigate_next</Icon>
          </IconButton>
        </div>
      </Toolbar>
      <Box p={2}>
        <FormControl variant="filled" style={{ width: "100%" }}>
          <Select
            label="Schedule"
            padding={10}
            value={props.selected}
            onChange={(e) => props.onChange(parseInt(e.target.value))}
          >
            {props.slides.map((s, i) => (
              <MenuItem value={i}>
                {i + 1}. {s.question ? s.question : "Blank slide"}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
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
    >
      {props.item ? (
        <React.Fragment>
          {props.index}
          <div
            className="slide-actions"
            style={{
              position: "absolute",
              top: 7,
              right: 7,
              zIndex: 12,
            }}
          >
            <div>
              <IconButton
                onClick={() =>
                  props.onReposition(props.index - 1, props.index - 2)
                }
              >
                <Icon>expand_less</Icon>
              </IconButton>
            </div>
            <div>
              <IconButton
                onClick={() =>
                  props.onReposition(props.index, props.index - 1, props.index)
                }
              >
                <Icon>expand_more</Icon>
              </IconButton>
            </div>
          </div>
          <div
            onClick={(e) => {
              if (props.item) props.onChange(props.item, props.item.index);
            }}
          >
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
                {props.item.score && (
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
                      {props.item.score}
                    </div>
                  </div>
                )}
              </Box>
            </div>
            <div style={{ marginBottom: 0 }}>
              <Box
                display="flex"
                width="100%"
                alignItems="stretch"
                justifyContent="space-between"
                flexWrap="wrap"
                className={styles.answerprev}
              >
                {props.item.choices &&
                  props.item.choices
                    .slice(
                      0,
                      props.item.type === 1 ? 4 : props.item.type === 5 ? 1 : 2
                    )
                    .map((c, i) => (
                      <Box
                        key={i}
                        style={{
                          ...(props.item.type === 5 ? { width: "100%" } : {}),
                        }}
                      >
                        {props.item.choices && props.item.choices[i]
                          ? props.item.choices[i]
                          : String.fromCharCode(160)}
                      </Box>
                    ))}
              </Box>
            </div>
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
          <Tooltip title="Add">
            <IconButton onClick={() => props.onAddSlide(props.item.index)}>
              <Icon>add</Icon>
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
  const values =
    typeof props.values === "function" ? props.values() : props.values;
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
      {values.map((s, i) => (
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
            ...(props.value === s.value && styles.value),
          }}
        >
          {s.label}
        </div>
      ))}
    </div>
  );
}
export default SlideContainer;
