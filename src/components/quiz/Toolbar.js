import React, { useState } from "react";
import {
  Toolbar as MuiToolbar,
  Icon,
  useTheme,
  IconButton,
  Button,
  CircularProgress,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";

function Toolbar(props) {
  const theme = useTheme();
  const history = useHistory();
  const [saving, setSaving] = useState(false);
  return (
    <MuiToolbar
      style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        background: theme.palette.grey[100],
        zIndex: 10,
      }}
    >
      <div>
        <IconButton onClick={() => history.push("#settings")}>
          <Icon>settings</Icon>
        </IconButton>
        <Button
          onClick={() => history.push("#preview")}
          variant="contained"
          disabled={!props.preview}
          style={{ marginRight: 13 }}
        >
          Preview
        </Button>
        <Button
          onClick={() => {
            setSaving(true);
            props.onSave(() => setSaving(false));
          }}
          variant="contained"
          style={{
            background:
              saving || !props.modified
                ? theme.palette.disabled
                : theme.palette.success.main,
            color: "#fff",
            position: "relative",
          }}
          disabled={!props.modified || saving}
        >
          Save
          {saving && (
            <CircularProgress size={18} style={{ position: "absolute" }} />
          )}
        </Button>
      </div>
    </MuiToolbar>
  );
}

export default Toolbar;
