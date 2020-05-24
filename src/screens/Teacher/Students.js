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

function Students(props) {
  const [myItems, setMyItems] = useState(sampleActivities.students);
  const [itemsCopy, setItemsCopy] = useState();
  const [orderBy, setOrderBy] = React.useState("calories");
  const [order, setOrder] = React.useState("asc");

  const styles = useStyles();
  useEffect(() => {
    setItemsCopy(myItems);
  }, []);

  const _handleSort = (sortBy, order) => {
    setOrderBy(sortBy);
    if (order === "asc") {
      setMyItems(
        myItems.sort(
          (a, b) =>
            a[sortBy].toLowerCase().charCodeAt(0) -
            b[sortBy].toLowerCase().charCodeAt(0)
        )
      );
      setOrder("desc");
    } else {
      setMyItems(
        myItems.sort(
          (a, b) =>
            b[orderBy].toLowerCase().charCodeAt(0) -
            a[orderBy].toLowerCase().charCodeAt(0)
        )
      );
      setOrder("asc");
    }
  };
  const _handleSearch = (e) => {
    setMyItems(
      itemsCopy.filter((i) => JSON.stringify(i).indexOf(e.toLowerCase()) >= 0)
    );
  };
  const headCells = [
    { id: "name", numeric: false, disablePadding: true, label: "Name" },
    { id: "phone", numeric: true, disablePadding: false, label: "Phone" },
    { id: "email", numeric: true, disablePadding: false, label: "Email" },
  ];
  return (
    <Box width="100%" alignSelf="flex-start">
      <Box m={2} display="flex" justifyContent="space-between" flexWrap="wrap">
        <Button variant="contained" color="primary">
          Download Excel
        </Button>
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
              {myItems.map((row) => {
                return (
                  <TableRow key={row.id} className={styles.row}>
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell align="right">Phone number</TableCell>
                    <TableCell align="right">Email</TableCell>
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

const sampleActivities = require("./dummyclass.json");

export default Students;
