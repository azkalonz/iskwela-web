import {
  Avatar,
  Backdrop,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  CircularProgress,
  Divider,
  Icon,
  IconButton,
  ListItemText,
  makeStyles,
  Menu,
  MenuItem,
  Paper,
  Popover,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import { ContentState, convertToRaw, EditorState } from "draft-js";
import { motion } from "framer-motion";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import moment from "moment";
import MUIRichTextEditor from "mui-rte";
import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { connect } from "react-redux";
import Api from "../api";
import Pagination, { getPageItems } from "../components/Pagination";
import { makeLinkTo } from "../components/router-dom";
import socket from "../components/socket.io";
import UserData from "../components/UserData";
import { isMobileDevice } from "../App";
import { Link } from "react-router-dom";
import Drawer from "../components/Drawer";
import NavBar from "../components/NavBar";
import Scrollbar from "../components/Scrollbar";

const key = {};
function keyPress(e) {
  const { shiftKey, which, keyCode } = e;
  key.which = which || keyCode;
  key.shiftKey = shiftKey;
}

const getAutocomplete = (classes) =>
  Object.keys(classes).map((k) => {
    let c = classes[k];
    return {
      keys: [
        "class",
        c.name.toLowerCase(),
        c.name.toUpperCase(),
        c.name,
        c.id + "",
      ],
      value: c,
      content: `${c.name} (${moment(c.next_schedule.from).format(
        "ddd hh:mm A"
      )} - ${moment(c.next_schedule.to).format("hh:mm A")})`,
    };
  });

function TagItem(props) {
  return (
    <React.Fragment>
      <Avatar
        src={props.user.preferences.profile_picture}
        alt={props.user.first_name}
        style={{ marginRight: 10 }}
      />
      <ListItemText
        primary={props.user.first_name + " " + props.user.last_name}
        secondary={"@" + props.user.username}
      />
    </React.Fragment>
  );
}
function TagSomeone(props) {
  const theme = useTheme();
  const url = "http://google.com/" + props.decoratedText;
  const getTitle = () => {
    let s = props.classes[
      window.location.pathname.split("/").filter((q) => (q ? true : false))[1]
    ].students.find((s) => s.username === props.decoratedText.replace("@", ""));
    return s.first_name + " " + s.last_name;
  };
  return (
    <React.Fragment>
      {props.classes[
        window.location.pathname.split("/").filter((q) => (q ? true : false))[1]
      ].students.findIndex(
        (s) => s.username === props.decoratedText.replace("@", "")
      ) >= 0 ? (
        <Tooltip title={props.decoratedText} placement="top">
          <a
            style={{
              textDecoration: "none",
              color: theme.palette.primary.main,
              fontWeight: "bold",
            }}
            href={"#" + props.decoratedText}
          >
            {React.Children.map(props.children, (child) => (
              <React.Fragment>
                {React.cloneElement(child, {
                  text: getTitle(),
                })}
              </React.Fragment>
            ))}
          </a>
        </Tooltip>
      ) : (
        <a>{props.children}</a>
      )}
    </React.Fragment>
  );
}
const ConnectedTagSomeone = connect((states) => ({
  classes: states.classDetails,
  allClasses: states.classes,
}))(TagSomeone);
function HashTag(props) {
  const theme = useTheme();
  const url = "http://google.com/" + props.decoratedText;
  return (
    <React.Fragment>
      <a
        href={url}
        style={{ textDecoration: "none", color: theme.palette.info.main }}
      >
        {props.children}
      </a>
    </React.Fragment>
  );
}
function LinkTag(props) {
  const theme = useTheme();
  return (
    <React.Fragment>
      <a
        href={props.decoratedText}
        style={{ textDecoration: "none", color: theme.palette.info.main }}
      >
        {props.children}
      </a>
    </React.Fragment>
  );
}
function Editor(props) {
  const editorRef = useRef();
  useEffect(() => {
    if (props.getRef && editorRef.current) {
      props.getRef(editorRef);
    }
  }, [props.getRef]);
  useEffect(() => {
    if (editorRef.current && props.focused) {
      editorRef.current.focus();
    }
  }, [editorRef]);
  return (
    <MUIRichTextEditor
      value={props.value}
      {...props}
      ref={editorRef}
      decorators={[
        {
          component: ConnectedTagSomeone,
          regex: /\@[\w]{2,}/g,
        },
        {
          component: HashTag,
          regex: /\#[\w]{1,}/g,
        },
        {
          component: LinkTag,
          regex: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
        },
      ]}
    />
  );
}
const serializeBody = (data) => {
  let parsed;
  try {
    parsed = JSON.parse(data);
  } catch (e) {
    parsed = convertToRaw(ContentState.createFromText(data));
  }
  if (typeof parsed === "object") return parsed;
  else return {};
};
function Comment(props) {
  const theme = useTheme().palette.type;
  return (
    <Box
      key={props.key}
      width="100%"
      display="flex"
      alignItems="flex-start"
      marginBottom={2}
      className={"comment-container " + "comment-" + props.id}
    >
      <Box>
        <Avatar
          src={
            props.added_by.profile_picture ||
            props.userInfo?.preferences?.profile_picture
          }
          alt={props.added_by.first_name}
        />
      </Box>
      <Box
        width="100%"
        marginLeft={1}
        style={{
          borderRadius: 6,
          background:
            theme === "dark" ? "rgba(255,255,255,0.03)" : "rgb(249, 245, 254)",
        }}
      >
        <Box p={1}>
          <Box display="flex" alignItems="center">
            <Typography
              style={{
                fontWeight: 600,
                opacity: 0.8,
                fontSize: 14,
                marginRight: 13,
              }}
            >
              {props.added_by.first_name + " " + props.added_by.last_name}
            </Typography>
            {props.saving && <CircularProgress size={18} />}
          </Box>
          <Editor
            toolbar={false}
            inlineToolbar={false}
            readOnly={true}
            value={JSON.stringify(serializeBody(props.body))}
          />
        </Box>
      </Box>
    </Box>
  );
}
function StartADiscussion(props) {
  const theme = useTheme();
  const { school_id } = props.userInfo;
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [editorRef, setEditorRef] = useState({});
  const [uploadAnchor, setUploadAnchor] = useState();
  const classesAutocomplete = getAutocomplete(props.allClasses);
  const isTeacher =
    props.userInfo.user_type === "t" || props.userInfo.user_type === "a";
  const [states, setStates] = useState({
    DISCUSSION: false,
  });
  const handlePost = () => {
    if (editorRef.current) {
      editorRef.current.save && editorRef.current.save();
      props.onPost();
    } else {
      handleOpen("DISCUSSION");
    }
  };
  const handleSave = async (data) => {
    handleClose("DISCUSSION");
    props.onSaving({
      id: -1,
      body: data,
      created_at: new Date().toString(),
      updated_at: new Date().toString(),
      added_by: props.userInfo,
    });
    let post = await Api.post("/api/post/save", {
      body: {
        body: data,
        itemable_type: "school",
        itemable_id: school_id,
      },
    });
    socket.emit("new post", { school_id, post });
    // socket.emit("save post", {
    //   school_i: props.class.id,
    //   value: data,
    //   author: props.userInfo,
    //   date: new Date().toString(),
    // });
    props.onSaving(null);
  };
  const handleOpen = (name) => {
    let m = { ...states };
    m[name] = true;
    setStates(m);
  };
  const handleClose = (name) => {
    let m = { ...states };
    m[name] = false;
    setStates(m);
  };
  const uploadImage = (url = null) => {
    let f = document.querySelector("#upload-image");
    return new Promise(async (resolve, reject) => {
      let body = new FormData();
      body.append("file", f.files[0]);
      if (url) {
        resolve({
          data: {
            url,
            width: "100%",
            height: "auto",
            alignment: "left", // or "center", "right"
            type: "image", // or "video"
          },
        });
      }
      const uploadedFile = await Api.post("/api/public/upload", { body });
      if (!uploadedFile) {
        reject();
        return;
      }
      resolve({
        data: {
          url: uploadedFile.url,
          width: "100%",
          height: "auto",
          alignment: "left", // or "center", "right"
          type: "image", // or "video"
        },
      });
    });
  };
  return (
    <React.Fragment>
      <Popover
        onClose={() => setUploadAnchor(null)}
        style={{ zIndex: 1302 }}
        anchorEl={uploadAnchor}
        open={uploadAnchor ? true : false}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <Box p={2}>
          <input
            id="upload-image"
            accept="image/x-png,image/gif,image/jpeg"
            type="file"
            style={{ display: "none" }}
            onChange={() => {
              if (
                document.querySelector("#upload-image").files.length &&
                editorRef.current
              ) {
                editorRef.current.insertAtomicBlockAsync(
                  "IMAGE",
                  uploadImage(),
                  "Uploading..."
                );
              }
            }}
          />
          <Button
            onClick={() => document.querySelector("#upload-image").click()}
          >
            Upload Image
          </Button>
          <Button
            onClick={() => {
              let url = prompt("Enter Image URL");
              if (url) {
                editorRef.current.insertAtomicBlockAsync(
                  "IMAGE",
                  uploadImage(url),
                  "Uploading..."
                );
              }
            }}
          >
            Insert URL
          </Button>
        </Box>
      </Popover>

      <div
        style={{
          position: "relative",
          borderRadius: 4,
          background: props.theme === "dark" ? "#111" : "#fff",
          ...(states.DISCUSSION
            ? {
                boxShadow: "none",
                zIndex: 1302,
              }
            : {
                zIndex: 1,
                border:
                  props.theme === "dark"
                    ? "none"
                    : "1px solid rgb(233, 228, 239)",
                boxShadow: "0 2px 4px rgb(241, 230, 255)!important",
              }),
        }}
      >
        {isTeacher && (
          <Box p={2}>
            <Box width="100%" display="flex" alignItems="center">
              {!states.DISCUSSION ? (
                <React.Fragment>
                  <Box style={{ marginRight: 13 }}>
                    <Avatar
                      src={
                        (props.userInfo &&
                          props.userInfo.preferences.profile_picture) ||
                        "/"
                      }
                      alt="Picture"
                    />
                  </Box>
                  <Box
                    width="100%"
                    id="start-a-discussion"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleOpen("DISCUSSION")}
                  >
                    <TextField
                      variant="outlined"
                      className="themed-input no-margin"
                      type="text"
                      placeholder="Start a discussion"
                      fullWidth
                      style={{ pointerEvents: "none" }}
                      inputProps={{ styles: { padding: 13 } }}
                    />
                  </Box>
                </React.Fragment>
              ) : (
                <motion.div
                  initial={{ scaleX: 0.8, scaleY: 0.5, opacity: 0 }}
                  animate={{ scaleX: 1, scaleY: 1, opacity: 1 }}
                  style={{
                    width: "100%",
                    position: "relative",
                    minHeight: isMobile ? 125 : 90,
                  }}
                >
                  <Editor
                    focused={true}
                    label="Try @Student, :English, #HashTag"
                    controls={[...toolbarcontrols, "insert-photo"]}
                    inlineToolbarControls={inlinetoolbarcontrols}
                    getRef={(ref) => setEditorRef(ref)}
                    inlineToolbar={true}
                    onSave={(data) => handleSave(data)}
                    customControls={[
                      {
                        name: "insert-photo",
                        icon: <Icon>insert_photo</Icon>,
                        type: "callback",
                        onClick: (editorState, name, anchor) => {
                          setUploadAnchor(anchor);
                        },
                      },
                    ]}
                    // autocomplete={{
                    //   strategies: [
                    //     {
                    //       items: classesAutocomplete,
                    //       triggerChar: ":",
                    //       atomicBlockName: "class",
                    //     },
                    //     {
                    //       items: props.class.students.map((c) => ({
                    //         keys: [
                    //           "students",
                    //           c.first_name,
                    //           c.last_name,
                    //           c.last_name.toLowerCase(),
                    //           c.first_name.toLowerCase(),
                    //           c.username,
                    //         ],
                    //         value: "@" + c.username,
                    //         content: <TagItem user={c} />,
                    //       })),
                    //       triggerChar: "@",
                    //     },
                    //   ],
                    // }}
                  />
                </motion.div>
              )}
            </Box>
            {isTeacher && (
              <Box
                display="flex"
                width="100%"
                alignItems="center"
                style={{ marginTop: 13, paddingLeft: 52 }}
              >
                <Box width="100%">{!states.DISCUSSION && props.children}</Box>
                <Box>
                  <motion.button
                    style={{ background: "none", border: "none", padding: 0 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      color="secondary"
                      variant="contained"
                      style={{
                        boxShadow: "none",
                        marginLeft: 13,
                        fontWeight: "bold",
                      }}
                      onClick={handlePost}
                    >
                      POST
                    </Button>
                  </motion.button>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </div>
      <Backdrop
        open={states.DISCUSSION || false}
        onClick={() => handleClose("DISCUSSION")}
        style={{ zIndex: 1301 }}
      />
      {/* end */}
    </React.Fragment>
  );
}
const ConnectedStartADiscussion = connect((states) => ({
  userInfo: states.userInfo,
  classes: states.classDetails,
  allClasses: states.classes,
  theme: states.theme,
}))(StartADiscussion);

function WriteAComment(props) {
  const theme = useTheme();
  const [editorRef, setEditorRef] = useState();
  const [content, setContent] = useState("");
  const handleAddComment = async (school_id, post_id, comment) => {
    let x = JSON.parse(comment);
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
    comment = x;
    setContent(
      JSON.stringify(
        convertToRaw(EditorState.createEmpty().getCurrentContent())
      )
    );
    props.onSaving({
      body: comment,
      created_at: new Date().toString(),
      updated_at: new Date().toString(),
      added_by: props.userInfo,
    });
    let r = document.querySelector("#right-panel");
    let p = document.querySelector("#discussion-" + post_id);
    if (p && r) {
      r = r.firstElementChild.firstElementChild.firstElementChild;
      r.scrollTop = r.scrollTop + p.getBoundingClientRect().top - 50;
    }
    try {
      let c = await Api.post("/api/comment/save", {
        body: {
          body: comment,
          post_id,
        },
      });
      socket.emit("add comment", {
        school_id,
        post: props.post,
        comment: c,
      });
    } catch (e) {
      console.error(e);
    }
    props.onSaving(null);
    // socket.emit("add comment", {
    //   school_i,
    //   post_id,
    //   comment,
    //   author: props.userInfo,
    // });
  };
  return (
    <Box width="100%" display="flex" alignItems="flex-start">
      <Box>
        <Avatar
          src={props.userInfo.preferences.profile_picture}
          alt={props.userInfo.first_name}
        />
      </Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        width="100%"
      >
        <Box
          flex={1}
          id={"writeacomment-" + props.post.id}
          width="100%"
          marginLeft={1}
          marginRight={1}
          style={{
            borderRadius: 6,
            minHeight: 42,
            maxHeight: 150,
            overflow: "auto",
            paddingLeft: theme.spacing(2),
            background: "#1d1d1d",
            ...(props.theme === "dark"
              ? {
                  border: "1px solid rgba(255,255,255,0.22)",
                }
              : {}),
          }}
          className={props.theme !== "dark" && "nonMui-themed-input"}
        >
          <Editor
            toolbar={false}
            getRef={(ref) => setEditorRef(ref)}
            inlineToolbar={false}
            label="Write a comment"
            value={content}
            onSave={(data) => {
              handleAddComment(props.school_id, props.post.id, data);
              key.which = -1;
            }}
            onChange={(state) => {
              if (!key.shiftKey && key.which === 13 && !isMobileDevice()) {
                if (editorRef?.current) editorRef.current.save();
              } else if (key.shiftKey && key.which === 13) {
                let c = document.querySelector(
                  "#writeacomment-" + props.post.id
                );
                if (c) c.scrollTop = c.scrollHeight;
              }
            }}
          />
        </Box>
        {isMobileDevice() && (
          <Box>
            <IconButton
              onClick={() => {
                if (editorRef?.current) editorRef.current.save();
              }}
              color="primary"
            >
              <Icon>send</Icon>
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
}
function Discussion(props) {
  const [expanded, setExpanded] = useState(false);
  const styles = useStyles();
  const { school_id } = props.userInfo;
  const [commentsPerPage, setCommentsPerPage] = useState(1);
  const [saving, setSaving] = useState();
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [postValue, setPostValue] = useState(props.post.body);
  const [editorRef, setEditorRef] = useState();

  const slicedComments = useCallback(() => {
    if (props.post.comments && commentsPerPage) {
      return props.post.comments
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, commentsPerPage + 1);
    } else {
      return [];
    }
  }, [props.post.comments, commentsPerPage]);
  const handleDelete = async (post) => {
    setDeleting(true);
    try {
      await Api.delete("/api/post/remove/" + post.id);
      socket.emit("delete post", { school_id, post });
    } catch (e) {}
    setDeleting(false);
  };
  const handleEdit = (post) => {
    setEditing(post);
  };
  const handleSave = async (data) => {
    setSaving(true);
    if (!editing) return;
    let post = await Api.post("/api/post/save", {
      body: {
        id: editing.id,
        body: data,
        itemable_type: "school",
        itemable_id: school_id,
      },
    });
    socket.emit("update post", { school_id, post });
    setSaving(null);
    setEditing(null);
  };
  const handleCancel = () => {
    setPostValue("");
    setTimeout(() => setPostValue(props.post.body), 0);
    setEditing(null);
  };
  useEffect(() => {
    setPostValue(props.post.body);
  }, [props.post]);
  return (
    <Paper
      key={props.key}
      style={{ marginTop: 13 }}
      id={"discussion-" + props.post.id}
    >
      <Box>
        <Box
          width="100%"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          p={2}
          paddingBottom={0}
        >
          <Box display="flex" alignItems="center">
            <Avatar
              src={
                props.saving
                  ? props.userInfo.preferences.profile_picture
                  : props.post.added_by.profile_picture
              }
              alt="Profile pic"
            />
            <Box marginLeft={2} style={{ opacity: 0.8, maxWidth: 480 }}>
              <Typography
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color:
                    useTheme().palette.type === "dark" ? "#fff" : "#060606",
                }}
              >
                {props.post.added_by.first_name +
                  " " +
                  props.post.added_by.last_name}
              </Typography>
              <Typography
                color="textSecondary"
                style={{
                  fontSize: 14,
                  marginTop: -6,
                  fontWeight: 400,
                  color:
                    useTheme().palette.type === "dark" ? "#fff" : "#171717",
                }}
              >
                {moment(props.post.created_at).fromNow()}
              </Typography>
            </Box>
          </Box>
          <Box>
            {editing && !saving && (
              <ButtonGroup color="primary" variant="contained">
                <Button
                  disabled={saving}
                  onClick={() => editorRef?.current && editorRef.current.save()}
                >
                  Save
                </Button>
                <Button
                  disabled={saving}
                  color="default"
                  onClick={() => handleCancel()}
                >
                  Cancel
                </Button>
              </ButtonGroup>
            )}
            {(props.saving || deleting || (editing && saving)) && (
              <CircularProgress size={18} />
            )}
            {(props.post.added_by.id === props.userInfo.id ||
              props.userInfo.user_type === "t") && (
              <PopupState variant="popover" popupId="publish-btn">
                {(popupState) => (
                  <React.Fragment>
                    <IconButton color="primary" {...bindTrigger(popupState)}>
                      <Icon>more_vert</Icon>
                    </IconButton>
                    <Menu {...bindMenu(popupState)}>
                      <MenuItem
                        onClick={() => {
                          handleDelete(props.post);
                          popupState.close();
                        }}
                      >
                        Delete
                      </MenuItem>
                      {props.post.added_by.id === props.userInfo.id && (
                        <MenuItem
                          onClick={() => {
                            handleEdit(props.post);
                            popupState.close();
                          }}
                        >
                          Edit
                        </MenuItem>
                      )}
                    </Menu>
                  </React.Fragment>
                )}
              </PopupState>
            )}
          </Box>
        </Box>
        <Box
          width="100%"
          p={2}
          paddingTop={0}
          // className={[
          //   styles.discussionPost,
          //   expanded ? "expanded" : "not-expanded",
          // ].join(" ")}
          style={
            editing
              ? {
                  paddingTop: 16,
                  background: "rgba(255, 207, 36, 0.12)",
                }
              : {}
          }
        >
          {serializeBody(postValue).blocks ? (
            <Editor
              toolbar={editing}
              inlineToolbar={editing}
              readOnly={!editing}
              value={JSON.stringify(serializeBody(postValue))}
              controls={toolbarcontrols}
              inlineToolbarControls={inlinetoolbarcontrols}
              inlineToolbar={true}
              onSave={handleSave}
              getRef={(ref) => setEditorRef(ref)}
              // autocomplete={{
              //   strategies: [
              //     {
              //       items: classesAutocomplete,
              //       triggerChar: ":",
              //       atomicBlockName: "class",
              //     },
              //     {
              //       items: props.class.students.map((c) => ({
              //         keys: [
              //           "students",
              //           c.first_name,
              //           c.last_name,
              //           c.last_name.toLowerCase(),
              //           c.first_name.toLowerCase(),
              //           c.username,
              //         ],
              //         value: "@" + c.username,
              //         content: <TagItem user={c} />,
              //       })),
              //       triggerChar: "@",
              //     },
              //   ],
              // }}
            />
          ) : serializeBody(postValue).type === "image" ? (
            <img src={serializeBody(postValue).src} width="100%" />
          ) : null}
          {/* {!expanded && (
                <Box className="show-more">
                  <Button onClick={() => setExpanded(true)} fullWidth>
                    <Icon>expand_more</Icon>
                  </Button>
                </Box>
              )} */}
        </Box>
        <Divider />
        <Box p={2}>
          <Typography style={{ fontWeight: 600, fontSize: 14, opacity: 0.8 }}>
            {(props.post.comments && props.post.comments.length) || 0} comments
          </Typography>
        </Box>
        <Divider />
        <Box p={2}>
          {saving && typeof saving === "object" && (
            <Comment userInfo={props.userInfo} {...saving} saving={true} />
          )}
          {props.post.comments &&
            slicedComments().map((c, index) => <Comment key={index} {...c} />)}
          {props.post.comments &&
          props.post.comments.length &&
          commentsPerPage < props.post.comments.length - 1 ? (
            <Link
              href="#"
              style={{ textDecoration: "none" }}
              onClick={() => setCommentsPerPage(commentsPerPage + 5)}
            >
              <Typography
                style={{ fontWeight: 400, fontSize: 14, marginTop: 16 }}
                color="primary"
              >
                View more {props.post.comments.length - slicedComments().length}{" "}
                comments
              </Typography>
            </Link>
          ) : null}
        </Box>
        {!props.disabledComment && (
          <Box p={2}>
            <WriteAComment onSaving={(c) => setSaving(c)} {...props} />
          </Box>
        )}
      </Box>
    </Paper>
  );
}
function Bulletin(props) {
  const query = require("query-string").parse(window.location.search);
  const { schedule_id, room_name } = props.match.params;
  const { school_id } = props.userInfo;
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState();
  const styles = useStyles();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [discussionPage, setDiscussionPage] = useState(
    (!isNaN(parseInt(query.page)) && parseInt(query.page)) || 1
  );
  const isLoading = (l) => {
    setLoading(l);
  };
  const getPosts = async () => {
    if (!school_id) return;
    isLoading(true);
    try {
      let p = await Api.get(
        "/api/post/school/" + school_id + "?include=comments"
      );
      UserData.setPosts(school_id, p);
      isLoading(false);
    } catch (e) {}
  };
  useEffect(() => {
    UserData.setPosts(school_id, []);
    getPosts();
  }, [school_id]);
  useEffect(() => {
    window.removeEventListener("keydown", keyPress);
    window.addEventListener("keydown", keyPress);
  }, []);
  return (
    <Drawer {...props}>
      <Box display="flex" flexDirection="column" height="100vh">
        <NavBar
          title="Bulletin"
          left={
            isTablet && (
              <IconButton
                aria-label="Collapse Panel"
                onClick={() => {
                  props.history.push("#menu");
                }}
                style={{ marginLeft: -15 }}
              >
                <Icon>menu</Icon>
              </IconButton>
            )
          }
        />
        {/* {props.classes[school_id] && props.classes[school_id].students && (  */}
        <Box
          p={2}
          className={styles.root}
          style={{
            maxWidth: props.maxWidth || "auto",
            margin: "0 auto",
            height: "100%",
            overflow: "auto",
            width: "100%",
          }}
        >
          <Scrollbar autoHide>
            <Box display="flex" justifyContent="center" alignItems="flex-start">
              <Box width="100%" maxWidth={765}>
                <ConnectedStartADiscussion
                  class={props.classes[school_id]}
                  author={props.userInfo}
                  onPost={() => setDiscussionPage(1)}
                  onSaving={(post) => setSaving(post)}
                >
                  {/* <IconButton>
                      <Icon color="primary">insert_photo_outline</Icon>
                    </IconButton> */}
                </ConnectedStartADiscussion>
                {saving && (
                  <Discussion
                    {...props}
                    class={props.classes[school_id]}
                    post={saving}
                    saving={true}
                    disabledComment={true}
                  />
                )}
                {getPageItems(
                  props.posts.current
                    .sort(
                      (a, b) => new Date(b.created_at) - new Date(a.created_at)
                    )
                    .map((p, index) => (
                      <Discussion
                        key={index}
                        {...props}
                        class={props.classes[school_id]}
                        post={p}
                      />
                    )),
                  discussionPage,
                  10
                )}
                <Box marginTop={2} marginBottom={2}>
                  {!loading ? (
                    <Pagination
                      count={props.posts.current.length}
                      itemsPerPage={10}
                      icon={
                        <img
                          src="/hero-img/no-posts.svg"
                          width={180}
                          style={{ padding: "50px 0" }}
                        />
                      }
                      emptyTitle="No discussions yet"
                      emptyMessage={
                        <Button
                          onClick={() => {
                            document.querySelector(
                              "#right-panel"
                            ).scrollTop = 0;
                            document
                              .querySelector("#start-a-discussion")
                              .click();
                          }}
                        >
                          Start one
                        </Button>
                      }
                      nolink
                      page={discussionPage}
                      onChange={(p) => {
                        setDiscussionPage(p);
                        props.history.push(
                          makeLinkTo([
                            "bulletin",
                            schedule_id,
                            "",
                            "?page=" + p,
                          ])
                        );
                        let r = document.querySelector("#right-panel");
                        if (r) {
                          r =
                            r.firstElementChild.firstElementChild
                              .firstElementChild;
                          r.scrollTop = 0;
                        }
                      }}
                    />
                  ) : (
                    <Box width="100%" display="flex" justifyContent="center">
                      <CircularProgress />
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Scrollbar>
        </Box>
      </Box>
    </Drawer>
  );
}
const useStyles = makeStyles((theme) => ({
  root: {
    "& .comment-container:last-of-type": {
      marginBottom: "0!important",
    },
  },
  discussionPost: {
    maxHeight: 230,
    overflow: "hidden",
    position: "relative",
    "& .show-more": {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      background: "#fff",
      textAlign: "center",
      boxShadow: "0 -8px 18px rgba(0,0,0,0.1)",
      zIndex: 1,
    },
    "&.expanded": {
      overflow: "auto",
      maxHeight: "initial",
    },
  },
}));
export default connect((states) => ({
  userInfo: states.userInfo,
  theme: states.theme,
  posts: states.posts,
  classes: states.classDetails,
  allClasses: states.classes,
}))(Bulletin);
export { ConnectedStartADiscussion as StartADiscussion };

const toolbarcontrols = [
  "title",
  "bold",
  "italic",
  "underline",
  "strikethrough",
  "highlight",
  // "media",
  "numberList",
  "bulletList",
  "quote",
];
const inlinetoolbarcontrols = [
  "bold",
  "italic",
  "underline",
  "strikethrough",
  "highlight",
];
export const createImagePost = (url, description = null) => {
  return JSON.stringify({
    blocks: [
      {
        key: "ev6vu",
        text: description || "",
        type: "unstyled",
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [],
        data: {},
      },
      {
        key: "414mj",
        text: " ",
        type: "atomic",
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [{ offset: 0, length: 1, key: 0 }],
        data: {},
      },
      {
        key: "4j6no",
        text: "",
        type: "unstyled",
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [],
        data: {},
      },
    ],
    entityMap: {
      0: {
        type: "IMAGE",
        mutability: "IMMUTABLE",
        data: {
          url: url,
          width: "100%",
          height: "auto",
          alignment: "left",
          type: "image",
        },
      },
    },
  });
};
