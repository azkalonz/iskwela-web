import React, { useState } from "react";
import {
  TableSortLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  IconButton,
  InputBase,
  makeStyles,
  Avatar,
  Typography,
  CircularProgress,
} from "@material-ui/core";
import store from "../../components/redux/store";
import SearchIcon from "@material-ui/icons/Search";
import { asyncForEach } from "../../components/UserData";
import Api from "../../api";
import Pagination, { getPageItems } from "../../components/Pagination";
import { SearchInput } from "../../components/Selectors";

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
  const query = require("query-string").parse(window.location.search);
  const { class_id } = props.match.params;
  const [students, setStudents] = useState();
  const [orderBy, setOrderBy] = React.useState("calories");
  const [order, setOrder] = React.useState("asc");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(query.page ? parseInt(query.page) : 1);
  const styles = useStyles();

  const getStudents = async () => {
    let a = store.getState().classDetails[class_id].students;
    await asyncForEach(a, async (s, index, arr) => {
      if (store.getState().pics[s.id]) {
        a[index].pic = store.getState().pics[s.id];
        return;
      }
      try {
        let pic = await Api.postBlob("/api/download/user/profile-picture", {
          body: { id: s.id },
        }).then((resp) => (resp.ok ? resp.blob() : null));
        if (pic) {
          var picUrl = URL.createObjectURL(pic);
          let userpic = {};
          userpic[s.student.id] = picUrl;
          store.dispatch({
            type: "SET_PIC",
            userpic,
          });
          a[index].pic = picUrl;
        }
      } catch (e) {
        a[index].pic = "/logo192.png";
      }
      setStudents(a);
    });
  };
  useState(() => {
    getStudents();
  }, []);
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
  const getFilteredStudents = () =>
    students.filter(
      (s) => JSON.stringify(s).toLowerCase().indexOf(search.toLowerCase()) >= 0
    );
  return (
    <Box width="100%" alignSelf="flex-start">
      <Box m={2} display="flex" justifyContent="flex-end" flexWrap="wrap">
        <SearchInput onChange={(e) => _handleSearch(e)} />
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
                getPageItems(getFilteredStudents(), page).map((row) => {
                  return (
                    <TableRow key={row.id} className={styles.row}>
                      <TableCell component="th" scope="row">
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <Avatar src={row.pic} alt={row.first_name} />
                          <Typography variant="body1" style={{ marginLeft: 7 }}>
                            {row.first_name} {row.last_name}
                          </Typography>
                        </div>
                      </TableCell>
                      <TableCell align="right">{row.phone_number}</TableCell>
                      <TableCell align="right">{row.email}</TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        {!students && <CircularProgress />}
        {students && (
          <Box p={2}>
            <Pagination
              emptyMessage={
                search
                  ? "Try a different keyword"
                  : "There's no students in your class yet."
              }
              icon={search ? "person_search" : "face"}
              emptyTitle={search ? "Nothing Found" : ""}
              match={props.match}
              page={page}
              onChange={(e) => setPage(e)}
              count={getFilteredStudents().length}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Students;
