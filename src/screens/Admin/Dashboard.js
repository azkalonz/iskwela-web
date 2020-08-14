import React, { useMemo, useEffect, useState } from "react";
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
import { CalendarProvider, Weekdays, Dates } from "../../components/Calendar";
import Scrollbar from "../../components/Scrollbar";
import { useHistory } from "react-router-dom";
import Api from "../../api";
import { connect } from "react-redux";
import NavBar from "../../components/NavBar";
import UserData from "../../components/UserData";
import socket from "../../components/socket.io";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";

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
      <Box width="100%" display="flex">
        <Box
          className={classes.tabs}
          style={{
            width: opened ? 270 : 0,
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
                  style={{ marginLeft: -15 }}
                >
                  <Icon>menu</Icon>
                </IconButton>
              )}
            </Box>
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
              onClick={() =>
                props.history.push(
                  window.location.search.replaceUrlParam("classId", "")
                )
              }
            />
            <Tab label="Sections" {...a11yProps(1)} />
            <Tab label="Students" {...a11yProps(2)} />
            <Tab label="Parents" {...a11yProps(3)} />
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
            title="Dashboard"
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
  const [currentClass, setCurrentClass] = useState();
  const [loading, setLoading] = useState(true);
  const data = Object.keys(props.classes).map((q) => props.classes[q]);
  const [sections, setSections] = useState([]);
  const [years, setYears] = useState([]);
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
      width: "5%",
    },
    { id: "name", title: "Name", width: "23%" },
    { id: "description", title: "Description", width: "23%" },
    { id: "teacher", title: "Teacher", width: "23%" },
    { id: "frequency", title: "Frequency", width: "23%" },
  ]);
  const _handleFileOption = (option, item) => {};
  const fetchData = async () => {
    setLoading(true);
    try {
      let sec = await Api.get("/api/schooladmin/sections");
      let yrs = await Api.get("/api/years");
      setSections(sec);
      setYears(yrs);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
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
  return (
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
              <Button variant="contained" color="secondary">
                New Class
              </Button>
            </Box>
            <Box>
              <SearchInput onChange={(e) => null} />
            </Box>
          </Box>
          <Table
            loading={loading}
            headers={columnHeaders}
            filtered={(t) => data}
            data={data}
            actions={{
              _handleFileOption: (opt, item) => _handleFileOption(opt, item),
            }}
            options={[
              { key: "view", name: "View Details" },
              { key: "edit", name: "Edit" },
            ]}
            style={{ margin: 0 }}
            pagination={{
              page: 1,
              render: <Pagination page={1} count={1} nolink />,
            }}
            rowRender={(item) => (
              <Box
                p={2}
                display="flex"
                width="100%"
                onClick={() =>
                  props.history.push(
                    window.location.search.replaceUrlParam("classId", item.id)
                  )
                }
              >
                <Box width="5%">
                  <Typography>{item.id}</Typography>
                </Box>
                <Box width="23%">
                  <Typography>{item.name}</Typography>
                </Box>
                <Box width="23%">
                  <Typography>{item.description}</Typography>
                </Box>
                <Box width="23%">
                  <Typography>
                    {item.teacher?.first_name + " " + item.teacher?.last_name}
                  </Typography>
                </Box>
                <Box width="23%">
                  <Typography>{item.frequency}</Typography>
                </Box>
              </Box>
            )}
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
  );
}
function ClassDetails(props) {
  const theme = useTheme();
  const { name, teacher, color, id } = props.class;
  const frequency =
    props.class?.frequency === "DAILY"
      ? ["M", "T", "W", "R", "F", "S", "U"]
      : props.class?.frequency?.split(",");
  const class_id = id;
  const styles = useStyles();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(0);
  useEffect(() => {
    let d = document.querySelector("#dashboard-panel")?.firstChild?.firstChild;
    if (d) d.scrollTop = 0;
  }, [props.class]);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
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
        <IconButton
          onClick={() =>
            props.history.push(
              window.location.search.replaceUrlParam("classId", "")
            )
          }
        >
          <Icon>arrow_back</Icon>
        </IconButton>
        <ButtonBase
          onClick={() => editClassPicture()}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 50,
            height: 50,
            borderRadius: "50%",
            overflow: "hidden",
            marginRight: "7px",
          }}
        >
          <img
            src={props.class.bg_image || props.class.image}
            width="auto"
            height="100%"
          />
        </ButtonBase>
        <Typography
          style={{
            maxWidth: "40%",
            fontSize: 18,
            fontWeight: 500,
            marginLeft: 13,
          }}
        >
          {name}
        </Typography>
        <Button
          style={{ marginLeft: 13, width: "auto" }}
          onClick={() => setEditing(!editing)}
        >
          {editing ? (
            "Save  "
          ) : (
            <React.Fragment>
              Edit <Icon fontSize="small">create_outlined</Icon>
            </React.Fragment>
          )}
        </Button>
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
        <Tab label="Students" {...a11yProps(2)} />
      </Tabs>
      <Box width="100%" overflow="auto" p={4}>
        <form
          action="#"
          onSubmit={() => false}
          className={!editing ? styles.notEditingForm : ""}
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
                          popupState.open();
                        }}
                        display={"flex"}
                        justifyContent="flex-start"
                        alignItems="center"
                        style={{ cursor: "pointer" }}
                        {...bindTrigger(popupState)}
                      >
                        <Avatar
                          src={props.childInfo.preferences?.profile_picture}
                          alt={props.childInfo.first_name}
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
                            {props.childInfo.first_name +
                              " " +
                              props.childInfo.last_name}
                          </Typography>
                        </Box>
                        <IconButton
                          color="primary"
                          {...bindTrigger(popupState)}
                        >
                          <Icon>expand_more</Icon>
                        </IconButton>
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
                                props.classes?.teacher?.id ===
                                child.childInfo.id
                              }
                              onClick={async () => {}}
                            >
                              <Avatar
                                src={
                                  child.childInfo?.preferences?.profile_picture
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
                    defaultValue={props.class[item] || "No description"}
                    className={
                      "themed-input " +
                      (theme.palette.type === "dark" ? "light" : "dark")
                    }
                    label={item.ucfirst()}
                  />
                </Box>
              ))}
              {props.subjects && (
                <Box>
                  <FormControl
                    className="themed-input"
                    variant="outlined"
                    style={{ marginTop: "38px" }}
                    disabled={!editing}
                  >
                    <InputLabel>Subject</InputLabel>
                    <Select
                      label="Subject"
                      name="subject"
                      defaultValue={props.subjects[0].id}
                    >
                      {props.subjects.map((subject, index) => (
                        <MenuItem key={index} value={subject.id}>
                          {subject.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}
              <Box display="flex">
                {props.sections.length ? (
                  <FormControl
                    className="themed-input"
                    variant="outlined"
                    style={{ marginTop: "38px" }}
                    disabled={!editing}
                  >
                    <InputLabel>Section</InputLabel>
                    <Select
                      label="Section"
                      name="section"
                      defaultValue={props.sections[0].id}
                    >
                      {props.sections.map((section, index) => (
                        <MenuItem key={index} value={section.id}>
                          {section.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <Box display="flex">
                    <CircularProgress size={10} /> retrieving sections...
                  </Box>
                )}
                {props.years.length ? (
                  <FormControl
                    className="themed-input"
                    variant="outlined"
                    style={{ marginTop: "38px", marginLeft: 13 }}
                    disabled={!editing}
                  >
                    <InputLabel>Year Level</InputLabel>
                    <Select
                      label="Year Level"
                      name="year-level"
                      defaultValue={props.sections[0].id}
                    >
                      {props.years.map((year, index) => (
                        <MenuItem key={index} value={year.id}>
                          {year.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <Box display="flex">
                    <CircularProgress size={10} /> retrieving year levels...
                  </Box>
                )}
              </Box>
            </Box>
          </TabPanel>
          <TabPanel value={value} index={1}>
            <Box display="flex">
              <Box>
                <Box marginTop={"38px"} display="flex">
                  <TextField
                    variant="outlined"
                    label="Date"
                    disabled={!editing}
                    className={
                      "themed-input no-margin small " +
                      (theme.palette.type === "dark" ? "light" : "dark")
                    }
                    type="date"
                    defaultValue="2020-08-14"
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
                    type="date"
                    defaultValue="2020-08-14"
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
                <Box marginTop={"35px"} display="flex">
                  <TextField
                    variant="outlined"
                    label="Time"
                    disabled={!editing}
                    className={
                      "themed-input no-margin small " +
                      (theme.palette.type === "dark" ? "light" : "dark")
                    }
                    type="time"
                    defaultValue="07:30"
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
                    defaultValue="07:30"
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
                      { key: "M", value: "Monnday" },
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
                            defaultChecked={frequency.indexOf(day.key) >= 0}
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
                  events={[]}
                  schedules={[]}
                >
                  <Weekdays />
                  <Dates />
                </CalendarProvider>
              </Box>
            </Box>
          </TabPanel>
          <TabPanel value={value} index={2}>
            Item Three
          </TabPanel>
        </form>
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
    background:
      theme.palette.type === "dark" ? "#222" : theme.palette.primary.main,
    color: "#fff",
  },
  notEditingForm: {
    "& .themed-input": {
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
