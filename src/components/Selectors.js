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
    <FormControl style={{ width: "100%" }} variant="outlined">
      <InputLabel>Date</InputLabel>

      <Select
        label="Date"
        style={{ background: "#efe7ff" }}
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
    <FormControl style={{ width: "100%" }} variant="outlined">
      <InputLabel>Status</InputLabel>
      <Select
        style={{ background: "#efe7ff" }}
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

export function SearchInput(props) {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const searchRef = useRef();
  const [val, setval] = useState();
  const quickSearch =
    props.quickSearch === undefined ? true : props.quickSearch;
  return (
    <Box
      p={0.3}
      borderRadius={4}
      display="flex"
      style={{
        ...(isMobile
          ? { width: "100%", ...(props.style ? props.style : {}) }
          : props.style
          ? props.style
          : {}),
        ...{ background: "#efe7ff", border: "1px solid #c9b8eb" },
      }}
    >
      <InputBase
        style={{ width: "100%" }}
        placeholder="Search"
        onKeyUp={(e) => {
          if (!quickSearch) {
            if (e.which === 13) props.onChange(e.target.value);
          } else {
            props.onChange(e.target.value);
          }
          setval(e.target.value);
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
  );
}

const ConnectedScheduleSelector = connect((states) => ({
  classDetails: states.classDetails,
}))(ScheduleSelector);
const ConnectedStatusSelector = connect((states) => ({
  classDetails: states.classDetails,
}))(StatusSelector);
export {
  ConnectedScheduleSelector as ScheduleSelector,
  ConnectedStatusSelector as StatusSelector,
};
