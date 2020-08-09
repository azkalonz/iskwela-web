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
  Icon,
} from "@material-ui/core";
import DeleteOutlineOutlinedIcon from "@material-ui/icons/DeleteOutlineOutlined";
import VisibilityOffOutlinedIcon from "@material-ui/icons/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@material-ui/icons/VisibilityOutlined";
import { connect } from "react-redux";

function CheckBoxAction(props) {
  const isTeacher = props.userInfo.user_type === "t" ? true : false;
  const theme = useTheme();
  return isTeacher ? (
    <AppBar
      className="sticky"
      style={{ top: 65, background: theme.palette.grey[200] }}
      variant="outlined"
    >
      <Toolbar
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingLeft: 20,
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
              <Tooltip
                title={props.labels.onDelete?.title || "Delete"}
                placement="bottom"
              >
                <IconButton onClick={props.onDelete}>
                  {!props.labels.onDelete?.icon ? (
                    <DeleteOutlineOutlinedIcon />
                  ) : (
                    <Icon>{props.labels.onDelete?.icon}</Icon>
                  )}
                </IconButton>
              </Tooltip>
            </Grow>
          )}
          {props.onUnpublish && (
            <Grow in={true}>
              <Tooltip
                title={props.labels.onUnpublish?.title || "Unpublish"}
                placement="bottom"
              >
                <IconButton onClick={props.onUnpublish}>
                  {!props.labels.onUnpublish?.icon ? (
                    <span className="icon-unpublish"></span>
                  ) : (
                    <Icon>{props.labels.onUnpublish?.icon}</Icon>
                  )}
                </IconButton>
              </Tooltip>
            </Grow>
          )}
          {props.onPublish && (
            <Grow in={true}>
              <Tooltip
                title={props.labels.onPublish?.title || "Publish"}
                placement="bottom"
              >
                <IconButton onClick={props.onPublish}>
                  {!props.labels.onPublish?.icon ? (
                    <span className="icon-publish"></span>
                  ) : (
                    <Icon>{props.labels.onPublish?.icon}</Icon>
                  )}
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
  ) : null;
}

const ConnectedCheckBoxAction = connect((states) => ({
  userInfo: states.userInfo,
}))(CheckBoxAction);

export { ConnectedCheckBoxAction as CheckBoxAction };
