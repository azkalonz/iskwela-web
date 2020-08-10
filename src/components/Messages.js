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
  ButtonBase,
  Button,
  useTheme,
  useMediaQuery,
} from "@material-ui/core";
import socket from "./socket.io";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import moment from "moment";
import store from "./redux/store";
const { OnlineBadge, OfflineBadge } = require("../screens/Chat");

const focusNewMessage = () => {
  let c = document.querySelector("#chat-container");
  if (c && c.firstElementChild) {
    c = c.firstElementChild;
    let height = c.firstElementChild.scrollHeight;
    c.firstElementChild.scrollTop = height + window.outerHeight;
  }
};
const Messages = {
  hooks: {},
  clear: () => {
    store.dispatch({ type: "CLEAR_MESSAGES" });
  },
  updateMessage: (id, { sender, receiver, update }, callback) => {
    socket.emit("update message", { id, sender, receiver, update });
  },
  updateConvo: ({ sender, receiver, update }, callback) => {
    socket.emit("update chat", { sender, receiver, update });
  },
  getRecentMessages: (user, callback, otheruser = null) => {
    socket.emit("get recent messages", { user, otheruser });
  },
  sendMessage: (channel, message) => {
    socket.emit("send message", { channel, message });
    typeof Messages.hooks["send message"] === "function" &&
      Messages.hooks["send message"](message);
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
      "update chat",
      (data) => dispatch && dispatch({ data, type: "UPDATE_CHAT" })
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
      setTimeout(() => {
        focusNewMessage();
      }, 0);
      typeof Messages.hooks["new message"] === "function" &&
        Messages.hooks["new message"](data);
    });
    socket.on("get messages", (data) => {
      dispatch && dispatch({ data, type: "SET_MESSAGES" });
      setTimeout(() => {
        if (data.start === 0) focusNewMessage();
      }, 1600);
      typeof Messages.hooks["get message"] === "function" &&
        Messages.hooks["get message"](data);
    });
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const history = useHistory();
  const getFilteredMessages = () =>
    props.recent
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
      });
  React.useEffect(() => {
    props.onNotSeen(
      props.recent
        .filter((q) => (q.seen[props.userInfo.id] ? false : true))
        .filter((q, i) => {
          let duplicateIndex = props.recent.findIndex((qq) => qq.id === q.id);
          return i > duplicateIndex ? false : true;
        }).length
    );
  }, [props.recent]);
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
      <Box width={isMobile ? "100vw" : 400}>
        <Toolbar>
          <Typography style={{ fontWeight: "bold" }}>
            Recent Messages
          </Typography>
          <Divider />
        </Toolbar>
        {!props.recent.length ? (
          <Box p={3} style={{ opacity: 0.6 }} textAlign="center">
            <img width="70%" alt="Messages" src="/chat/chat.svg" />
            <Typography>Your inbox is clear!</Typography>
          </Box>
        ) : null}
        {getFilteredMessages().map((r, index) => {
          let user = r.sender.id === props.userInfo.id ? r.receiver : r.sender;
          let message = JSON.parse(r.message).blocks[0].text;
          return (
            <ButtonBase
              key={index}
              className={r.seen[props.userInfo.id] ? "seen" : "not-seen"}
              onClick={() => {
                if (isMobile) history.push("/chat/" + user.username);
                else history.push("?t=" + user.username);
                props.onClose && props.onClose();
              }}
              style={{
                textAlign: "left",
                padding: 13,
                alignItems: "flex-start",
                width: "100%",
              }}
            >
              <Box marginRight={1}>
                {React.createElement(
                  eval(
                    props.users &&
                      props.users.find((q) => q.id === user.id)?.status ===
                        "online"
                      ? "OnlineBadge"
                      : "OfflineBadge"
                  ),
                  {
                    anchorOrigin: {
                      vertical: "bottom",
                      horizontal: "right",
                    },
                    variant: "dot",
                  },
                  <Avatar
                    src={user.preferences.profile_picture}
                    alt={user.first_name}
                  />
                )}
              </Box>
              <Box
                flex={1}
                overflow="hidden"
                className={r.seen[props.userInfo.id] ? "seen" : "not-seen"}
                width="80%"
              >
                <Typography style={{ fontWeight: "bold" }}>
                  {user.first_name + " " + user.last_name}
                </Typography>
                <Typography
                  style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
                >
                  {message}
                </Typography>
              </Box>
              <Box>
                <Typography color="textSecondary">
                  {moment(new Date()).diff(r.date, "days") > 1
                    ? moment(r.date).format("ddd")
                    : moment(r.date).fromNow()}
                </Typography>
              </Box>
            </ButtonBase>
          );
        })}
        <Box width="100%" textAlign="left">
          <Divider />
          <Toolbar>
            <Button
              onClick={() => {
                history.push("/chat#users");
                props.onClose && props.onClose();
              }}
            >
              See All
            </Button>
          </Toolbar>
        </Box>
      </Box>
    </Popover>
  );
}

const ConnectedRecentMessages = connect((states) => ({
  recent: states.messages.recent_messages.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  ),
  userInfo: states.userInfo,
  users: states.users,
}))(RecentMessages);
export { ConnectedRecentMessages as RecentMessages };

export default Messages;
