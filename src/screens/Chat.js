import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
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
  Tooltip,
  Grow,
} from "@material-ui/core";
import { connect } from "react-redux";
import { SearchInput } from "../components/Selectors";
import Drawer from "../components/Drawer";
import MUIRichTextEditor from "mui-rte";
import { useHistory } from "react-router-dom";
import { convertToRaw, EditorState, ContentState } from "draft-js";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import socket from "../components/socket.io";
import moment from "moment";
import NavBar from "../components/NavBar";
import Jitsi from "react-jitsi";
import { ResizeLine } from "../components/content-creator";
import { AvatarGroup } from "@material-ui/lab";
import { setTitle } from "../App";
import { makeLinkTo } from "../components/router-dom";
import Scrollbar from "../components/Scrollbar";

function Users(props) {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const { first_name, last_name, preferences } = props.userInfo;
  const { onlineUsers } = props;
  const [search, setSearch] = useState("");
  const { chat_id } = props.match.params;
  const users = onlineUsers;
  const getFilteredUsers = () =>
    [...users].filter(
      (q) => JSON.stringify(q).toLowerCase().indexOf(search) >= 0
    );

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
      position="relative"
      flexDirection="column"
    >
      <Toolbar
        style={{
          background: props.theme === "dark" ? "#1d1d1d" : "#fff",
          borderBottom:
            props.theme === "dark"
              ? "1px solid rgba(255, 255, 255, 0.12)"
              : "1px solid rgba(0,0,0,0.17)",
          minHeight: 50,
        }}
      >
        {isTablet && (
          <IconButton onClick={() => props.history.push("#menu")}>
            <Icon>menu</Icon>
          </IconButton>
        )}
        <Box width="100%">
          <Typography style={{ fontWeight: "bold" }}>Friends</Typography>
        </Box>
        <Box>
          <SearchInput
            onChange={(e) => setSearch(e.toLowerCase())}
            minimized={true}
            styles={{
              searchInput: {
                position: "absolute",
                right: 8,
                left: 12,
                width: "auto",
                zIndex: 2,
                top: 6,
              },
            }}
          />
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
      <Box
        overflow="auto"
        height="100%"
        style={props.theme === "dark" ? { background: "#111" } : {}}
      >
        <Scrollbar autoHide>
          {users &&
            props.recent &&
            getFilteredUsers().map((s, index) => (
              <Grow in={true}>
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
                          getRecentMessage(s).date &&
                          moment(getRecentMessage(s).date).format("hh:mm A")}
                      </Typography>
                      <Typography key={index} color="textSecondary">
                        {getRecentMessage(s) &&
                        getRecentMessage(s)?.seen &&
                        Object.keys(getRecentMessage(s).seen).length >= 2
                          ? "Seen"
                          : getRecentMessage(s).sender &&
                            getRecentMessage(s).sender.id === props.userInfo.id
                          ? "Sent"
                          : ""}
                      </Typography>
                    </Box>
                  </Box>
                </ButtonBase>
              </Grow>
            ))}
        </Scrollbar>
      </Box>
    </Box>
  );
}
function ChatBox(props) {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const { first_name, last_name, preferences = {} } = props.user || {};
  const editorRef = useRef();
  const [reset, setReset] = useState(1);
  const [message, setMessage] = useState("");
  const { onlineUsers } = props;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { chat_id } = props.match.params;
  const sendMessage = (message, callback) => {
    if (!chat_id) return;
    let x = JSON.parse(message);
    if (!x.blocks[0].text) {
      resetEditor();
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
    resetEditor();
  };
  const resetEditor = () => {
    setMessage(
      JSON.stringify(
        convertToRaw(EditorState.createEmpty().getCurrentContent())
      )
    );
    setReset(null);
    setTimeout(() => {
      setReset(1);
      doneTyping();
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
        }
      }, 0);
    }, 0);
  };
  const getBubbleShape = (convo, index) => {
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
  const closeAllDetails = (ignore = []) => {
    let d = document.querySelectorAll(".details.opened");
    if (d)
      d.forEach(
        (e) => Array.from(ignore).indexOf(e) < 0 && e.classList.remove("opened")
      );
  };
  const loadMore = () => {
    if (loading) return;
    setLoading(true);
    closeAllDetails();
    props.loadMore(() => setLoading(false));
  };
  const typing = () => {
    let status = {};
    status[props.userInfo.id] = {
      message:
        props.userInfo.first_name +
        " " +
        props.userInfo.last_name +
        " is typing...",
    };
    Messages.updateConvo({
      sender: props.userInfo,
      receiver: props.user,
      update: {
        status: {
          ...props.status,
          ...status,
        },
      },
    });
    setIsTyping(true);
  };
  const doneTyping = () => {
    let status = { ...props.status };
    status[props.userInfo.id] = {};
    Messages.updateConvo({
      sender: props.userInfo,
      receiver: props.user,
      update: {
        status,
      },
    });
    setIsTyping(false);
  };
  useEffect(() => {
    if (props.chat.messages) setMessages(props.chat.messages);
  }, [props.chat]);
  useEffect(() => {
    setMessages([]);
    resetEditor();
  }, [chat_id]);
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
        style={{
          background: props.theme === "dark" ? "#1d1d1d" : "#fff",
        }}
        height={50}
        minHeight={50}
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
        {chat_id && (
          <Box display="flex" alignItems="center" flex={1} overflow="hidden">
            {React.createElement(
              eval(
                onlineUsers &&
                  onlineUsers.find(
                    (q) => q && props.user && q.id === props.user.id
                  )?.status === "online"
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
              <Avatar src={preferences.profile_picture} alt={first_name} />
            )}
            <Typography style={{ marginLeft: 7 }}>
              {first_name} {last_name}
            </Typography>
            {props.loading && <CircularProgress size={18} />}
          </Box>
        )}
        <Box>
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
        position="relative"
        style={props.theme === "dark" ? { background: "#111" } : {}}
      >
        {props.chat && messages && (
          <Scrollbar autoHide>
            {!props.loading && props.chat.loaded < props.chat.total && chat_id && (
              <Box width="100%" display="flex" justifyContent="center">
                <IconButton onClick={loadMore}>
                  <Icon>expand_less</Icon>
                </IconButton>
              </Box>
            )}
            <Box p={2}>
              {chat_id &&
                messages
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map((c, index) => (
                    <Box
                      key={index}
                      position="relative"
                      marginTop={index === 0 ? 2 : 0}
                    >
                      {c.sender.id !== props.userInfo.id &&
                        (getBubbleShape(messages, index) === 3 ||
                          getBubbleShape(messages, index) === 5) && (
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
                        id={"msg-" + c.id}
                        className="msg-container"
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
                        {messages[index - 1] &&
                          new Date(c.date).getDate() -
                            new Date(messages[index - 1].date).getDate() >
                            0 && (
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
                                {moment(c.date).format(
                                  "ddd - MMMM DD, YYYY hh:mm A"
                                )}
                              </Box>
                              <Box width="100%">
                                <Divider />
                              </Box>
                            </Box>
                          )}
                        <Box
                          className="details"
                          width="100%"
                          style={{
                            textAlign: "center",
                          }}
                        >
                          {moment(c.date).format("MMMM DD, YYYY hh:mm A")}
                        </Box>
                        <Box
                          className={
                            (c.sender.id !== props.userInfo.id
                              ? "msg sender "
                              : "msg receiver ") +
                            getClassName(getBubbleShape(messages, index))
                          }
                          onClick={() => {
                            let m = document
                              .querySelector("#msg-" + c.id)
                              .querySelectorAll(".details");
                            if (m) {
                              closeAllDetails(m);
                              m.forEach((el) => {
                                el.classList.toggle("opened");
                              });
                            }
                          }}
                        >
                          <Box
                            position="absolute"
                            bottom={5}
                            display="flex"
                            alignItems="center"
                            style={{ left: -25 }}
                          >
                            {c.sender.id === props.userInfo.id && (
                              <React.Fragment>
                                {Object.keys(c.seen).length <
                                props.chat.participants.length ? (
                                  <Tooltip title="Sent">
                                    <CheckCircleIcon
                                      color="primary"
                                      fontSize="small"
                                    />
                                  </Tooltip>
                                ) : (
                                  index === messages.length - 1 && (
                                    <AvatarGroup max={3}>
                                      {props.chat.participants
                                        .filter(
                                          (q) => q.id !== props.userInfo.id
                                        )
                                        .map((s) => (
                                          <Tooltip
                                            title={
                                              s.first_name + " " + s.last_name
                                            }
                                          >
                                            <Avatar
                                              alt={s.first_name}
                                              src={
                                                s.preferences.profile_picture
                                              }
                                              style={{ height: 25, width: 25 }}
                                            />
                                          </Tooltip>
                                        ))}
                                    </AvatarGroup>
                                  )
                                )}
                              </React.Fragment>
                            )}
                          </Box>
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
                          {Object.keys(c.seen).filter(
                            (q) => parseInt(q) !== props.userInfo.id
                          ).length >=
                          props.chat.participants.length - 1
                            ? "Seen"
                            : "Sent"}
                          {/* {Object.keys(c.seen)
                            .filter((q) => parseInt(q) !== props.userInfo.id)
                            .map((k, index) => (
                              <React.Fragment key={index}>
                                {index === 0 && "Seen "}
                                {c.seen[k].first_name +
                                  " " +
                                  c.seen[k].last_name}
                                {index <
                                  Object.keys(c.seen).filter(
                                    (q) => parseInt(q) !== props.userInfo.id
                                  ).length -
                                    1 && ", "}
                              </React.Fragment>
                            ))} */}
                        </Box>
                      </Box>
                    </Box>
                  ))}
            </Box>
          </Scrollbar>
        )}
        {props.status &&
          props.user &&
          Object.keys(props.status).map((q, index) => {
            if (
              parseInt(q) !== props.userInfo.id &&
              props.user.id === parseInt(q)
            ) {
              return (
                <Box width="100%" style={{ textAlign: "center" }} key={index}>
                  {props.status[q].message}
                </Box>
              );
            } else {
              return null;
            }
          })}
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
        style={props.theme === "dark" ? { background: "#111" } : {}}
      >
        <Box
          height="100%"
          width="100%"
          overflow="auto"
          style={{
            background:
              props.theme === "dark"
                ? "rgba(255,255,255,0.05)"
                : "rgba(0,0,0,0.05)",
            borderRadius: 8,
            padding: "0 13px",
          }}
        >
          {reset && (
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
                window.clearTimeout(window.doneTyping);
                if (state.getCurrentContent().getPlainText()) {
                  if (!isTyping) typing();
                } else {
                  doneTyping();
                }
                window.doneTyping = setTimeout(() => doneTyping(), 5000);
                if (
                  state.getCurrentContent().getPlainText().indexOf("\n") >= 0
                ) {
                  if (editorRef.current) editorRef.current.save();
                }
              }}
            />
          )}
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
  const { chat_id } = props.match.params;
  const { first_name, last_name, preferences = {} } = props.user || {};
  return (
    <Box height="100%" overflow="auto">
      <Box
        display="flex"
        justifyContent="stretch"
        height="100%"
        flexDirection="column"
        style={{
          borderBottom:
            props.theme === "dark"
              ? "1px solid rgba(255, 255, 255, 0.12)"
              : "1px solid rgba(0,0,0,0.17)",
          ...(props.theme === "dark" ? { background: "#111" } : {}),
        }}
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
        <Scrollbar autoHide>
          <Box
            width="100%"
            style={{
              borderTop:
                props.theme === "dark"
                  ? "1px solid rgba(255, 255, 255, 0.12)"
                  : "1px solid rgba(0,0,0,0.17)",
            }}
          >
            <Box width="100%">
              {chat_id && (
                <List>
                  <ListItem
                    onClick={() => {
                      Messages.vc.call(props.userInfo, props.user);
                      props.history.push("#");
                    }}
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
              )}
            </Box>
          </Box>
        </Scrollbar>
      </Box>
    </Box>
  );
}
function MainChat(props) {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [isResizing, setIsResizing] = useState({});
  return (
    <Box width="100%" display="flex" height="100%">
      <Box width="100%" height="100%" maxWidth="100%">
        <ChatBox {...props} status={props.chat?.status} />
      </Box>
      <Box
        className={
          "chat-details " + (isTablet ? "fixed-drawer drawer" : "drawer")
        }
        width={325}
        minWidth={325}
        style={{
          ...(props.location.hash === "#user-details" && isTablet
            ? {
                right: 0,
              }
            : {
                ...(isTablet
                  ? {
                      right: -325,
                    }
                  : {
                      right: 0,
                      position: "relative",
                    }),
              }),
        }}
      >
        {!isTablet && (
          <ResizeLine
            orientation="vertical"
            minSize={100}
            maxSize={400}
            inverted={true}
            resizing={isResizing.DETAILS || false}
            ready={() => setIsResizing({ ...isResizing, ...{ DETAILS: true } })}
            done={() => setIsResizing({ ...isResizing, ...{ DETAILS: false } })}
            offset={66}
            force={true}
            onResize={() => null}
            style={{
              position: "absolute",
              borderBottom: "1px solid rgba(0,0,0,0.17)",
              width: 4,
              height: "100%",
              left: 0,
              top: 0,
              bottom: 0,
            }}
          />
        )}
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
  const [loading, setLoading] = useState(false);
  const { onlineUsers, chat, recent = [] } = props;
  const [isResizing, setIsResizing] = useState({});

  const getMessages = (start = 0, end = 10, callback = null) => {
    setLoading(true);
    let receiver = onlineUsers.find((q) => q.username === chat_id);
    if (receiver) {
      let sender = props.userInfo;
      let channel = sender.username + "-" + receiver.username;
      Messages.getMessages(channel, { start, end }, callback);
    }
    setTail(chat_id);
  };
  const getSortedUsers = useCallback(
    () =>
      [...onlineUsers]
        .filter((q) => q.id !== props.userInfo.id)
        .sort((a, b) => {
          a = recent.find(
            (q) => q.receiver.id === a.id || q.sender.id === a.id
          );
          return a ? -1 : 0;
        })
        .sort((a, b) => {
          a = recent.find(
            (q) => q.receiver.id === a.id || q.sender.id === a.id
          );
          b = recent.find(
            (q) => q.receiver.id === b.id || q.sender.id === b.id
          );
          return a && b ? new Date(b.date) - new Date(a.date) : 0;
        }),
    [onlineUsers, recent]
  );
  const seen = () => {
    if (chat.messages.length) {
      if (props.userInfo.username + "-" + chat_id === chat.channel) {
        const { id, sender, receiver, seen } = chat.messages[
          chat.messages.length - 1
        ];
        let latestSeen = { ...seen };
        let loadedNotSeen = chat.messages
          .filter((q) => (!q.seen[props.userInfo.id] ? true : false))
          .map((q) => q.id);
        latestSeen[props.userInfo.id] = {
          ...props.userInfo,
          date: new Date().toISOString(),
        };
        Messages.updateMessage(loadedNotSeen, {
          sender,
          receiver,
          update: { seen: latestSeen },
        });
      }
    }
  };
  useEffect(() => {
    window.clearInterval(window.seenbutnotfocused);
    window.seenbutnotfocused = setInterval(() => {
      if (document.hasFocus()) {
        seen();
      }
    }, 100);
  }, [chat]);
  useEffect(() => {
    Messages.hooks["get message"] = () => {
      window.clearTimeout(window.loadingmsg);
      window.loadingmsg = setTimeout(() => setLoading(false), 1500);
    };
    Messages.getRecentMessages(props.userInfo);
  }, []);
  useEffect(() => {
    if (
      chat_id === props.userInfo.username ||
      !onlineUsers.find((q) => q.username === chat_id)
    ) {
      history.push("/chat");
      setTitle("Chat");
    } else if (onlineUsers.find((q) => q.username === chat_id)) {
      let u = onlineUsers.find((q) => q.username === chat_id);
      setTitle(["Chat", u.first_name + " " + u.last_name]);
    }
    if (tail !== chat_id) {
      getMessages();
    }
  }, [chat_id, onlineUsers]);
  return (
    <Drawer {...props}>
      <Box display="flex" className={styles.root}>
        <Box
          width={325}
          minWidth={325}
          className={isTablet ? "fixed-drawer drawer" : "drawer"}
          style={{
            ...(props.location.hash === "#users" && isTablet
              ? {
                  left: 0,
                }
              : {
                  ...(isTablet
                    ? {
                        left: -325,
                      }
                    : {
                        left: 0,
                        position: "relative",
                      }),
                }),
          }}
        >
          <Users
            {...props}
            recent={recent.sort((a, b) => new Date(b.date) - new Date(a.date))}
            selected={chat_id}
            onlineUsers={getSortedUsers()}
            onClick={(user) => {
              history.push("/chat/" + user.username);
            }}
          />
          {!isTablet && (
            <ResizeLine
              orientation="vertical"
              minSize={100}
              maxSize={400}
              resizing={isResizing.USERS || false}
              ready={() => setIsResizing({ ...isResizing, ...{ USERS: true } })}
              done={() => setIsResizing({ ...isResizing, ...{ USERS: false } })}
              offset={66}
              force={true}
              onResize={() => null}
              style={{
                position: "absolute",
                borderBottom: "1px solid rgba(0,0,0,0.17)",
                width: 4,
                height: "100%",
                right: 0,
                top: 0,
                bottom: 0,
              }}
            />
          )}
        </Box>
        <Box width="100%" height="100%">
          <MainChat
            {...props}
            users={onlineUsers}
            loadMore={(callback) =>
              getMessages(chat.end, chat.end + 10, callback)
            }
            loading={loading}
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
    background: theme.palette.type === "dark" ? "#282828" : "#fff",
    height: "100vh",
    "& p": {
      display: "inline-block",
      width: "100%",
    },
    "& .drawer": {
      transition:
        "left cubic-bezier(0, 0, 0.2, 1) 0.3s,right cubic-bezier(0, 0, 0.2, 1) 0.3s",
      "&.fixed-drawer": {
        background: theme.palette.type === "dark" ? "#282828" : "#fff",
        position: "fixed",
        top: 0,
        bottom: 0,
        width: "325px!important",
        minWidth: "325px!important",
        zIndex: 15,
      },
    },
    "& .users": {
      height: "100%",
      borderRight:
        "1px solid " +
        (theme.palette.type === "dark"
          ? "rgba(255, 255, 255, 0.12)"
          : "rgba(0,0,0,0.17)"),
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
      borderRight:
        "1px solid " +
        (theme.palette.type === "dark"
          ? "rgba(255, 255, 255, 0.12)"
          : "rgba(0,0,0,0.17)"),
      "& .msg-container": {
        "& .details": {
          overflow: "hidden",
          transition: "height 0.2s ease-out",
          height: "0px",
          opacity: 0.7,
          "&.opened": {
            display: "block",
            height: "20px",
          },
        },
      },
      "& .msg": {
        maxWidth: "85%",
        cursor: "pointer",
        padding: "0 13px",
        position: "relative",
        marginTop: 3,
        borderRadius: 18,
      },
      "& .sender": {
        background:
          theme.palette.type === "dark"
            ? "rgba(255,255,255,0.05)"
            : "rgba(0,0,0,0.05)",
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
export const OnlineBadge = withStyles((theme) => ({
  badge: {
    backgroundColor: "#44b700",
    color: "#44b700",
    transform: "scale(1.5)",
    border: "1px solid " + (theme.palette.type === "dark" ? "#282828" : "#fff"),
    zIndex: 10,
  },
}))(Badge);
export const OfflineBadge = withStyles((theme) => ({
  badge: {
    backgroundColor: "#b5b5b5",
    color: "#44b700",
    transform: "scale(1.5)",
    border: "1px solid " + (theme.palette.type === "dark" ? "#282828" : "#fff"),
    zIndex: 10,
  },
}))(Badge);

export default connect((states) => ({
  userInfo: states.userInfo,
  classDetails: states.classDetails,
  onlineUsers: states.onlineUsers,
  chat: states.messages.current,
  theme: states.theme,
  recent: states.messages.recent_messages,
}))(Chat);
