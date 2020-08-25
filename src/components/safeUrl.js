export const addWrapper = (el, handler) => {
  if (el.parentElement && !el.parentElement.querySelector(".safe-to-url")) {
    let x = document.createElement("div");
    x.classList.add("safe-to-url");
    x.addEventListener("click", () => handler(x));
    el.parentElement.style.position = "relative";
    el.parentElement.style.cursor = "pointer";
    el.parentElement.appendChild(x);
  } else {
    let x = el.parentElement.querySelector(".safe-to-url");
    x.addEventListener("click", () => handler(x));
  }
};
export const safeURLChange = (room_name, handler) => {
  let buttons = [".tab-btn", ".logo-btn", ".warn-to-leave"];
  if (!room_name) {
    document
      .querySelectorAll(".safe-to-url")
      .forEach((i) => (i.style.display = "none"));
    return;
  } else {
    document
      .querySelectorAll(".safe-to-url")
      .forEach((i) => (i.style.display = "block"));
  }
  buttons.forEach((b) => {
    document.querySelectorAll(b).forEach((i) => addWrapper(i, handler));
  });
};
