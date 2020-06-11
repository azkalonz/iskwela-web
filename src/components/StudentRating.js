import React, { useState } from "react";
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
} from "@material-ui/core";

export default function StudenRating(props) {
  const [value, setValue] = React.useState(5);
  const [hover, setHover] = React.useState(-1);
  return (
    <Dialog
      open={props.open ? props.open : false}
      fullWidth
      maxWidth="sm"
      onClose={props.onClose}
      TransitionComponent={Transition}
    >
      <DialogTitle onClose={props.onClose}>
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
              src={props.activity.student.pic}
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
            {value !== null && (
              <Box ml={2}>{labels[hover !== -1 ? hover : value]}</Box>
            )}
          </Box>
        </DialogContent>
      )}
      <DialogActions>
        <Button variant="outlined" onClick={props.onClose}>
          Cancel
        </Button>
        <Button variant="outlined" color="primary" onClick={props.onClose}>
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

const labels = {
  0.5: "Useless",
  1: "Useless+",
  1.5: "Poor",
  2: "Poor+",
  2.5: "Ok",
  3: "Ok+",
  3.5: "Good",
  4: "Good+",
  4.5: "Excellent",
  5: "Excellent+",
};
