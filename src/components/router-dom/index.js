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
  },
  {
    title: "Lesson Plan",
    link: "lesson-plan",
  },
  {
    title: "Instructional Materials",
    link: "instructional-materials",
  },
  {
    title: "Schedule",
    link: "schedule",
  },
  {
    title: "Students",
    link: "students",
  },
];
export const rightPanelOptionsStudents = [
  {
    title: "Activity",
    link: "activity",
  },
  {
    title: "Lesson Materials",
    link: "instructional-materials",
  },
  {
    title: "Schedule",
    link: "schedule",
  },
];

export function isValidOption(name) {
  if (!name) return;
  return rightPanelOptions
    .concat(rightPanelOptionsStudents)
    .find((o) => o.link.toLowerCase() === name.toLowerCase());
}
