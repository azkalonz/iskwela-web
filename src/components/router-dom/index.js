import React from "react";
import AssignmentOutlinedIcon from "@material-ui/icons/AssignmentOutlined";
import BorderColorOutlinedIcon from "@material-ui/icons/BorderColorOutlined";
import EventNoteOutlinedIcon from "@material-ui/icons/EventNoteOutlined";
import EventOutlinedIcon from "@material-ui/icons/EventOutlined";
import FaceOutlinedIcon from "@material-ui/icons/FaceOutlined";
import Activity from "../../screens/class/Activity";
import LessonPlan from "../../screens/class/LessonPlan";
import Students from "../../screens/class/Students";
import Schedule from "../../screens/class/Schedule";
import Quiz from "../../containers/Quiz";
import InstructionalMaterials from "../../screens/class/InstructionalMaterials";

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
      .replace(/\/&/g, "&")
  );
}
export const rightPanelOptions = [
  {
    title: "Activity",
    link: "activity",
    icon: <AssignmentOutlinedIcon />,
    screen: Activity,
  },
  {
    title: "Lesson Plan",
    link: "lesson-plan",
    icon: <BorderColorOutlinedIcon />,
    screen: LessonPlan,
  },
  {
    title: "Instructional Materials",
    link: "instructional-materials",
    icon: <EventNoteOutlinedIcon />,
    screen: InstructionalMaterials,
  },
  {
    title: "Create Quiz",
    link: "quiz",
    icon: <EventNoteOutlinedIcon />,
    screen: Quiz,
  },
  {
    title: "Schedule",
    link: "schedule",
    icon: <EventOutlinedIcon />,
    screen: Schedule,
  },
  {
    title: "Students",
    link: "students",
    icon: <FaceOutlinedIcon />,
    screen: Students,
  },
];
export const rightPanelOptionsStudents = [
  {
    title: "Activity",
    link: "activity",
    icon: <AssignmentOutlinedIcon />,
    screen: Activity,
  },
  {
    title: "Lesson Materials",
    link: "instructional-materials",
    icon: <EventNoteOutlinedIcon />,
    screen: InstructionalMaterials,
  },
  {
    title: "Schedule",
    link: "schedule",
    icon: <EventOutlinedIcon />,
    screen: Schedule,
  },
];
export function getView(name) {
  console.log(
    rightPanelOptions
      .concat(rightPanelOptionsStudents)
      .filter((i) => i.link === name)[0]
  );
  return rightPanelOptions
    .concat(rightPanelOptionsStudents)
    .filter((i) => i.link === name)[0].screen;
}

export function isValidOption(name) {
  if (!name) return;
  return rightPanelOptions
    .concat(rightPanelOptionsStudents)
    .find((o) => o.link.toLowerCase() === name.toLowerCase());
}
