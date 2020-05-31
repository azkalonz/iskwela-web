import React from "react";
import AssignmentOutlinedIcon from "@material-ui/icons/AssignmentOutlined";
import BorderColorOutlinedIcon from "@material-ui/icons/BorderColorOutlined";
import EventNoteOutlinedIcon from "@material-ui/icons/EventNoteOutlined";
import EventOutlinedIcon from "@material-ui/icons/EventOutlined";
import FaceOutlinedIcon from "@material-ui/icons/FaceOutlined";

export function makeLinkTo(path, options = {}) {
  path = path.map((p) => (options[p] != null ? options[p] : p));
  return (
    "/" +
    path
      .filter(
        (i) =>
          (typeof i === "string" || typeof i === "number") && i.length !== 0
      )
      .join("/")
      .replace("/?", "?")
      .replace("//", "/")
  );
}
export const rightPanelOptions = [
  {
    title: "Activity",
    link: "activity",
    icon: <AssignmentOutlinedIcon />,
  },
  {
    title: "Lesson Plan",
    link: "lesson-plan",
    icon: <BorderColorOutlinedIcon />,
  },
  {
    title: "Instructional Materials",
    link: "instructional-materials",
    icon: <EventNoteOutlinedIcon />,
  },
  {
    title: "Schedule",
    link: "schedule",
    icon: <EventOutlinedIcon />,
  },
  {
    title: "Students",
    link: "students",
    icon: <FaceOutlinedIcon />,
  },
];
export const rightPanelOptionsStudents = [
  {
    title: "Activity",
    link: "activity",
    icon: <AssignmentOutlinedIcon />,
  },
  {
    title: "Lesson Materials",
    link: "instructional-materials",
    icon: <EventNoteOutlinedIcon />,
  },
  {
    title: "Schedule",
    link: "schedule",
    icon: <EventOutlinedIcon />,
  },
];

export function isValidOption(name) {
  if (!name) return;
  return rightPanelOptions
    .concat(rightPanelOptionsStudents)
    .find((o) => o.link.toLowerCase() === name.toLowerCase());
}
