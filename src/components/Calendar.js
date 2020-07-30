import React, {
  useState,
  useEffect,
  isValidElement,
  Children,
  cloneElement,
} from "react";
import moment from "moment";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from "@material-ui/core";
import { getWeek } from "date-fns";
import { connect } from "react-redux";

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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <CalendarProvider
      variant={isMobile ? "small" : "large"}
      events={[].concat(...eventSchedules)}
    >
      <Weekdays />
      <Dates />
    </CalendarProvider>
  );
}
export function Weekdays(props) {
  const weekDays = moment.weekdaysMin();
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
export function Dates({ month, variant, year, events = [] }) {
  const totalDays = moment(new Date(year, month)).daysInMonth();
  const totalWeeks = Math.ceil(totalDays / 7);
  const weekDates = [];
  const getEvent = (date) => {
    return events.find((q) => moment(q.date).isSame(date));
  };
  (function () {
    let day = 1;
    let week;
    for (let i = 0; i < totalWeeks; i++) {
      week = [];
      for (let j = day; j <= totalDays; j++) {
        let theday = moment(new Date(year, month, j));
        let date = theday.day();
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
  console.log(weekDates);
  const dayToggleEffect = () => {
    let days = document.querySelectorAll(".day");
    days.forEach((day) => {
      let child = day.firstElementChild;
      if (!child) return;
      else if (child.tagName === "DIV") {
        child.onclick = () => {
          document.querySelectorAll("[opened=true]").forEach((q) => {
            if (q === child) return;
            q.setAttribute("opened", "false");
            q.style.height = "100%";
            q.parentElement.style.zIndex = "0";
            q.style.wordBreak = "break-all";
          });
          child.style.wordBreak = "keep-all";
          let reason = child.querySelector(".reason");
          let opened = child.getAttribute("opened");
          let o = "true";
          if (!opened) {
            child.setAttribute("initial-height", child.clientHeight);
            o = "true";
          } else if (opened === "true") {
            o = "false";
          } else if (opened === "false") {
            o = "true";
          }
          child.setAttribute("opened", o);
          let initialHeight = parseInt(child.getAttribute("initial-height"));
          initialHeight += 2;
          if (o === "true") {
            if (initialHeight < reason?.clientHeight) {
              child.style.height = reason?.clientHeight + "px";
            }
            day.style.zIndex = "10";
          } else {
            child.style.height = initialHeight + "px";
            day.style.zIndex = "0";
            child.style.wordBreak = "break-all";
            setTimeout(() => {
              child.style.height = "100%";
            }, 1000);
          }
        };
      }
    });
  };
  useEffect(() => {
    dayToggleEffect();
  }, [month]);
  return (
    <React.Fragment>
      {weekDates.map((week, index) => (
        <div className={"week " + "no-" + (index + 1)} key={index}>
          {week.map((day, i) => {
            let event = getEvent(day.date);
            return event ? (
              <div key={i} className={"day"}>
                <Box width="100%" height="100%" className={event.status}>
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
                          {event.status === "absent" ? event.reason : ""}
                        </Box>
                      )}
                    </Box>
                  </Tooltip>
                </Box>
              </div>
            ) : (
              <div key={i} className="day">
                {day.value}
              </div>
            );
          })}
        </div>
      ))}
    </React.Fragment>
  );
}
export function CalendarProvider(props) {
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(moment().year());
  const theme = useTheme().palette.type;
  return (
    <Box
      className={["mkj-calendar", props.variant, theme].join(" ")}
      style={props.style}
    >
      <Box
        width="100%"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <MonthSelector onChange={(val) => setMonth(val)} selected={month} />
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
  return (
    <Select
      label="Month"
      color="primary"
      defaultValue={0}
      onChange={(e) => props.onChange && props.onChange(e.target.value)}
    >
      {moment.months().map((month, i) => (
        <MenuItem value={i} key={i}>
          <Typography
            style={{ fontSize: props.selected === i ? "2rem" : "1rem" }}
          >
            {month}
          </Typography>
        </MenuItem>
      ))}
    </Select>
  );
}

export default connect()(Calendar);
