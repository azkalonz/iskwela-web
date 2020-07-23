import React, { useEffect, useState, useRef } from "react";
import Messages from "../components/Messages";
import {
  Box,
  Avatar,
  makeStyles,
  Typography,
  withStyles,
  ButtonBase,
  Badge,
  IconButton,
  Icon,
  Divider,
  TextField,
  CircularProgress,
  Toolbar,
  ListItem,
  ListItemIcon,
  List,
  useTheme,
  ListItemText,
  useMediaQuery,
  Backdrop,
} from "@material-ui/core";
import { connect } from "react-redux";
import { SearchInput } from "../components/Selectors";
import Scrollbars from "react-custom-scrollbars";
import Drawer from "../components/Drawer";
import MUIRichTextEditor from "mui-rte";
import { useHistory } from "react-router-dom";
import { convertToRaw, EditorState } from "draft-js";
import socket from "../components/socket.io";
import moment from "moment";
import NavBar from "../components/NavBar";
import Jitsi from "react-jitsi";

function Users(props) {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const { first_name, last_name, preferences } = props.userInfo;
  const { onlineUsers } = props;
  const [search, setSearch] = useState("");
  const { chat_id } = props.match.params;
  const students = onlineUsers;
  const getSortedStudents = () =>
    [...students]
      .filter((q) => JSON.stringify(q).toLowerCase().indexOf(search) >= 0)
      .filter((q) => q.id !== props.userInfo.id)
      .sort((a, b) => {
        a = props.recent.find(
          (q) => q.receiver.id === a.id || q.sender.id === a.id
        );
        return a ? -1 : 0;
      })
      .sort((a, b) => {
        a = props.recent.find(
          (q) => q.receiver.id === a.id || q.sender.id === a.id
        );
        b = props.recent.find(
          (q) => q.receiver.id === b.id || q.sender.id === b.id
        );
        return a && b ? new Date(b.date) - new Date(a.date) : 0;
      });
  const getRecentMessage = (user) => {
    let r =
      props.recent.find(
        (q) => q.receiver.id === user.id || q.sender.id === user.id
      ) || {};
    return r;
  };
  return (
    <Box
      width="100%"
      height="100%"
      className="users"
      display="flex"
      flexDirection="column"
    >
      <Toolbar style={{ background: "#fff" }}>
        {isTablet && (
          <IconButton onClick={() => props.history.push("#menu")}>
            <Icon>menu</Icon>
          </IconButton>
        )}
        <Box width="100%">
          <SearchInput onChange={(e) => setSearch(e.toLowerCase())} />
        </Box>
        {isTablet && (
          <IconButton
            color="primary"
            onClick={() =>
              props.history.push(
                props.location.hash === "#users" ? "#" : "#users"
              )
            }
          >
            <Icon>
              {props.location.hash === "#users" ? (
                <span className="icon-menu-close"></span>
              ) : (
                <span className="icon-menu-open"></span>
              )}
            </Icon>
          </IconButton>
        )}
      </Toolbar>
      <Box overflow="auto" height="100%">
        <Scrollbars autoHide>
          {students &&
            props.recent &&
            getSortedStudents().map((s, index) => (
              <ButtonBase
                key={index}
                className={
                  "chat-user " +
                  (props.selected === s.username ? "selected" : "")
                }
                onClick={() => props.onClick(s)}
              >
                {React.createElement(
                  eval(
                    onlineUsers &&
                      onlineUsers.find((q) => q.id === s.id)?.status ===
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
                    src={s.preferences.profile_picture}
                    alt={s.first_name}
                  />
                )}
                <Box
                  width="85%"
                  display="flex"
                  alignItems="flex-start"
                  justifyContent="space-between"
                >
                  <Box
                    width="70%"
                    marginLeft={1}
                    className={
                      getRecentMessage(s)?.seen &&
                      Object.keys(getRecentMessage(s).seen).length &&
                      getRecentMessage(s)?.seen[props.userInfo.id]
                        ? "seen"
                        : "not-seen"
                    }
                  >
                    <Typography color="primary">
                      {s.first_name + " " + s.last_name}
                    </Typography>
                    <Typography
                      component="div"
                      color="textSecondary"
                      style={{
                        marginTop: -10,
                        maxHeight: 38,
                      }}
                      component="div"
                    >
                      <MUIRichTextEditor
                        readOnly={true}
                        value={getRecentMessage(s).message}
                        toolbar={false}
                        inlineToolbar={false}
                      />
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography color="textSecondary">
                      {getRecentMessage(s) &&
                        moment(getRecentMessage(s).date).format("hh:mm A")}
                    </Typography>
                    {/* <Badge badgeContent={2} color="error" /> */}
                  </Box>
                </Box>
              </ButtonBase>
            ))}
        </Scrollbars>
      </Box>
    </Box>
  );
}
function ChatBox(props) {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const { first_name, last_name, preferences = {} } = props.user || {};
  const editorRef = useRef();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { chat_id } = props.match.params;
  const sendMessage = (message, callback) => {
    if (!chat_id) return;
    let x = JSON.parse(message);
    if (!x.blocks[0].text) {
      setMessage(
        JSON.stringify(
          convertToRaw(EditorState.createEmpty().getCurrentContent())
        )
      );
      return;
    }
    if (!x.blocks[Object.keys(x.blocks).length - 1].text)
      x.blocks.splice(Object.keys(x.blocks).length - 1);
    x = JSON.stringify(x);
    message = x;
    Messages.sendMessage(
      { sender: props.userInfo, receiver: props.user },
      message
    );
    props.onSend &&
      props.onSend({
        message,
        sender: props.userInfo,
        receiver: props.user,
        date: new Date().toISOString(),
      });
    setMessage(
      JSON.stringify(
        convertToRaw(EditorState.createEmpty().getCurrentContent())
      )
    );
  };
  const sameSender = (convo, index) => {
    let i = 5;
    let { id } = convo[index].sender;
    let top = convo[index - 1];
    let bottom = convo[index + 1];
    if (top && bottom && id !== top.sender.id && id !== bottom.sender.id)
      return i;
    if (top && top.sender.id === id) i -= 2;
    if (bottom && bottom.sender.id === id) i -= 3;
    return i;
  };
  const getClassName = (i) => {
    switch (i) {
      case 0:
        return "top-bottom";
      case 3:
        return "bottom";
      case 2:
        return "top";
      case 5:
        return "";
    }
  };
  const loadMore = () => {
    setLoading(true);
    document
      .querySelectorAll(".details.opened")
      .forEach((e) => e.classList.remove("opened"));
    props.loadMore(() => setLoading(false));
  };
  return (
    <Box
      width="100%"
      className="chat-box"
      display="flex"
      height="100%"
      flexDirection="column"
    >
      <Box
        p={2}
        display="flex"
        justifyContent="space-between"
        style={{ background: "#fff" }}
        height={50}
        alignItems="center"
      >
        {isTablet && (
          <IconButton
            color="primary"
            onClick={() =>
              props.history.push(
                props.location.hash === "#users" ? "#" : "#users"
              )
            }
          >
            <Icon>
              {props.location.hash === "#users" ? (
                <span className="icon-menu-close"></span>
              ) : (
                <span className="icon-menu-open"></span>
              )}
            </Icon>
          </IconButton>
        )}
        <Box display="flex" alignItems="center" flex={1} overflow="hidden">
          <Avatar src={preferences.profile_picture} alt={first_name} />
          <Typography style={{ marginLeft: 7 }}>
            {first_name} {last_name}
          </Typography>
          {loading && <CircularProgress size={18} />}
        </Box>
        <Box>
          <IconButton>
            <Icon>search</Icon>
          </IconButton>
          {isTablet && (
            <IconButton
              color="primary"
              onClick={() => props.history.push("#user-details")}
            >
              <Icon>info</Icon>
            </IconButton>
          )}
        </Box>
      </Box>
      <Box width="100%">
        <Divider />
      </Box>
      <Box
        id="chat-container"
        height="100%"
        paddingTop={0}
        paddingBottom={0}
        overflow="auto"
      >
        {props.chat && props.chat.messages && (
          <Scrollbars autoHide>
            {props.chat.loaded !== props.chat.total && chat_id && (
              <Box width="100%" display="flex" justifyContent="center">
                <IconButton onClick={loadMore}>
                  <Icon>expand_less</Icon>
                </IconButton>
              </Box>
            )}
            <Box p={2}>
              {props.chat.messages
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map((c, index) => (
                  <Box
                    key={index}
                    position="relative"
                    marginTop={index === 0 ? 2 : 0}
                  >
                    {c.sender.id !== props.userInfo.id &&
                      (sameSender(props.chat.messages, index) === 3 ||
                        sameSender(props.chat.messages, index) === 5) && (
                        <Box
                          className="picture"
                          style={{
                            width: 35,
                            height: 35,
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                          }}
                        >
                          <Avatar
                            style={{ width: "100%", height: "100%" }}
                            src={c.sender.preferences.profile_picture}
                            alt={c.sender.first_name}
                          />
                        </Box>
                      )}
                    <Box
                      key={index}
                      display="flex"
                      style={{
                        marginLeft:
                          c.sender.id !== props.userInfo.id ? "40px" : "0",
                        position: "relative",
                      }}
                      justifyContent={
                        c.sender.id !== props.userInfo.id
                          ? "flex-start"
                          : "flex-end"
                      }
                      flexWrap="wrap"
                    >
                      {props.chat.messages[index - 1] &&
                        moment(c.date).diff(
                          props.chat.messages[index - 1].date,
                          "days"
                        ) > 1 && (
                          <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            width="100%"
                          >
                            <Box width="100%">
                              <Divider />
                            </Box>
                            <Box p={2} style={{ whiteSpace: "pre" }}>
                              {moment(c.date).format("MMMM DD, YYYY hh:mm A")}
                            </Box>
                            <Box width="100%">
                              <Divider />
                            </Box>
                          </Box>
                        )}
                      <Box
                        id={"msg-" + c.id}
                        className={
                          (c.sender.id !== props.userInfo.id
                            ? "msg sender "
                            : "msg receiver ") +
                          getClassName(sameSender(props.chat.messages, index))
                        }
                        onClick={() =>
                          document
                            .querySelector("#msg-" + c.id)
                            ?.nextElementSibling?.classList.toggle("opened")
                        }
                      >
                        <MUIRichTextEditor
                          readOnly={true}
                          value={c.message}
                          toolbar={false}
                          inlineToolbar={false}
                        />
                      </Box>
                      <Box
                        className="details"
                        width="100%"
                        style={{
                          textAlign:
                            c.sender.id === props.userInfo.id
                              ? "right"
                              : "left",
                        }}
                      >
                        {moment(c.date).format("MMMM DD, YYYY hh:mm A")}
                      </Box>
                    </Box>
                  </Box>
                ))}
            </Box>
          </Scrollbars>
        )}
      </Box>
      <Box width="100%">
        <Divider />
      </Box>
      <Box
        p={2}
        minHeight={70}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        maxHeight={500}
      >
        <Box
          height="100%"
          width="100%"
          overflow="auto"
          style={{
            background: "rgba(0,0,0,0.05)",
            borderRadius: 8,
            padding: "0 13px",
          }}
        >
          <MUIRichTextEditor
            ref={editorRef}
            value={message}
            toolbar={true}
            controls={[]}
            label="Write Something"
            onSave={(data) => {
              sendMessage(data);
            }}
            onChange={(state) => {
              if (state.getCurrentContent().getPlainText().indexOf("\n") >= 0) {
                if (editorRef.current) editorRef.current.save();
              }
            }}
          />
        </Box>
        <Box>
          <IconButton
            color="primary"
            onClick={() => {
              if (editorRef.current) editorRef.current.save();
            }}
          >
            <Icon>send</Icon>
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
function ChatDetails(props) {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const { first_name, last_name, preferences = {} } = props.user || {};
  return (
    <Box height="100%" overflow="auto">
      <Box
        display="flex"
        justifyContent="stretch"
        height="100%"
        flexDirection="column"
      >
        <NavBar
          left={
            isTablet && (
              <IconButton
                color="primary"
                onClick={() => props.history.push("#")}
              >
                <Icon>
                  <span className="icon-menu-open"></span>
                </Icon>
              </IconButton>
            )
          }
        />
        <Scrollbars autoHide>
          <Box width="100%">
            <Box p={2} textAlign="center" display="flex" alignItems="center">
              <Avatar
                src={preferences.profile_picture}
                src={first_name}
                style={{ width: 70, height: 70 }}
              />
              <Typography style={{ fontWeight: "bold", fontSize: "1.6rem" }}>
                {first_name} {last_name}
              </Typography>
            </Box>
            <Box width="100%">
              <List>
                <ListItem
                  onClick={() => Messages.vc.call(props.userInfo, props.user)}
                >
                  <ListItemIcon>
                    <span
                      className="icon-start-conference"
                      style={{
                        fontSize: "1.7rem",
                        color: theme.palette.primary.main,
                      }}
                    ></span>
                  </ListItemIcon>
                  <ListItemText primary="Video Call" />
                </ListItem>
              </List>
            </Box>
          </Box>
        </Scrollbars>
      </Box>
    </Box>
  );
}
function MainChat(props) {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  return (
    <Box width="100%" display="flex" height="100%">
      <Box width="100%" height="100%">
        <ChatBox {...props} />
      </Box>
      <Box
        className={
          "chat-details " + (isTablet ? "fixed-drawer drawer" : "drawer")
        }
        width={325}
        minWidth={325}
        style={{ right: props.location.hash === "#user-details" ? 0 : -325 }}
      >
        <ChatDetails {...props} />
      </Box>
    </Box>
  );
}
function Chat(props) {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const query = require("query-string");
  const chat_id = props.match.params.chat_id || query.t;
  const styles = useStyles();
  const [tail, setTail] = useState("");
  const history = useHistory();
  const { onlineUsers, chat, recent = [] } = props;

  const getMessages = (start = 0, end = 10, callback = null) => {
    let receiver = onlineUsers.find((q) => q.username === chat_id);
    if (receiver) {
      let sender = props.userInfo;
      let channel = sender.username + "-" + receiver.username;
      Messages.getMessages(channel, { start, end }, callback);
    }
    setTail(chat_id);
  };
  useEffect(() => {
    if (chat.messages.length) {
      if (props.userInfo.username + "-" + chat_id === chat.channel) {
        const { id, sender, receiver, seen } = chat.messages[
          chat.messages.length - 1
        ];
        let latestSeen = { ...seen };
        if (!latestSeen[props.userInfo.id]) {
          latestSeen[props.userInfo.id] = {
            ...props.userInfo,
            date: new Date().toISOString(),
          };
          Messages.updateMessage(id, {
            sender,
            receiver,
            update: { seen: latestSeen },
          });
        }
      }
    }
  }, [chat]);
  useEffect(() => {
    Messages.getRecentMessages(props.userInfo);
  }, []);
  useEffect(() => {
    if (chat_id === props.userInfo.username) history.push("/chat");
    if (tail !== chat_id) getMessages();
  }, [chat_id, onlineUsers]);
  return (
    <Drawer {...props}>
      <Box display="flex" className={styles.root}>
        <Box
          width={325}
          minWidth={325}
          className={isTablet ? "fixed-drawer drawer" : "drawer"}
          style={{ left: props.location.hash === "#users" ? 0 : -325 }}
        >
          <Users
            {...props}
            recent={recent.sort((a, b) => new Date(b.date) - new Date(a.date))}
            selected={chat_id}
            onlineUsers={onlineUsers}
            onClick={(user) => {
              history.push("/chat/" + user.username);
            }}
          />
        </Box>
        <Box width="100%" height="100%">
          <MainChat
            {...props}
            students={onlineUsers}
            loadMore={(callback) =>
              getMessages(chat.end, chat.end + 10, callback)
            }
            onSend={(d) => {
              if (d) {
                // setRecent([...recent, d]);
              }
            }}
            chat={chat}
            user={onlineUsers.find((q) => q.username === chat_id)}
          />
        </Box>
      </Box>
      <Backdrop
        open={
          isTablet &&
          (props.location.hash === "#users" ||
            props.location.hash === "#user-details" ||
            props.location.hash === "#menu")
        }
        style={{ zIndex: 14 }}
        onClick={() => props.history.push("#")}
      />
    </Drawer>
  );
}

function VideoChat(props) {
  const query = require("query-string").parse(window.location.search);
  useEffect(() => {
    if (!query.chat) window.close();
  }, [query]);
  return query.chat ? (
    <Box className="video-chat">
      <Jitsi
        domain="jts.iskwela.net"
        jwt={
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJqaXRzaSIsImlzcyI6InNjaG9vbGh1YiIsInN1YiI6Imp0cy5pc2t3ZWxhLm5ldCIsInJvb20iOiIqIn0.3BQBpXgHFM51Al1qjPz-sCFDPEnuKwKb47-h2Dctsqg"
        }
        displayName={props.userInfo.first_name + " " + props.userInfo.last_name}
        roomName={query.chat}
        containerStyle={{
          margin: "0 auto",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      />
    </Box>
  ) : null;
}
const ConnectedVideoChat = connect((states) => ({
  userInfo: states.userInfo,
}))(VideoChat);
export { ConnectedVideoChat as VideoChat };
const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
    "& p": {
      display: "inline-block",
      width: "100%",
    },
    "& .drawer": {
      transition:
        "left cubic-bezier(0, 0, 0.2, 1) 0.3s,right cubic-bezier(0, 0, 0.2, 1) 0.3s",
      "&.fixed-drawer": {
        background: "#fff",
        position: "fixed",
        top: 0,
        bottom: 0,
        width: 325,
        zIndex: 15,
      },
    },
    "& .users": {
      height: "100%",
      borderRight: "1px solid rgba(0,0,0,0.17)",
      "& .chat-user": {
        padding: theme.spacing(2),
        width: "100%",
        display: "flex",
        textAlign: "left",
        "&:hover,&.selected": {
          background: theme.palette.primary.main + "1a",
        },
      },
      "& .current-user": {
        display: "flex",
        alignItems: "center",
        "&>p": {
          marginLeft: theme.spacing(2),
        },
      },
    },
    "& .chat-box": {
      borderRight: "1px solid rgba(0,0,0,0.17)",
      "& .msg": {
        maxWidth: "85%",
        cursor: "pointer",
        padding: "0 13px",
        marginTop: 3,
        borderRadius: 18,
        "&+.details": {
          overflow: "hidden",
          transition: "height 0.2s ease-out",
          height: "0px",
          opacity: 0.7,
          "&.opened": {
            display: "block",
            height: "15px",
          },
        },
      },
      "& .sender": {
        background: "rgba(0,0,0,0.05)",
        "&.top-bottom": {
          borderRadius: "5px 15px 15px 5px",
        },
        "&.top": {
          borderRadius: "15px 15px 15px 5px",
        },
        "&.bottom": {
          borderRadius: "5px 15px 15px 15px",
        },
      },
      "& .receiver": {
        background: theme.palette.primary.main,
        color: "#fff",
        "&.top-bottom": {
          borderRadius: "15px 5px 5px 15px",
        },
        "&.top": {
          borderRadius: "15px 15px 5px 15px",
        },
        "&.bottom": {
          borderRadius: "15px 5px 15px 15px",
        },
      },
    },
    "& .chat-details": {},
  },
}));
const OnlineBadge = withStyles((theme) => ({
  badge: {
    backgroundColor: "#44b700",
    color: "#44b700",
    transform: "scale(1.5)",
    border: "1px solid #fff",
    zIndex: 10,
  },
}))(Badge);
const OfflineBadge = withStyles((theme) => ({
  badge: {
    backgroundColor: "#b5b5b5",
    color: "#44b700",
    transform: "scale(1.5)",
    border: "1px solid #fff",
    zIndex: 10,
  },
}))(Badge);

export default connect((states) => ({
  userInfo: states.userInfo,
  classDetails: states.classDetails,
  onlineUsers: states.onlineUsers,
  chat: states.messages.current,
  recent: states.messages.recent_messages,
}))(Chat);
