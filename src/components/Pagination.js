import React from "react";
import { useHistory } from "react-router-dom";
import { makeLinkTo } from "./router-dom";
import { Button } from "@material-ui/core";
const queryString = require("query-string");

export const ITEMS_PER_PAGE = 10;

export default function Pagination(props) {
  const { class_id, schedule_id, option_name, room_name } = props.match.params;
  const query = queryString.parse(window.location.search);
  const history = useHistory();
  const itemsPerPage = ITEMS_PER_PAGE;
  const totalItems = props.length;
  const page = props.page;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  let buttons = [];
  for (let i = 0; i < totalPages; i++) {
    buttons.push(
      <Button
        key={i}
        color={i === parseInt(page) - 1 ? "primary" : "default"}
        variant={i === parseInt(page) - 1 ? "contained" : "text"}
        onClick={() => {
          if (!props.nolink) {
            props.onChange(i);
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
                  page: "?page=" + (i + 1),
                  date: query.date ? "&date=" + query.date : "",
                  status: query.status ? "&status=" + query.status : "",
                }
              )
            );
          } else {
            props.onChange(i + 1);
          }
        }}
      >
        {i + 1}
      </Button>
    );
  }
  return <div>{buttons}</div>;
}
export function getPageItems(items, page) {
  return items.slice(
    (page - 1) * ITEMS_PER_PAGE,
    (page - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );
}
