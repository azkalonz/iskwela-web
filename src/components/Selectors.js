import React, { useRef, useState } from "react";
import {
  FormControl,
  InputLabel,
  Box,
  InputBase,
  IconButton,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  Icon,
  makeStyles,
} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import moment from "moment";
import { connect } from "react-redux";
import { makeLinkTo } from "./router-dom";
import { useHistory } from "react-router-dom";
const queryString = require("query-string");

function ScheduleSelector(props) {
  const { class_id, schedule_id, option_name, room_name } = props.match.params;
  const query = queryString.parse(window.location.search);
  const history = useHistory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <FormControl
      className="themed-input"
      style={{ width: "100%", marginTop: theme.spacing(2) }}
      variant="outlined"
    >
      <InputLabel>Date</InputLabel>

      <Select
        label="Date"
        style={{ background: props.theme === "dark" ? "#1d1d1d" : "#efe7ff" }}
        value={props.schedule}
        onChange={(e) => {
          props.onChange(parseInt(e.target.value) !== -1 ? e.target.value : -1);
          history.push(
            makeLinkTo(
              [
                "class",
                class_id,
                schedule_id,
                option_name,
                "room",
                "page",
                "date",
                "status",
              ],
              {
                room: room_name ? room_name : "",
                page: "?page=1",
                date: "&date=" + e.target.value,
                status: query.status ? "&status=" + query.status : "",
              }
            )
          );
        }}
        padding={10}
      >
        <MenuItem value={-1}>All</MenuItem>
        {props.classDetails[class_id] &&
          props.classDetails[class_id].schedules.map((k, i) => {
            return (
              <MenuItem value={k.id} key={i}>
                {moment(k.from).format("LLLL")}
              </MenuItem>
            );
          })}
      </Select>
    </FormControl>
  );
}

function StatusSelector(props) {
  const { class_id, schedule_id, option_name, room_name } = props.match.params;
  const query = queryString.parse(window.location.search);
  const history = useHistory();
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <FormControl
      style={{ width: "100%", marginTop: theme.spacing(2) }}
      className="themed-input"
      variant="outlined"
    >
      <InputLabel>Status</InputLabel>
      <Select
        style={{ background: props.theme === "dark" ? "#1d1d1d" : "#efe7ff" }}
        label="Status"
        value={props.status}
        onChange={(e) => {
          props.onChange(e.target.value !== "all" ? e.target.value : null);
          history.push(
            makeLinkTo(
              [
                "class",
                class_id,
                schedule_id,
                option_name,
                "room",
                "page",
                "date",
                "status",
              ],
              {
                room: room_name ? room_name : "",
                page: "?page=1",
                date: query.date ? "&date=" + query.date : "&date=" + -1,
                status: "&status=" + e.target.value,
              }
            )
          );
        }}
        padding={10}
      >
        <MenuItem value="all">All</MenuItem>
        <MenuItem value="unpublished">Unpublished</MenuItem>
        <MenuItem value="published">Published</MenuItem>
      </Select>
    </FormControl>
  );
}

function SearchInput(props) {
  const styles = useStyles();
  const theme = useTheme();
  const [isHidden, setIsHidden] = useState(true);
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const searchRef = useRef();
  const [val, setval] = useState();
  const quickSearch =
    props.quickSearch === undefined ? true : props.quickSearch;
  return (
    <React.Fragment>
      <Box
        p={0.3}
        className={[
          isHidden && props.minimized ? "search-input hidden" : "search-input",
          styles.searchInput,
        ].join(" ")}
        paddingLeft={1}
        borderRadius={4}
        alignSelf="flex-end"
        display="flex"
        style={{
          ...(isMobile
            ? { width: "100%", ...(props.style ? props.style : {}) }
            : props.style
            ? props.style
            : {}),
          ...{
            background: props.theme === "dark" ? "#1d1d1d" : "#efe7ff",
            border:
              "1px solid " +
              (props.theme === "dark" ? "rgba(255,255,255,0.22)" : "#c9b8eb"),
          },
          ...(props.styles && props.styles.searchInput
            ? props.styles.searchInput
            : {}),
        }}
      >
        <InputBase
          className={styles.searchInput}
          style={{ width: "100%" }}
          placeholder={props.label || "Search"}
          onBlur={(e) => {
            let parent = e.target?.parentElement?.parentElement;
            if (parent) {
              parent.classList.remove("focused");
            }
            props.minimized && setIsHidden(true);
          }}
          onKeyUp={(e) => {
            if (!quickSearch) {
              if (e.which === 13) props.onChange(e.target.value);
            } else {
              props.onChange(e.target.value);
            }
            setval(e.target.value);
          }}
          onFocus={(e) => {
            let parent = e.target?.parentElement?.parentElement;
            if (parent) {
              parent.classList.add("focused");
            }
          }}
          inputProps={{ "aria-label": "search activity" }}
          ref={searchRef}
        />
        {val && (
          <IconButton
            type="submit"
            aria-label="search"
            style={{ padding: 0 }}
            onClick={(e) => {
              props.onReset && props.onReset(val);
              searchRef.current.querySelector("input").value = "";
              props.onChange("");
              setval("");
            }}
          >
            <Icon>close</Icon>
          </IconButton>
        )}
        <IconButton
          type="submit"
          aria-label="search"
          style={{ padding: 0 }}
          onClick={(e) =>
            props.onChange(searchRef.current.querySelector("input").value)
          }
        >
          <SearchIcon color="primary" />
        </IconButton>
      </Box>
      {isHidden && props.minimized && (
        <IconButton
          onClick={() => {
            setIsHidden(!isHidden);
          }}
          style={props.styles?.searchBtn}
        >
          <Icon>search</Icon>
        </IconButton>
      )}
    </React.Fragment>
  );
}

const useStyles = makeStyles((theme) => ({
  searchInput: {
    "&.focused": {
      background:
        theme.palette.type === "dark" ? "#000!important" : "#fff!important",
      border: "1px solid #7539FF!important",
      borderRadius: 6,
    },
  },
}));

const ConnectedScheduleSelector = connect((states) => ({
  theme: states.theme,
  classDetails: states.classDetails,
}))(ScheduleSelector);
const ConnectedStatusSelector = connect((states) => ({
  theme: states.theme,
  classDetails: states.classDetails,
}))(StatusSelector);
const ConnectedSearchInput = connect((states) => ({
  theme: states.theme,
  classDetails: states.classDetails,
}))(SearchInput);
export {
  ConnectedScheduleSelector as ScheduleSelector,
  ConnectedSearchInput as SearchInput,
  ConnectedStatusSelector as StatusSelector,
};
