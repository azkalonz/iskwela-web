import CreateQuestionnaire from "../../containers/CreateQuestionnaire";
import Activity from "../../screens/class/Activity";
import AnswerQuiz from "../../screens/class/AnswerQuiz";
import Assignment from "../../screens/class/Assignment";
import Attendance from "../../screens/class/Attendance";
import InstructionalMaterials from "../../screens/class/InstructionalMaterials";
import LessonPlan from "../../screens/class/LessonPlan";
import Kahoot from "../../screens/class/Kahoot";
import WhiteBoard from "../../components/WhiteBoard";
import Todo from "../../screens/class/Todo";
import MyTodo from "../../screens/Student/Todo";
import Periodical from "../../screens/class/Periodical";
import Posts from "../../screens/class/Posts";
import Project from "../../screens/class/Project";
import Questionnaires from "../../screens/class/Questionnaires";
import Quizzes from "../../screens/class/Quizzes";
import Schedule from "../../screens/class/Schedule";
import Scores from "../../screens/class/Scores";
import Students from "../../screens/class/Students";
import Calendar from "../Calendar";
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
export const leftPanelTeacherMenu = [
  {
    title: "Posts",
    icon: "icon-feeds",
    screen: Posts,
    link: "posts",
  },
  {
    title: "Student Activities",
    navTitle: "Due this week",
    // link: "todo",
    icon: "icon-activities",
    // screen: Todo,
    children: [
      {
        title: "Seat Works",
        link: "activity",
        icon: null,
        screen: Activity,
      },
      {
        title: "Projects",
        link: "projects",
        icon: null,
        screen: Project,
      },
      {
        title: "Quizzes",
        link: "quizzes",
        icon: null,
        screen: Quizzes,
      },
      {
        title: "Periodical Tests",
        link: "periodical-tests",
        icon: null,
        screen: Periodical,
      },
      {
        title: "Assignments",
        link: "assignments",
        icon: null,
        screen: Assignment,
      },
      {
        title: "White Board",
        link: "white-board",
        icon: null,
        screen: WhiteBoard,
      },
      {
        title: "Kahoot",
        link: "kahoot.it",
        icon: null,
        screen: Kahoot,
      },
    ],
  },
  {
    title: "Questionnaires",
    icon: "icon-quiz",
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
        solo: true,
        link: "questionnaire",
        icon: null,
      },
    ],
  },
  {
    title: "Instructional Materials",
    link: "instructional-materials",
    icon: "icon-instructional-materials",
    screen: InstructionalMaterials,
  },
  {
    title: "Lesson Plan",
    link: "lesson-plan",
    icon: "icon-lesson-plan",
    screen: LessonPlan,
  },
  {
    title: "Reports",
    icon: "icon-attendance",
    children: [
      {
        title: "Attendance",
        link: "attendance",
        screen: Attendance,
      },
      {
        title: "Scores",
        link: "scores",
        screen: Scores,
      },
    ],
  },
  {
    title: "Schedules",
    link: "schedule",
    icon: "icon-schedule",
    screen: Schedule,
  },
  {
    title: "Students",
    link: "students",
    icon: "icon-students",
    screen: Students,
  },
];
export const leftPanelNonTeacherMenu = [
  {
    key: "posts",
    title: "Posts",
    icon: "icon-feeds",
    screen: Posts,
    link: "posts",
  },
  {
    key: "student-activities",
    title: "Student Activities",
    icon: "icon-activities",
    // navTitle: "Due this week",
    // link: "my-todo",
    // screen: MyTodo,
    children: [
      {
        title: "Seat Works",
        link: "activity",
        icon: null,
        screen: Activity,
      },
      {
        title: "Projects",
        link: "projects",
        icon: null,
        screen: Project,
      },

      {
        title: "Quizzes",
        link: "quizzes",
        icon: null,
        screen: Quizzes,
      },
      {
        title: "Periodical Tests",
        link: "periodical-tests",
        icon: null,
        screen: Periodical,
      },
      {
        title: "Assignments",
        link: "assignments",
        icon: null,
        screen: Assignment,
      },
      {
        title: "White Board",
        link: "white-board",
        icon: null,
        screen: WhiteBoard,
        hideToUserType: ["p"],
      },
      {
        title: "Kahoot",
        link: "kahoot.it",
        icon: null,
        screen: Kahoot,
        hideToUserType: ["p"],
      },
    ],
  },
  {
    key: "instructional-materials",
    title: "Instructional Materials",
    link: "instructional-materials",
    icon: "icon-instructional-materials",
    screen: InstructionalMaterials,
  },
  {
    key: "reports",
    title: "Reports",
    icon: "icon-attendance",
    children: [
      {
        title: "Attendance",
        link: "my-attendance",
        screen: Calendar,
      },
      {
        title: "Scores",
        link: "scores",
        screen: Scores,
      },
    ],
  },
  {
    key: "schedules",
    title: "Schedules",
    link: "schedule",
    icon: "icon-schedule",
    screen: Schedule,
  },
];
export const reorderOptions = (orderId, options) => {
  let reorderedOptions = options;
  let order = {
    p: [
      "reports",
      "student-activities",
      "instructional-materials",
      "posts",
      "schedules",
    ],
  };
  switch (orderId) {
    case "p":
      reorderedOptions = order.p.map((q) => options.find((qq) => q === qq.key));
  }
  return reorderedOptions;
};
export function getView(name, isTeacher = false) {
  if (isTeacher) {
    let screen;
    leftPanelTeacherMenu.concat(leftPanelNonTeacherMenu).forEach((i) => {
      if (screen) return;
      if (i.link === name) screen = i.screen;
      if (i.children)
        i.children.forEach((c) => {
          if (screen) return;
          if (c.link === name) screen = c.screen;
        });
    });
    return screen;
  } else {
    let screen;
    leftPanelNonTeacherMenu.forEach((i) => {
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
}

export function isValidOption(name) {
  if (!name) return;
  let isvalid;
  leftPanelTeacherMenu.concat(leftPanelNonTeacherMenu).forEach((o) => {
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
