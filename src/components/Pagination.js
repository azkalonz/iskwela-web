import React from "react";
import { useHistory } from "react-router-dom";
import { makeLinkTo } from "./router-dom";
import { Icon, Grow, Box, Typography } from "@material-ui/core";
import { Pagination as MuiPagination } from "@material-ui/lab";

const queryString = require("query-string");

export const ITEMS_PER_PAGE = 10;

export default function Pagination(props) {
  const { class_id, schedule_id, option_name, room_name } = props.match.params;
  const query = queryString.parse(window.location.search);
  const history = useHistory();
  const itemsPerPage = props.itemsPerPage || ITEMS_PER_PAGE;
  const totalItems = props.count;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  return totalPages ? (
    <MuiPagination
      page={props.page}
      variant="outlined"
      shape="rounded"
      color="primary"
      count={totalPages}
      onChange={(e, p) => {
        if (!props.nolink) {
          props.onChange(p);
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
                page: "?page=" + p,
                date: query.date ? "&date=" + query.date : "",
                status: query.status ? "&status=" + query.status : "",
              }
            )
          );
        } else {
          props.onChange(p);
        }
      }}
    />
  ) : !props.noEmptyMessage ? (
    <Grow in={true}>
      <Box
        width="100%"
        alignItems="center"
        justifyContent="center"
        display="flex"
        flexDirection="column"
      >
        <Icon color="disabled" style={{ fontSize: 140 }}>
          {props.icon ? props.icon : "class"}
        </Icon>
        <Typography variant="h6" component="h2" color="textPrimary">
          {props.emptyTitle ? props.emptyTitle : "All clear!"}
        </Typography>
        <Typography variant="body2" component="h3" color="textSecondary">
          {props.emptyMessage
            ? props.emptyMessage
            : "There's no Activity to report yet."}
        </Typography>
      </Box>
    </Grow>
  ) : null;
}
export function getPageItems(items, page, itemsPerPage = ITEMS_PER_PAGE) {
  return items.slice(
    (page - 1) * itemsPerPage,
    (page - 1) * itemsPerPage + itemsPerPage
  );
}
