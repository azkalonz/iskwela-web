import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
  Children,
  isValidElement,
  cloneElement,
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
import { setTitle, isMobileDevice } from "../App";
import Scrollbar from "../components/Scrollbar";
const qs = require("query-string");

const key = {};
function keyPress(e) {
  const { shiftKey, which, keyCode } = e;
  key.which = which || keyCode;
  key.shiftKey = shiftKey;
}

function getAbsoluteHeight(el) {
  el = typeof el === "string" ? document.querySelector(el) : el;
  var styles = window.getComputedStyle(el);
  var margin =
    parseFloat(styles["marginTop"]) + parseFloat(styles["marginBottom"]);
  return Math.ceil(el.offsetHeight + margin);
}
window.g = getAbsoluteHeight;
const fixChatBoxHeight = () => {
  let c = document.querySelector("#chat-container");
  if (c) {
    let h = c.getAttribute("data-height");
    if (h) h = parseFloat(h);
    let b = c.previousElementSibling;
    let a = c.nextElementSibling;
    if (b && a) {
      c.style.height =
        (h || window.innerHeight) -
        (getAbsoluteHeight(b) + getAbsoluteHeight(a)) +
        "px";
    }
  }
};

export function ChatUsers(props) {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const { first_name, last_name, preferences } = props.userInfo;
  const { users } = props;
  const [search, setSearch] = useState("");
  const getFilteredUsers = () =>
    [...users]
      .filter((q) => q.username !== props.userInfo.username)
      .filter((q) => JSON.stringify(q).toLowerCase().indexOf(search) >= 0);

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
          <Typography style={{ fontWeight: "bold" }}>
            Recent Messages
          </Typography>
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
                      users &&
                        users.find((q) => q.id === s.id)?.status === "online"
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
export function ChatBox(props) {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const { first_name, last_name, preferences = {} } = props.user || {};
  const editorRef = useRef();
  const [reset, setReset] = useState(1);
  const [message, setMessage] = useState("");
  const { users } = props;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { chat_id } = props;
  const sendMessage = (message, callback) => {
    if (!chat_id) return;
    let x = JSON.parse(message);
    let c = 0;
    for (let i = 0; i < x.blocks.length; i++) {
      if (x.blocks[i].text) c++;
    }
    if (!c) {
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
    fixChatBoxHeight();
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
    window.removeEventListener("keydown", keyPress);
    window.addEventListener("keydown", keyPress);
  }, []);
  useEffect(() => {
    if (props.chat.messages) setMessages(props.chat.messages);
  }, [props.chat]);
  useEffect(() => {
    setMessages([]);
    resetEditor();
  }, [chat_id]);
  return (
    <Box width="100%" className="chat-box" height="100%" overflow="hidden">
      <Box
        onClick={() =>
          props.actions?.chatHeadClick && props.actions.chatHeadClick()
        }
        width="100%"
        className="sticky"
        top={0}
        left={0}
        right={0}
        zIndex={2}
        style={{
          cursor: (props.actions?.chatHeadClick && "pointer") || "default",
        }}
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
          {isTablet && !props.disabledActions?.USERS_LIST && (
            <IconButton
              color="primary"
              onClick={() => props.history.push("#users")}
            >
              <Icon>
                <span className="icon-menu-open"></span>
              </Icon>
            </IconButton>
          )}
          {chat_id && (
            <Box display="flex" alignItems="center" flex={1} overflow="hidden">
              {React.createElement(
                eval(
                  users &&
                    users.find((q) => q && props.user && q.id === props.user.id)
                      ?.status === "online"
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
            {isTablet && !props.disabledActions?.USER_INFO && (
              <IconButton
                color="primary"
                onClick={() => props.history.push("#user-details")}
              >
                <Icon>info</Icon>
              </IconButton>
            )}
          </Box>
        </Box>
        <Divider />
      </Box>
      <Box
        data-height={props.height}
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
                            {c.seen && c.sender.id === props.userInfo.id && (
                              <React.Fragment>
                                {Object.keys(c.seen).length <
                                props.chat?.participants?.length ? (
                                  <Tooltip title="Sent">
                                    <CheckCircleIcon
                                      color="primary"
                                      fontSize="small"
                                    />
                                  </Tooltip>
                                ) : (
                                  index === messages.length - 1 && (
                                    <AvatarGroup max={3}>
                                      {props.chat?.participants
                                        ?.filter(
                                          (q) => q.id !== props.userInfo.id
                                        )
                                        .map((s, index) => (
                                          <Tooltip
                                            key={index}
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
                          {c.seen &&
                          Object.keys(c.seen).filter(
                            (q) => parseInt(q) !== props.userInfo.id
                          ).length >=
                            props.chat?.participants?.length - 1
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
                <Box
                  className="sticky"
                  style={{
                    width: "100%",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    textAlign: "center",
                  }}
                  key={index}
                >
                  {props.status[q].message}
                </Box>
              );
            } else {
              return null;
            }
          })}
      </Box>
      <Box
        className="sticky"
        width="100%"
        bottom={0}
        left={0}
        right={0}
        zIndex={1}
        style={
          props.theme === "dark"
            ? { background: "#111" }
            : { background: "#fff" }
        }
      >
        <Divider />
        <Box
          p={2}
          minHeight={70}
          width="100%"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box
            height="100%"
            width="100%"
            minHeight={37}
            maxHeight={200}
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
                label="Type a message"
                onSave={(data) => {
                  sendMessage(data);
                  key.which = -1;
                }}
                onChange={(state) => {
                  fixChatBoxHeight();
                  window.clearTimeout(window.doneTyping);
                  if (state.getCurrentContent().getPlainText()) {
                    if (!isTyping) typing();
                  } else {
                    doneTyping();
                  }
                  window.doneTyping = setTimeout(() => doneTyping(), 5000);
                  if (!key.shiftKey && key.which === 13 && !isMobileDevice()) {
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
    </Box>
  );
}
function ChatDetails(props) {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const { chat_id } = props;
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
          style={{ boxShadow: "none" }}
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
      <Box
        width="100%"
        marginRight="-3px"
        height="100%"
        maxWidth="100%"
        overflow="auto"
      >
        <ChatBox {...props} />
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
                      right: "-100vw",
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
export function ChatProvider(props) {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const query = qs.parse(window.location.search);
  const chat_id = props?.match?.params?.chat_id || query.t || props.chatId;
  const [tail, setTail] = useState("");
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const { users, chat, recent = [] } = props;
  const getMessages = (start = 0, end = 10, callback = null) => {
    if (!chat_id) return;
    setLoading(true);
    let receiver = users.find((q) => q.username === chat_id);
    if (receiver) {
      let sender = props.userInfo;
      let channel = sender.username + "-" + receiver.username;
      Messages.getMessages(channel, { start, end }, callback);
    }
    setTail(chat_id);
  };
  const getSortedUsers = useCallback(
    () =>
      [...users]
        .filter((q) => q.school_id === props.userInfo.school_id)
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
    [users, recent]
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
        window.clearInterval(window.seenbutnotfocused);
        seen();
      }
    }, 100);
  }, [chat]);
  useEffect(() => {
    Messages.clear();
    Messages.hooks["get message"] = () => {
      window.clearTimeout(window.loadingmsg);
      window.loadingmsg = setTimeout(() => setLoading(false), 1500);
    };
    Messages.getRecentMessages(props.userInfo);
    window.removeEventListener("resize", fixChatBoxHeight);
    window.addEventListener("resize", fixChatBoxHeight);
  }, []);
  useEffect(() => {
    if (
      chat_id === props.userInfo.username ||
      !users.find((q) => q.username === chat_id)
    ) {
      if (!props.noRedirect) {
        history.push("/chat#users");
        if (!chat_id) setTitle("Chat");
      }
    } else if (users.find((q) => q.username === chat_id)) {
      let u = users.find((q) => q.username === chat_id);
      if (tail !== chat_id)
        setTitle(["Chat", u.first_name + " " + u.last_name]);
    }
    if (tail !== chat_id) {
      getMessages();
    }
  }, [chat_id, users]);
  return (
    <React.Fragment>
      {Children.map(props.children, (child) => {
        if (isValidElement(child)) {
          return cloneElement(child, {
            recent: recent.sort((a, b) => new Date(b.date) - new Date(a.date)),
            selected: chat_id,
            users: getSortedUsers(),
            onClick: (user) => {
              history.push("/chat?t=" + user.username);
            },
            loadMore: (callback) =>
              getMessages(chat.end, chat.end + 10, callback),
            onSend: () => {},
            loading,
            chat,
            chat_id,
            status: chat?.status,
            user: users.find((q) => q.username === chat_id),
            ...props,
          });
        }
        return child;
      })}
    </React.Fragment>
  );
}
function Chat(props) {
  const styles = useStyles();
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [isResizing, setIsResizing] = useState({});
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
                        left: "-100vw",
                      }
                    : {
                        left: 0,
                        position: "relative",
                      }),
                }),
          }}
        >
          <ChatProvider {...props}>
            <ChatUsers />
          </ChatProvider>
          {!isTablet && (
            <ResizeLine
              orientation="vertical"
              minSize={210}
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
          <ChatProvider {...props}>
            <MainChat />
          </ChatProvider>
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
  const query = qs.parse(window.location.search);
  useEffect(() => {
    if (!query.chat) window.close();
  }, [query.chat]);
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
function FloatingChatBox(props) {
  const theme = useTheme();
  const query = qs.parse(window.location.search);
  const { user } = props;
  return user ? (
    <Box
      width={280}
      marginRight={1}
      bgcolor={theme.palette.type === "dark" ? "#222" : "#fff"}
      display="flex"
      flexDirection="column"
      alignItems="stretch"
      justifyContent="space-between"
      boxShadow="0 0px 15px rgba(0,0,0,0.15)"
      style={{
        borderRadius: "10px 10px 0 0",
        transition: "height 0.1s ease-out",
        height:
          query.t && query.t !== "null" && props.opened === user.username
            ? 400
            : 50,
      }}
    >
      {props.opened === user.username && query.t && query.t !== "null" ? (
        <ChatBox
          {...props}
          height={400}
          disabledActions={{
            USERS_LIST: true,
            USER_INFO: true,
          }}
          actions={{
            chatHeadClick: () => {
              props.onOpened &&
              props.opened === user.username &&
              (query.t || query.t !== "null")
                ? props.onOpened(null)
                : props.onOpened(user.username);
            },
          }}
        />
      ) : (
        <Box position="relative">
          <Toolbar
            style={{
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            onClick={() =>
              props.onOpened && props.opened === user.username
                ? props.onOpened(null)
                : props.onOpened(user.username)
            }
          >
            <Box
              display="flex"
              alignItems="center"
              overflow="hidden"
              style={{ marginRight: 20 }}
            >
              {React.createElement(
                eval(user.status === "online" ? "OnlineBadge" : "OfflineBadge"),
                {
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "right",
                  },
                  variant: "dot",
                },
                <Avatar
                  src={user.preferences?.profile_picture}
                  alt={user.first_name}
                  style={{ width: 25, height: 25 }}
                />
              )}
              <Typography style={{ fontWeight: 500, marginLeft: 7 }}>
                {user.first_name + " " + user.last_name}
              </Typography>
            </Box>
          </Toolbar>
          <IconButton
            onClick={() => props.onClose()}
            style={{ position: "absolute", right: 0, top: 0 }}
          >
            <Icon>close</Icon>
          </IconButton>
        </Box>
      )}
    </Box>
  ) : null;
}
function FloatingChatWidget(props) {
  const history = useHistory();
  const query = qs.parse(window.location.search);
  const styles = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const MAX_CHAT_BOXES = 3;
  const [search, setSearch] = useState("");
  const { userInfo, chatId } = props;
  const [opened, setOpened] = useState(false);
  const [chatBoxes, setChatBoxes] = useState([]);
  const users = useMemo(() => {
    if (props.users)
      return props.users
        .filter(
          (q) =>
            JSON.stringify(q).toLowerCase().indexOf(search.toLowerCase()) >= 0
        )
        .filter((user) => user.id !== userInfo.id)
        .filter((q) => q.school_id === userInfo.school_id);
    else return [];
  }, [props.users, search]);
  const onlineUsersCount = useMemo(() => {
    if (users) {
      let c = users.filter((user) => user.status === "online").length;
      c = c >= 0 ? c : 0;
      return c;
    } else {
      return 0;
    }
  }, [users]);
  const toggleChatUsers = () => {
    setOpened(!opened);
  };
  const [openedChatBox, setOpenedChatBox] = useState();
  const chatWith = (username) => {
    history.push(window.location.search.replaceUrlParam("t", username));
    props.setChatId(username);
    setOpenedChatBox(username);
    if (chatBoxes.length > MAX_CHAT_BOXES) {
      let c = [...chatBoxes];
      c.splice(1, 1);
      setChatBoxes(c);
    }
    if (chatBoxes.indexOf(username) < 0) {
      setChatBoxes([...chatBoxes, username]);
    }
  };
  const removeChatBox = (username) => {
    let b = [...chatBoxes];
    let index = b.indexOf(username);
    if (index >= 0) {
      b.splice(index, 1);
      setChatBoxes(b);
    }
  };
  useEffect(() => {
    if (chatId) {
      chatWith(chatId);
    }
  }, [chatId]);
  useEffect(() => {
    if (query.t && query.t !== "null" && query.t !== "undefined") {
      props.setChatId(query.t);
      if (query.t === "VIEW_USERS") setOpened(true);
    }
  }, [query.t]);
  return !isMobile ? (
    <Box
      className={styles.root}
      display="flex"
      flexDirection="column"
      style={{
        position: "fixed",
        right: 10,
        borderRadius: "10px 10px 0 0",
        bottom: 0,
        background: theme.palette.type === "dark" ? "#222" : "#fff",
        width: opened ? 330 : 110,
        height: opened ? "80vh" : 50,
        boxShadow: "rgba(0, 0, 0, 0.1) -3.6px 0px 10px",
        transition: "all 0.1s ease-out",
      }}
    >
      <ButtonBase
        style={{
          height: 50,
          alignSelf: "flex-end",
          border: "1px solid rgba(0,0,0,0.17)",
          background: theme.palette.type === "dark" ? "#111" : "#fff",
          width: "100%",
          borderRadius: "10px 10px 0 0",
        }}
        onClick={toggleChatUsers}
      >
        <Box
          height="inherit"
          p={2}
          width="100%"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography
            style={{ fontSize: 18, fontWeight: 500, textAlign: "left" }}
          >
            Chat {opened && `(${onlineUsersCount})`}
          </Typography>
          <Icon>{opened ? "expand_more" : "expand_less"}</Icon>
        </Box>
      </ButtonBase>
      {opened && (
        <Box width="100%" p={2}>
          <SearchInput onChange={(e) => setSearch(e)} />
        </Box>
      )}
      <Box
        style={{
          position: "absolute",
          right: opened ? 330 : 130,
          height: 50,
          overflow: "visibile",
          bottom: 0,
          display: "flex",
          alignItems: "flex-end",
          transition: "all 0.1s ease-out",
        }}
      >
        {chatBoxes.map((chat, key) => (
          <React.Fragment key={key}>
            <FloatingChatBox
              {...props}
              user={users.find((q) => q.username === chat)}
              opened={openedChatBox}
              onOpened={(u) => {
                chatWith(u);
              }}
              onClose={() => removeChatBox(chat)}
            />
          </React.Fragment>
        ))}
      </Box>
      <Box width="100%" overflow="auto" height="100%">
        <Scrollbar autoHide>
          {opened &&
            users.map((user, key) => (
              <ButtonBase
                key={key}
                onClick={() => {
                  chatWith(user.username);
                  setOpened(false);
                }}
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  textAlign: "left",
                  padding: 13,
                  borderTop: "1px solid rgba(0,0,0,0.16)",
                }}
              >
                {React.createElement(
                  eval(
                    user.status === "online" ? "OnlineBadge" : "OfflineBadge"
                  ),
                  {
                    anchorOrigin: {
                      vertical: "bottom",
                      horizontal: "right",
                    },
                    variant: "dot",
                  },
                  <Avatar
                    src={user.preferences?.profile_picture}
                    alt={user.first_name}
                  />
                )}
                <Typography style={{ marginLeft: 7 }}>
                  {user.first_name} {user.last_name}
                </Typography>
              </ButtonBase>
            ))}
        </Scrollbar>
      </Box>
    </Box>
  ) : null;
}

const ConnectedFloatingChatWidget = connect((states) => ({
  messages: states.messages,
}))(FloatingChatWidget);
export { ConnectedFloatingChatWidget as FloatingChatWidget };

const ConnectedVideoChat = connect((states) => ({
  userInfo: states.userInfo,
}))(VideoChat);
export { ConnectedVideoChat as VideoChat };
const useStyles = makeStyles((theme) => ({
  floatingChat: {
    "& > div": {
      "& .msg > div": {
        padding: "0px 8px",
        marginTop: 13,
        borderRadius: 12,
      },
      "& .sender": {
        "& > div": {
          backgroundColor: "rgba(0,0,0,0.12)",
          "& span, & p": {
            color: "#000!important",
          },
          marginLeft: 8,
        },
      },
      "& .receiver": {
        "& > div": {
          backgroundColor: theme.palette.primary.main,
          "& span, & p": {
            color: "#fff!important",
          },
          marginRight: 8,
        },
      },
    },
  },
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
        width: "100vw!important",
        minWidth: "100vw!important",
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
      "& .msg-container": {
        "& .details": {
          overflow: "hidden",
          transition: "height 0.1s ease-out",
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
    "& .chat-details": {
      zIndex: 1,
      borderLeft:
        "1px solid " +
        (theme.palette.type === "dark"
          ? "rgba(255, 255, 255, 0.12)"
          : "rgba(0,0,0,0.17)"),
      background: theme.palette.type === "dark" ? "#111" : "#fff",
    },
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
  theme: states.theme,
  users: states.users,
  chat: states.messages.current,
  recent: states.messages.recent_messages,
}))(Chat);
