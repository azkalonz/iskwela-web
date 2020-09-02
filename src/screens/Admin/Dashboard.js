import React, { useMemo, useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { Table } from "../../components/Table";
import Pagination, { getPageItems } from "../../components/Pagination";
import { SearchInput } from "../../components/Selectors";
import {
  Button,
  IconButton,
  Icon,
  TextField,
  useMediaQuery,
  Backdrop,
  Toolbar,
  ButtonBase,
  Avatar,
  Menu,
  MenuItem,
  Paper,
  FormGroup,
  FormControlLabel,
  Checkbox,
  FormControl,
  FormLabel,
  Select,
  InputLabel,
  CircularProgress,
  List,
  Snackbar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Grow,
  Slide,
  Chip,
  ButtonGroup,
} from "@material-ui/core";
import Drawer from "../../components/Drawer";
import {
  CalendarProvider,
  Weekdays,
  Dates,
  getYears,
} from "../../components/Calendar";
import Scrollbar from "../../components/Scrollbar";
import { useHistory, Redirect } from "react-router-dom";
import Api from "../../api";
import { connect } from "react-redux";
import NavBar from "../../components/NavBar";
import UserData from "../../components/UserData";
import socket from "../../components/socket.io";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import SavingButton from "../../components/SavingButton";
import moment from "moment";
import { makeLinkTo } from "../../components/router-dom";
import { BlankDialog, Alert } from "../../components/dialogs";
import { id } from "date-fns/locale";

const qs = require("query-string");

const createTab = (key, label, opts = {}) => ({ key, label, ...opts });
function Dashboard(props) {
  const theme = useTheme();
  const query = qs.parse(window.location.search);
  const tabMap = [
    createTab("classes", "Classes"),
    createTab("accounts", "Accounts"),
    createTab("student-groups", "Student Groups"),
    createTab("grading-categories", "Grading Categories"),
  ];
  const tabid = tabMap.findIndex((q) => q.key === query.tab);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(tabid >= 0 ? tabid : 0);
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const classes = useStyles();
  const [saving, setSaving] = useState(false);
  const [savingId, setSavingId] = useState([]);
  const [editing, setEditing] = useState(false || !!props.editOnly);
  const [opened, setOpened] = useState(true);
  const [success, setSuccess] = useState(false);
  const [state, setState] = React.useState({
    username: "",
    fname: "",
    lname: "",
    email: "",
    pnumber: "",
  });

  const handleUpdate = () => {
    setSaving(true);
    setSavingId([window.currentItem.id]);

    fetchData({
      send: async () =>
        await Api.post("/api/admin/user/update/" + window.currentItem.id, {
          body: {
            username: state.username,
            first_name: state.fname,
            last_name: state.lname,
            phone_number:
              state.pnumber !== ""
                ? parseInt(state.pnumber)
                : window.currentItem.phone_number === null
                ? 0
                : window.currentItem.phone_number,
            email: state.email,
          },
        }),
      before: () => setLoading(true),
      after: () => {
        setSuccess(true);
        setSaving(false);
        setSavingId([]);
        setLoading(false);
      },
    });
    // setSaving(true);
    // setSavingId([window.currentItem.id]);
    // try {
    //   setSaving(true);
    //   setSavingId([window.currentItem.id]);
    //   await Api.post("/api/admin/user/update/" + window.currentItem.id, {
    //     body: {
    //       username: state.username,
    //       first_name: state.fname,
    //       last_name: state.lname,
    //       phone_number:
    //         state.pnumber !== ""
    //           ? parseInt(state.pnumber)
    //           : window.currentItem.phone_number === null
    //           ? 0
    //           : window.currentItem.phone_number,
    //       email: state.email,
    //     },
    //   });
    //   setSuccess(true);
    //   setSaving(false);
    //   setSavingId([]);
    // } catch (e) {
    //   console.log(console.error());
    // }
    // setSaving(false);
    // setSavingId([]);
  };
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const handleEditChange = (event) => {
    const value = event.target.value;
    setState({
      ...state,
      [event.target.name]: value,
    });
  };

  return (
    <Drawer {...props}>
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Success
        </Alert>
      </Snackbar>
      <BlankDialog
        title={
          <Box display="flex" alignItems="center">
            <Avatar
              style={{ width: 80, height: 80 }}
              src={window.currentItem?.preferences?.profile_picture}
              alt={window.currentItem?.name}
            />
            <Typography
              style={{
                fontSize: 18,
                fontWeight: 500,
                marginLeft: 13,
                marginRight: "auto",
              }}
            >
              {window.currentItem?.name}
            </Typography>

            <SavingButton
              saving={saving}
              style={{ marginLeft: 13, width: "auto" }}
              onClick={() => {
                if (editing) {
                  handleUpdate();
                } else if (!props.editOnly) {
                  setEditing(true);
                }
              }}
            >
              {editing || props.editOnly ? (
                "Save  "
              ) : (
                <React.Fragment>
                  Edit <Icon fontSize="small">create_outlined</Icon>
                </React.Fragment>
              )}
            </SavingButton>
            {editing && !props.editOnly && (
              <Button
                style={{ color: "red", width: "auto" }}
                onClick={() => {
                  setEditing(false);
                }}
              >
                Cancel
              </Button>
            )}
          </Box>
        }
        open={(window.currentItem && query.action === "view-user") || false}
        onClose={() => {
          setEditing(false);
          props.history.push(
            window.location.search.replaceUrlParam("action", "")
          );
        }}
      >
        {window.currentItem && (
          <Box>
            <fieldset disabled={editing ? false : true}>
              <form
                className={classes.root}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <TextField
                  variant="filled"
                  defaultValue={window.currentItem.id}
                  label="User ID"
                  size="small"
                  width="100"
                  disabled
                  style={{ width: "80%" }}
                />
                <TextField
                  name="username"
                  onChange={handleEditChange}
                  variant="filled"
                  defaultValue={window.currentItem.username}
                  label="Username"
                  size="small"
                  style={{ width: "80%" }}
                />
                <TextField
                  name="fname"
                  onChange={handleEditChange}
                  variant="filled"
                  defaultValue={window.currentItem.first_name}
                  label="First Name"
                  size="small"
                  style={{ width: "80%" }}
                />
                <TextField
                  name="lname"
                  onChange={handleEditChange}
                  variant="filled"
                  defaultValue={window.currentItem.last_name}
                  label="Last Name"
                  size="small"
                  style={{ width: "80%" }}
                />
                <TextField
                  name="pnumber"
                  onChange={handleEditChange}
                  variant="filled"
                  defaultValue={window.currentItem.phone_number}
                  label="Phone Number"
                  size="small"
                  style={{ width: "80%" }}
                />
                <TextField
                  name="email"
                  onChange={handleEditChange}
                  variant="filled"
                  label="Email"
                  defaultValue={window.currentItem.email}
                  size="small"
                  style={{ width: "80%" }}
                />
              </form>
            </fieldset>
          </Box>
          // <List>
          //   <ListItem>
          //     <ListItemText
          //       primary={window.currentItem.id}
          //       secondary="User ID"
          //     />
          //   </ListItem>
          //   <ListItem>
          //     <ListItemText
          //       primary={window.currentItem.username}
          //       secondary="Username"
          //     />
          //   </ListItem>
          //   <ListItem>
          //     <ListItemText
          //       primary={window.currentItem.first_name}
          //       secondary="First Name"
          //     />
          //   </ListItem>
          //   <ListItem>
          //     <ListItemText
          //       primary={window.currentItem.last_name}
          //       secondary="Last Name"
          //     />
          //   </ListItem>
          //   <ListItem>
          //     <ListItemText
          //       primary={window.currentItem.phone_number}
          //       secondary="Phone Number"
          //     />
          //   </ListItem>
          //   <ListItem>
          //     <ListItemText
          //       primary={window.currentItem.email}
          //       secondary="Email"
          //     />
          //   </ListItem>
          // </List>
        )}
      </BlankDialog>
      <Backdrop
        open={isMobile && opened}
        style={{ zIndex: 16 }}
        onClick={() => setOpened(false)}
      />
      <Box width="100%" display="flex" className={classes.tab}>
        <Box
          className={classes.tabs}
          style={{
            width: opened ? 345 : 0,
            transition: "width 0.3s ease-out",
          }}
        >
          <Toolbar style={{ display: "flex", justifyContent: "space-between" }}>
            <Box>
              {isTablet && (
                <IconButton
                  aria-label="Collapse Panel"
                  onClick={() => {
                    props.history.push("#menu");
                  }}
                  style={{ marginLeft: -15, color: "#fff" }}
                >
                  <Icon>menu</Icon>
                </IconButton>
              )}
            </Box>
            <Typography
              style={{ color: "#fff", fontSize: 18, fontWeight: 500 }}
            >
              Admin Panel
            </Typography>
            <IconButton
              onClick={() => setOpened(false)}
              style={{ color: "#fff" }}
            >
              <span className="icon-menu-close"></span>
            </IconButton>
          </Toolbar>

          <Tabs
            orientation="vertical"
            variant="scrollable"
            value={value}
            onChange={handleChange}
          >
            {tabMap.map((tab, index) => (
              <Tab
                key={tab.key}
                label={tab.label}
                {...a11yProps(index)}
                onClick={() => props.history.push("/dashboard?tab=" + tab.key)}
              />
            ))}
          </Tabs>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          width="100%"
          height="100vh"
          id="dashboard-panel"
        >
          <NavBar
            left={
              !opened && (
                <IconButton onClick={() => setOpened(true)}>
                  <span className="icon-menu-open"></span>
                </IconButton>
              )
            }
          />
          {loading && (
            <Box
              width="100%"
              display="flex"
              alignItems="center"
              justifyContent="center"
              p={4}
            >
              <CircularProgress />
            </Box>
          )}
          {!loading && (
            <Scrollbar autoHide>
              <TabPanel value={value} index={0}>
                <Classes {...props} />
              </TabPanel>
              <TabPanel value={value} index={1}>
                <Accounts history={props.history} />
              </TabPanel>
              <TabPanel value={value} index={2}>
                <StudentGroups {...props} />
              </TabPanel>
              <TabPanel value={value} index={3}>
                <GradingCategories {...props} />
              </TabPanel>
            </Scrollbar>
          )}
        </Box>
      </Box>
      <Backdrop
        open={props.location.hash === "#menu" && isMobile ? true : false}
        style={{ zIndex: 16, backgroundColor: "rgba(0,0,0,0.7)" }}
        onClick={() => {
          props.history.push("#");
        }}
      />
    </Drawer>
  );
}

function Classes(props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const query = qs.parse(window.location.search);
  const { option_name } = props.match.params;
  const [currentClass, setCurrentClass] = useState();
  const [loading, setLoading] = useState(true);
  const [classList, setClassList] = useState([]);
  const [sections, setSections] = useState([]);
  const [years, setYears] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [subjects, setSubjects] = useState([]);
  const [success, setSuccess] = useState(false);
  const [savingId, setSavingId] = useState([]);
  const [saving, setSaving] = useState(false);
  let subArray = Object.keys(props.classes).map(
    (k) => props.classes[k].subject
  );

  const columnHeaders = useMemo(() => [
    {
      id: "id",
      title: "ID",
      align: "center",
      width: "5%",
    },
    { id: "name", align: "center", title: "Name", width: "23%" },
    { id: "description", align: "center", title: "Description", width: "23%" },
    { id: "teacher", align: "center", title: "Teacher", width: "23%" },
    { id: "frequency", align: "center", title: "Frequency", width: "23%" },
  ]);
  const _handleFileOption = (option, item) => {
    switch (option) {
      case "edit":
        props.history.push(
          window.location.search.replaceUrlParam("classId", item.id)
        );
        return;
      case "delete-class":
        deleteClass(item);
        return;
    }
  };

  const getFilteredClasses = (c = classList) =>
    [...c].filter(
      (q) => JSON.stringify(q).toLowerCase().indexOf(search.toLowerCase()) >= 0
    );
  const fetch = async () => {
    setLoading(true);
    try {
      let sec = await Api.get("/api/schooladmin/sections");
      let yrs = await Api.get("/api/years");
      let sbj = await Api.get("/api/subjects");
      let classes = await Api.get("/api/schooladmin/classes");
      setSections(sec);
      setSubjects(sbj);
      setYears(yrs);
      setClassList(classes.sort((a, b) => b.id - a.id));
    } catch (e) {}
    setLoading(false);
  };
  const deleteClass = (item) => {
    let classes = [...classList];
    let classIndex = classList.findIndex((q) => q.id === item.id);
    if (window.confirm("Are you sure to delete this class?")) {
      fetchData({
        before: () => setLoading(true),
        send: async () =>
          await Api.delete("/api/schooladmin/class/remove/" + item.id),
        after: () => {
          if (classes[classIndex]) {
            classes.splice(classIndex, 1);
            if (classes[0]) setClassList(classes);
            setLoading(false);
            //setSuccess(true);
          }
        },
      });
    }
  };
  useEffect(() => {
    if (query.classId) {
      let i = query.classId;
      if (!isNaN(parseInt(i))) {
        i = parseInt(i);
        let d = classList.find((q) => q.id === i);
        setCurrentClass(d);
      }
    } else {
      setCurrentClass(null);
    }
  }, [query.classId]);
  useEffect(() => {
    fetch();
  }, [option_name, query.classId]);
  return props.userInfo?.user_type === "a" ? (
    <React.Fragment>
      {option_name === "new-class" ? (
        <ClassDetails
          class={{
            teacher: props.parentData?.childInfo,
          }}
          {...props}
          sections={sections}
          years={years}
          subjects={subjects}
          editOnly={true}
        />
      ) : (
        <React.Fragment>
          {loading && (
            <Box
              width="100%"
              display="flex"
              alignItems="center"
              justifyContent="center"
              p={4}
            >
              <CircularProgress />
            </Box>
          )}
          {!currentClass && !loading && (
            <Box p={4}>
              <Box
                display="flex"
                textAlign="center"
                justifyContent="center"
                position="relative"
                alignItems={isMobile ? "center" : ""}
                flexDirection={isMobile ? "column-reverse" : ""}
                style={{ marginBottom: 20 }}
              >
                <Box
                  style={{
                    marginRight: 10,
                  }}
                >
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => props.history.push("/dashboard/new-class")}
                  >
                    New Class
                  </Button>
                </Box>

                <Box
                  style={{
                    marginLeft: isMobile ? 0 : "auto",
                    marginBottom: isMobile ? 10 : "auto",
                    marginTop: isMobile ? 10 : "auto",
                  }}
                ></Box>
                <Box>
                  <SearchInput onChange={(e) => setSearch(e)} />
                </Box>
              </Box>
              <Table
                noSelect
                loading={loading}
                headers={columnHeaders}
                filtered={(t) => getFilteredClasses(t)}
                data={classList}
                actions={{
                  _handleFileOption: (opt, item) =>
                    _handleFileOption(opt, item),
                }}
                options={[
                  { name: "Edit", value: "edit" },
                  { name: "Delete", value: "delete-class" },
                ]}
                style={{ margin: 0 }}
                pagination={{
                  page,
                  render: (
                    <Box p={2}>
                      <Pagination
                        page={page}
                        onChange={(e) => setPage(e)}
                        icon={
                          search ? (
                            <img
                              src="/hero-img/search.svg"
                              width={180}
                              style={{ padding: "50px 0" }}
                            />
                          ) : (
                            <img
                              src="/hero-img/undraw_Progress_tracking_re_ulfg.svg"
                              width={180}
                              style={{ padding: "50px 0" }}
                            />
                          )
                        }
                        emptyTitle={search ? "Nothing Found" : false}
                        emptyMessage={
                          search ? "Try a different keyword." : false
                        }
                        nolink
                        count={getFilteredClasses().length}
                      />
                    </Box>
                  ),
                  onChangePage: (p) => setPage(p),
                }}
                rowRenderMobile={(item) => {
                  let f = item.frequency;
                  if (typeof f === "string" && f) {
                    f = f.split(",").filter((q) => !!q);
                    if (f.length >= 7) f = "DAILY";
                    else f = f.join(",");
                  }
                  return (
                    <Box
                      onClick={() =>
                        props.history.push(
                          window.location.search.replaceUrlParam(
                            "classId",
                            item.id
                          )
                        )
                      }
                      display="flex"
                      flexWrap="wrap"
                      width="90%"
                      flexDirection="column"
                      justifyContent="space-between"
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
                          Name
                        </Typography>
                        <Typography variant="body1">{item.name}</Typography>
                      </Box>
                      <Box width="100%" marginBottom={1}>
                        <Typography
                          style={{
                            fontWeight: "bold",
                            color: "#38108d",
                            fontSize: "1em",
                          }}
                        >
                          DESCRIPTION
                        </Typography>
                        <Typography
                          variant="body1"
                          style={{
                            fontWeight: "bold",
                            fontSize: "0.9em",
                          }}
                        >
                          {item.description ? item.description : "--"}
                        </Typography>
                      </Box>
                      <Box width="100%" marginBottom={1}>
                        <Typography
                          style={{
                            fontWeight: "bold",
                            color: "#38108d",
                            fontSize: "1em",
                          }}
                        >
                          TEACHER
                        </Typography>
                      </Box>
                      <Box
                        display="flex"
                        alignItems="center"
                        style={{ margin: "13px 0" }}
                      >
                        <Avatar
                          src={item.teacher?.profile_picture}
                          alt={item.teacher?.first_name}
                        />
                        <Typography
                          variant="body1"
                          style={{
                            fontWeight: "bold",
                            marginLeft: 13,
                            fontSize: "0.9em",
                          }}
                        >
                          {item.teacher?.first_name +
                            " " +
                            item.teacher?.last_name}
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
                          FREQUENCY
                        </Typography>
                        <Box display="flex" alignItems="center">
                          <Typography>{f}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  );
                }}
                rowRender={(item) => {
                  let f = item.frequency;
                  if (typeof f === "string" && f) {
                    f = f.split(",").filter((q) => !!q);
                    if (f.length >= 7) f = "DAILY";
                    else f = f.join(",");
                  }
                  return (
                    <Box
                      p={2}
                      display="flex"
                      width="100%"
                      onClick={() =>
                        props.history.push(
                          window.location.search.replaceUrlParam(
                            "classId",
                            item.id
                          )
                        )
                      }
                    >
                      <Box width="5%" textAlign="center">
                        <Typography style={{ fontWeight: 600 }}>
                          {item.id}
                        </Typography>
                      </Box>
                      <Box width="23%" textAlign="center">
                        <Typography>{item.name}</Typography>
                      </Box>
                      <Box width="23%" textAlign="center">
                        <Typography>
                          {item.description ? item.description : "--"}
                        </Typography>
                      </Box>
                      <Box
                        width="23%"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Avatar
                          src={item.teacher?.profile_picture}
                          alt={item.teacher?.first_name}
                        />
                        <Typography style={{ marginLeft: 13 }}>
                          {item.teacher?.first_name +
                            " " +
                            item.teacher?.last_name}
                        </Typography>
                      </Box>
                      <Box width="23%" textAlign="center">
                        <Typography>{f}</Typography>
                      </Box>
                    </Box>
                  );
                }}
              />
            </Box>
          )}
          {currentClass && (
            <ClassDetails
              class={currentClass}
              {...props}
              sections={sections}
              years={years}
              subjects={subjects}
            />
          )}
        </React.Fragment>
      )}
    </React.Fragment>
  ) : (
    <Redirect to="/" />
  );
}

