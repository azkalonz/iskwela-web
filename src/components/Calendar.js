import {
  Box,
  CircularProgress,
  MenuItem,
  Select,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import moment from "moment";
import React, {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { connect } from "react-redux";
import { AttendanceProvider } from "../screens/class/Attendance";
import { SetAttendanceDialog } from "./dialogs";

const reasons = [
  "Sickness/doctor’s appointment",
  "Sickness/doctor’s appointment, House emergency, Family emergency",
  "House emergency",
  "Family emergency",
  "Delivery of a major purchase",
  "Family emergency, House emergency",
  "Delivery of a major purchase, House emergency",
];
export const eventSchedules = moment.months().map((month) =>
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(() => ({
    date: month + " " + Math.floor(Math.random() * 31) + ", 2020",
    reason: reasons[Math.floor(Math.random() * 7)],
    status: Math.floor(Math.random() * 2) ? "present" : "absent",
  }))
);
function Calendar(props) {
  const theme = useTheme();
  const { class_id } = props.match.params;
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <AttendanceProvider {...props} student={props.userInfo} class_id={class_id}>
      <CalendarProvider variant={isMobile ? "small" : "large"}>
        <Weekdays />
        <Dates />
      </CalendarProvider>
    </AttendanceProvider>
  );
}
export function Weekdays(props) {
  const weekDays = moment
    .weekdaysMin()
    .map((q) => (props.variant === "small" ? q[0] : q));
  return (
    <div className="weekdays-container">
      {weekDays.map((day, index) => (
        <div className={"day " + day}>
          <Typography color="primary">{day}</Typography>
        </div>
      ))}
    </div>
  );
}
export function Dates({
  includeDays,
  month,
  variant,
  year,
  events = [],
  isLoading,
}) {
  const totalDays = moment(new Date(year, month)).daysInMonth();
  const totalWeeks = Math.ceil(totalDays / 7);
  const [currentEvent, setCurrentEvent] = useState({});
  const weekDates = [];
  const getEvent = (date) => {
    return events.find((q) => moment(q.date).isSame(date));
  };
  (function () {
    let day = 1;
    let week;
    for (let i = 0; i <= totalWeeks; i++) {
      week = [];
      for (let j = day; j <= totalDays; j++) {
        let theday = new Date(year, month, j);
        let date = theday.getDay();
        week[date] = {
          date: theday,
          value: j,
        };
        day++;
        if (date >= 6) break;
      }
      for (let fillDay = 0; fillDay <= 6; fillDay++)
        if (typeof week[fillDay] !== "object") week[fillDay] = "x";
      weekDates[i] = week;
    }
  })();
  useEffect(() => {
    if (!isLoading) setCurrentEvent({ ...currentEvent, opened: false });
  }, [isLoading]);
  useEffect(() => {
    console.log(includeDays);
  }, [includeDays]);
  return (
    <React.Fragment>
      <SetAttendanceDialog
        isLoading={isLoading}
        eventSchedule={currentEvent}
        onClose={() => setCurrentEvent({ ...currentEvent, opened: false })}
      />
      {weekDates.map((week, index) => (
        <div className={"week " + "no-" + (index + 1)} key={index}>
          {week.map((day, i) => {
            let event = getEvent(day.date);
            return (includeDays ? includeDays.indexOf(i) >= 0 : true) &&
              event ? (
              <div key={i} className={"day"}>
                <Box
                  width="100%"
                  height="100%"
                  className={event.status}
                  onClick={() => setCurrentEvent({ ...event, opened: true })}
                >
                  <Tooltip
                    title={moment(event.date).format("MMM DD, YYYY hh:mm A")}
                  >
                    <Box position="relative" height="100%">
                      <Box
                        position="absolute"
                        className={[variant || "small", "date"].join(" ")}
                      >
                        {day.value}
                      </Box>
                      {variant === "large" && (
                        <Box p={1} paddingLeft={6} className="reason">
                          <Typography style={{ fontWeight: "bold" }}>
                            {event.status.ucfirst()}
                          </Typography>
                          {event.excerpt}
                        </Box>
                      )}
                    </Box>
                  </Tooltip>
                </Box>
              </div>
            ) : (
              <div key={i} className={"day " + (i === 0 ? "weekend" : "")}>
                {day.value}
              </div>
            );
          })}
        </div>
      ))}
    </React.Fragment>
  );
}
export function getYears(startYear, currentYear = new Date().getFullYear()) {
  var years = [];
  startYear = startYear || 1980;
  while (startYear <= currentYear) {
    years.push(startYear++);
  }
  return years;
}

export function CalendarProvider(props) {
  const [month, setMonth] = useState(moment().month());
  const [year, setYear] = useState(moment().year());
  const theme = useTheme().palette.type;
  let scheduleLength = useMemo(() => {
    for (
      var i = 0, len = 0;
      i < props.schedules.length;
      i++, props.schedules[i] !== undefined && len++
    );

    return len;
  }, [props.schedules]);
  return (
    <Box
      className={["mkj-calendar", props.variant, theme].join(" ")}
      style={props.style}
      position="relative"
    >
      {props.isLoading && (
        <Box
          position="absolute"
          left={0}
          right={0}
          bottom={0}
          top={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          bgcolor={
            theme === "dark" ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)"
          }
          zIndex={20}
        >
          <CircularProgress />
        </Box>
      )}
      <Box
        width="100%"
        display="flex"
        justifyContent="center"
        alignItems="flex-end"
      >
        <MonthSelector
          onChange={(val) => setMonth(val)}
          year={year}
          selected={month}
          variant={props.variant}
          events={props.events}
        />
        <YearSelector
          onChange={(val) => setYear(val)}
          years={
            typeof props.schedules === "object" && props.schedules.length > 0
              ? getYears(
                  moment(props.schedules[scheduleLength - 1].from).year(),
                  moment(props.schedules[0].from).year()
                )
              : null
          }
        />
      </Box>
      <Box>
        {Children.map(props.children, (child) => {
          if (isValidElement(child)) {
            return cloneElement(child, { ...props, month, year });
          }
          return child;
        })}
      </Box>
    </Box>
  );
}
function MonthSelector(props) {
  const getTotalEvents = useCallback(
    (month) => {
      if (typeof props.events === "object")
        return props.events.filter(
          (q) =>
            moment(q.date).month() === month &&
            moment(q.date).year() === props.year
        )?.length;
      else return 0;
    },
    [props.events, props.year]
  );
  return (
    <Select
      label="Month"
      color="primary"
      defaultValue={moment().month()}
      onChange={(e) => props.onChange && props.onChange(e.target.value)}
    >
      {moment.months().map((month, i) => (
        <MenuItem value={i} key={i}>
          <Typography
            style={{
              fontSize:
                props.selected === i && props.variant !== "small"
                  ? "2rem"
                  : "1rem",
            }}
          >
            {month} ({getTotalEvents(i)})
          </Typography>
        </MenuItem>
      ))}
    </Select>
  );
}

function YearSelector(props) {
  return (
    <Select
      label="Year"
      color="primary"
      defaultValue={moment().year()}
      onChange={(e) => props.onChange && props.onChange(e.target.value)}
    >
      {(props.years || [moment().year()]).map((year, i) => (
        <MenuItem value={year} key={i}>
          <Typography
            style={{ fontSize: props.selected === i ? "2rem" : "1rem" }}
          >
            {year}
          </Typography>
        </MenuItem>
      ))}
    </Select>
  );
}

export default connect((states) => ({
  classDetails: states.classDetails,
  userInfo: states.userInfo,
}))(Calendar);
