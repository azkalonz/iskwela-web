import React from "react";
import {
  Box,
  Popover,
  Toolbar,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
} from "@material-ui/core";
import socket from "./socket.io";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";

const recentMessages = [];

const Messages = {
  updateMessage: (id, { sender, receiver, update }, callback) => {
    socket.emit("update message", { id, sender, receiver, update });
  },
  getRecentMessages: (user, callback, otheruser = null) => {
    socket.emit("get recent messages", { user, otheruser });
  },
  sendMessage: (channel, message) => {
    socket.emit("send message", { channel, message });
  },
  getMessages: (channel, { start, end }, callback = null) => {
    socket.emit("get messages", { channel, start, end });
    callback && callback();
  },
  subscribe: (dispatch) => {
    socket.on(
      "update message",
      (data) => dispatch && dispatch({ data, type: "UPDATE_MESSAGE" })
    );
    socket.on(
      "get online users",
      (data) => dispatch && dispatch({ data, type: "SET_ONLINE_USERS" })
    );
    socket.on(
      "get recent messages",
      (data) => dispatch && dispatch({ data, type: "SET_RECENT" })
    );
    socket.on("new message", (data) => {
      dispatch && dispatch({ data, type: "ADD_MESSAGE" });
      let c = document.querySelector("#chat-container");
      if (c && c.firstElementChild) {
        c = c.firstElementChild;
        let height = c.firstElementChild.scrollHeight;
        c.firstElementChild.scrollTop = height;
      }
    });
    socket.on(
      "get messages",
      (data) => dispatch && dispatch({ data, type: "SET_MESSAGES" })
    );
  },
  vc: {
    call: (caller, receiver) => {
      socket.emit("videocall", { caller, receiver, status: "CALLING" });
    },
    decline: (caller, receiver) => {
      socket.emit("videocall", { caller, receiver, status: "DECLINED" });
    },
    accept: (caller, receiver) => {
      socket.emit("videocall", { caller, receiver, status: "ACCEPTED" });
    },
  },
};

function RecentMessages(props) {
  const history = useHistory();
  React.useEffect(() => {
    props.onNotSeen(
      props.recent.filter((q) => (q.seen[props.userInfo.id] ? false : true))
        .length
    );
  }, [props.recent, props.onNotSeen]);
  return (
    <Popover
      anchorEl={props.anchor}
      onClose={props.onClose}
      open={props.anchor ? true : false}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <Box width={320}>
        <Toolbar>
          <Typography style={{ fontWeight: "bold" }}>
            Recent Messages
          </Typography>
          <Divider />
        </Toolbar>
        <List>
          {props.recent
            .filter((q, i) => {
              let duplicateIndex = props.recent.findIndex(
                (qq) => qq.channel === q.channel
              );
              return i > duplicateIndex ? false : true;
            })
            .filter((q, i) => {
              let isSender = q.sender.id === props.userInfo.id;
              let user = isSender ? q.receiver : q.sender;
              let duplicateIndex = props.recent.findIndex((qq) =>
                isSender ? qq.receiver.id === user.id : qq.sender.id === user.id
              );
              return i > duplicateIndex ? false : true;
            })
            .map((r) => {
              let user =
                r.sender.id === props.userInfo.id ? r.receiver : r.sender;
              let message = JSON.parse(r.message).blocks[0].text;
              return (
                <ListItem
                  className={r.seen[props.userInfo.id] ? "seen" : "not-seen"}
                  onClick={() => history.push("/chat/" + user.username)}
                >
                  <ListItemAvatar>
                    <Avatar src={user.preferences.profile_picture} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.first_name + " " + user.last_name}
                    secondary={message}
                  />
                </ListItem>
              );
            })}
          <ListItem onClick={() => history.push("/chat/")}>
            <ListItemText primary="See All" />
          </ListItem>
        </List>
      </Box>
    </Popover>
  );
}
const ConnectedRecentMessages = connect((states) => ({
  recent: states.messages.recent_messages,
  userInfo: states.userInfo,
}))(RecentMessages);
export { ConnectedRecentMessages as RecentMessages };

export default Messages;
