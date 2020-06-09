import React from "react";
import {
  AppBar,
  Toolbar as MuiToolbar,
  Icon,
  useTheme,
  Button,
  Typography,
} from "@material-ui/core";

function Toolbar(props) {
  const theme = useTheme();
  return (
    <AppBar
      variant="outlined"
      position="static"
      id="quiz-toolbar"
      style={{ borderLeft: "none", background: theme.palette.grey[100] }}
    >
      <MuiToolbar
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <Button
          variant="contained"
          style={{ background: theme.palette.success.main, color: "#fff" }}
        >
          Save
        </Button>
      </MuiToolbar>
    </AppBar>
  );
}

export default Toolbar;
