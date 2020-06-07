import React from "react";
import { useHistory } from "react-router-dom";
import { makeLinkTo } from "./router-dom";
import { Button } from "@material-ui/core";
import { Pagination as MuiPagination } from "@material-ui/lab";

const queryString = require("query-string");

export const ITEMS_PER_PAGE = 10;

export default function Pagination(props) {
  const { class_id, schedule_id, option_name, room_name } = props.match.params;
  const query = queryString.parse(window.location.search);
  const history = useHistory();
  const itemsPerPage = ITEMS_PER_PAGE;
  const totalItems = props.count;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  return (
    <MuiPagination
      page={props.page}
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
  );
}
export function getPageItems(items, page) {
  return items.slice(
    (page - 1) * ITEMS_PER_PAGE,
    (page - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );
}
