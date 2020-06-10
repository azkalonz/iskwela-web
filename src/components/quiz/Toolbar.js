import React from "react";
import {
  AppBar,
  Toolbar as MuiToolbar,
  Icon,
  useTheme,
  IconButton,
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
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <IconButton onClick={() => props.navigate("BEFORE")}>
            <Icon>navigate_before</Icon>
          </IconButton>
          <IconButton onClick={() => props.navigate("NEXT")}>
            <Icon>navigate_next</Icon>
          </IconButton>
        </div>
        <div>
          <IconButton onClick={() => props.navigate("NEXT")}>
            <Icon>settings</Icon>
          </IconButton>
          <Button
            variant="contained"
            style={{ background: theme.palette.success.main, color: "#fff" }}
          >
            Save
          </Button>
        </div>
      </MuiToolbar>
    </AppBar>
  );
}

export default Toolbar;
