import React, { useState, useEffect } from "react";
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TableSortLabel,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Menu,
  MenuItem,
  withStyles,
  Slide,
  Box,
  Grow,
  Button,
  TextField,
  IconButton,
  InputBase,
  ListItemSecondaryAction,
  makeStyles,
  Typography,
  Paper,
} from "@material-ui/core";
import MoreHorizOutlinedIcon from "@material-ui/icons/MoreHorizOutlined";
import SearchIcon from "@material-ui/icons/Search";
import { makeLinkTo } from "../../components/router-dom";
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";
import MuiAlert from "@material-ui/lab/Alert";
import MomentUtils from "@date-io/moment";
import moment from "moment";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import Form from "../../components/Form";
import UserData from "../../components/UserData";
import Api from "../../api";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}
function Schedule(props) {
  const history = useHistory();
  const { class_id, schedule_id, option_name } = props.match.params;
  const [schedules, setSchedules] = useState();
  const [saving, setSaving] = useState(false);
  const [sortType, setSortType] = useState("DESCENDING");
  const [errors, setErrors] = useState([]);
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [orderBy, setOrderBy] = React.useState("calories");
  const [order, setOrder] = React.useState("asc");
  const [search, setSearch] = useState("");
  const isTeacher = props.userInfo.user_type === "t" ? true : false;
  const styles = useStyles();
  const [savingId, setSavingId] = useState();
  const [form, setForm] = useState({
    id: schedule_id,
    date_from: moment(new Date()).format("YYYY-MM-DD H:mm:ss"),
    date_to: moment(new Date()).format("YYYY-MM-DD H:mm:ss"),
    teacher_id: props.userInfo.id,
  });

  useEffect(() => {
    if (schedules)
      setAnchorEl(() => {
        let a = {};
        schedules.forEach((i) => {
          a[i.id] = null;
        });
        return a;
      });
  }, [schedules]);

  useEffect(() => {
    if (props.classDetails)
      setSchedules(props.classDetails[class_id].schedules);
  }, [class_id]);

  const _handleFileOption = (option, file) => {
    setAnchorEl(() => {
      let a = {};
      a[file.id] = null;
      return { ...anchorEl, ...a };
    });
    switch (option) {
      case "join":
        history.push(
          makeLinkTo(["class", class_id, file.id, "opt", "video-conference"], {
            opt: option_name ? option_name : "",
          })
        );
        return;
      case "start":
        _handleUpdateStatus("ONGOING", file);
        return;

      case "end":
        _handleUpdateStatus("DONE", file);
        return;

      case "cancel":
        _handleUpdateStatus("CANCELED", file);
        return;
      case "edit":
        setOpen(true);
        setForm({ ...file, date_from: file.from, date_to: file.to });
        return;
    }
  };
  const _handleUpdateStatus = async (status, item) => {
    setSaving(true);
    setSavingId(item.id);
    let res = await Api.post("/api/schedule/save", {
      body: {
        id: item.id,
        date_from: props.classDetails[class_id].schedules[item.id].from,
        date_to: props.classDetails[class_id].schedules[item.id].to,
        teacher_id: props.userInfo.id,
        status: status,
      },
    });
    await UserData.updateClassDetails(class_id);
    setSaving(false);
    setSavingId(null);
  };

  const _handleSort = (sortBy, order) => {
    setOrderBy(sortBy);
    if (order === "asc") {
      setSchedules(
        schedules.sort((a, b) => ("" + a[sortBy]).localeCompare(b[sortBy]))
      );
      setOrder("desc");
    } else {
      setSchedules(
        schedules.sort((a, b) => ("" + b[sortBy]).localeCompare(a[sortBy]))
      );
      setOrder("asc");
    }
  };
  const _handleSearch = (e) => {
    setSearch(e.toLowerCase());
  };
  const headCells = [
    { id: "date", numeric: false, disablePadding: true, label: "Date" },
    { id: "time", numeric: true, disablePadding: false, label: "Time" },
    {
      id: "teacher_name",
      numeric: true,
      disablePadding: false,
      label: "teacher_name",
    },
    { id: "status", numeric: true, disablePadding: false, label: "Status" },
  ];
  const _handleEditSchedule = async () => {
    setSaving(true);
    let formData = new Form(form);
    let res = await formData.send("/api/schedule/save");
    setErrors(null);
    if (res) {
      if (!res.errors) {
        await UserData.updateClassDetails(class_id);
        setOpen(false);
      } else {
        let err = [];
        for (let e in res.errors) {
          err.push(res.errors[e][0]);
        }
        setErrors(err);
      }
    }
    setSaving(false);
  };
  return (
    <Box width="100%" alignSelf="flex-start">
      <Box m={2} display="flex" justifyContent="flex-end" flexWrap="wrap">
        <Box border={1} p={0.3} borderRadius={7}>
          <InputBase
            onChange={(e) => _handleSearch(e.target.value)}
            placeholder="Search"
            inputProps={{ "aria-label": "search activity" }}
          />
          <IconButton type="submit" aria-label="search" style={{ padding: 0 }}>
            <SearchIcon />
          </IconButton>
        </Box>
      </Box>

      <Box m={2}>
        <TableContainer>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    align={headCell.numeric ? "right" : "left"}
                    padding={headCell.disablePadding ? "none" : "default"}
                    sortDirection={orderBy === headCell.id ? order : false}
                    onClick={() => _handleSort(headCell.id, order)}
                  >
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : "asc"}
                    >
                      {headCell.label}
                      {orderBy === headCell.id ? (
                        <span className={styles.visuallyHidden}>
                          {order === "desc"
                            ? "sorted descending"
                            : "sorted ascending"}
                        </span>
                      ) : null}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {schedules &&
                schedules
                  .filter(
                    (i) => JSON.stringify(i).toLowerCase().indexOf(search) >= 0
                  )
                  .map((row) => {
                    let status = {
                      className: styles[row.status],
                      label: row.status,
                      color: styles[row.status + "_color"],
                    };
                    return (
                      <Grow in={true}>
                        <TableRow
                          key={row.name}
                          className={[styles.row, status.color].join(" ")}
                        >
                          <TableCell component="th" scope="row">
                            {moment(row.from).format("MMMM D, YYYY")}
                          </TableCell>
                          <TableCell align="right">
                            {moment(row.from).format("h:mm A")} -{" "}
                            {moment(row.to).format("h:mm A")}
                          </TableCell>
                          <TableCell align="right">
                            {row.teacher_name}
                          </TableCell>
                          <TableCell align="center">
                            {saving && savingId === row.id ? (
                              <CircularProgress size={17} />
                            ) : (
                              <Chip
                                label={status.label.toUpperCase()}
                                className={status.className}
                              />
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              onClick={(event) =>
                                setAnchorEl(() => {
                                  let a = {};
                                  a[row.id] = event.currentTarget;
                                  return { ...anchorEl, ...a };
                                })
                              }
                            >
                              <MoreHorizOutlinedIcon />
                            </IconButton>
                            {anchorEl && (
                              <StyledMenu
                                id="customized-menu"
                                anchorEl={anchorEl[row.id]}
                                keepMounted
                                open={Boolean(anchorEl[row.id])}
                                onClose={() =>
                                  setAnchorEl(() => {
                                    let a = {};
                                    a[row.id] = null;
                                    return { ...anchorEl, ...a };
                                  })
                                }
                              >
                                <StyledMenuItem
                                  disabled={
                                    row.status !== "ONGOING" ? true : false
                                  }
                                >
                                  <ListItemText
                                    primary="Join"
                                    onClick={() =>
                                      _handleFileOption("join", row)
                                    }
                                  />
                                </StyledMenuItem>
                                {isTeacher && (
                                  <div>
                                    <StyledMenuItem>
                                      <ListItemText
                                        primary="Start"
                                        disabled={row.status === "ONGOING"}
                                        onClick={() =>
                                          _handleFileOption("start", row)
                                        }
                                      />
                                    </StyledMenuItem>
                                    <StyledMenuItem>
                                      <ListItemText
                                        primary="End"
                                        disabled={row.status !== "ONGOING"}
                                        onClick={() =>
                                          _handleFileOption("end", row)
                                        }
                                      />
                                    </StyledMenuItem>
                                    <StyledMenuItem>
                                      <ListItemText
                                        primary="Cancel"
                                        onClick={() =>
                                          _handleFileOption("cancel", row)
                                        }
                                      />
                                    </StyledMenuItem>
                                    <StyledMenuItem>
                                      <ListItemText
                                        primary="Edit"
                                        onClick={() =>
                                          _handleFileOption("edit", row)
                                        }
                                      />
                                    </StyledMenuItem>
                                  </div>
                                )}
                              </StyledMenu>
                            )}
                          </TableCell>
                        </TableRow>
                      </Grow>
                    );
                  })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        keepMounted
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">Edit Schedule</DialogTitle>
        <DialogContent>
          <Box style={{ marginBottom: 18 }}>
            {errors &&
              errors.map((e, i) => (
                <Grow in={true}>
                  <Alert key={i} style={{ marginBottom: 9 }} severity="error">
                    {e}
                  </Alert>
                </Grow>
              ))}
          </Box>
          <DialogContentText
            id="alert-dialog-slide-description"
            component="div"
          >
            <Box display="flex" flexWrap="wrap">
              <MuiPickersUtilsProvider utils={MomentUtils}>
                <Box
                  display="flex"
                  width="100%"
                  justifyContent="space-between"
                  alignItems="center"
                  flexWrap="wrap"
                >
                  <Box
                    justifyContent="space-between"
                    display="flex"
                    width="100%"
                  >
                    <KeyboardDatePicker
                      disableToolbar
                      fullWidth
                      variant="inline"
                      format="MMM DD, YYYY"
                      margin="normal"
                      label="Date"
                      value={form.date_from}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          date_from:
                            moment(e).format("YYYY-MM-DD") +
                            " " +
                            moment(form.date_from).format("H:mm:ss"),
                          date_to:
                            moment(e).format("YYYY-MM-DD") +
                            " " +
                            moment(form.date_to).format("H:mm:ss"),
                        })
                      }
                      KeyboardButtonProps={{
                        "aria-label": "change date",
                      }}
                    />
                  </Box>
                  <Box
                    justifyContent="space-between"
                    display="flex"
                    width="100%"
                  >
                    <KeyboardTimePicker
                      margin="normal"
                      label="Time From"
                      format="hh:mm A"
                      value={form.date_from}
                      KeyboardButtonProps={{
                        "aria-label": "change time",
                      }}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          date_from:
                            moment(form.date_from).format("YYYY-MM-DD") +
                            " " +
                            moment(e).format("H:mm:ss"),
                          date_to:
                            moment(form.date_to).format("YYYY-MM-DD") +
                            " " +
                            moment(form.date_to).format("H:mm:ss"),
                        })
                      }
                    />
                    <KeyboardTimePicker
                      margin="normal"
                      format="hh:mm A"
                      value={form.date_to}
                      label="Time To"
                      KeyboardButtonProps={{
                        "aria-label": "change time",
                      }}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          date_from:
                            moment(form.date_from).format("YYYY-MM-DD") +
                            " " +
                            moment(form.date_from).format("H:mm:ss"),
                          date_to:
                            moment(form.date_to).format("YYYY-MM-DD") +
                            " " +
                            moment(e).format("H:mm:ss"),
                        })
                      }
                    />
                  </Box>
                </Box>
              </MuiPickersUtilsProvider>
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions style={{ justifyContent: "flex-end" }}>
          <DialogActions>
            <Button variant="outlined" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <div style={{ position: "relative" }}>
              <Button
                variant="contained"
                color="primary"
                className={styles.wrapper}
                disabled={saving}
                onClick={() => _handleEditSchedule()}
              >
                Save
              </Button>
              {saving && (
                <CircularProgress size={24} className={styles.buttonProgress} />
              )}
            </div>
          </DialogActions>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

