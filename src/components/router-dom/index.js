import React from "react";
import AssignmentOutlinedIcon from "@material-ui/icons/AssignmentOutlined";
import BorderColorOutlinedIcon from "@material-ui/icons/BorderColorOutlined";
import EventNoteOutlinedIcon from "@material-ui/icons/EventNoteOutlined";
import EventOutlinedIcon from "@material-ui/icons/EventOutlined";
import FaceOutlinedIcon from "@material-ui/icons/FaceOutlined";
import Activity from "../../screens/class/Activity";
import Attendance from "../../screens/class/Attendance";
import LessonPlan from "../../screens/class/LessonPlan";
import Quizzes from "../../screens/class/Quizzes";
import Students from "../../screens/class/Students";
import Schedule from "../../screens/class/Schedule";
import Scores from "../../screens/class/Scores";
import InstructionalMaterials from "../../screens/class/InstructionalMaterials";
import CreateOutlinedIcon from "@material-ui/icons/CreateOutlined";
import PeopleOutlinedIcon from "@material-ui/icons/PeopleOutlined";
import NoteAddOutlinedIcon from "@material-ui/icons/NoteAddOutlined";
import AnswerQuiz from "../../screens/class/AnswerQuiz";
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
    title: "Quizzes",
    link: "quizzes",
    icon: <NoteAddOutlinedIcon />,
    children: ["scores", "quiz"],
    screen: Quizzes,
  },
  {
    title: "Schedule",
    link: "schedule",
    icon: <EventOutlinedIcon />,
    screen: Schedule,
  },
  {
    title: "Attendance",
    link: "attendance",
    icon: <PeopleOutlinedIcon />,
    screen: Attendance,
  },
  {
    title: "Students",
    link: "students",
    icon: <FaceOutlinedIcon />,
    screen: Students,
  },
  {
    title: "Quiz",
    link: "quiz",
    icon: null,
    screen: AnswerQuiz,
    hidden: true,
  },
  {
    title: "Scores",
    link: "scores",
    icon: null,
    screen: Scores,
    hidden: true,
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
    title: "Quizzes",
    link: "quizzes",
    children: ["scores", "quiz"],
    icon: <NoteAddOutlinedIcon />,
    screen: Quizzes,
  },
  {
    title: "Quiz",
    link: "quiz",
    icon: null,
    screen: AnswerQuiz,
    hidden: true,
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