function StudentGroups(props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const query = qs.parse(window.location.search);
  const [sections, setSections] = useState([]);
  const [years, setYears] = useState();
  const [selectedYear, setSelectedYear] = useState();
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchSections, setSearchSections] = useState("");
  const tabMap = useMemo(() => {
    if (sections?.length) {
      let s = sections
        .sort((a, b) => b.id - a.id)
        .map((s) => ({
          key: s.id,
          label: `${s.name} (${s.students.length})`,
        }))
        .filter(
          (q) =>
            JSON.stringify(q)
              .toLowerCase()
              .indexOf(searchSections.toLowerCase()) >= 0
        );
      if (s.length) {
        if (searchSections || !query.section) {
          props.history.push(
            window.location.search.replaceUrlParam("section", s[0].key)
          );
        }
      }
      return s;
    } else {
      return [];
    }
  }, [sections, searchSections]);
  const [value, setValue] = useState(0);
  const [selectedChild, setSelectedChild] = useState();
  const [childrenSearch, setChildrenSearch] = useState("");
  const [childrenPage, setChildrenPage] = useState(1);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [students, setStudents] = useState([]);
  const [success, setSuccess] = useState(false);
  const [successAdmin, setSuccessAdmin] = useState(false);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const getFilteredChildren = useCallback(
    (data = students) => {
      return data
        ?.map((q) => ({
          ...q,
          name: q.first_name + " " + q.last_name,
        }))
        ?.filter(
          (q) =>
            JSON.stringify(q)
              .toLowerCase()
              .indexOf(childrenSearch.toLowerCase()) >= 0
        );
    },
    [students, loadingChildren, selectedChild, childrenSearch, childrenPage]
  );
  const addStudentToSection = useCallback(() => {
    let section = parseInt(query.section);
    let ss = [...sections];
    section = sections.find((q) => q.id === section);
    if (section && selectedChild?.id) {
      fetchData({
        before: () => setSaving(true),
        send: async () =>
          await Api.post("/api/schooladmin/section/add-student", {
            body: { section_id: section.id, student_id: selectedChild.id },
          }),
        after: (data) => {
          if (data && tableRef[`section-${section.id}`]) {
            let secIndex = ss.findIndex((q) => q.id === section.id);
            tableRef[`section-${section.id}`].appendData(data);
            if (ss[secIndex]) {
              ss[secIndex] = data;
              setSections(ss);
              setSuccess(true);
            }
          }
          setSaving(false);
        },
      });
    }
  }, [sections, selectedChild]);

  const addSection = (name = "section") => {
    if (!form[name]) return;
    let errors = {};
    let body = {};
    form[name].forEach((field) => {
      const { minChar, value, required, maxChar, key, pattern } = field;
      body[key] = value;
      let e;
      if (required) {
        if (!value) {
          e = "Please enter a " + field.name;
        } else if (minChar && value?.length < minChar) {
          e = "Please enter at least " + minChar + " length " + field.name;
        } else if (maxChar && value?.length > maxChar) {
          e = "Maximum characters execeed.";
        } else if (pattern && !new RegExp(pattern).test(value)) {
          e = "Please enter a valid " + field.name;
        }
      } else if (value && pattern && !new RegExp(pattern).test(value)) {
        e = "Please enter a valid " + field.name;
      }
      if (e) errors[key] = e;
    });
    if (!Object.keys(errors).length && selectedYear) {
      body.year_id = selectedYear;
      fetchData({
        before: () => setSaving(true),
        send: async () =>
          await Api.post("/api/schooladmin/section/save", { body }),
        after: (data) => {
          if (data && data.id) {
            setSections([{ ...data, students: [] }, ...sections]);
            form[name].forEach((field) => {
              delete field.value;
            });
            props.history.push(
              window.location.search
                .replaceUrlParam("add_section", "")
                .replaceUrlParam("section", data.id)
            );
            setSuccess(true);
          }
          setSaving(false);
          setErrors({});
        },
      });
    } else {
      setErrors(errors);
    }
  };
  const removeFromSection = async (student, callback) => {
    if (window.confirm("Are you sure to remove this student?")) {
      let section = parseInt(query.section);
      let ss = [...sections];
      let sectionIndex = ss.findIndex((q) => q.id === section);
      section = ss.find((q) => q.id === section);
      console.log(section);
      if (section) {
        let studentIndex = section.students?.find(
          (q) => q?.user.id === student.id
        );
        console.log(studentIndex);
        if (studentIndex) {
          await fetchData({
            send: async () =>
              await Api.delete(
                "/api/schooladmin/section/remove-student/?section_id=" +
                  section.id +
                  "&student_id=" +
                  student.id
              ),
            after: (response) => {
              if (response?.id) {
                ss[sectionIndex] = response;
                setSections(ss);
                setSuccess(true);
              }
            },
          });
        }
      }
    }
    callback && callback();
  };
  const deleteSection = () => {
    let section = parseInt(query.section);
    let ss = [...sections];
    section = sections.find((q) => q.id === section);
    if (section && window.confirm("Are you sure to delete this section?")) {
      fetchData({
        send: async () =>
          await Api.delete("/api/schooladmin/section/remove/" + section.id),

        after: () => {
          let secIndex = ss.findIndex((q) => q.id === section.id);
          if (ss[secIndex]) {
            ss.splice(secIndex, 1);
            if (ss[0])
              props.history.push(
                window.location.search.replaceUrlParam("section", ss[0].id)
              );
            setSections(ss);
            setSuccess(true);
          }
        },
      });
    }
  };
  useEffect(() => {
    fetchData({
      before: () => {
        setLoading(true);
      },
      send: async () =>
        await Api.get("/api/schooladmin/sections?include=students"),
      after: (data) => {
        if (data?.length) {
          setSections(data);
        } else {
          setSections([]);
        }
      },
    });
    fetchData({
      before: () => setLoading(true),
      send: async () => await Api.get("/api/schooladmin/students"),
      after: (data) => {
        if (data?.length) {
          setStudents(data);
        } else {
          setStudents([]);
        }
      },
    });
    fetchData({
      before: () => setLoading(true),
      send: async () => await Api.get("/api/years"),
      after: (data) => {
        if (data?.length) {
          setYears(data);
          setSelectedYear(data[0].id);
        } else {
          setYears([]);
        }
        setLoading(false);
      },
    });
  }, []);
  useEffect(() => {
    if (tabMap?.length) {
      let tabid = tabMap.findIndex((q) => q.key?.toString() === query.section);
      if (tabid >= 0) {
        setValue(tabid);
      } else setValue(0);
    }
  }, [tabMap, query.section]);
  return (
    <React.Fragment>
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Success
        </Alert>
      </Snackbar>
      <Box
        m={4}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
          {searchSections && (
            <IconButton onClick={() => setSearchSections("")}>
              <Icon>arrow_back</Icon>
            </IconButton>
          )}
        </Box>

        <Button
          style={{ marginRight: isMobile ? 10 : "auto" }}
          variant="contained"
          color="secondary"
          onClick={() => {
            props.history.push(
              window.location.search.replaceUrlParam("add_section", true)
            );
          }}
        >
          New Section
        </Button>

        <Box>
          <SearchInput
            onChange={(e) => setSearchSections(e)}
            onReset={() => setSearchSections("")}
            label="Search Sections"
            quickSearch={false}
          />
        </Box>
      </Box>
      {loading && (
        <Box
          width="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={4}
        >
          <CircularProgress />
        </Box>
      )}
      {!loading &&
        !tabMap.length &&
        (sections?.length === 0 || !!searchSections) && (
          <Box p={2}>
            <Pagination
              page={1}
              onChange={(e) => null}
              count={0}
              icon={
                searchSections ? (
                  <img
                    src="/hero-img/search.svg"
                    width={180}
                    style={{ padding: "50px 0" }}
                  />
                ) : (
                  <img
                    src="/hero-img/undraw_Progress_tracking_re_ulfg.svg"
                    width={180}
                    style={{ padding: "50px 0" }}
                  />
                )
              }
              emptyTitle={searchSections ? "Nothing Found" : "No Data"}
              emptyMessage={"Try a different keyword."}
              nolink
            />
          </Box>
        )}
      <BlankDialog
        open={query.add_section === "true"}
        title={"Add New Section"}
        onClose={() => {
          setErrors([]);
          props.history.push(
            window.location.search.replaceUrlParam("add_section", "")
          );
          form.teacher.forEach((field) => {
            delete field.value;
          });
        }}
        actions={
          <SavingButton saving={saving} onClick={() => addSection()}>
            Submit
          </SavingButton>
        }
      >
        <form
          action="#"
          onSubmit={(e) => {
            e.preventDefault();
            addSection();
          }}
        >
          {form.section.map((field, index) => (
            <TextField
              key={index}
              disabled={saving || !selectedYear}
              fullWidth
              required={field.required}
              onChange={(e) => {
                field.value = e.target.value;
              }}
              label={field.name}
              error={!!errors[field.key]}
              helperText={errors[field.key] || ""}
              variant="outlined"
              className="themed-input"
              {...(field.props || {})}
            />
          ))}
          <Box display="flex" style={{ marginTop: "44px" }}>
            {years && selectedYear ? (
              <FormControl
                className="themed-input"
                variant="outlined"
                disabled={saving || !selectedYear}
              >
                <InputLabel>Year Level *</InputLabel>
                <Select
                  label="Year Level"
                  name="year-level"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {years.map((year, index) => (
                    <MenuItem key={index} value={year.id}>
                      {year.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Box display="flex" alignItems="center" marginRight={2}>
                <CircularProgress size={10} style={{ marginRight: 13 }} />
                retrieving year levels...
              </Box>
            )}
          </Box>
        </form>
      </BlankDialog>
      {tabMap?.length ? (
        <Tabs
          style={{ padding: "0 30px" }}
          orientation="horizontal"
          variant="scrollable"
          value={value}
          onChange={handleChange}
        >
          {tabMap.map((tab, index) => (
            <Tab
              key={tab.key}
              label={tab.label}
              {...a11yProps(index)}
              onClick={() =>
                props.history.push(
                  "/dashboard/" +
                    window.location.search.replaceUrlParam("section", tab.key)
                )
              }
            />
          ))}
        </Tabs>
      ) : null}
      {tabMap?.length && sections && sections.length
        ? sections.map((section, index) => (
            <TabPanel value={value} index={index}>
              <BlankDialog
                open={
                  !isNaN(parseInt(query.section)) &&
                  sections.find((q) => q.id === parseInt(query.section)) &&
                  query.add_to_section === "true"
                }
                title={"Add Student"}
                onClose={() => {
                  setSelectedChild(null);
                  props.history.push(
                    window.location.search.replaceUrlParam("add_to_section", "")
                  );
                }}
                actions={
                  <SavingButton
                    saving={saving}
                    onClick={() => addStudentToSection()}
                  >
                    Add Student
                  </SavingButton>
                }
              >
                <Box
                  width="100%"
                  overflow="hidden"
                  display="flex"
                  alignItems="center"
                  marginBottom={2}
                >
                  <Typography
                    style={{ marginLeft: 13, fontSize: 18, fontWeight: 500 }}
                  >
                    {section.name}
                  </Typography>
                </Box>
                <SearchInput
                  onChange={(e) => {
                    setChildrenSearch(e);
                  }}
                />
                {selectedChild && (
                  <React.Fragment>
                    <Box
                      p={3}
                      className="sticky"
                      onClick={() => {}}
                      display={"flex"}
                      justifyContent="flex-start"
                      alignItems="center"
                      component={Paper}
                      style={{
                        cursor: "pointer",
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 11,
                      }}
                    >
                      <Avatar
                        src={selectedChild?.preferences?.profile_picture}
                        alt={selectedChild?.first_name}
                      />
                      <Box marginLeft={2}>
                        <Typography style={{ fontSize: 12 }}>
                          Selected Student
                        </Typography>
                        <Typography
                          style={{
                            fontWeight: 16,
                            fontWeight: 500,
                          }}
                        >
                          {selectedChild?.first_name +
                            " " +
                            selectedChild?.last_name}
                        </Typography>
                      </Box>
                    </Box>
                  </React.Fragment>
                )}
                {loadingChildren && (
                  <Box
                    width="100%"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    p={4}
                  >
                    <CircularProgress />
                  </Box>
                )}
                {!loadingChildren && (
                  <React.Fragment>
                    <List>
                      {getPageItems(getFilteredChildren(), childrenPage).map(
                        (child, index) => (
                          <ListItem
                            disabled={saving}
                            key={index}
                            button
                            divider
                            selected={selectedChild?.id === child.id || false}
                            onClick={() => setSelectedChild(child)}
                          >
                            <ListItemAvatar>
                              <Avatar
                                src={child.preferences?.profile_picture}
                                alt={child.name}
                              />
                            </ListItemAvatar>
                            <ListItemText
                              primary={child.name}
                              secondary={child.phone_number}
                            />
                            <ListItemSecondaryAction>
                              {section.students.find(
                                (q) => q?.user?.id === child.id
                              ) && <Icon>check_circle</Icon>}
                            </ListItemSecondaryAction>
                          </ListItem>
                        )
                      )}
                    </List>
                    <Box p={2}>
                      <Pagination
                        count={getFilteredChildren().length}
                        nolink
                        page={childrenPage}
                        onChange={(p) => setChildrenPage(p)}
                        icon={
                          <img
                            src="/hero-img/person-search.svg"
                            width={180}
                            style={{ padding: "50px 0" }}
                          />
                        }
                        emptyTitle={"Nothing Found"}
                        emptyMessage={
                          childrenSearch
                            ? "Try a different keyword."
                            : "No Data"
                        }
                      />
                    </Box>
                  </React.Fragment>
                )}
              </BlankDialog>
              <Box p={4}>
                <UserTable
                  {...props}
                  getRef={(ref) => (tableRef["section-" + section.id] = ref)}
                  key={index}
                  onRowClick={(item, itemController) =>
                    itemController("view-user", item)
                  }
                  optionActions={{
                    removeFromSection: (item, callback) =>
                      removeFromSection(item, callback),
                  }}
                  options={[
                    {
                      name: "Remove Student",
                      value: "remove-student",
                    },
                    {
                      name: "Reset Password",
                      value: "reset-password",
                    },
                  ]}
                  actions={[
                    {
                      name: "Add Student",
                      onClick: () =>
                        props.history.push(
                          window.location.search.replaceUrlParam(
                            "add_to_section",
                            "true"
                          )
                        ),
                      props: {
                        style: {
                          background: "green",
                          color: "#fff",
                        },
                      },
                    },
                    {
                      name: "Delete Section",
                      onClick: () => deleteSection(),
                      props: {
                        style: {
                          background: "green",
                          color: "#fff",
                        },
                      },
                    },
                  ]}
                  data={section.students?.map(
                    (q) =>
                      ({
                        ...q.user,
                        name: q.user.first_name + " " + q.user.last_name,
                      } || [])
                  )}
                />
              </Box>
            </TabPanel>
          ))
        : null}
    </React.Fragment>
  );
}

function GradingCategories(props) {
  const query = qs.parse(window.location.search);
  const [success, setSuccess] = useState(false);
  const [grading, setGrading] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subjectGrading, setSubjectGrading] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [savingId, setSavingId] = useState([]);
  const [currentCategory, setCurrentCategory] = useState();
  const tabMap = useMemo(
    () => [
      createTab("subject-grading", "Subject Grading", {
        onClick: () =>
          props.history.push(
            window.location.search.replaceUrlParam("subject_id", "")
          ),
      }),
      createTab("categories", "Grading Categories", {
        onClick: () =>
          props.history.push(
            window.location.search.replaceUrlParam("subject_id", "")
          ),
      }),
    ],
    []
  );
  const tabid = useMemo(
    () => tabMap.findIndex((q) => q.key === query.section),
    [tabMap]
  );
  const [value, setValue] = useState(tabid >= 0 ? tabid : 0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const getSubjectCategories = (id) => {
    fetchData({
      before: () => setLoading(true),
      send: async () =>
        await Api.get("/api/schooladmin/subject-grading-categories/" + id),
      after: (data) => {
        if (data?.length) {
          setSubjectGrading(data.sort((a, b) => b.id - a.id));
        } else setSubjectGrading([]);
        setLoading(false);
      },
    });
  };
  const SubjectGradingCategory = useCallback(
    (item) => {
      const cat = grading.find(
        (q) => parseInt(q.id) === parseInt(item.category_id)
      );
      return (
        <Box p={2} display="flex" width="100%">
          <Box width="50%">
            <Typography style={{ fontWeight: 600 }}>{cat?.category}</Typography>
          </Box>
          <Box width="50%">
            <Typography style={{ fontWeight: 600 }}>
              {parseFloat(item.category_percentage) * 100} %
            </Typography>
          </Box>
        </Box>
      );
    },
    [subjectGrading, grading, subjects]
  );
  const removeCategory = (item, cat = "school") => {
    if (window.confirm(`Are you sure to delete this category?`)) {
      fetchData({
        send: async () =>
          Api.delete(
            "/api/schooladmin/" + cat + "-grading-category/remove/" + item.id
          ),
        after: (data) => {
          if (data?.success && tableRef[cat + "-grading"].deleteData) {
            tableRef[cat + "-grading"].deleteData(item.id);
            let d = [...grading];
            let i = d.findIndex((q) => q.id === item.id);
            if (i >= 0) {
              d.splice(i, 1);
              setGrading(d);
            }
            setSuccess(true);
          }
          setSaving(false);
        },
      });
    }
    setCurrentCategory(null);
  };
  const saveCategory = useCallback(
    (name = "category", callback = null) => {
      const isSubject = !isNaN(parseInt(query.subject_id));
      if (currentCategory && isSubject) {
        name = "subjectCategory";
      }
      if (!form[name]) return;
      let errors = {};
      let body = {};
      form[name].forEach((field) => {
        const {
          minChar,
          value,
          required,
          maxChar,
          key,
          pattern,
          titleCase,
        } = field;
        if (titleCase && typeof value === "string")
          body[key] = value.titleCase();
        else body[key] = value;
        let e;
        if (required) {
          if (!value) {
            e = "Please enter a " + field.name;
          } else if (minChar && value?.length < minChar) {
            e = "Please enter at least " + minChar + " length " + field.name;
          } else if (maxChar && value?.length > maxChar) {
            e = "Maximum characters execeed.";
          } else if (pattern && !new RegExp(pattern).test(value)) {
            e = "Please enter a valid " + field.name;
          }
        } else if (value && pattern && !new RegExp(pattern).test(value)) {
          e = "Please enter a valid " + field.name;
        }
        if (e) errors[key] = e;
      });
      if (!Object.keys(errors).length) {
        let finalBody = {};
        let pp = parseFloat(body.category_percentage) / 100;
        body.category_percentage = pp;
        if (currentCategory && !isSubject) {
          finalBody.id = currentCategory.id;
          finalBody.category = body.category;
        } else if (!currentCategory && !isSubject) {
          finalBody.category = body.category;
        } else if (currentCategory && isSubject) {
          finalBody.category_percentage = pp;
          finalBody.id = currentCategory.id;
          finalBody.subject_id = parseInt(currentCategory.subject_id);
          finalBody.category_id = parseInt(currentCategory.category_id);
        } else if (!currentCategory && isSubject) {
          finalBody.category_id = body.category;
          finalBody.subject_id = parseInt(query.subject_id);
        }
        let endpoint = isSubject
          ? "/api/schooladmin/subject-grading-category/save"
          : "/api/schooladmin/school-grading-category/save";
        fetchData({
          before: () => setSaving(true),
          send: async () =>
            await Api.post(endpoint, {
              body: {
                ...finalBody,
                category_percentage: parseFloat(body.category_percentage),
              },
            }),
          after: (data) => {
            if (data && data.id) {
              if (currentCategory && !isSubject) {
                let d = [...grading];
                let index = d.findIndex((q) => q.id === data.id);
                if (index >= 0) {
                  d[index] = data;
                  setGrading(d);
                }
              } else if (!currentCategory && !isSubject) {
                setGrading([data, ...grading]);
              } else if (currentCategory && isSubject) {
                tableRef["subject-grading"].modifyData(data.id, data);
              } else if (!currentCategory && isSubject) {
                tableRef["subject-grading"].appendData(data);
              }
              form[name].forEach((field) => {
                delete field.value;
              });
              setSuccess(true);
              callback && callback();
            }
            setCurrentCategory(null);
            setSaving(false);
            setErrors({});
          },
        });
      } else {
        setErrors(errors);
      }
    },
    [
      currentCategory,
      success,
      saving,
      errors,
      grading,
      subjectGrading,
      query.subject_id,
    ]
  );
  const closeCatDialog = (name = "category") => {
    setCurrentCategory(null);
    props.history.push(
      window.location.search
        .replaceUrlParam("action", "")
        .replaceUrlParam("category", "")
    );
    form[name].forEach((field) => {
      delete field.value;
    });
    setErrors([]);
  };
  useEffect(() => {
    if (query.subject_id)
      props.history.push(
        window.location.search.replaceUrlParam("subject_id", "")
      );
    fetchData({
      before: () => setLoading(true),
      send: async () =>
        await Api.get("/api/schooladmin/school-grading-categories"),
      after: (data) => {
        if (data?.length) {
          setGrading(
            data
              .sort((a, b) => b.id - a.id)
              .filter((q) => q.school_id === props.userInfo.school_id)
          );
        }
      },
    });
    fetchData({
      before: () => setLoading(true),
      send: async () => await Api.get("/api/subjects"),
      after: (data) => {
        if (data?.length) {
          setSubjects(data);
        }
        setLoading(false);
      },
    });
  }, []);
  useEffect(() => {
    let id = parseInt(query.length);
    if (!isNaN(id) && subjects?.length) {
      getSubjectCategories(id);
    }
  }, [query.subject_id, subjects]);

  return (
    <Box>
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Success
        </Alert>
      </Snackbar>
      <Tabs
        style={{ padding: "0 30px" }}
        orientation="horizontal"
        variant="scrollable"
        value={value}
        onChange={handleChange}
      >
        {tabMap
          .filter((q) => !q.hidden)
          .map((tab, index) => (
            <Tab
              key={tab.key}
              label={tab.label}
              {...a11yProps(index)}
              onClick={() => {
                props.history.push(
                  window.location.search.replaceUrlParam("section", tab.key)
                );
                tab.onClick && tab.onClick();
              }}
            />
          ))}
      </Tabs>
      <BlankDialog
        title="Create Subject Grading Category"
        open={query.action === "create-subject-category" || false}
        onClose={() => {
          closeCatDialog("subjectCategory2");
          setCurrentCategory(null);
        }}
        actions={
          <SavingButton
            saving={saving}
            onClick={() => saveCategory("subjectCategory2")}
          >
            Save
          </SavingButton>
        }
      >
        <form
          action="#"
          onSubmit={(e) => {
            e.preventDefault();
            saveCategory("subjectCategory2");
          }}
        >
          <Typography style={{ fontSize: 18, fontWeight: 600 }}>
            {currentCategory?.category}
          </Typography>
          {form.subjectCategory2.map((field, index) => {
            let val = "";
            if (grading && field.key === "category") {
              field.options = grading.map((q) => ({
                key: q.id,
                value: q.category,
              }));
              val = field.options[0]?.key;
              field.value = val;
            }
            return !field.options ? (
              <TextField
                key={index}
                disabled={saving}
                defaultValue={val}
                fullWidth
                required={field.required}
                onChange={(e) => {
                  field.value = e.target.value;
                }}
                label={field.name}
                error={!!errors[field.key]}
                helperText={errors[field.key] || ""}
                variant="outlined"
                className="themed-input"
                {...(field.props || {})}
              />
            ) : (
              <FormControl
                fullWidth
                variant="outlined"
                className="themed-input"
                style={{ marginTop: "42px" }}
              >
                <InputLabel>{field.name}</InputLabel>
                <Select
                  required={field.required}
                  disabled={saving}
                  onChange={(e) => {
                    field.value = e.target.value;
                  }}
                  label={field.name}
                  defaultValue={field.options[0]?.key}
                >
                  {field.options?.map((op, index) => (
                    <MenuItem value={op.key} key={index}>
                      {op.value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            );
          })}
        </form>
      </BlankDialog>
      <BlankDialog
        title="Edit Grading Category"
        open={
          (currentCategory &&
            query.action === "edit-category" &&
            !isNaN(parseInt(query.category))) ||
          false
        }
        onClose={() => {
          closeCatDialog();
          setCurrentCategory(null);
        }}
        actions={
          <SavingButton
            saving={saving}
            onClick={() =>
              saveCategory(
                query.subject_id?.length ? "subjectCategory" : "category"
              )
            }
          >
            Save
          </SavingButton>
        }
      >
        <form
          action="#"
          onSubmit={(e) => {
            e.preventDefault();
            saveCategory(
              query.subject_id?.length ? "subjectCategory" : "category"
            );
          }}
        >
          <Typography style={{ fontSize: 18, fontWeight: 600 }}>
            {currentCategory?.category ||
              grading?.find(
                (q) => parseInt(q.id) === parseInt(currentCategory?.category_id)
              )?.category}
          </Typography>
          {form[query.subject_id?.length ? "subjectCategory" : "category"].map(
            (field, index) => {
              let val = "";
              if (currentCategory) {
                val = currentCategory[field.key];
                if (field.key === "category_percentage") {
                  val = parseFloat(currentCategory[field.key]) * 100;
                }
                if (!currentCategory.category && field.key === "category") {
                  let d = grading.find(
                    (q) =>
                      parseInt(q.id) === parseInt(currentCategory.category_id)
                  );
                  if (d) val = d.category;
                }
                field.value = val;
              }
              return (
                <TextField
                  key={index}
                  disabled={saving || field.props?.disabled}
                  defaultValue={val}
                  fullWidth
                  required={field.required}
                  onChange={(e) => {
                    field.value = e.target.value;
                  }}
                  label={field.name}
                  error={!!errors[field.key]}
                  helperText={errors[field.key] || ""}
                  variant="outlined"
                  className="themed-input"
                  {...(field.props || {})}
                />
              );
            }
          )}
        </form>
      </BlankDialog>
      <BlankDialog
        title="Create Grading Category"
        open={query.action === "new-category" || false}
        onClose={() => {
          closeCatDialog();
          setCurrentCategory(null);
        }}
        actions={
          <SavingButton
            saving={saving}
            onClick={() =>
              saveCategory("category", () =>
                props.history.push(
                  window.location.search.replaceUrlParam(
                    "action",
                    "edit-category"
                  )
                )
              )
            }
          >
            Save
          </SavingButton>
        }
      >
        {!saving && (
          <form
            action="#"
            onSubmit={(e) => {
              e.preventDefault();
              saveCategory("category", () =>
                props.history.push(
                  window.location.search.replaceUrlParam(
                    "action",
                    "edit-category"
                  )
                )
              );
            }}
          >
            {form.category.map((field, index) => {
              return (
                <TextField
                  key={index}
                  disabled={saving}
                  type={field.type || "text"}
                  fullWidth
                  required={field.required}
                  onChange={(e) => {
                    field.value = e.target.value;
                  }}
                  label={field.name}
                  error={!!errors[field.key]}
                  helperText={errors[field.key] || ""}
                  variant="outlined"
                  className="themed-input"
                  {...(field.props || {})}
                />
              );
            })}
          </form>
        )}
      </BlankDialog>
      <Box p={4}>
        {loading && (
          <Box
            width="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={4}
          >
            <CircularProgress />
          </Box>
        )}
        <TabPanel value={value} index={0}>
          {!loading && (
            <React.Fragment>
              {!query.subject_id?.length ? (
                <UserTable
                  {...props}
                  onSelect={(item) => setCurrentCategory(item)}
                  loading={loading}
                  headers={[{ id: "name", title: "Subject", width: "100%" }]}
                  saving={saving}
                  savingId={savingId}
                  data={subjects}
                  getRef={(ref) => (tableRef["school-grading"] = ref)}
                  options={[]}
                  tableProps={{ noOptions: true }}
                  optionActions={{
                    delete: (item) => removeCategory(item),
                  }}
                  actions={[]}
                  rowRenderMobile={(item, itemController) => (
                    <Box
                      display="flex"
                      flexWrap="wrap"
                      width="90%"
                      flexDirection="column"
                      onClick={() => {
                        props.history.push(
                          window.location.search.replaceUrlParam(
                            "subject_id",
                            item.id
                          )
                        );
                        getSubjectCategories(item.id);
                      }}
                      justifyContent="space-between"
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
                          SUBJECT
                        </Typography>
                        <Typography
                          variant="body1"
                          style={{
                            fontWeight: "bold",
                            fontSize: "0.9em",
                          }}
                        >
                          {item.name}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  rowRender={(item, itemController) => {
                    return (
                      <Box
                        p={2}
                        display="flex"
                        width="100%"
                        onClick={() => {
                          props.history.push(
                            window.location.search.replaceUrlParam(
                              "subject_id",
                              item.id
                            )
                          );
                          getSubjectCategories(item.id);
                        }}
                      >
                        <Box width="100%">
                          <Typography style={{ fontWeight: 600 }}>
                            {item.name}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  }}
                />
              ) : null}
              {query.subject_id?.length ? (
                <UserTable
                  {...props}
                  onSelect={(item) => setCurrentCategory(item)}
                  loading={loading}
                  headers={[
                    { id: "name", title: "Category Name", width: "50%" },
                    {
                      id: "category_percentage",
                      title: "Percentage",
                      width: "50%",
                    },
                  ]}
                  saving={saving}
                  savingId={savingId}
                  data={subjectGrading}
                  getRef={(ref) => (tableRef["subject-grading"] = ref)}
                  options={[
                    { name: "Edit", value: "edit-category" },
                    {
                      name: "Delete",
                      value: "delete-category",
                    },
                  ]}
                  optionActions={{
                    delete: (item) => removeCategory(item, "subject"),
                  }}
                  actions={[
                    {
                      name: "New Category",
                      onClick: () =>
                        props.history.push(
                          window.location.search.replaceUrlParam(
                            "action",
                            "create-subject-category"
                          )
                        ),
                    },
                  ]}
                  rowRenderMobile={(item, itemController) => {
                    const cat = grading.find(
                      (q) => parseInt(q.id) === parseInt(item.category_id)
                    );
                    return (
                      <Box
                        display="flex"
                        flexWrap="wrap"
                        width="90%"
                        flexDirection="column"
                        onClick={() => {
                          props.history.push(
                            window.location.search.replaceUrlParam(
                              "subject_id",
                              item.id
                            )
                          );
                          getSubjectCategories(item.id);
                        }}
                        justifyContent="space-between"
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
                            CATEGORY NAME
                          </Typography>
                          <Typography
                            variant="body1"
                            style={{
                              fontWeight: "bold",
                              fontSize: "0.9em",
                            }}
                          >
                            {cat?.category}
                          </Typography>
                        </Box>
                        <Box width="100%" marginBottom={1}>
                          <Typography
                            style={{
                              fontWeight: "bold",
                              color: "#38108d",
                              fontSize: "1em",
                            }}
                          >
                            PERCENTAGE
                          </Typography>
                          <Typography
                            variant="body1"
                            style={{
                              fontWeight: "bold",
                              fontSize: "0.9em",
                            }}
                          >
                            {(item.category_percentage * 100).toFixed(2)} %
                          </Typography>
                        </Box>
                      </Box>
                    );
                  }}
                  rowRender={(item, itemController) => {
                    return SubjectGradingCategory(item);
                  }}
                />
              ) : null}
            </React.Fragment>
          )}
        </TabPanel>
        <TabPanel value={value} index={1}>
          {!loading && (
            <UserTable
              {...props}
              onSelect={(item) => {
                setCurrentCategory(item);
              }}
              loading={loading}
              headers={[
                { id: "id", title: "ID", width: "5%" },
                { id: "category", title: "Category Name", width: "47%" },
                {
                  id: "category_percentage",
                  title: "Percentage",
                  width: "47%",
                },
              ]}
              saving={saving}
              savingId={savingId}
              getRef={(ref) => (tableRef["school-grading"] = ref)}
              options={[
                { name: "Edit", value: "edit-category" },
                {
                  name: "Delete",
                  value: "delete-category",
                },
              ]}
              optionActions={{
                delete: (item) => removeCategory(item),
              }}
              actions={[
                {
                  name: "New Category",
                  onClick: () =>
                    props.history.push(
                      window.location.search.replaceUrlParam(
                        "action",
                        "new-category"
                      )
                    ),
                },
              ]}
              data={grading}
              rowRenderMobile={(item, itemController) => (
                <Box
                  display="flex"
                  flexWrap="wrap"
                  width="90%"
                  flexDirection="column"
                  onClick={() => itemController("edit-category", item)}
                  justifyContent="space-between"
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
                      CATEGORY NAME
                    </Typography>
                    <Typography
                      variant="body1"
                      style={{
                        fontWeight: "bold",
                        fontSize: "0.9em",
                      }}
                    >
                      {item.category}
                    </Typography>
                  </Box>
                  <Box width="100%" marginBottom={1}>
                    <Typography
                      style={{
                        fontWeight: "bold",
                        color: "#38108d",
                        fontSize: "1em",
                      }}
                    >
                      PERCENTAGE
                    </Typography>
                    <Typography
                      variant="body1"
                      style={{
                        fontWeight: "bold",
                        fontSize: "0.9em",
                      }}
                    >
                      {(item.category_percentage * 100).toFixed(2)} %
                    </Typography>
                  </Box>
                </Box>
              )}
              rowRender={(item, itemController) => (
                <Box
                  p={2}
                  display="flex"
                  width="100%"
                  onClick={() => itemController("edit-category", item)}
                >
                  <Box width="5%">
                    <Typography style={{ fontWeight: 600 }}>
                      {item.id}
                    </Typography>
                  </Box>
                  <Box width="47%" display="flex" alignItems="center">
                    <Typography style={{ marginLeft: 13 }}>
                      {item.category}
                    </Typography>
                  </Box>
                  <Box width="47%">
                    <Typography>
                      {(item.category_percentage * 100).toFixed(2)} %
                    </Typography>
                  </Box>
                </Box>
              )}
            />
          )}
        </TabPanel>
      </Box>
    </Box>
  );
}
function ClassDetails(props) {
  const theme = useTheme();
  const { teacher, color, id, subject, section, year } = props.class;
  const frequency = useMemo(() => {
    return props.class?.frequency === "DAILY"
      ? ["M", "T", "W", "R", "F", "S", "U"]
      : typeof props.class?.frequency === "string"
      ? props.class.frequency
          .split(",")
          .filter((q) => typeof q === "string" && q)
      : [];
  }, [props.class]);
  const sortedFrequency = useMemo(() => ["u", "m", "t", "w", "r", "f", "s"], [
    frequency,
  ]);
  const initialClass = useMemo(
    () => ({
      ...props.class,
      years: props.years,
      sections: props.sections,
      section_id: section?.id || props.sections[0]?.id,
      subject_id: subject?.id || props.subjects[0]?.id,
      year_id: year?.id || props.years[0]?.id,
      subjects: props.subjects,
      teacher: props.class?.teacher,
      frequency,
      date_from: props.class?.date_from,
      date_to: props.class?.date_to,
      time_from: props.class?.time_from,
      time_to: props.class?.time_to,
    }),
    [props.class, props.subjects, props.years, props.sections]
  );
  const [CLASS, setCLASS] = useState(initialClass);
  const [saving, setSaving] = useState(false);
  const [savingImg, setSavingImg] = useState(false);
  const class_id = id;
  const styles = useStyles();
  const [editing, setEditing] = useState(false || !!props.editOnly);
  const query = qs.parse(window.location.search);
  const tabMap = useMemo(
    () => [
      createTab("details", "Details"),
      createTab("schedules", "Schedules"),
      createTab("students", "Students", { hidden: props.editOnly }),
    ],
    [props.editOnly]
  );
  const tabid = tabMap.findIndex((q) => q.key === query.section);
  const [value, setValue] = useState(tabid >= 0 ? tabid : 0);

  const handleSave = async () => {
    const frequencyOrder = ["m", "t", "w", "r", "f", "s", "u"];
    setSaving(true);
    const {
      id,
      name,
      description,
      teacher,
      subject_id,
      year_id,
      date_from,
      frequency,
      date_to,
      time_from,
      time_to,
      section_id,
    } = CLASS;
    let data = {
      id,
      name: name || "Class description",
      description,
      teacher_id: teacher?.id,
      date_from,
      frequency:
        typeof frequency === "object"
          ? frequency?.join(",")
          : typeof frequency === "string"
          ? frequency
          : "",
      date_to,
      time_from,
      time_to,
      subject_id,
      year_id,
      section_id,
    };
    let finalData = {};
    data = Object.keys(data)
      .filter(
        (k) => data[k] !== undefined && data[k] !== null && data[k] !== ""
      )
      .map((q) => (finalData[q] = data[q]));
    try {
      let orderedFrequency = frequencyOrder
        .filter((q) =>
          typeof frequency === "object"
            ? frequency.indexOf(q.toUpperCase()) >= 0
            : false
        )
        .join(",");
      let res = await Api.post("/api/schooladmin/class/save", {
        body: {
          ...finalData,
          ...(orderedFrequency ? { frequency: orderedFrequency } : {}),
        },
      });
      if (res?.id) {
        let newDetails = await Api.get("/api/teacher/class/" + res.id);
        if (newDetails) {
          let t = props.parentData?.childInfo;
          if (t?.id === newDetails?.teacher?.id) {
            UserData.updateClass(
              res.id,
              {
                ...newDetails,
                ...finalData,
              },
              true
            );
            if (props.editOnly)
              props.history.push(
                makeLinkTo(["class", res.id, res?.next_schedule?.id])
              );
          } else {
            props.history.push("/dashboard/");
          }
        }
      }
    } catch (e) {
      console.log(e);
      alert("Please fill in the required fields.");
      if (!props.editOnly) {
        setCLASS(initialClass);
      }
    }
    if (!props.editOnly) {
      setEditing(false);
    }
    setSaving(false);
  };
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const getSchedules = useCallback(() => {
    let events = [];
    if (CLASS.date_from && CLASS.date_to) {
      var a = moment(CLASS.date_from);
      var b = moment(CLASS.date_to);
      for (var m = moment(a); m.diff(b, "days") <= 0; m.add(1, "days")) {
        events.push({
          date: m.format("YYYY-MM-DD"),
          status: "schedule",
        });
      }
      return events;
    }
  }, [CLASS]);

  const editClassPicture = (callback) => {
    let input = document.querySelector("#edit-class-pic-input");
    if (!input) {
      let x = document.createElement("input");
      x.setAttribute("accept", "image/x-png,image/gif,image/jpeg");
      x.setAttribute("type", "file");
      x.setAttribute("id", "edit-class-pic-input");
      document.querySelector("#root").appendChild(x);
    }
    input = document.querySelector("#edit-class-pic-input");
    let newinput = input.cloneNode(true);
    newinput.addEventListener("change", async () => {
      if (newinput.files.length && class_id !== undefined) {
        try {
          setSavingImg(true);
          let body = new FormData();
          body.append("image", newinput.files[0]);
          await Api.post("/api/upload/class/image/" + class_id, {
            body,
          });
          let newClassDetails = await UserData.updateClassDetails(class_id);
          UserData.updateClass(class_id, newClassDetails[class_id]);
          socket.emit(
            "new class details",
            JSON.stringify({ details: newClassDetails, id: class_id })
          );
        } catch (e) {}
      }
      callback && callback(URL.createObjectURL(newinput.files[0]));
    });
    input.parentNode.replaceChild(newinput, input);
    input = document.querySelector("#edit-class-pic-input");
    input.click();
  };
  useEffect(() => {
    let d = document.querySelector("#dashboard-panel")?.firstChild?.firstChild;
    if (d) d.scrollTop = 0;
  }, [props.class]);
  useEffect(() => {
    setCLASS({
      ...CLASS,
      ...initialClass,
    });
  }, [props.subjects, props.sections, props.years]);
  return (
    <React.Fragment>
      <Grow in={true}>
        <Box
          style={{
            padding: "18px auto",
            borderBottom: "1px solid rgba(0,0,0,0.16)",
            top: 0,
            right: 0,
            left: 0,
            zIndex: 11,
          }}
          component={Paper}
          className="sticky"
          p={2}
          display="flex"
          alignItems="center"
        >
          {(!editing || props.editOnly) && (
            <IconButton onClick={() => props.history.push("/dashboard")}>
              <Icon>arrow_back</Icon>
            </IconButton>
          )}
          {(props.classes[id]?.bg_image || props.classes[id]?.image) && (
            <ButtonBase
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 50,
                width: 50,
                height: 50,
                borderRadius: "50%",
                overflow: "hidden",
                marginRight: "7px",
                position: "relative",
              }}
            >
              <img
                onClick={() => props.history.push("/class/" + id)}
                src={props.classes[id]?.bg_image || props.classes[id]?.image}
                width="auto"
                height="100%"
              />
              {editing && (
                <Box
                  onClick={() =>
                    !savingImg && editClassPicture(() => setSavingImg(false))
                  }
                  bgcolor={
                    savingImg ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"
                  }
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    top: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {!savingImg ? (
                    <Icon style={{ color: "#fff" }}>camera_alt</Icon>
                  ) : (
                    <CircularProgress size={15} />
                  )}
                </Box>
              )}
            </ButtonBase>
          )}
          <Typography
            style={{
              maxWidth: "40%",
              fontSize: 18,
              fontWeight: 500,
              marginLeft: 13,
              cursor: "pointer",
            }}
            onClick={() => !editing && props.history.push("/class/" + id)}
          >
            {CLASS?.name}
          </Typography>
          <SavingButton
            saving={saving}
            style={{ marginLeft: 13, width: "auto" }}
            onClick={() => {
              if (editing) handleSave();
              else if (!props.editOnly) {
                setEditing(true);
              }
            }}
          >
            {editing || props.editOnly ? (
              "Save  "
            ) : (
              <React.Fragment>
                Edit <Icon fontSize="small">create_outlined</Icon>
              </React.Fragment>
            )}
          </SavingButton>
          {editing && !props.editOnly && (
            <Button
              style={{ color: "red", width: "auto" }}
              onClick={() => {
                setCLASS(initialClass);
                setEditing(false);
              }}
            >
              Cancel
            </Button>
          )}
        </Box>
      </Grow>
      <Tabs
        style={{ padding: "0 30px" }}
        orientation="horizontal"
        variant="scrollable"
        value={value}
        onChange={handleChange}
      >
        {tabMap
          .filter((q) => !q.hidden)
          .map((tab, index) => (
            <Tab
              key={tab.key}
              label={tab.label}
              {...a11yProps(index)}
              onClick={() => {
                props.history.push(
                  window.location.search.replaceUrlParam("section", tab.key)
                );
                tab.onClick && tab.onClick();
              }}
            />
          ))}
      </Tabs>
      <Slide in={true} direction="up">
        <Box width="100%" overflow="auto" p={4}>
          <Box component={Paper} p={4}>
            <form
              action="#"
              onSubmit={() => false}
              className={
                !editing && !props.editOnly ? styles.notEditingForm : ""
              }
              style={{ width: "100%" }}
            >
              <TabPanel value={value} index={0}>
                <Box>
                  {props.childInfo && (
                    <PopupState variant="popover" popupId="viewing-as">
                      {(popupState) => (
                        <React.Fragment>
                          <Box
                            marginTop={1}
                            onClick={() => {
                              editing && popupState.open();
                            }}
                            display={"flex"}
                            justifyContent="flex-start"
                            alignItems="center"
                            style={{ cursor: "pointer" }}
                            {...(editing ? bindTrigger(popupState) : {})}
                          >
                            <Avatar
                              src={
                                CLASS.teacher?.preferences?.profile_picture ||
                                CLASS.teacher?.profile_picture
                              }
                              alt={CLASS.teacher?.first_name}
                            />
                            <Box marginLeft={2}>
                              <Typography style={{ fontSize: 12 }}>
                                Teacher
                              </Typography>
                              <Typography
                                style={{
                                  fontWeight: 16,
                                  fontWeight: 500,
                                }}
                              >
                                {CLASS.teacher?.first_name +
                                  " " +
                                  CLASS.teacher?.last_name}
                              </Typography>
                            </Box>
                            {editing && (
                              <IconButton
                                color="primary"
                                {...bindTrigger(popupState)}
                              >
                                <Icon>expand_more</Icon>
                              </IconButton>
                            )}
                          </Box>
                          <Menu
                            {...bindMenu(popupState)}
                            style={{
                              maxWidth: 300,
                            }}
                          >
                            {props.parentData?.children?.map((child, index) => {
                              return (
                                <MenuItem
                                  key={index}
                                  selected={
                                    CLASS.teacher?.id === child.childInfo.id
                                  }
                                  onClick={() => {
                                    setCLASS({
                                      ...CLASS,
                                      teacher: child.childInfo,
                                    });
                                    popupState.close();
                                  }}
                                >
                                  <Avatar
                                    src={
                                      child.childInfo?.preferences
                                        ?.profile_picture
                                    }
                                    alt={child.childInfo.first_name}
                                  />
                                  <Typography style={{ marginLeft: 13 }}>
                                    {child.childInfo.first_name +
                                      " " +
                                      child.childInfo.last_name}
                                  </Typography>
                                </MenuItem>
                              );
                            })}
                          </Menu>
                        </React.Fragment>
                      )}
                    </PopupState>
                  )}
                  {["name", "description"].map((item, index) => (
                    <Box width="100%" marginTop={1} key={index}>
                      <TextField
                        disabled={!editing}
                        name={item}
                        fullWidth
                        variant="outlined"
                        type="text"
                        value={
                          CLASS[item] || (editing ? "" : "No " + item.ucfirst())
                        }
                        onChange={(e) => {
                          let s = {};
                          s[item] = e.target.value;
                          setCLASS({ ...CLASS, ...s });
                        }}
                        className={
                          "themed-input " +
                          (theme.palette.type === "dark" ? "light" : "dark")
                        }
                        label={item.ucfirst() + (editing ? "*" : "")}
                      />
                    </Box>
                  ))}
                  <Box display="flex" style={{ marginTop: "44px" }}>
                    {CLASS.subject_id ? (
                      <FormControl
                        className="themed-input"
                        variant="outlined"
                        disabled={!editing}
                      >
                        <InputLabel>Subject</InputLabel>
                        <Select
                          label="Subject"
                          name="subject"
                          value={CLASS?.subject_id}
                          onChange={(e) =>
                            setCLASS({
                              ...CLASS,
                              subject_id: parseInt(e.target.value),
                            })
                          }
                        >
                          {CLASS?.subjects.map((subject, index) => (
                            <MenuItem key={index} value={subject.id}>
                              {subject.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <Box display="flex" alignItems="center" marginRight={2}>
                        <CircularProgress
                          size={10}
                          style={{ marginRight: 13 }}
                        />
                        retrieving subjects...
                      </Box>
                    )}
                  </Box>
                  <Box display="flex" style={{ marginTop: "44px" }}>
                    {CLASS.section_id ? (
                      <FormControl
                        className="themed-input"
                        variant="outlined"
                        disabled={!editing}
                      >
                        <InputLabel>Section</InputLabel>
                        <Select
                          label="Section"
                          name="section"
                          value={CLASS?.section_id}
                          onChange={(e) =>
                            setCLASS({
                              ...CLASS,
                              section_id: parseInt(e.target.value),
                            })
                          }
                        >
                          {CLASS?.sections.map((section, index) => (
                            <MenuItem key={index} value={section.id}>
                              {section.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <Box display="flex" alignItems="center" marginRight={2}>
                        <CircularProgress
                          size={10}
                          style={{ marginRight: 13 }}
                        />
                        retrieving sections...
                      </Box>
                    )}
                  </Box>
                  <Box display="flex" style={{ marginTop: "44px" }}>
                    {CLASS.year_id ? (
                      <FormControl
                        className="themed-input"
                        variant="outlined"
                        disabled={!editing}
                      >
                        <InputLabel>Year Level</InputLabel>
                        <Select
                          label="Year Level"
                          name="year-level"
                          value={CLASS?.year_id}
                          onChange={(e) =>
                            setCLASS({
                              ...CLASS,
                              year_id: parseInt(e.target.value),
                            })
                          }
                        >
                          {CLASS.years.map((year, index) => (
                            <MenuItem key={index} value={year.id}>
                              {year.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <Box display="flex" alignItems="center" marginRight={2}>
                        <CircularProgress
                          size={10}
                          style={{ marginRight: 13 }}
                        />
                        retrieving year levels...
                      </Box>
                    )}
                  </Box>
                </Box>
              </TabPanel>
              <TabPanel value={value} index={1}>
                <Box display="flex">
                  <Box>
                    <Box marginTop={"44px"} display="flex">
                      <TextField
                        variant="outlined"
                        label={"Date" + (editing ? "*" : "")}
                        disabled={!editing}
                        className={
                          "themed-input no-margin small " +
                          (theme.palette.type === "dark" ? "light" : "dark")
                        }
                        type="date"
                        defaultValue={CLASS.date_from}
                        {...(!editing ? { value: CLASS.date_from } : {})}
                        onChange={(e) => {
                          setCLASS({ ...CLASS, date_from: e.target.value });
                        }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        style={{
                          height: 46,
                          paddingRight: theme.spacing(2),
                          flex: 1,
                        }}
                      />
                      <TextField
                        variant="outlined"
                        disabled={!editing}
                        className={
                          "themed-input no-margin small " +
                          (theme.palette.type === "dark" ? "light" : "dark")
                        }
                        type="date"
                        defaultValue={CLASS.date_to}
                        {...(!editing ? { value: CLASS.date_to } : {})}
                        onChange={(e) => {
                          setCLASS({ ...CLASS, date_to: e.target.value });
                        }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        style={{
                          height: 46,
                          paddingRight: theme.spacing(2),
                          flex: 1,
                        }}
                      />
                    </Box>
                    <Box marginTop={"35px"} display="flex">
                      <TextField
                        variant="outlined"
                        label={"Time" + (editing ? "*" : "")}
                        disabled={!editing}
                        className={
                          "themed-input no-margin small " +
                          (theme.palette.type === "dark" ? "light" : "dark")
                        }
                        type="time"
                        defaultValue={CLASS.time_from}
                        {...(!editing ? { value: CLASS.time_from } : {})}
                        onChange={(e) => {
                          setCLASS({ ...CLASS, time_from: e.target.value });
                        }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        inputProps={{
                          step: 300,
                        }}
                        style={{
                          height: 46,
                          paddingRight: theme.spacing(2),
                          flex: 1,
                        }}
                      />
                      <TextField
                        variant="outlined"
                        disabled={!editing}
                        className={
                          "themed-input no-margin small " +
                          (theme.palette.type === "dark" ? "light" : "dark")
                        }
                        type="time"
                        defaultValue={CLASS.time_to}
                        {...(!editing ? { value: CLASS.time_to } : {})}
                        onChange={(e) => {
                          setCLASS({ ...CLASS, time_to: e.target.value });
                        }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        inputProps={{
                          step: 300,
                        }}
                        style={{
                          height: 46,
                          paddingRight: theme.spacing(2),
                          flex: 1,
                        }}
                      />
                    </Box>
                    <FormControl style={{ marginTop: 8 }} disabled={!editing}>
                      <FormLabel>Frequency</FormLabel>
                      <FormGroup>
                        {[
                          { key: "M", value: "Monday" },
                          { key: "T", value: "Tuesday" },
                          { key: "W", value: "Wednesday" },
                          { key: "R", value: "Thursday" },
                          { key: "F", value: "Friday" },
                          { key: "S", value: "Saturday" },
                          { key: "U", value: "Sundary" },
                        ].map((day, index) => (
                          <FormControlLabel
                            key={index}
                            control={
                              <Checkbox
                                checked={CLASS.frequency.indexOf(day.key) >= 0}
                                onChange={() => {
                                  let i = CLASS.frequency?.indexOf(day.key);
                                  let c = [...CLASS.frequency];
                                  if (i >= 0) c.splice(i, 1);
                                  else c.push(day.key);
                                  setCLASS({
                                    ...CLASS,
                                    frequency: c.filter(
                                      (q) => typeof q === "string" && q
                                    ),
                                  });
                                }}
                                name="frequency[]"
                              />
                            }
                            label={day.value}
                          />
                        ))}
                      </FormGroup>
                    </FormControl>
                  </Box>
                  <Box marginLeft={4}>
                    <CalendarProvider
                      style={{ minWidth: 240 }}
                      variant={"small"}
                      events={getSchedules()}
                      schedules={[]}
                      years={
                        CLASS.date_to && CLASS.date_from
                          ? getYears(
                              moment(CLASS.date_from || new Date()).year(),
                              moment(CLASS.date_to).year()
                            )
                          : [moment().year()]
                      }
                    >
                      <Weekdays />
                      <Dates
                        includeDays={
                          typeof CLASS.frequency === "object"
                            ? sortedFrequency
                                .map((f, i) =>
                                  CLASS.frequency.indexOf(f.toUpperCase()) >= 0
                                    ? i
                                    : null
                                )
                                .filter((f) => f !== null)
                            : CLASS.frequency.split(",").filter((q) => !!q)
                                .length &&
                              sortedFrequency
                                .map((f, i) =>
                                  CLASS.frequency
                                    .split(",")
                                    .filter((q) => !!q)
                                    .indexOf(f.toUpperCase()) >= 0
                                    ? i
                                    : null
                                )
                                .filter((f) => f !== null)
                        }
                      />
                    </CalendarProvider>
                  </Box>
                </Box>
              </TabPanel>
              <TabPanel value={value} index={2}>
                <UserTable
                  {...props}
                  name="students"
                  onRowClick={(item, itemController) =>
                    itemController("view-user", item)
                  }
                  options={[
                    {
                      name: "Reset Password",
                      value: "reset-password",
                    },
                  ]}
                />
              </TabPanel>
            </form>
          </Box>
        </Box>
      </Slide>
    </React.Fragment>
  );
}

const createFormField = (key, name, opt) => ({ key, name, ...opt });
const form = {
  section: [
    createFormField("name", "Name", {
      required: true,
      minChar: 2,
      maxChar: 20,
      pattern: /[a-zA-Z]+/,
    }),
  ],
  category: [
    createFormField("category", "Category Name", {
      required: true,
      minChar: 1,
      maxChar: 40,
      pattern: /[a-zA-Z]+/,
    }),
    createFormField("category_percentage", "Percentage", {
      props: {
        type: "number",
        inputProps: {
          max: 100,
          min: 1,
        },
      },
      type: "number",
      required: true,
    }),
  ],
  subjectCategory: [
    createFormField("category", "Category Name", {
      required: true,
      minChar: 1,
      maxChar: 40,
      pattern: /[a-zA-Z]+/,
      props: {
        disabled: true,
      },
    }),
    createFormField("category_percentage", "Percentage", {
      props: {
        type: "number",
        inputProps: {
          max: 100,
          min: 1,
        },
      },
      type: "number",
      required: true,
    }),
  ],
  subjectCategory2: [
    createFormField("category", "Category Name", {
      required: true,
      minChar: 1,
      maxChar: 40,
    }),
    createFormField("category_percentage", "Percentage", {
      props: {
        type: "number",
        inputProps: {
          max: 100,
          min: 1,
        },
      },
      type: "number",
      required: true,
    }),
  ],
  teacher: [
    createFormField("username", "Username", {
      required: true,
      titleCase: false,
      minChar: 4,
      maxChar: 20,
      pattern: /^[a-zA-Z0-9]*$/,
    }),
    createFormField("password", "Password", {
      required: true,
      minChar: 4,
      props: {
        type: "password",
      },
    }),
    createFormField("first_name", "First Name", {
      required: true,
      titleCase: true,
      minChar: 2,
      maxChar: 26,
      pattern: /[a-zA-Z]+/,
    }),
    createFormField("last_name", "Last Name", {
      required: true,
      titleCase: true,
      minChar: 2,
      maxChar: 26,
      pattern: /[a-zA-Z]+/,
    }),
    createFormField("middle_name", "Middle Name", {
      titleCase: true,
      minChar: 1,
      maxChar: 26,
      pattern: /[a-zA-Z]+/,
    }),
    createFormField("gender", "Gender", {
      pattern: /[a-zA-Z]+/,
      options: [
        { key: "m", value: "Male" },
        { key: "f", value: "Female" },
        { key: "u", value: "Others" },
      ],
    }),
    createFormField("email", "Email", {
      pattern: /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
      props: {
        type: "email",
      },
    }),
    createFormField("phone_number", "Phone"),
  ],
};
form.parent = form.teacher;
form.student = form.teacher;
let modifiedChildren = false;
const tableRef = {};
function Accounts(props) {
  const query = qs.parse(window.location.search);
  const tabMap = [
    createTab("teachers", "Teachers"),
    createTab("parents", "Parents"),
    createTab("students", "Students"),
  ];
  const [success, setSuccess] = useState(false);
  const [successAdmin, setSuccessAdmin] = useState(false);
  const [errors, setErrors] = useState({});
  const tabid = tabMap.findIndex((q) => q.key === query.section);
  const [value, setValue] = useState(tabid >= 0 ? tabid : 0);
  const [children, setChildren] = useState([]);
  const [childrenSearch, setChildrenSearch] = useState("");
  const [childrenPage, setChildrenPage] = useState(1);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [selectedChild, setSelectedChild] = useState();
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState();
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const getFilteredChildren = useCallback(
    () =>
      children?.filter(
        (q) =>
          JSON.stringify(q)
            .toLowerCase()
            .indexOf(childrenSearch.toLowerCase()) >= 0
      ) || [],
    [childrenSearch, children]
  );
  const addChild = (c) => {
    if (!c?.id) return;
    fetchData({
      before: () => setSaving(true),
      send: async () =>
        Api.post("/api/schooladmin/parent/add-child", {
          body: { parent_id: parseInt(query.parent), student_id: c.id },
        }),
      after: (data) => {
        if (data?.id) {
          modifiedChildren = true;
          setSuccess(true);
          setCurrentUser({
            ...currentUser,
            children: [
              {
                id: c.id,
                childInfo: { ...c, name: c.first_name + " " + c.last_name },
              },
              ...currentUser.children,
            ],
          });
        }
        setSaving(false);
      },
    });
  };
  const removeChild = (c) => {
    if (!c?.id) return;
    fetchData({
      before: () => setSaving(true),
      send: async () =>
        Api.delete(
          "/api/schooladmin/parent/remove-child?parent_id=" +
            currentUser?.id +
            "&student_id=" +
            c.id
        ),
      after: (data) => {
        if (data?.id) {
          modifiedChildren = true;
          let s = [...(currentUser?.children || [])];
          if (s) {
            s = s.filter((q) => q?.childInfo?.id !== c.id);
          }
          setCurrentUser({ ...currentUser, children: s });
          setChildren(s.map((q) => q.childInfo));
          setSuccess(true);
          setSelectedChild(null);
        }
        setSaving(false);
      },
    });
  };

  const registerUser = (name) => {
    if (!form[name]) return;
    let errors = {};
    let body = {};
    form[name].forEach((field) => {
      const {
        minChar,
        value,
        required,
        maxChar,
        key,
        pattern,
        titleCase,
      } = field;
      if (titleCase && typeof value === "string") body[key] = value.titleCase();
      else body[key] = value;
      let e;
      if (required) {
        if (!value) {
          e = "Please enter a " + field.name;
        } else if (minChar && value?.length < minChar) {
          e = "Please enter at least " + minChar + " length " + field.name;
        } else if (maxChar && value?.length > maxChar) {
          e = "Maximum characters execeed.";
        } else if (pattern && !new RegExp(pattern).test(value)) {
          e = "Please enter a valid " + field.name;
        }
      } else if (value && pattern && !new RegExp(pattern).test(value)) {
        e = "Please enter a valid " + field.name;
      }
      if (e) errors[key] = e;
    });
    if (!Object.keys(errors).length) {
      fetchData({
        before: () => setSaving(true),
        send: async () =>
          await Api.post("/api/admin/register/" + name, { body }),
        after: (data) => {
          if (data && data.id && tableRef[name].appendData) {
            tableRef[name].appendData(data);
            form[name].forEach((field) => {
              delete field.value;
            });
            props.history.push(
              window.location.search.replaceUrlParam("register", "")
            );
            setSuccess(true);
          }
          setSaving(false);
          setErrors({});
        },
      });
    } else {
      setErrors(errors);
    }
  };
  useEffect(() => {
    if (query.action === "add-child") {
      fetchData({
        before: () => {
          setChildren(null);
          setLoadingChildren(true);
        },
        send: async () => await Api.get("/api/schooladmin/students"),
        after: (data) => {
          if (typeof data === "object")
            setChildren(
              data.map((q) => ({
                ...q,
                name: q.first_name + " " + q.last_name,
              }))
            );
          else setChildren([]);
          setLoadingChildren(false);
        },
      });
    } else if (query.action === "remove-child") {
      if (currentUser?.children) {
        setChildren(
          currentUser.children.map((q) => ({
            ...q.childInfo,
            name: q.childInfo.first_name + " " + q.childInfo.last_name,
          }))
        );
      } else {
        setChildren([]);
      }
      setLoadingChildren(false);
    }
  }, [query.action]);
  const AccountPanel = useCallback(
    ({ name, tableProps }) => (
      <React.Fragment>
        <UserTable
          name={name + "s"}
          onRowClick={(item, itemController) =>
            itemController("view-user", item)
          }
          options={tableProps?.options || []}
          actions={[
            {
              name: "Add " + name.ucfirst(),
              onClick: () =>
                props.history.push(
                  window.location.search.replaceUrlParam("register", name)
                ),
            },
          ]}
          getRef={(r) => (tableRef[name] = r)}
          {...(tableProps || {})}
          {...props}
        />
        <BlankDialog
          open={query.register === name}
          title={"Add New " + name.ucfirst()}
          onClose={() => {
            setErrors([]);
            props.history.push(
              window.location.search.replaceUrlParam("register", "")
            );
            form[name].forEach((field) => {
              delete field.value;
            });
          }}
          actions={
            <SavingButton saving={saving} onClick={() => registerUser(name)}>
              Submit
            </SavingButton>
          }
        >
          <form
            action="#"
            onSubmit={(e) => {
              e.preventDefault();
              registerUser(name);
            }}
          >
            {form[name].map((field, index) =>
              !field.options ? (
                <TextField
                  key={index}
                  disabled={saving}
                  fullWidth
                  required={field.required}
                  onChange={(e) => {
                    field.value = e.target.value;
                  }}
                  label={field.name}
                  error={!!errors[field.key]}
                  helperText={errors[field.key] || ""}
                  variant="outlined"
                  className="themed-input"
                  {...(field.props || {})}
                />
              ) : (
                <FormControl
                  fullWidth
                  variant="outlined"
                  className="themed-input"
                  style={{ marginTop: "42px" }}
                >
                  <InputLabel>{field.name}</InputLabel>
                  <Select
                    required={field.required}
                    disabled={saving}
                    onChange={(e) => {
                      field.value = e.target.value;
                    }}
                    label={field.name}
                    defaultValue={field.options[0].key}
                  >
                    {field.options.map((op, index) => (
                      <MenuItem value={op.key} key={index}>
                        {op.value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )
            )}
          </form>
        </BlankDialog>
      </React.Fragment>
    ),
    [errors, query.register, saving]
  );
  const ChildrenDialog = useCallback(
    ({ title, action = {} }) => (
      <BlankDialog
        open={currentUser && query.action === action.query}
        title={title}
        onClose={() => {
          action.onClose && action.onClose();
          props.history.push(
            window.location.search.replaceUrlParam("action", "")
          );
        }}
        actions={
          <SavingButton
            saving={saving}
            onClick={() =>
              action.query === "add-child"
                ? addChild(selectedChild)
                : action.query === "remove-child"
                ? removeChild(selectedChild)
                : null
            }
          >
            {action.saveTitle}
          </SavingButton>
        }
      >
        {currentUser && (
          <Box
            width="100%"
            overflow="hidden"
            display="flex"
            alignItems="center"
            marginBottom={2}
          >
            <Avatar
              src={currentUser?.preferences?.profile_picture}
              alt={currentUser.first_child}
            />
            <Typography
              style={{ marginLeft: 13, fontSize: 18, fontWeight: 500 }}
            >
              {currentUser.first_name + " " + currentUser.last_name}
            </Typography>
          </Box>
        )}
        <SearchInput
          onChange={(e) => {
            setChildrenSearch(e);
          }}
        />
        {selectedChild && (
          <React.Fragment>
            <Box
              p={3}
              className="sticky"
              onClick={() => {}}
              display={"flex"}
              justifyContent="flex-start"
              alignItems="center"
              component={Paper}
              style={{
                cursor: "pointer",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 11,
              }}
            >
              <Avatar
                src={selectedChild?.preferences?.profile_picture}
                alt={selectedChild?.first_name}
              />
              <Box marginLeft={2}>
                <Typography style={{ fontSize: 12 }}>
                  Selected Student
                </Typography>
                <Typography
                  style={{
                    fontWeight: 16,
                    fontWeight: 500,
                  }}
                >
                  {selectedChild?.first_name + " " + selectedChild?.last_name}
                </Typography>
              </Box>
            </Box>
          </React.Fragment>
        )}
        {loadingChildren && (
          <Box
            width="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={4}
          >
            <CircularProgress />
          </Box>
        )}
        {!loadingChildren && (
          <React.Fragment>
            <List>
              {getPageItems(getFilteredChildren(), childrenPage).map(
                (child, index) => (
                  <ListItem
                    disabled={saving}
                    key={index}
                    button
                    divider
                    selected={selectedChild?.id === child.id || false}
                    onClick={() => setSelectedChild(child)}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={child.preferences?.profile_picture}
                        alt={child.name}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={child.name}
                      secondary={child.phone_number}
                    />
                    <ListItemSecondaryAction>
                      {currentUser?.children?.find(
                        (q) => q?.childInfo?.id === child.id
                      ) && <Icon>check_circle</Icon>}
                    </ListItemSecondaryAction>
                  </ListItem>
                )
              )}
            </List>
            <Box p={2}>
              <Pagination
                count={getFilteredChildren().length}
                nolink
                page={childrenPage}
                onChange={(p) => setChildrenPage(p)}
                icon={
                  <img
                    src="/hero-img/person-search.svg"
                    width={180}
                    style={{ padding: "50px 0" }}
                  />
                }
                emptyTitle={"Nothing Found"}
                emptyMessage={
                  childrenSearch ? "Try a different keyword." : "No Data"
                }
              />
            </Box>
          </React.Fragment>
        )}
      </BlankDialog>
    ),
    [
      currentUser,
      childrenPage,
      childrenSearch,
      getFilteredChildren,
      loadingChildren,
      selectedChild,
      query.action,
      saving,
    ]
  );
  return (
    <React.Fragment>
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Success
        </Alert>
      </Snackbar>
      <Tabs
        style={{ padding: "0 30px" }}
        orientation="horizontal"
        variant="scrollable"
        value={value}
        onChange={handleChange}
      >
        {tabMap.map((tab, index) => (
          <Tab
            key={tab.key}
            label={tab.label}
            {...a11yProps(index)}
            onClick={() =>
              props.history.push(
                "/dashboard/" +
                  window.location.search.replaceUrlParam("section", tab.key)
              )
            }
          />
        ))}
      </Tabs>
      <Box m={4} p={2}>
        <TabPanel value={value} index={0}>
          {AccountPanel({
            name: "teacher",
            tableProps: {
              options: [
                {
                  name: "Deactivate",
                  value: "deactivate",
                },
                {
                  name: "Activate",
                  value: "activate",
                },
                {
                  name: "Reset Password",
                  value: "reset-password",
                },
              ],
            },
            onSelect: (item) => setCurrentUser(item),
          })}
        </TabPanel>
        <TabPanel value={value} index={1}>
          {AccountPanel({
            name: "parent",
            tableProps: {
              options: [
                {
                  name: "Update",
                  value: "update",
                },
                {
                  name: "Deactivate",
                  value: "deactivate",
                },
                {
                  name: "Activate",
                  value: "activate",
                },
                { name: "Add a Child", value: "add-child" },
                { name: "Remove a Child", value: "remove-child" },
                {
                  name: "Reset Password",
                  value: "reset-password",
                },
              ],
              onSelect: (item) => setCurrentUser(item),
            },
          })}
          {ChildrenDialog({
            title: "Add a Child",
            action: {
              saveTitle: "Add Child",
              query: "add-child",
              onClose: () => {
                if (modifiedChildren) tableRef.parent.fetch();
                setSelectedChild(null);
              },
            },
          })}
          {ChildrenDialog({
            title: "Remove a Child",
            action: {
              saveTitle: "Remove Child",
              query: "remove-child",
              onClose: () => {
                if (modifiedChildren) tableRef.parent.fetch();
                setSelectedChild(null);
              },
            },
          })}
        </TabPanel>
        <TabPanel value={value} index={2}>
          {AccountPanel({
            name: "student",
            onSelect: (item) => setCurrentUser(item),
            tableProps: {
              options: [
                {
                  name: "Update",
                  value: "update",
                },
                {
                  name: "Deactivate",
                  value: "deactivate",
                },
                {
                  name: "Activate",
                  value: "activate",
                },
                {
                  name: "Reset Password",
                  value: "reset-password",
                },
              ],
            },
          })}
        </TabPanel>
      </Box>
    </React.Fragment>
  );
}
export const fetchData = async ({
  before = null,
  send,
  after = null,
  onError = null,
} = {}) => {
  if (!send) return;
  let res;
  before && before();
  try {
    res = await send();
  } catch (e) {
    onError && onError(e);
  }
  after && after(res);
};
function UserTable(props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const query = qs.parse(window.location.search);
  const [saving, setSaving] = useState(false);
  const [savingId, setSavingId] = useState([]);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [success, setSuccess] = useState(false);
  const [successAdmin, setSuccessAdmin] = useState(false);

  const updateAccount = (item) => {};

  const activate = (isActivate, student) => {
    const stat = isActivate ? "activate" : "deactivate";
    fetchData({
      before: () => {
        setSaving(true);
        setSavingId([student.id]);
      },
      send: async () =>
        await Api.post("/api/admin/user/" + stat + "/" + student.id),
      after: (data) => {
        if (data) {
          setSuccess(true);
        }
        setSaving(false);
        setSavingId([]);
      },
    });
  };

  const _handleFileOption = (opt, item) => {
    const actions = props.optionActions || {};
    modifiedChildren = false;
    props.onSelect && props.onSelect(item);
    switch (opt) {
      case "update":
        alert("update");
        updateAccount(item);
        break;
      case "remove-student":
        if (actions.removeFromSection) {
          setSavingId([item.id]);
          setSaving(true);
          actions.removeFromSection(item, () => {
            setSavingId([]);
            setSaving(false);
          });
        }
        break;
      case "deactivate":
        activate(false, item);
        break;
      case "activate":
        activate(true, item);
        break;
      case "view-user":
        window.currentItem = item;
        props.history.push(
          window.location.search.replaceUrlParam("action", "view-user")
        );
        return;
      case "delete-category":
        if (actions.delete) {
          actions.delete(item);
        }
        return;
      case "edit-category":
        props.history.push(
          window.location.search
            .replaceUrlParam("action", "edit-category")
            .replaceUrlParam("category", item.id)
        );
        return;
      case "add-child":
        props.history.push(
          window.location.search
            .replaceUrlParam("action", "add-child")
            .replaceUrlParam("parent", item.id)
        );
        return;
      case "remove-child":
        props.history.push(
          window.location.search
            .replaceUrlParam("action", "remove-child")
            .replaceUrlParam("parent", item.id)
        );
        return;
      case "reset-password":
        fetchData({
          before: () => {
            setSaving(true);
            setSavingId([item.id]);
          },
          send: async () =>
            await Api.post("/api/schooladmin/change-user-password", {
              body: {
                username: item.username,
                password: item.username,
              },
            }),
          after: (data) => {
            if (data && data?.success) {
              setSuccessAdmin(true);
            }
            setSaving(false);
            setSavingId([]);
          },
        });
        return;
    }
  };
  const appendData = (d) => {
    setData([d, ...data]);
  };
  const modifyData = (id, d) => {
    let dd = [...data];
    let index = dd.findIndex((q) => q.id === id);
    if (index >= 0) {
      dd[index] = d;
      setData(dd);
    }
  };
  const deleteData = (id) => {
    let dd = [...data];
    let index = dd.findIndex((q) => q.id === id);
    if (index >= 0) {
      dd.splice(index, 1);
      setData(dd);
    }
  };
  const getFilteredData = (d = data) =>
    [...d].filter(
      (q) => JSON.stringify(q).toLowerCase().indexOf(search.toLowerCase()) >= 0
    );
  const fetch = () =>
    fetchData({
      send: () => Api.get("/api/schooladmin/" + props.name),
      before: () => setLoading(true),
      after: (data) => {
        if (data?.length)
          setData(
            data
              .map((q) => ({
                ...q,
                name: q.first_name + " " + q.last_name,
              }))
              .sort((a, b) => b.id - a.id)
          );
        setLoading(false);
      },
    });
  useEffect(() => {
    if (props.data) {
      setData(props.data);
      setLoading(false);
    } else if (props.name) fetch();
    else {
      setData([]);
      setLoading(false);
    }
  }, [props.name, props.data]);
  useEffect(() => {
    if (typeof props.getRef === "function")
      props.getRef({ appendData, fetch, modifyData, deleteData });
  }, [props.getRef]);
  return (
    <React.Fragment>
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Success
        </Alert>
      </Snackbar>
      <Snackbar
        open={successAdmin}
        autoHideDuration={6000}
        onClose={() => setSuccessAdmin(false)}
      >
        <Alert severity="success" onClose={() => setSuccessAdmin(false)}>
          Success! Password is the same as the username.{" "}
        </Alert>
      </Snackbar>
      <Box
        paddingBottom={2}
        display="flex"
        flexWrap={isMobile ? "wrap" : "nowrap"}
        justifyContent="space-between"
      >
        <Box
          width={isMobile ? "100%" : "auto"}
          style={{ order: isMobile ? 2 : 0 }}
        >
          {props.actions?.length ? (
            <ButtonGroup fullWidth variant="contained" color="secondary">
              {(props.actions || []).map((a, i) => (
                <Button
                  key={i}
                  onClick={a.onClick}
                  {...(a?.props || {})}
                  style={{
                    margin: 0,
                    whiteSpace: "pre",
                    fontWeight: 700,
                    ...(a?.props?.style || {}),
                  }}
                >
                  {isMobile && a.icon ? <Icon>{a.icon}</Icon> : a.name}
                </Button>
              ))}
            </ButtonGroup>
          ) : null}
        </Box>
        <Box
          marginBottom={isMobile ? 2 : 0}
          flex={isMobile ? 1 : "none"}
          width={isMobile ? "100%" : "auto"}
        >
          {data?.length ? <SearchInput onChange={(e) => setSearch(e)} /> : null}
        </Box>
      </Box>
      {loading && (
        <Box
          width="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={4}
        >
          <CircularProgress />
        </Box>
      )}

      {!loading && (
        <Table
          {...(props.tableProps ? props.tableProps : {})}
          noSelect
          loading={loading}
          saving={saving}
          savingId={savingId}
          headers={
            props.headers
              ? props.headers
              : [
                  { id: "id", title: "ID", width: "5%" },
                  { id: "first_name", title: "Name", width: "31%" },
                  { id: "phone_number", title: "Phone", width: "31%" },
                  { id: "email", title: "Email", width: "31%" },
                ]
          }
          filtered={(t) => getFilteredData(t)}
          data={data}
          actions={{
            _handleFileOption: (opt, item) => _handleFileOption(opt, item),
          }}
          options={props.options || []}
          style={{ margin: 0 }}
          pagination={{
            page,
            render: (
              <Pagination
                page={page}
                onChange={(e) => setPage(e)}
                count={getFilteredData().length}
                icon={
                  search ? (
                    <img
                      src="/hero-img/person-search.svg"
                      width={180}
                      style={{ padding: "50px 0" }}
                    />
                  ) : (
                    <img
                      src="/hero-img/undraw_Progress_tracking_re_ulfg.svg"
                      width={180}
                      style={{ padding: "50px 0" }}
                    />
                  )
                }
                emptyTitle={search ? "Nothing Found" : "No Data"}
                emptyMessage={"Try a different keyword."}
                nolink
              />
            ),
            onChangePage: (p) => setPage(p),
          }}
          rowRenderMobile={(item) =>
            props.rowRenderMobile ? (
              props.rowRenderMobile(item, _handleFileOption)
            ) : (
              <Box
                onClick={() =>
                  (props.onRowClick &&
                    props.onRowClick(item, _handleFileOption)) ||
                  _handleFileOption("view", item)
                }
                display="flex"
                flexWrap="wrap"
                width="90%"
                flexDirection="column"
                justifyContent="space-between"
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
                  <Box
                    display="flex"
                    alignItems="center"
                    style={{ margin: "13px 0" }}
                  >
                    <Avatar
                      src={item.preferences?.profile_picture}
                      alt={item.first_name}
                    />
                    <Box marginLeft={2}>
                      <Typography
                        variant="body1"
                        style={{
                          fontWeight: "bold",
                          fontSize: "0.9em",
                        }}
                      >
                        {item.first_name + " " + item.last_name}
                      </Typography>
                      <Typography
                        variant="body1"
                        style={{
                          fontWeight: "bold",
                          fontSize: "0.6em",
                        }}
                        color="textSecondary"
                      >
                        {item.username}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Box width="100%" marginBottom={1}>
                  <Typography
                    style={{
                      fontWeight: "bold",
                      color: "#38108d",
                      fontSize: "1em",
                    }}
                  >
                    PHONE
                  </Typography>
                  <Typography
                    variant="body1"
                    style={{
                      fontWeight: "bold",
                      fontSize: "0.9em",
                      color:
                        item.done !== "true"
                          ? theme.palette.success.main
                          : theme.palette.error.main,
                    }}
                  >
                    {item.phone_number}
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
                    EMAIL
                  </Typography>
                  <Box display="flex" alignItems="center">
                    {item.email}
                  </Box>
                </Box>
              </Box>
            )
          }
          rowRender={(item) =>
            props.rowRender ? (
              props.rowRender(item, _handleFileOption)
            ) : (
              <Box
                p={2}
                display="flex"
                width="100%"
                onClick={() =>
                  (props.onRowClick &&
                    props.onRowClick(item, _handleFileOption)) ||
                  _handleFileOption("view", item)
                }
              >
                <Box width="5%">
                  <Typography style={{ fontWeight: 600 }}>{item.id}</Typography>
                </Box>
                <Box width="31%" display="flex" alignItems="center">
                  <Avatar
                    src={item.preferences?.profile_picture}
                    alt={item.first_name}
                  />
                  <Typography style={{ marginLeft: 13 }}>
                    {item.first_name && item.first_name + " " + item.last_name}
                  </Typography>
                </Box>
                <Box width="31%">
                  <Typography>{item.phone_number}</Typography>
                </Box>
                <Box width="31%">
                  <Typography>{item.email}</Typography>
                </Box>
              </Box>
            )
          }
        />
      )}
    </React.Fragment>
  );
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
      width: "25ch",
    },
  },
  tab: {
    "& .MuiTabs-root:not(.MuiTabs-vertical)": {
      borderBottom: "1px solid " + theme.palette.divider,
    },
  },
  tabs: {
    [theme.breakpoints.down("sm")]: {
      position: "fixed",
      top: 0,
      bottom: 0,
      overflow: "hidden",
      left: 0,
      zIndex: 17,
    },
    "& .MuiTab-wrapper": {
      flexDirection: "row!important",
      justifyContent: "flex-start!important",
      padding: "0 16px",
    },
    background:
      theme.palette.type === "dark" ? "#222" : theme.palette.primary.main,
    color: "#fff",
  },
  notEditingForm: {
    "& .themed-input": {
      "& svg": {
        display: "none",
      },
      "& > div:first-of-type": {
        backgroundColor: "transparent!important",
        border: "none",
        color: "#000",
      },
    },
  },
}));
export default connect((states) => ({
  parentData: states.parentData,
  userInfo: states.userInfo,
  childInfo: states.parentData?.childInfo,
  classes: states.classes,
}))(Dashboard);
