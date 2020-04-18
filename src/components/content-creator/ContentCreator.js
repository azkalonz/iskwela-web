import React, { Component } from "react";
import "../../styles/contentcreate.scss";
import Slides from "./Slides";

class ContentCreator extends Component {
  render() {
    return (
      <section id="material-maker">
        <Slides />
      </section>
    );
  }
}

export default ContentCreator;
