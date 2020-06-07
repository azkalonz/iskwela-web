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
import store from "./redux/store";
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
  return props.data ? (
    normalize(props.data.loaded, props.data.total) < 100 ? (
      <Paper className={styles.root} id="tests">
        <List>
          <ListItem>
            <div className={styles.progressItem}>
              <ListItemText
                primary={props.data.title}
                secondary={normalize(props.data.loaded, props.data.total) + "%"}
              />
              <LinearProgress
                variant="determinate"
                value={normalize(props.data.loaded, props.data.total)}
              />
            </div>
            <ListItemSecondaryAction>
              {normalize(props.data.loaded, props.data.total) < 100 ? (
                <IconButton
                  onClick={() => {
                    store.dispatch({
                      type: "CLEAR_PROGRESS",
                      id: props.id,
                    });
                    props.data.onCancel.cancel("Canceled");
                  }}
                >
                  <CloseIcon />
                </IconButton>
              ) : (
                <CheckCircleOutlineOutlinedIcon
                  style={{ color: theme.palette.success.main }}
                />
              )}
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>
    ) : null
  ) : null;
}
