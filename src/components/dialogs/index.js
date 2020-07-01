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
  ListItem,
  Paper,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  List,
  DialogActions,
} from "@material-ui/core";
import { connect } from "react-redux";
import Pagination, { getPageItems } from "../Pagination";
import { SearchInput } from "../Selectors";
import { Link, useHistory } from "react-router-dom";
import { makeLinkTo } from "../router-dom";

function AttachQuestionnaireDialog(props) {
  const history = useHistory();
  const theme = useTheme();
  const { class_id, schedule_id } = props.match.params;
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [filter, setFilter] = useState({
    SUBJECT: -1,
    SEARCH: "",
  });
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const getFilteredQuestionnaires = () =>
    props.questionnaires
      .filter(
        (q) => JSON.stringify(q).toLowerCase().indexOf(filter.SEARCH) >= 0
      )
      .filter((q) =>
        filter.SUBJECT >= 0 ? q.subject_id === filter.SUBJECT : true
      );
  React.useEffect(() => {
    if (props.selected) setSelected(props.selected);
  }, [props.selected]);
  const getPagination = () => (
    <Pagination
      page={page}
      onChange={(p) => setPage(p)}
      icon={filter.SEARCH ? "person_search" : ""}
      emptyTitle={filter.SEARCH ? "Nothing Found" : "No Questionnaires"}
      emptyMessage={
        <Button
          onClick={() =>
            history.push(
              makeLinkTo(["class", class_id, schedule_id, "questionnaire"])
            )
          }
        >
          Create Questionnaire
        </Button>
      }
      count={getFilteredQuestionnaires().length}
      nolink
    />
  );
  const handleClose = () => {
    if (selected) props.onSelect(selected);
    props.onClose();
    setFilter({ ...filter, SEARCH: "" });
  };
  return (
    <Dialog
      open={props.open}
      onClose={handleClose}
      fullScreen={isMobile}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle onClose={handleClose}>{props.title}</DialogTitle>
      <DialogContent>
        {props.data && (
          <React.Fragment>
            <Box width="100%" display="flex" flexWrap="wrap">
              <Box width={isMobile ? "100%" : "70%"}>
                <SearchInput
                  onChange={(s) => setFilter({ ...filter, SEARCH: s })}
                />
              </Box>
              <Box
                width={isMobile ? "100%" : "30%"}
                style={{
                  ...(isMobile ? { paddingTop: 10 } : { paddingLeft: 10 }),
                }}
              >
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
                    <MenuItem value={-1}>All</MenuItem>
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
                        <MenuItem
                          value={props.classes[k].subject.id}
                          key={index}
                        >
                          {props.classes[k].subject.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
            <List>
              {getPageItems(getFilteredQuestionnaires(), page).map(
                (q, index) => (
                  <ListItem ContainerComponent={Paper} key={index}>
                    <ListItemText primary={q.title} secondary={q.intro} />
                    <ListItemSecondaryAction>
                      <Button
                        onClick={() =>
                          setSelected(() => {
                            let s = [...selected];
                            let i = selected.findIndex((qq) => qq.id === q.id);
                            if (i >= 0) s.splice(i, 1);
                            else s.push(q);
                            return s;
                          })
                        }
                        variant="contained"
                        color={
                          selected.findIndex((qq) => qq.id === q.id) >= 0
                            ? theme.palette.error.main
                            : "primary"
                        }
                      >
                        {selected.findIndex((qq) => qq.id === q.id) >= 0
                          ? "REMOVE"
                          : "SELECT"}
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                )
              )}
            </List>
            {!getFilteredQuestionnaires().length && getPagination()}
          </React.Fragment>
        )}
      </DialogContent>
      <DialogActions>
        {getFilteredQuestionnaires().length ? getPagination() : null}
        <Button variant="contained" color="secondary" onClick={handleClose}>
          Done
        </Button>
      </DialogActions>
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
