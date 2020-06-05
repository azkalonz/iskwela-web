import React from "react";
import {
  AppBar,
  Toolbar,
  Checkbox,
  Grow,
  Tooltip,
  IconButton,
  Button,
  useTheme,
} from "@material-ui/core";
import DeleteOutlineOutlinedIcon from "@material-ui/icons/DeleteOutlineOutlined";
import VisibilityOffOutlinedIcon from "@material-ui/icons/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@material-ui/icons/VisibilityOutlined";

export function CheckBoxAction(props) {
  const theme = useTheme();
  return (
    <AppBar position="sticky" style={{ background: theme.palette.grey[200] }}>
      <Toolbar
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <Checkbox
            checked={props.checked}
            onChange={() => {
              props.onSelect();
            }}
          />
          {props.onDelete && (
            <Grow in={true}>
              <Tooltip title="Delete" placement="bottom">
                <IconButton onClick={props.onDelete}>
                  <DeleteOutlineOutlinedIcon />
                </IconButton>
              </Tooltip>
            </Grow>
          )}
          {props.onUnpublish && (
            <Grow in={true}>
              <Tooltip title="Unpublish" placement="bottom">
                <IconButton onClick={props.onUnpublish}>
                  <VisibilityOffOutlinedIcon />
                </IconButton>
              </Tooltip>
            </Grow>
          )}
          {props.onPublish && (
            <Grow in={true}>
              <Tooltip title="Publish" placement="bottom">
                <IconButton onClick={props.onPublish}>
                  <VisibilityOutlinedIcon />
                </IconButton>
              </Tooltip>
            </Grow>
          )}
        </div>
        <div>
          <Grow in={true}>
            <Button variant="outlined" onClick={props.onCancel}>
              Cancel
            </Button>
          </Grow>
        </div>
      </Toolbar>
    </AppBar>
  );
}
