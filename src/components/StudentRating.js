import React, { useEffect, useState } from "react";
import { Rating as MuiRating } from "@material-ui/lab";
import {
  Dialog,
  DialogTitle as MuiDialogTitle,
  Icon,
  makeStyles,
  DialogContent,
  Box,
  Slide,
  withStyles,
  Typography,
  DialogActions,
  Avatar,
  Button,
  TextField,
} from "@material-ui/core";
import Api from "../api";

export default function StudenRating(props) {
  const [value, setValue] = React.useState(5);
  const [hover, setHover] = React.useState(-1);
  const handleSave = async () => {
    if (!props.activity) return;
    if (props.endpoint === "assignment/v2") {
      let res = await Api.post("/api/assignment/v2/set-score", {
        body: {
          score: Math.map(value, 0, 5, 0, props.activity.total_score),
          activity_id: props.activity.id,
          student_id: props.activity.student.id,
        },
      });
    } else {
      let res = await Api.post(
        "/api/class/" + (props.endpoint || "seatwork") + "/set-score",
        {
          body: {
            score: Math.map(value, 0, 5, 0, props.activity.total_score),
            activity_id: props.activity.id,
            student_id: props.activity.student.id,
          },
        }
      );
    }

    props.onClose(true);
  };
  useEffect(() => {
    const { answers, student, total_score } = props.activity || {};
    if (answers && student) {
      let ans = answers.find((q) => q.student?.id === student.id);
      if (ans) {
        setValue(Math.map(ans.score, 0, total_score, 0, 5));
      }
    }
  }, [props.activity]);
  return (
    <Dialog
      open={props.open ? props.open : false}
      fullWidth
      maxWidth="sm"
      onClose={() => props.onClose(true)}
      TransitionComponent={Transition}
    >
      <DialogTitle onClose={() => props.onClose()}>
        {props.activity && props.activity.title}
      </DialogTitle>
      {props.activity && props.activity.student && (
        <DialogContent>
          <Typography
            variant="body1"
            color="textSecondary"
            style={{ fontWeight: "bold", marginBottom: 7 }}
          >
            Student
          </Typography>
          <Box display="flex" alignItems="center" p={2}>
            <Avatar
              src={props.activity.student.preferences?.profile_picture || "/"}
              alt={props.activity.student.first_name}
            />
            <div style={{ marginLeft: 13 }}>
              {props.activity.student &&
                props.activity.student.first_name +
                  " " +
                  props.activity.student.last_name}
            </div>
          </Box>
          <Typography
            variant="body1"
            color="textSecondary"
            style={{ fontWeight: "bold", marginBottom: 7 }}
          >
            Rating
          </Typography>
          <Box p={2}>
            <TextField
              type="number"
              inputProps={{ max: props.activity.total_score || 100, min: 0 }}
              value={Math.map(value, 0, 5, 0, props.activity.total_score)}
              onChange={(e) => {
                let val = parseInt(e.target.value);
                setValue(Math.map(val, 0, props.activity.total_score, 0, 5));
              }}
            />
            <MuiRating
              name="hover-feedback"
              value={value ? value : 5}
              precision={0.5}
              onChange={(event, newValue) => {
                setValue(newValue);
              }}
              onChangeActive={(event, newHover) => {
                setHover(newHover);
              }}
            />
          </Box>
        </DialogContent>
      )}
      <DialogActions>
        <Button variant="outlined" onClick={props.onClose}>
          Cancel
        </Button>
        <Button variant="outlined" color="primary" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

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
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <Icon className={classes.closeButton} onClick={onClose}>
          close
        </Icon>
      ) : null}
    </MuiDialogTitle>
  );
});

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
