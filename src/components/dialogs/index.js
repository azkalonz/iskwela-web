import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle as MuiDialogTitle,
  Slide,
  DialogContent,
  withStyles,
  Typography,
  IconButton,
  Icon,
  Box,
  useTheme,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core";
import { connect } from "react-redux";

function AttachQuestionnaireDialog(props) {
  const [filter, setFilter] = useState({
    SUBJECT: props.classes[Object.keys(props.classes)[0]].subject.id,
  });
  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle onClose={props.onClose}>{props.title}</DialogTitle>
      <DialogContent>
        {props.data && (
          <React.Fragment>
            <FormControl style={{ width: "100%" }} variant="outlined">
              <InputLabel>Subject</InputLabel>
              <Select
                style={{ background: "#efe7ff" }}
                label="Subject"
                value={filter.SUBJECT}
                onChange={(e) => {
                  setFilter({ ...filter, SUBJECT: e.target.value });
                }}
                padding={10}
              >
                {Object.keys(props.classes)
                  .filter((k, i) => {
                    let c = Object.keys(props.classes);
                    let index = c.findIndex(
                      (key) =>
                        props.classes[key].subject.id ===
                        props.classes[k].subject.id
                    );
                    return index === i;
                  })
                  .map((k, index) => (
                    <MenuItem value={props.classes[k].subject.id}>
                      {props.classes[k].subject.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            {props.questionnaires
              .filter((q) => q.subject_id === filter.SUBJECT)
              .map((q) => (
                <div>{JSON.stringify(q)}</div>
              ))}
          </React.Fragment>
        )}
      </DialogContent>
    </Dialog>
  );
}
const ConnectedAttachQuestionnaireDialog = connect((states) => ({
  classes: states.classes,
  questionnaires: states.questionnaires,
}))(AttachQuestionnaireDialog);
export { ConnectedAttachQuestionnaireDialog as AttachQuestionnaireDialog };

export function CreateDialog(props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const handleClose = () => props.onClose();
  return (
    <Dialog
      open={props.open}
      TransitionComponent={Transition}
      keepMounted
      fullScreen={true}
      onClose={handleClose}
    >
      <DialogTitle onClose={handleClose}>{props.title}</DialogTitle>
      <DialogContent
        style={{
          display: "flex",
          flexWrap: isMobile ? "wrap" : "nowrap",
          ...(isMobile ? { padding: "8px 0" } : {}),
        }}
      >
        <Box display="block" width={isMobile ? "100%" : "70%"} m={2}>
          {props.leftContent}
        </Box>
        <Box flex={1} m={2} width={isMobile ? "100%" : "30%"}>
          {props.rightContent}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
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
