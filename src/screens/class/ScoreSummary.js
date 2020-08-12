import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  List,
  ListItem,
  Typography,
  Grid,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Menu,
  MenuItem,
} from "@material-ui/core";
import Rating from "@material-ui/lab/Rating";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import PopupState, {
  bindTrigger,
  bindPopover,
  bindMenu,
} from "material-ui-popup-state";

const Scores = () => {
  const classes = useStyles(false);
  const rows = [
    "Assignments",
    "Periodical Exams",
    "Projects",
    "Quizzes",
    "Seatworks",
  ];

  const ratings = [5, 4, 3, 2, 1.3];
  const scores = [95, 80, 50, 30, 10];

  return (
    <Grid container direction="column" className={classes.parentWrapper}>
      <Grid item>
        <Typography className={classes.title}>My Score Summmary</Typography>
        <List>
          {rows.map((column, index) => {
            return (
              <ListItem
                button
                divider
                key={index}
                style={{
                  border: "3px",
                  borderStyle: "outset",
                  marginBottom: "3px",
                }}
              >
                <ListItemText
                  primary={column}
                  secondary={
                    <Rating
                      key="index"
                      name="read-only"
                      value={ratings[index]}
                      readOnly
                      size="small"
                      precision={0.1}
                    />
                  }
                  style={{ width: "100%", paddingRight: "20px" }}
                />
                <p key="index" className={classes.scores}>
                  {scores[index]}%
                </p>
                <ListItemSecondaryAction>
                  <PopupState variant="popover" popupId={"details-" + index}>
                    {(popupState) => (
                      <div>
                        <IconButton {...bindTrigger(popupState)}>
                          <MoreHorizIcon style={{ color: "#7539ff" }} />
                        </IconButton>
                        <Menu {...bindMenu(popupState)}>
                          <MenuItem
                            onClick={() => {
                              alert(column);
                              popupState.close();
                            }}
                          >
                            Details
                          </MenuItem>
                        </Menu>
                      </div>
                    )}
                  </PopupState>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles((theme) => ({
  parentWrapper: {
    margin: "20px",
    width: "70%",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
  itemWrapper: {
    margin: "10px",
    padding: "3px",
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
  },
  scores: {
    textAlign: "right",
    width: "100%",
    marginRight: theme.spacing(3),
    fontWeight: "normal",
    fontSize: "20px",
  },
  btnMore: {
    boxShadow: "0px 0px 0px 0px",
    backgroundColor: "transparent",
    padding: "5px",
    color: "#7539ff",
  },
}));
export default Scores;
