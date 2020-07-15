import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Box } from "@material-ui/core";

function Kahoot(props) {
  useEffect(() => {
    props.onLoad(true);
    let i = document.querySelector("#kahoot-iframe");
    i.src = "https://kahoot.it/";
    i.onload = () => {
      props.onLoad(false);
    };
  }, []);
  return (
    <Box marginTop={2} marginBottom={2} height="100vh" width="100%">
      <iframe
        id="kahoot-iframe"
        style={{ border: "none" }}
        width="100%"
        height="100%"
      />
    </Box>
  );
}

export default connect()(Kahoot);
