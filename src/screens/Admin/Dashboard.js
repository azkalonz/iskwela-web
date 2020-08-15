import React, { useMemo, useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { Table } from "../../components/Table";
import Pagination from "../../components/Pagination";
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

const qs = require("query-string");

function Dashboard(props) {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const classes = useStyles();
  const [opened, setOpened] = useState(true);
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Drawer {...props}>
      <Backdrop
        open={isMobile && opened}
        style={{ zIndex: 16 }}
        onClick={() => setOpened(false)}
      />
      <Box width="100%" display="flex">
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
            <Tab
              label="Classes"
              {...a11yProps(0)}
              onClick={() => props.history.push("/dashboard")}
            />
            <Tab label="Accounts" {...a11yProps(1)} />
            <Tab label="Student Groups" {...a11yProps(2)} />
            <Tab label="Parents" {...a11yProps(3)} />
            <Tab label="Grading Categories" {...a11yProps(4)} />
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
          <Scrollbar autoHide>
            <TabPanel value={value} index={0}>
              <Classes {...props} />
            </TabPanel>
            <TabPanel value={value} index={1}>
              Item Two
            </TabPanel>
            <TabPanel value={value} index={2}>
              Item Three
            </TabPanel>
            <TabPanel value={value} index={3}>
              Item Four
            </TabPanel>
          </Scrollbar>
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
  const query = qs.parse(window.location.search);
  const { option_name } = props.match.params;
  const [currentClass, setCurrentClass] = useState();
  const [loading, setLoading] = useState(true);
  const data = Object.keys(props.classes).map((q) => props.classes[q]);
  const [sections, setSections] = useState([]);
  const [years, setYears] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const subjects = Object.keys(props.classes)
    .filter((k, i) => {
      let c = Object.keys(props.classes);
      let index = c.findIndex(
        (key) => props.classes[key].subject.id === props.classes[k].subject.id
      );
      return index === i;
    })
    .map((k) => props.classes[k].subject);
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
    }
  };
  const getFilteredClasses = (c = data) =>
    [...c]
      .filter(
        (q) =>
          JSON.stringify(q).toLowerCase().indexOf(search.toLowerCase()) >= 0
      )
      .sort((a, b) => b.id - a.id);
  const fetchData = async () => {
    setLoading(true);
    try {
      let sec = await Api.get("/api/schooladmin/sections");
      let yrs = await Api.get("/api/years");
      setSections(sec);
      setYears(yrs);
    } catch (e) {}
    setLoading(false);
  };
  useEffect(() => {
    fetchData();
    if (query.classId) {
      let i = query.classId;
      if (!isNaN(parseInt(i))) {
        i = parseInt(i);
        let d = data.find((q) => q.id === i);
        setCurrentClass(d);
      }
    } else {
      setCurrentClass(null);
    }
  }, [query.classId]);
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
          {!currentClass && (
            <Box p={4}>
              <Box
                width="100%"
                display="flex"
                justifyContent="space-between"
                marginBottom={4}
              >
                <Box>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => props.history.push("/dashboard/new-class")}
                  >
                    New Class
                  </Button>
                </Box>
                <Box>
                  <SearchInput onChange={(e) => setSearch(e)} />
                </Box>
              </Box>
              <Table
                noSelect
                loading={loading}
                headers={columnHeaders}
                filtered={(t) => getFilteredClasses(t)}
                data={data}
                actions={{
                  _handleFileOption: (opt, item) =>
                    _handleFileOption(opt, item),
                }}
                options={[{ name: "Edit", value: "edit" }]}
                style={{ margin: 0 }}
                pagination={{
                  page: 1,
                  render: (
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
                      emptyMessage={search ? "Try a different keyword." : false}
                      nolink
                      count={getFilteredClasses().length}
                    />
                  ),
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
                        <Typography>{item.id}</Typography>
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
function ClassDetails(props) {
  const theme = useTheme();
  const { teacher, color, id } = props.class;
  const frequency = useMemo(
    () =>
      props.class?.frequency === "DAILY"
        ? ["M", "T", "W", "R", "F", "S", "U"]
        : typeof props.class?.frequency === "object"
        ? props.class.frequency
            .split(",")
            .filter((q) => typeof q === "string" && q)
        : [],
    [props.class]
  );
  const sortedFrequency = useMemo(() => ["u", "m", "t", "w", "r", "f", "s"], [
    frequency,
  ]);
  const initialClass = {
    years: props.years,
    sections: props.sections,
    subject_id: props.subjects[0]?.id,
    subjects: props.subjects,
    teacher: props.class?.teacher,
    frequency,
    date_from: props.class?.date_from,
    date_to: props.class?.date_from,
    time_from: props.class?.time_from,
    time_to: props.class?.time_to,
    ...props.class,
  };
  const [CLASS, setCLASS] = useState(initialClass);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingImg, setSavingImg] = useState(false);
  const [savingId, setSavingId] = useState(false);
  const class_id = id;
  const styles = useStyles();
  const [editing, setEditing] = useState(false || !!props.editOnly);
  const [students, setStudents] = useState([{}]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [value, setValue] = useState(0);

  const getFilteredStudents = (s = students) =>
    [...s].filter(
      (q) => JSON.stringify(q).toLowerCase().indexOf(search.toLowerCase()) >= 0
    );
  const getStudents = async () => {
    setLoading(true);
    try {
      let studs = await Api.get(
        "/api/teacher/class/" + class_id + "?include=schedules,students"
      );
      if (studs?.students?.length) {
        setStudents(studs.students);
      }
    } catch (e) {}
    setLoading(false);
  };
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
          if (t?.id && newDetails.teacher?.id !== t.id) {
            await UserData.getUserData(t, null, t.id);
            if (props.editOnly)
              window.location = `/class/${res.id}?userId=${newDetails.teacher?.id}`;
          } else {
            UserData.updateClass(
              res.id,
              {
                ...newDetails,
                ...finalData,
              },
              true
            );
            if (props.editOnly)
              props.history.push(makeLinkTo(["class", res.id]));
          }
        }
      }
    } catch (e) {
      console.log(e);
      alert("Please fill in the required fields.");
      if (!props.editOnly) {
        setCLASS({
          ...initialClass,
          subject_id: props.subjects[0]?.id,
          year_id: props.years[0]?.id,
          section_id: props.sections[0]?.id,
        });
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
  const _handleFileOption = (opt, item) => {
    switch (opt) {
      case "reset-password":
        resetPassword(item);
        return;
    }
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
  useEffect(() => {
    let d = document.querySelector("#dashboard-panel")?.firstChild?.firstChild;
    if (d) d.scrollTop = 0;
  }, [props.class]);
  useEffect(() => {
    setCLASS({
      ...CLASS,
      years: props.years,
      sections: props.sections,
      subjects: props.subjects,
      year_id: props.years[0]?.id,
      section_id: props.sections[0]?.id,
    });
  }, [props.subjects, props.sections, props.years]);
  return (
    <React.Fragment>
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
              onClick={() =>
                window.open(
                  props.classes[id]?.bg_image || props.classes[id]?.image,
                  "_blank"
                )
              }
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
          }}
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
              setCLASS({
                ...initialClass,
                subject_id: props.subjects[0]?.id,
                year_id: props.years[0]?.id,
                section_id: props.sections[0]?.id,
              });
              setEditing(false);
            }}
          >
            Cancel
          </Button>
        )}
      </Box>
      <Tabs
        style={{ padding: "0 30px" }}
        orientation="horizontal"
        variant="scrollable"
        value={value}
        onChange={handleChange}
      >
        <Tab label="Details" {...a11yProps(0)} />
        <Tab label="Schedules" {...a11yProps(1)} />
        {!props.editOnly && (
          <Tab
            label="Students"
            {...a11yProps(2)}
            onClick={() => getStudents()}
          />
        )}
      </Tabs>
      <Box width="100%" overflow="auto" p={4}>
        <Box component={Paper} p={4}>
          <form
            action="#"
            onSubmit={() => false}
            className={!editing && !props.editOnly ? styles.notEditingForm : ""}
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
                <Box display="flex" style={{ marginTop: "50px" }}>
                  {CLASS.subjects && (
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
                  )}
                </Box>
                <Box display="flex" style={{ marginTop: "50px" }}>
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
                      <CircularProgress size={10} style={{ marginRight: 13 }} />
                      retrieving sections...
                    </Box>
                  )}
                </Box>
                <Box display="flex" style={{ marginTop: "50px" }}>
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
                      <CircularProgress size={10} style={{ marginRight: 13 }} />
                      retrieving year levels...
                    </Box>
                  )}
                </Box>
              </Box>
            </TabPanel>
            <TabPanel value={value} index={1}>
              <Box display="flex">
                <Box>
                  <Box marginTop={"50px"} display="flex">
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
                                    (q) => typeof q === "string"
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
                          : null
                      }
                    />
                  </CalendarProvider>
                </Box>
              </Box>
            </TabPanel>
            <TabPanel value={value} index={2}>
              <Box
                width="100%"
                display="flex"
                justifyContent="space-between"
                marginBottom={4}
              >
                <Box>
                  {/* <Button variant="contained" color="secondary">
                    Add Student
                  </Button> */}
                </Box>
                <Box>
                  <SearchInput onChange={(e) => setSearch(e)} />
                </Box>
              </Box>
              <Table
                noSelect
                loading={loading}
                saving={saving}
                savingId={savingId}
                headers={[
                  { id: "id", title: "ID", width: "5%" },
                  { id: "first_name", title: "Name", width: "31%" },
                  { id: "phone_number", title: "Phone", width: "31%" },
                  { id: "email", title: "Email", width: "31%" },
                ]}
                filtered={(t) => getFilteredStudents(t)}
                data={students}
                actions={{
                  _handleFileOption: (opt, item) =>
                    _handleFileOption(opt, item),
                }}
                options={[
                  {
                    name: "Reset Password",
                    value: "reset-password",
                  },
                ]}
                style={{ margin: 0 }}
                pagination={{
                  page: 1,
                  render: (
                    <Pagination
                      page={page}
                      onChange={(e) => setPage(e)}
                      count={getFilteredStudents().length}
                      icon={
                        search ? (
                          <img
                            src="/hero-img/person-search.svg"
                            width={180}
                            style={{ padding: "50px 0" }}
                          />
                        ) : (
                          ""
                        )
                      }
                      emptyTitle={"Nothing Found"}
                      emptyMessage={"Try a different keyword."}
                      nolink
                    />
                  ),
                }}
                rowRenderMobile={(item, { disabled = false }) => (
                  <Box
                    onClick={() => !disabled && _handleFileOption("view", item)}
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
                        TITLE
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
                        <Typography
                          variant="body1"
                          style={{
                            fontWeight: "bold",
                            marginLeft: 13,
                            fontSize: "0.9em",
                          }}
                        >
                          {item.first_name + " " + item.last_name}
                        </Typography>
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
                )}
                rowRender={(item) => (
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
                    <Box width="5%">
                      <Typography>{item.id}</Typography>
                    </Box>
                    <Box width="31%" display="flex" alignItems="center">
                      <Avatar
                        src={item.preferences?.profile_picture}
                        alt={item.first_name}
                      />
                      <Typography style={{ marginLeft: 13 }}>
                        {item.first_name &&
                          item.first_name + " " + item.last_name}
                      </Typography>
                    </Box>
                    <Box width="31%">
                      <Typography>{item.phone_number}</Typography>
                    </Box>
                    <Box width="31%">
                      <Typography>{item.email}</Typography>
                    </Box>
                  </Box>
                )}
              />
            </TabPanel>
          </form>
        </Box>
      </Box>
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
  tabs: {
    [theme.breakpoints.down("sm")]: {
      position: "fixed",
      top: 0,
      bottom: 0,
      overflow: "hidden",
      left: 0,
      zIndex: 17,
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
