import React from "react";
import Button from "@material-ui/core/Button";

const Slide = (props) => {
  let cn = props.addBtn ? "slide add-btn" : "slide";
  return <div className={cn}>{props.addBtn && "+"}</div>;
};

export default function Slides() {
  return (
    <aside className="slides-container">
      <Button>
        <Slide />
      </Button>
      <Button>
        <Slide addBtn />
      </Button>
    </aside>
  );
}
