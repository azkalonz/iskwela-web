import React, { useState } from "react";
import { Box, Grow, makeStyles, Typography } from "@material-ui/core";
import { connect } from "react-redux";
import Pagination from "../../components/Pagination";
import store from "../../components/redux/store";
import { SearchInput } from "../../components/Selectors";
import { Table as MTable } from "../../components/Table";
import Api from "../../api";

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
  const [saving, setSaving] = useState(false);
  const [savingId, setSavingId] = useState([]);
  const [students, setStudents] = useState();
  const [orderBy, setOrderBy] = useState("first_name");
  const [order, setOrder] = useState("asc");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(query.page ? parseInt(query.page) : 1);
  const styles = useStyles();

  const getStudents = async () => {
    let a = store.getState().classDetails[class_id].students;
    setStudents(a);
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
  const resetPassword = async (user) => {
    let { id, username } = user;
    if (!username) return;
    setSaving(true);
    setSavingId([id]);
    try {
      await Api.post("/api/schooladmin/change-user-password", {
        body: {
          username,
          password: username,
        },
      });
    } catch (e) {}
    setSaving(false);
    setSavingId([]);
  };
  const _handleFileOption = (opt, item) => {
    switch (opt) {
      case "reset-password":
        resetPassword(item);
    }
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
  const getFilteredStudents = (st = students) =>
    st.filter(
      (s) => JSON.stringify(s).toLowerCase().indexOf(search.toLowerCase()) >= 0
    );
  return (
    <Box width="100%" alignSelf="flex-start">
      <Box m={2} display="flex" justifyContent="flex-end" flexWrap="wrap">
        <SearchInput onChange={(e) => _handleSearch(e)} />
      </Box>

      <Box m={2}>
        {students && (
          <Grow in={true}>
            <MTable
              headers={[
                { id: "first_name", title: "Name", width: "33%" },
                {
                  id: "phone_number",
                  title: "Phone",
                  width: "33%",
                  align: "flex-end",
                },
                {
                  id: "email",
                  title: "Email",
                  width: "33%",
                  align: "flex-end",
                },
              ]}
              actions={{
                _handleFileOption: (opt, file) => _handleFileOption(opt, file),
              }}
              options={[
                {
                  name: "Reset Password",
                  value: "reset-password",
                },
              ]}
              saving={saving}
              savingId={savingId}
              filtered={(a) => getFilteredStudents(a)}
              data={students}
              noSelect={true}
              pagination={{
                render: (
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
                ),
                page,
                onChangePage: (p) => setPage(p),
              }}
              rowRenderMobile={(item) => (
                <Box
                  display="flex"
                  flexWrap="wrap"
                  flexDirection="column"
                  justifyContent="space-between"
                  width="90%"
                  style={{ padding: "30px 0" }}
                >
                  <Box width="100%" marginBottom={1}>
                    <Typography
                      style={{
                        fontWeight: "bold",
                        color: "#38108d",
                        fontSize: "1em",
                      }}
                    >
                      NAME
                    </Typography>
                    <Typography variant="body1">
                      {item.first_name} {item.last_name}
                    </Typography>
                  </Box>
                  <Box width="100%">
                    <Typography
                      style={{
                        fontWeight: "bold",
                        color: "#38108d",
                        fontSize: "1em",
                      }}
                    >
                      PHONE
                    </Typography>
                    <Box display="flex" alignItems="center">
                      {item.phone_number}
                    </Box>
                  </Box>
                  <Box width="100%">
                    <Typography
                      style={{
                        fontWeight: "bold",
                        color: "#38108d",
                        fontSize: "1em",
                      }}
                    >
                      EMAIL
                    </Typography>
                    <Box display="flex" alignItems="center">
                      {item.email}
                    </Box>
                  </Box>
                </Box>
              )}
              rowRender={(item) => (
                <Box display="flex" width="100%" style={{ padding: "13px 0" }}>
                  <Box width="33%" maxWidth="33%" overflow="hidden">
                    {item.first_name} {item.last_name}
                  </Box>
                  <Box
                    width="33%"
                    maxWidth="33%"
                    overflow="hidden"
                    textAlign="right"
                  >
                    {item.phone_number}
                  </Box>
                  <Box
                    width="33%"
                    maxWidth="33%"
                    overflow="hidden"
                    textAlign="right"
                  >
                    {item.email}
                  </Box>
                </Box>
              )}
            />
          </Grow>
        )}
      </Box>
    </Box>
  );
}

export default connect((states) => ({}))(Students);
