import React from "react";
import AssignmentOutlinedIcon from "@material-ui/icons/AssignmentOutlined";
import BorderColorOutlinedIcon from "@material-ui/icons/BorderColorOutlined";
import EventNoteOutlinedIcon from "@material-ui/icons/EventNoteOutlined";
import EventOutlinedIcon from "@material-ui/icons/EventOutlined";
import FaceOutlinedIcon from "@material-ui/icons/FaceOutlined";
import Activity from "../../screens/class/Activity";
import Posts from "../../screens/class/Posts";
import Attendance from "../../screens/class/Attendance";
import LessonPlan from "../../screens/class/LessonPlan";
import Quizzes from "../../screens/class/Quizzes";
import CreateQuestionnaire from "../../containers/CreateQuestionnaire";
import Questionnaires from "../../screens/class/Questionnaires";
import Students from "../../screens/class/Students";
import Schedule from "../../screens/class/Schedule";
import Scores from "../../screens/class/Scores";
import InstructionalMaterials from "../../screens/class/InstructionalMaterials";
import CreateOutlinedIcon from "@material-ui/icons/CreateOutlined";
import PeopleOutlinedIcon from "@material-ui/icons/PeopleOutlined";
import NoteAddOutlinedIcon from "@material-ui/icons/NoteAddOutlined";
import AnswerQuiz from "../../screens/class/AnswerQuiz";
import QuestionAnswerOutlinedIcon from "@material-ui/icons/QuestionAnswerOutlined";
export function makeLinkTo(path, options = {}, relative = false) {
  path = path.map((p) => (options[p] != null ? options[p] : p));
  return (
    (relative ? "" : "/") +
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
    title: "Posts",
    icon: <QuestionAnswerOutlinedIcon />,
    screen: Posts,
    link: "posts",
  },
  {
    title: "Student Activity",
    icon: <AssignmentOutlinedIcon />,
    screen: Activity,
    children: [
      {
        title: "Seat Work",
        link: "activity",
        icon: <AssignmentOutlinedIcon />,
        screen: Activity,
      },
      {
        title: "Quiz",
        link: "quizzes",
        icon: <NoteAddOutlinedIcon />,
        children: [
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
        ],
        screen: Quizzes,
      },
    ],
  },
  {
    title: "Questionnaire",
    icon: <EventNoteOutlinedIcon />,
    screen: CreateQuestionnaire,
    children: [
      {
        title: "View Questionnaires",
        screen: Questionnaires,
        link: "view-questionnaire",
        icon: null,
      },
      {
        title: "Create Questionnaire",
        screen: CreateQuestionnaire,
        link: "questionnaire",
        icon: null,
      },
    ],
  },
  {
    title: "Instructional Materials",
    link: "instructional-materials",
    icon: <EventNoteOutlinedIcon />,
    screen: InstructionalMaterials,
  },
  {
    title: "Lesson Plan",
    link: "lesson-plan",
    icon: <BorderColorOutlinedIcon />,
    screen: LessonPlan,
  },
  {
    title: "Attendance",
    link: "attendance",
    icon: <PeopleOutlinedIcon />,
    screen: Attendance,
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
    title: "Posts",
    icon: <QuestionAnswerOutlinedIcon />,
    screen: Posts,
    link: "posts",
  },
  {
    title: "Seat Work",
    link: "activity",
    icon: <AssignmentOutlinedIcon />,
    screen: Activity,
  },
  {
    title: "Quizzes",
    link: "quizzes",
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
  let screen;
  rightPanelOptions.concat(rightPanelOptionsStudents).forEach((i) => {
    if (screen) return;
    if (i.link === name) screen = i.screen;
    if (i.children)
      i.children.forEach((c) => {
        if (screen) return;
        if (c.link === name) screen = c.screen;
      });
  });
  return screen;
}

export function isValidOption(name) {
  if (!name) return;
  let isvalid;
  rightPanelOptions.concat(rightPanelOptionsStudents).forEach((o) => {
    if (isvalid) return;
    if (o.link) {
      if (o.link.toLowerCase() === name.toLowerCase()) isvalid = o;
    }
    if (o.children) {
      o.children.forEach((c) => {
        if (isvalid) return;
        if (c.link) {
          if (c.link.toLowerCase() === name.toLowerCase()) isvalid = c;
        }
      });
    }
  });
  return isvalid;
}