const useStyles = makeStyles((theme) => ({
  hideonmobile: {
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
  },
  buttonProgress: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  wrapper: { margin: theme.spacing(1), position: "relative" },
  row: {
    backgroundColor: theme.palette.grey[200],
    borderLeft: "4px solid",
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1,
  },
  PENDING: {
    backgroundColor: theme.palette.error.main,
    borderColor: theme.palette.error.main,
    color: theme.palette.common.white,
  },
  PENDING: {
    backgroundColor: theme.palette.warning.main,
    borderColor: theme.palette.warning.main,
    color: theme.palette.common.white,
  },
  ONGOING: {
    backgroundColor: theme.palette.success.main,
    borderColor: theme.palette.success.main,
    color: theme.palette.common.white,
  },
  CANCELED: {
    backgroundColor: theme.palette.error.main,
    borderColor: theme.palette.error.main,
    color: theme.palette.common.white,
  },
  CANCELED_color: { borderColor: theme.palette.error.main },
  PENDING_color: { borderColor: theme.palette.warning.main },
  ONGOING_color: { borderColor: theme.palette.success.main },
}));
const StyledMenu = withStyles({
  paper: {
    border: "1px solid #d3d4d5",
  },
})((props) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "center",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "center",
    }}
    {...props}
  />
));

const StyledMenuItem = withStyles((theme) => ({
  root: {
    "&:focus": {
      backgroundColor: theme.palette.grey[200],
      "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
        color: theme.palette.common.primary,
      },
    },
  },
}))(MenuItem);

export default connect((states) => ({
  userInfo: states.userInfo,
  classDetails: states.classDetails,
}))(Schedule);
