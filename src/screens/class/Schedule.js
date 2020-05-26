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
  Button,
  TextField,
  IconButton,
  InputBase,
  ListItemSecondaryAction,
  makeStyles,
  Typography,
  Paper,
} from "@material-ui/core";
import RootRef from "@material-ui/core/RootRef";
import MoreHorizOutlinedIcon from "@material-ui/icons/MoreHorizOutlined";
import moment from "moment";
import SearchIcon from "@material-ui/icons/Search";
import store from "../../components/redux/store";

const objectToArray = (x, filter) =>
  Object.keys(x)
    .filter((i) => parseInt(i) === parseInt(filter))
    .map((k) => Object.keys(x[k]).map((kk) => x[k][kk]))[0];

function Schedule(props) {
  const [schedules, setSchedules] = useState(
    objectToArray(store.getState().classSchedules, props.match.params.id)
  );
  const [sortType, setSortType] = useState("DESCENDING");
  const [modals, setModals] = useState([false, false]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [orderBy, setOrderBy] = React.useState("calories");
  const [order, setOrder] = React.useState("asc");
  const [search, setSearch] = useState("");
  const isTeacher = store.getState().userInfo.user_type === "t" ? true : false;

  const styles = useStyles();

  useEffect(() => {
    console.log("s", schedules);
    if (schedules)
      setAnchorEl(() => {
        let a = {};
        schedules.forEach((i) => {
          a[i.id] = null;
        });
        return a;
      });
  }, [schedules]);

  const _handleSort = (sortBy, order) => {
    setOrderBy(sortBy);
    if (order === "asc") {
      setSchedules(
        schedules.sort((a, b) => ("" + a[orderBy]).localeCompare(b[orderBy]))
      );
      setOrder("desc");
    } else {
      setSchedules(
        schedules.sort((a, b) => ("" + b[orderBy]).localeCompare(a[orderBy]))
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
                    let stat =
                      row.status > 0
                        ? "done"
                        : row.status < 0
                        ? "pending"
                        : "cancelled";
                    let status = {
                      className: styles[stat],
                      label: stat,
                      color: styles[stat + "_color"],
                    };
                    return (
                      <TableRow
                        key={row.name}
                        className={[styles.row, status.color].join(" ")}
                      >
                        <TableCell component="th" scope="row">
                          {row.date}
                        </TableCell>
                        <TableCell align="right">{row.time}</TableCell>
                        <TableCell align="right">{row.teacher_name}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={status.label.toUpperCase()}
                            className={status.className}
                          />
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
                              <StyledMenuItem>
                                <ListItemText primary="View" />
                              </StyledMenuItem>
                              <StyledMenuItem>
                                <ListItemText primary="Download" />
                              </StyledMenuItem>
                              {isTeacher && (
                                <div>
                                  <StyledMenuItem>
                                    <ListItemText primary="Edit" />
                                  </StyledMenuItem>
                                  <StyledMenuItem>
                                    <ListItemText primary="Delete" />
                                  </StyledMenuItem>
                                </div>
                              )}
                            </StyledMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
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
  cancelled: {
    backgroundColor: theme.palette.error.main,
    borderColor: theme.palette.error.main,
    color: theme.palette.common.white,
  },
  pending: {
    backgroundColor: theme.palette.warning.main,
    borderColor: theme.palette.warning.main,
    color: theme.palette.common.white,
  },
  done: {
    backgroundColor: theme.palette.success.main,
    borderColor: theme.palette.success.main,
    color: theme.palette.common.white,
  },
  done_color: { borderColor: theme.palette.success.main },
  cancelled_color: { borderColor: theme.palette.error.main },
  pending_color: { borderColor: theme.palette.warning.main },
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

export default Schedule;
