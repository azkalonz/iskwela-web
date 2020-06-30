import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { makeLinkTo } from "../../components/router-dom";
import {
  IconButton,
  Icon,
  Box,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  DialogTitle as MuiDialogTitle,
  DialogContent,
  DialogActions,
  withStyles,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  useTheme,
  useMediaQuery,
  Dialog,
  TextField,
} from "@material-ui/core";
import moment from "moment";
import Pagination, { getPageItems } from "../../components/Pagination";
import { SearchInput } from "../../components/Selectors";
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
function Scores(props) {
  const query = require("query-string").parse(window.location.search);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { class_id, schedule_id } = props.match.params;
  const [quiz, setQuiz] = useState();
  const [page, setPage] = useState(query.page ? parseInt(query.page) : 1);
  const [search, setSearch] = useState("");
  const [currentStudent, setStudent] = useState();
  useEffect(() => {
    if (props.questionnaires && query.quiz_id) {
      let q = props.questionnaires.find(
        (qq) => qq.id === parseInt(query.quiz_id)
      );
      if (q) setQuiz(q);
      console.log(q);
    }
  }, [props.questionnaires]);
  useEffect(() => {
    if (query.add_score) {
      setStudent(
        props.classDetails[class_id].students.find(
          (s) => s.id === parseInt(query.add_score)
        )
      );
    }
  }, [query.add_score]);
  const addScore = {
    close: () =>
      props.history.push(
        makeLinkTo(["class", class_id, schedule_id, "scores", "q", "p"], {
          q: "?quiz_id=" + query.quiz_id,
          p: query.page ? "&page=" + query.page : "",
        })
      ),
    open: (id) =>
      props.history.push(
        makeLinkTo(
          [
            "class",
            class_id,
            schedule_id,
            "scores",
            "quiz_id",
            "page",
            "add_score",
          ],
          {
            quiz_id: "?quiz_id=" + query.quiz_id,
            page: query.page ? "&page=" + query.page : "",
            add_score: "&add_score=" + id,
          }
        )
      ),
  };
  return (
    <React.Fragment>
      <Dialog
        open={query.add_score ? true : false}
        onClose={addScore.close}
        fullWidth
        maxWidth="sm"
      >
        {currentStudent && (
          <React.Fragment>
            <DialogTitle onClose={addScore.close}>
              {currentStudent.first_name}&nbsp;
              {currentStudent.last_name}
            </DialogTitle>
            <DialogContent>
              <TextField
                variant="filled"
                label="Addition score"
                type="number"
                fullWidth
              />
              <TextField
                variant="filled"
                label="Reason or notes"
                type="text"
                multiline
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={addScore.close}>Cancel</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={addScore.close}
              >
                Save
              </Button>
            </DialogActions>
          </React.Fragment>
        )}
      </Dialog>
      <IconButton
        onClick={() =>
          props.history.push(
            makeLinkTo(["class", class_id, schedule_id, "quizzes"])
          )
        }
      >
        <Icon>arrow_back</Icon>
      </IconButton>
      {quiz && (
        <React.Fragment>
          <Box m={2}>
            <Paper>
              <Box
                p={2}
                display="flex"
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <div>
                  <Typography
                    style={{ fontWeight: "bold", whiteSpace: "pre-wrap" }}
                    variant="body1"
                  >
                    {quiz.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {quiz.intro}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    {quiz.questions.length} Questions
                  </Typography>
                </div>
                <div>
                  <Typography variant="body1" color="textSecondary">
                    {moment(new Date()).format("LL")}
                  </Typography>
                </div>
              </Box>
            </Paper>
          </Box>
          <Divider />
          <Box m={2}>
            <Box
              style={{ float: "right", margin: "13px 0" }}
              width={isMobile ? "100%" : 230}
            >
              <SearchInput onChange={(s) => setSearch(s)} />
            </Box>
            <TableContainer component={Paper}>
              <Table aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell align="left">Student</TableCell>
                    <TableCell align="center">Score</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getPageItems(
                    props.classDetails[class_id].students.filter(
                      (s) =>
                        JSON.stringify(s).toLowerCase().indexOf(search) >= 0
                    ),
                    page
                  ).map((row) => (
                    <TableRow key={row.name}>
                      <TableCell component="th" scope="row">
                        {row.first_name}
                        &nbsp;
                        {row.last_name}
                      </TableCell>
                      <TableCell align="center">20</TableCell>
                      <TableCell align="right">
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => addScore.open(row.id)}
                        >
                          Add Score
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <br />
            <Pagination
              match={props.match}
              queries={"&quiz_id=" + query.quiz_id}
              onChange={(p) => setPage(p)}
              page={page}
              count={props.classDetails[class_id].students.length}
              itemsPerPage={10}
            />
          </Box>
        </React.Fragment>
      )}
    </React.Fragment>
  );
}

export default connect((states) => ({
  questionnaires: states.questionnaires,
  classDetails: states.classDetails,
}))(Scores);
