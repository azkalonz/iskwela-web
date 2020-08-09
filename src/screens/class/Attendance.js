import {
  Avatar,
  Box,
  FormControl,
  Icon,
  IconButton,
  InputLabel,
  ListItemText,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  Typography,
  useMediaQuery,
  useTheme,
  ButtonGroup,
  Button,
  TextField,
} from "@material-ui/core";
import moment from "moment";
import React, {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import "react-calendar/dist/Calendar.css";
import { connect } from "react-redux";
import Api from "../../api";
import { CalendarProvider, Dates, Weekdays } from "../../components/Calendar";
import Pagination from "../../components/Pagination";
import store from "../../components/redux/store";
import { makeLinkTo } from "../../components/router-dom";
import { SearchInput } from "../../components/Selectors";
import { Table } from "../../components/Table";
import SavingButton from "../../components/SavingButton";
import { SetAttendanceDialog } from "../../components/dialogs";
import { asyncForEach } from "../../components/UserData";

const useStyles = makeStyles((theme) => ({
  calendar: {
    "& .react-calendar__month-view__days__day--weekend": {
      color: theme.palette.primary.main,
    },
    "& .react-calendar__tile--now": {
      background: theme.palette.primary.main + "!important",
      "& > abbr": {
        color: "#fff!important",
      },
    },
  },
}));

function Attendance(props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { class_id, schedule_id, option_name, room_name } = props.match.params;
  const query = require("query-string").parse(window.location.search);
  const styles = useStyles();
  const [saving, setSaving] = useState(false);
  const [savingId, setSavingId] = useState([]);
  const [currentEvent, setCurrentEvent] = useState();
  const [attendance, setAttendance] = useState(
    store.getState().classDetails[class_id]?.students.map((q) => ({
      ...q,
      name: q.first_name + " " + q.last_name,
      absences: Math.round(Math.random())
        ? Math.floor(Math.random() * (5 - 1) + 1) + " absences"
        : "",
    }))
  );
  const [page, setPage] = useState(query.page ? parseInt(query.page) : 1);
  const [search, setSearch] = useState("");

  const currentStudent = useMemo(() => {
    if (attendance && !isNaN(parseInt(query.id))) {
      return attendance.find((q) => q.id === parseInt(query.id));
    } else return null;
  }, [attendance, query.id]);
  const _handleFileOption = (option, file) => {
    switch (option) {
      case "update":
        setCurrentEvent({
          opened: true,
          date: props.classDetails[class_id]?.schedules[schedule_id]?.from,
          reason: (
            <React.Fragment>
              <TextField
                id="reason"
                className="themed-input"
                variant="outlined"
                label="Reason"
                type="text"
                fullWidth
              />
            </React.Fragment>
          ),
          actions: (
            <ButtonGroup variant="contained">
              <Button onClick={() => addAttendance(2, file.id, null)}>
                Absent
              </Button>
              <Button onClick={() => addAttendance(1, file.id, null)}>
                Present
              </Button>
            </ButtonGroup>
          ),
          status: "unmarked",
        });
        return;
      default:
        return;
    }
  };
  const addAttendance = async (
    status,
    student_id,
    callback,
    multiple = false
  ) => {
    if (typeof status !== "number" || !student_id || !class_id || !schedule_id)
      return;
    setSaving(true);
    try {
      await Api.post("/api/class/attendance/save", {
        body: {
          student_id,
          schedule_id: parseInt(schedule_id),
          class_id: parseInt(class_id),
          status,
          reason: document.querySelector("#reason")?.value || "--",
        },
      });
      if (!multiple) await getAttendance();
    } catch (e) {}
    if (!multiple) {
      setSavingId([]);
      setSaving(false);
      setCurrentEvent({ ...currentEvent, opened: false });
      callback && callback();
    }
  };
  const getFilteredAttendance = (a = attendance) =>
    a
      .filter((a) => JSON.stringify(a).toLowerCase().indexOf(search) >= 0)
      .map((q) => ({ ...q, name: q.first_name + " " + q.last_name }));
  const _handleSearch = (e) => {
    setSearch(e.toLowerCase());
    if (!e) setPage(query.page ? parseInt(query.page) : 1);
    else setPage(1);
  };
  const getAttendance = async () => {
    try {
      let res = await Api.get("/api/class/attendance/" + class_id);
      if (res.students) {
        let attendanceRecords = [...attendance].map((q) => {
          let a = res.students.find((qq) => qq.id === q.id);
          return { ...q, attendance: a, total_attendance: a.attendance };
        });
        setAttendance(attendanceRecords);
      }
    } catch (e) {}
  };
  useEffect(() => {
    if (class_id && !currentStudent) getAttendance();
  }, [class_id, currentStudent]);
  return (
    <Box>
      <SetAttendanceDialog
        eventSchedule={currentEvent}
        isLoading={saving}
        onClose={() => setCurrentEvent({ ...currentEvent, opened: false })}
      />
      {!currentStudent && (
        <Box
          display="flex"
          width="100%"
          justifyContent="center"
          alignItems="stretch"
        >
          <Box p={2} width="100%" marginTop={2}>
            <Box
              flexDirection="row"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <div>
                {!currentStudent && (
                  <FormControl variant="outlined">
                    <InputLabel>Status</InputLabel>
                    <Select label="Status" value="present" padding={10}>
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="present">Present</MenuItem>
                      <MenuItem value="absent">Absent</MenuItem>
                    </Select>
                  </FormControl>
                )}
              </div>
              {!currentStudent && (
                <SearchInput
                  style={{ marginLeft: 16 }}
                  onChange={(e) => {
                    _handleSearch(e);
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>
      )}
      <Box width="100%" display="flex" flexWrap={isMobile ? "wrap" : "nowrap"}>
        {!currentStudent && (
          <Box width="100%" alignSelf="flex-start" order={isMobile ? 2 : 0}>
            <Table
              headers={[
                { id: "name", title: "Name", width: "50%" },
                {
                  id: "total_attendance",
                  title: "Attendance",
                  align: "flex-end",
                  width: "50%",
                },
              ]}
              data={attendance}
              saving={saving}
              savingId={savingId}
              pagination={{
                render: (
                  <Pagination
                    page={page}
                    match={props.match}
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
                    onChange={(p) => setPage(p)}
                    count={getFilteredAttendance().length}
                  />
                ),
                page,
                onChangePage: (p) => setPage(p),
              }}
              labels={{
                onPublish: {
                  title: "Mark Present",
                  icon: "done_all",
                },
                onUnpublish: {
                  title: "Mark Absent",
                  icon: "close",
                },
              }}
              actions={{
                onUpdate: (a, s, done = null) => {
                  let k = Object.keys(a);
                  let id = a[k[0]]?.id;
                  if (k.length === 1) {
                    setSavingId([id]);
                    setCurrentEvent({
                      opened: true,
                      date:
                        props.classDetails[class_id]?.schedules[schedule_id]
                          ?.from,
                      reason: (
                        <React.Fragment>
                          <TextField
                            id="reason"
                            className="themed-input"
                            variant="outlined"
                            label="Reason"
                            type="text"
                            fullWidth
                          />
                        </React.Fragment>
                      ),
                      actions: (
                        <ButtonGroup variant="contained">
                          <Button onClick={() => addAttendance(2, id, done)}>
                            Absent
                          </Button>
                          <Button onClick={() => addAttendance(1, id, done)}>
                            Present
                          </Button>
                        </ButtonGroup>
                      ),
                      status: "unmarked",
                    });
                  } else if (k.length > 1) {
                    (async () => {
                      let ids = [];
                      k.map((kk) => {
                        ids.push(a[kk]?.id);
                      });
                      setSavingId(ids);
                      await asyncForEach(k, async (key) => {
                        id = a[key]?.id;
                        await addAttendance(!s ? 2 : 1, id, done, true);
                      });
                      await getAttendance();
                      setSavingId([]);
                      setSaving(false);
                      setCurrentEvent({ ...currentEvent, opened: false });
                      done && done();
                    })();
                  }
                },
                _handleFileOption: (opt, file) => _handleFileOption(opt, file),
              }}
              options={[]}
              teacherOptions={[{ name: "Mark Attendance", value: "update" }]}
              filtered={(a) => getFilteredAttendance(a)}
              rowRenderMobile={(item, { disabled = false }) => (
                <Box
                  onClick={() =>
                    !disabled &&
                    props.history.push(
                      makeLinkTo([
                        "class",
                        class_id,
                        schedule_id,
                        option_name,
                        room_name,
                        "?id=" + item.id,
                      ])
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
                      NAME
                    </Typography>
                    <Typography variant="body1">{item.name}</Typography>
                    <Typography variant="body1" color="textSecondary">
                      {item.attendance?.absence} absences
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
                      ATTENDANCE
                    </Typography>
                    <Box display="flex" alignItems="center">
                      {item.attendance?.attendance}
                    </Box>
                  </Box>
                </Box>
              )}
              rowRender={(item, { disabled = false }) => (
                <Box
                  width="100%"
                  display="flex"
                  onClick={() =>
                    !disabled &&
                    props.history.push(
                      makeLinkTo([
                        "class",
                        class_id,
                        schedule_id,
                        option_name,
                        room_name,
                        "?id=" + item.id,
                      ])
                    )
                  }
                >
                  <Box flex={1} overflow="hidden" width="50%" maxWidth="50%">
                    <ListItemText
                      primary={item.name}
                      secondaryTypographyProps={{
                        style: {
                          width: isMobile ? "80%" : "100%",
                          whiteSpace: "pre-wrap",
                        },
                      }}
                      primaryTypographyProps={{
                        style: {
                          whiteSpace: "pre-wrap",
                        },
                      }}
                      secondary={
                        item.attendance
                          ? item.attendance.absence + " absences"
                          : ""
                      }
                    />
                  </Box>
                  <Box
                    overflow="hidden"
                    width="50%"
                    maxWidth="50%"
                    justifyContent="flex-end"
                    display="flex"
                  >
                    <Typography
                      variant="body1"
                      component="div"
                      style={{
                        marginRight: 45,
                        display: "flex",
                        alignItems: "center",
                        textAlign: "right",
                      }}
                    >
                      {item.attendance?.attendance}
                    </Typography>
                  </Box>
                </Box>
              )}
            />
          </Box>
        )}
        <Box
          m={2}
          marginLeft={!currentStudent && !isMobile ? 0 : 2}
          width={!currentStudent && !isMobile ? 330 : "100%"}
        >
          <Paper>
            <Box p={2} className={styles.calendar}>
              <Box display="flex" alignItems="center" marginBottom={2}>
                {currentStudent && (
                  <IconButton
                    color="primary"
                    onClick={() => props.history.goBack()}
                  >
                    <Icon>arrow_back</Icon>
                  </IconButton>
                )}
                {currentStudent && (
                  <Avatar
                    src={currentStudent.preferences.profile_picture}
                    alt={currentStudent.first_name}
                    style={{ marginRight: theme.spacing(1) }}
                  />
                )}
                <Typography
                  style={{
                    fontWeight: 600,
                    fontSize: 18,
                  }}
                >
                  {!currentStudent ? "Schedule" : currentStudent.name}
                </Typography>
              </Box>
              <AttendanceProvider
                {...props}
                schedule_id={schedule_id}
                class_id={class_id}
                student={currentStudent}
              >
                <CalendarProvider
                  style={{ minWidth: 240 }}
                  variant={!currentStudent || isMobile ? "small" : "large"}
                >
                  <Weekdays />
                  <Dates />
                </CalendarProvider>
              </AttendanceProvider>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
export function AttendanceProvider(props) {
  const { student, class_id, schedule_id } = props;
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const schedules = useMemo(
    () =>
      Array.from(props.classDetails[class_id]?.schedules)
        ?.filter((q) => q !== undefined)
        .sort((a, b) => new Date(b.from) - new Date(a.from)),
    [props.classDetails]
  );
  const addAttendance = async (status, schedule_id) => {
    if (typeof status !== "number" || !student || !class_id || !schedule_id)
      return;
    setIsLoading(true);
    try {
      await Api.post("/api/class/attendance/save", {
        body: {
          student_id: student.id,
          schedule_id,
          class_id: parseInt(class_id),
          status,
          reason: document.querySelector("#reason")?.value || "--",
        },
      });
      await getAttendanceEvents();
    } catch (e) {}
    setIsLoading(false);
  };
  const getAttendanceEvents = async () => {
    try {
      let res = await Api.get(
        `/api/class/my-attendance?class_id=${class_id}&user_id=${student.id}`
      );
      if (res.length)
        setEvents(
          res.map((q) => ({
            date: moment(q.from).format("MMM DD, YYYY"),
            reason:
              q.status_flag === null ? (
                <React.Fragment>
                  <TextField
                    id="reason"
                    className="themed-input"
                    variant="outlined"
                    label="Reason"
                    type="text"
                    fullWidth
                  />
                </React.Fragment>
              ) : (
                q.reason
              ),
            actions: q.status_flag === null && (
              <ButtonGroup variant="contained">
                <Button onClick={() => addAttendance(2, q.schedule_id)}>
                  Absent
                </Button>
                <Button onClick={() => addAttendance(1, q.schedule_id)}>
                  Present
                </Button>
              </ButtonGroup>
            ),
            excerpt:
              typeof q.reason === "string" && q.reason.length
                ? q.reason.slice(0, 20) + (q.reason.length > 20 ? "..." : "")
                : "--",
            status:
              q.status_flag === 1
                ? "present"
                : q.status_flag === 2
                ? "absent"
                : "unmarked",
          }))
        );
    } catch (e) {}
    setIsLoading(false);
  };
  const getScheduleEvents = () => {
    setEvents(
      schedules.map((q) => ({
        date: moment(q.from).format("MMM DD, YYYY"),
        status: "schedule",
      }))
    );
    setIsLoading(false);
  };
  useEffect(() => {
    setIsLoading(true);
    if (student) getAttendanceEvents();
    else if (class_id && schedules.length) getScheduleEvents();
  }, [schedules, student]);
  return (
    <React.Fragment>
      {Children.map(props.children, (child) => {
        if (isValidElement(child)) {
          return cloneElement(child, { events, schedules, isLoading });
        }
        return child;
      })}
    </React.Fragment>
  );
}
export default connect((states) => ({ userInfo: states.userInfo }))(Attendance);
