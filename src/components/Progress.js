import React from "react";
import {
  Paper,
  makeStyles,
  List,
  ListItem,
  ListItemSecondaryAction,
  useTheme,
  ListItemText,
  IconButton,
  LinearProgress,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import CheckCircleOutlineOutlinedIcon from "@material-ui/icons/CheckCircleOutlineOutlined";
const useStyles = makeStyles((theme) => ({
  root: {
    position: "fixed",
    bottom: 10,
    zIndex: 999999,
    left: 10,
  },
  progressItem: {
    minWidth: 300,
  },
}));

export default function Progress(props) {
  const styles = useStyles();
  const theme = useTheme();
  const normalize = (loaded, total) => Math.ceil((loaded / total) * 100);
  return props.data.length ? (
    <Paper className={styles.root}>
      <List>
        {props.data.map((d) => (
          <ListItem>
            <div className={styles.progressItem}>
              <ListItemText
                primary={d.title}
                secondary={normalize(d.loaded, d.total) + "%"}
              />
              <LinearProgress
                variant="determinate"
                value={normalize(d.loaded, d.total)}
              />
            </div>
            <ListItemSecondaryAction>
              {normalize(d.loaded, d.total) < 100 ? (
                <IconButton onClick={() => d.onCancel.cancel("Canceled")}>
                  <CloseIcon />
                </IconButton>
              ) : (
                <CheckCircleOutlineOutlinedIcon
                  style={{ color: theme.palette.success.main }}
                />
              )}
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  ) : null;
}
