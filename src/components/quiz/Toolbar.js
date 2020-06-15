import React, { useState } from "react";
import {
  AppBar,
  Toolbar as MuiToolbar,
  Icon,
  Slider,
  Box,
  Dialog,
  DialogTitle as MuiDialogTitle,
  DialogActions,
  DialogContent,
  Typography,
  Slide as MuiSlide,
  withStyles,
  useTheme,
  IconButton,
  Button,
  CircularProgress,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { ValuePicker } from "./Slide";

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
function Toolbar(props) {
  const theme = useTheme();
  const history = useHistory();
  const [saving, setSaving] = useState(false);
  return (
    <MuiToolbar
      style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        background: theme.palette.grey[100],
        zIndex: 10,
      }}
    >
      <div>
        <IconButton onClick={() => history.push("#settings")}>
          <Icon>settings</Icon>
        </IconButton>
        <Button
          onClick={() => history.push("#preview")}
          variant="contained"
          disabled={!props.preview}
          style={{ marginRight: 13 }}
        >
          Preview
        </Button>
        <Button
          onClick={() => {
            setSaving(true);
            props.onSave(() => setSaving(false));
          }}
          variant="contained"
          style={{
            background:
              saving || !props.modified
                ? theme.palette.disabled
                : theme.palette.success.main,
            color: "#fff",
            position: "relative",
          }}
          disabled={!props.modified || saving}
        >
          Save
          {saving && (
            <CircularProgress size={18} style={{ position: "absolute" }} />
          )}
        </Button>
      </div>
    </MuiToolbar>
  );
}

export default Toolbar;
