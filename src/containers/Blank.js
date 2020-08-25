import React, { useEffect } from "react";
import Drawer from "../components/Drawer";
import NavBar from "../components/NavBar";
import { Box, CircularProgress } from "@material-ui/core";

function Blank(props) {
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    if (props.link) _getContent(props.link);
  }, []);
  const _getContent = async (l) => {
    let c = await fetch("https://cors-anywhere.herokuapp.com/" + l).then((p) =>
      p.text()
    );
    c = c.replace("src=", "src=" + l);
    document.querySelector("#content").innerHTML = c;
    setLoading(false);
  };
  return (
    <div>
      <Drawer {...props}>
        <Box
          flexDirection="row"
          alignContent="flex-start"
          display="flex"
          flexWrap="wrap"
          height="100vh"
        >
          <NavBar title={props.title} />
          {loading && (
            <Box
              width="100%"
              height="100%"
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <CircularProgress />
            </Box>
          )}
          <div id="content"></div>
        </Box>
      </Drawer>
    </div>
  );
}

export default Blank;
