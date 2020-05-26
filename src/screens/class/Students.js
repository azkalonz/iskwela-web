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
import store from "../../components/redux/store";
import SearchIcon from "@material-ui/icons/Search";

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
}));
console.log(store.getState().classDetails);
function Students(props) {
  const [students, setStudents] = useState(
    store.getState().classDetails[props.match.params.id].students
  );
  const [orderBy, setOrderBy] = React.useState("calories");
  const [order, setOrder] = React.useState("asc");
  const [search, setSearch] = useState("");

  const styles = useStyles();

  const _handleSort = (sortBy, order) => {
    setOrderBy(sortBy);
    if (order === "asc") {
      setStudents(
        students.sort((a, b) => ("" + a[sortBy]).localeCompare(b[sortBy]))
      );
      setOrder("desc");
    } else {
      setStudents(
        students.sort((a, b) => ("" + b[sortBy]).localeCompare(a[sortBy]))
      );
      setOrder("asc");
    }
  };
  const _handleSearch = (e) => {
    setSearch(e.toLowerCase());
  };
  const headCells = [
    { id: "first_name", numeric: false, disablePadding: true, label: "Name" },
    {
      id: "phone_number",
      numeric: true,
      disablePadding: false,
      label: "Phone",
    },
    { id: "email", numeric: true, disablePadding: false, label: "Email" },
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
              </TableRow>
            </TableHead>
            <TableBody>
              {students &&
                students
                  .filter(
                    (s) =>
                      JSON.stringify(s)
                        .toLowerCase()
                        .indexOf(search.toLowerCase()) >= 0
                  )
                  .map((row) => {
                    return (
                      <TableRow key={row.id} className={styles.row}>
                        <TableCell component="th" scope="row">
                          {row.first_name} {row.last_name}
                        </TableCell>
                        <TableCell align="right">{row.phone_number}</TableCell>
                        <TableCell align="right">{row.email}</TableCell>
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

export default Students;
