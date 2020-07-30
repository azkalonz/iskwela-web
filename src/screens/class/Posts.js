import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Paper,
  Box,
  Avatar,
  TextField,
  Button,
  IconButton,
  Icon,
  Backdrop,
  Card,
  CardMedia,
  CardActionArea,
  CardContent,
  Typography,
  useTheme,
  Chip,
  Tooltip,
  Toolbar,
  Divider,
  makeStyles,
  useMediaQuery,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  Popover,
  CircularProgress,
} from "@material-ui/core";
import { connect } from "react-redux";
import MUIRichTextEditor from "mui-rte";
import moment from "moment";
import { makeLinkTo } from "../../components/router-dom";
import UserData from "../../components/UserData";
import socket from "../../components/socket.io";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import Pagination, { getPageItems } from "../../components/Pagination";
import Api from "../../api";
import { List } from "immutable";

function ClassCard(props) {
  const { blockProps } = props;
  const { value } = blockProps;
  return (
    <Card className="class-card-tag">
      <CardActionArea
        onClick={() =>
          window.open(makeLinkTo(["class", value.id, value.next_schedule.id]))
        }
      >
        <CardMedia image="/bg.jpg" title={value.name} className="media" />
        <CardContent className="content">
          {Object.keys(value.next_schedule).length ? (
            <React.Fragment>
              <Typography variant="body1" className="date">
                {moment(value.next_schedule.from).format("MMM D, YYYY")}
              </Typography>
              <Typography
                variant="body1"
                color="textSecondary"
                className="date"
              >
                {moment(value.next_schedule.from).format("hh:mm A")}-
                {moment(value.next_schedule.to).format("hh:mm A")}
              </Typography>
            </React.Fragment>
          ) : null}
        </CardContent>
        <div className="title-container">
          <Typography variant="h6" className="title">
            {value.name}
          </Typography>
        </div>
      </CardActionArea>
    </Card>
  );
}
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
function Comment(props) {
  const theme = useTheme().palette.type;
  const serializeComment = (data) => {
    let parsed;
    try {
      parsed = JSON.parse(data);
    } catch (e) {
      parsed = convertToRaw(ContentState.createFromText(data));
    }
    if (typeof parsed === "object") return JSON.stringify(parsed);
    else return "";
  };
  return (
    <Box
      width="100%"
      display="flex"
      alignItems="flex-start"
      marginBottom={2}
      className={"comment-container " + "comment-" + props.id}
    >
      <Box>
        <Avatar
          src={props.added_by.profile_picture}
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
            <Typography style={{ fontWeight: "bold", marginRight: 13 }}>
              {props.added_by.first_name + " " + props.added_by.last_name}
            </Typography>
            {props.saving && <CircularProgress size={18} />}
          </Box>
          <Editor
            toolbar={false}
            inlineToolbar={false}
            readOnly={true}
            value={serializeComment(props.body)}
          />
        </Box>
      </Box>
    </Box>
  );
}
function StartADiscussion(props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [editorRef, setEditorRef] = useState({});
  const [uploadAnchor, setUploadAnchor] = useState();
  let classesAutocomplete = Object.keys(props.classes)
    .filter((k, i) => {
      let c = Object.keys(props.classes);
      let index = c.findIndex(
        (key) => props.classes[key].subject.id === props.classes[k].subject.id
      );
      return index === i;
    })
    .map((k) => {
      let c = props.classes[k];
      return {
        keys: [
          "class",
          c.name.toLowerCase(),
          c.name.toUpperCase(),
          c.name,
          c.id + "",
        ],
        value: c,
        content: c.name,
      };
    });
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
        itemable_type: "class",
        itemable_id: props.class.id,
      },
    });
    socket.emit("new post", { class_id: props.class.id, post });
    console.log("post", post);
    // socket.emit("save post", {
    //   class_id: props.class.id,
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
              <Box
                width="100%"
                style={{ position: "relative", minHeight: isMobile ? 125 : 90 }}
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
                    {
                      name: "class",
                      type: "atomic",
                      atomicComponent: ClassCard,
                    },
                  ]}
                  autocomplete={{
                    strategies: [
                      {
                        items: classesAutocomplete,
                        triggerChar: ":",
                        atomicBlockName: "class",
                      },
                      {
                        items: props.class.students.map((c) => ({
                          keys: [
                            "students",
                            c.first_name,
                            c.last_name,
                            c.last_name.toLowerCase(),
                            c.first_name.toLowerCase(),
                            c.username,
                          ],
                          value: "@" + c.username,
                          content: <TagItem user={c} />,
                        })),
                        triggerChar: "@",
                      },
                    ],
                  }}
                />
              </Box>
            )}
          </Box>
          <Box
            display="flex"
            width="100%"
            alignItems="center"
            style={{ marginTop: 13, paddingLeft: 52 }}
          >
            <Box width="100%">{!states.DISCUSSION && props.children}</Box>
            <Box>
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
            </Box>
          </Box>
        </Box>
      </div>
      <Backdrop
        open={states.DISCUSSION || false}
        onClick={() => handleClose("DISCUSSION")}
        style={{ zIndex: 1301 }}
      />
    </React.Fragment>
  );
}
const ConnectedStartADiscussion = connect((states) => ({
  userInfo: states.userInfo,
  classes: states.classDetails,
  theme: states.theme,
}))(StartADiscussion);

function WriteAComment(props) {
  const theme = useTheme();
  const [editorRef, setEditorRef] = useState();
  const [content, setContent] = useState("");
  const handleAddComment = async (class_id, post_id, comment) => {
    let x = JSON.parse(comment);
    if (!x.blocks[0].text) {
      setContent(
        JSON.stringify(
          convertToRaw(EditorState.createEmpty().getCurrentContent())
        )
      );
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
        class_id,
        post: props.post,
        comment: c,
      });
    } catch (e) {
      console.error(e);
    }
    props.onSaving(null);
    // socket.emit("add comment", {
    //   class_id,
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
        width="100%"
        marginLeft={1}
        style={{
          borderRadius: 6,
          minHeight: 42,
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
            handleAddComment(props.class.id, props.post.id, data);
          }}
          onChange={(state) => {
            if (state.getCurrentContent().getPlainText().indexOf("\n") >= 0) {
              if (editorRef.current) editorRef.current.save();
            }
          }}
          autocomplete={{
            strategies: [
              {
                items: props.class.students.map((c) => ({
                  keys: [
                    "students",
                    c.first_name,
                    c.last_name,
                    c.last_name.toLowerCase(),
                    c.first_name.toLowerCase(),
                    c.username,
                  ],
                  value: "@" + c.username,
                  content: <TagItem user={c} />,
                })),
                triggerChar: "@",
              },
            ],
          }}
        />
      </Box>
    </Box>
  );
}

function Discussion(props) {
  const [expanded, setExpanded] = useState(false);
  const styles = useStyles();
  const [commentsPerPage, setCommentsPerPage] = useState(1);
  const [saving, setSaving] = useState();
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async (post) => {
    setDeleting(true);
    try {
      await Api.delete("/api/post/remove/" + post.id);
      socket.emit("delete post", { class_id: props.class.id, post });
    } catch (e) {}
    setDeleting(false);
  };
  return (
    <Paper style={{ marginTop: 13 }} id={"discussion-" + props.post.id}>
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
              src={props.post.added_by.profile_picture}
              alt="Profile pic"
            />
            <Box marginLeft={2}>
              <Typography style={{ fontWeight: "bold" }}>
                {props.post.added_by.first_name +
                  " " +
                  props.post.added_by.last_name}
              </Typography>
              <Typography color="textSecondary" style={{ marginTop: -6 }}>
                {moment(props.post.created_at).fromNow()}
              </Typography>
            </Box>
          </Box>
          <Box>
            {props.saving || (deleting && <CircularProgress size={18} />)}
            {props.post.added_by.id === props.userInfo.id ||
            props.userInfo.user_type === "t" ? (
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
                    </Menu>
                  </React.Fragment>
                )}
              </PopupState>
            ) : null}
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
        >
          <Editor
            toolbar={false}
            inlineToolbar={false}
            readOnly={true}
            value={props.post.body}
          />
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
          <Typography style={{ fontWeight: "bold" }}>
            {(props.post.comments && props.post.comments.length) || 0} comments
          </Typography>
        </Box>
        <Divider />
        <Box p={2}>
          {saving && <Comment {...saving} saving={true} />}
          {props.post.comments &&
            props.post.comments
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .slice(0, commentsPerPage + 1)
              .map((c, index) => <Comment key={index} {...c} />)}
          {props.post.comments &&
          props.post.comments.length &&
          commentsPerPage < props.post.comments.length - 1 ? (
            <a href="#" onClick={() => setCommentsPerPage(commentsPerPage + 5)}>
              Show more comments
            </a>
          ) : null}
        </Box>
        <Box p={2}>
          <WriteAComment onSaving={(c) => setSaving(c)} {...props} />
        </Box>
      </Box>
    </Paper>
  );
}
function WhatsDue(props) {
  return (
    <Paper>
      <Toolbar>
        <Typography style={{ fontWeight: "bold" }}>What's Due</Typography>
      </Toolbar>
      <Box p={2} display="flex" alignItems="center" justifyContent="center">
        <Typography color="textSecondary">
          No Assignment due this week
        </Typography>
      </Box>
    </Paper>
  );
}
function Posts(props) {
  const query = require("query-string").parse(window.location.search);
  const { class_id, schedule_id, room_name } = props.match.params;
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState();
  const styles = useStyles();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [discussionPage, setDiscussionPage] = useState(
    (!isNaN(parseInt(query.page)) && parseInt(query.page)) || 1
  );
  const isLoading = (l) => {
    props.onLoad(l);
    setLoading(l);
  };
  const getPosts = async () => {
    if (!class_id) return;
    props.onLoad(false);
    try {
      let p = await Api.get(
        "/api/post/class/" + class_id + "?include=comments"
      );
      UserData.setPosts(class_id, p);
      isLoading(false);
    } catch (e) {}
  };
  useEffect(() => {
    UserData.setPosts(class_id, []);
    isLoading(true);
    getPosts();
  }, [class_id]);
  return (
    <React.Fragment>
      {props.classes[class_id] && props.classes[class_id].students && (
        <Box
          p={2}
          className={styles.root}
          style={{ maxWidth: props.maxWidth || "auto", margin: "0 auto" }}
        >
          <Box display="flex" justifyContent="center" alignItems="flex-start">
            <Box width="100%" maxWidth={765}>
              <ConnectedStartADiscussion
                class={props.classes[class_id]}
                author={props.userInfo}
                onPost={() => setDiscussionPage(1)}
                onSaving={(post) => setSaving(post)}
              >
                {/* <IconButton>
                  <Icon color="primary">insert_photo_outline</Icon>
                </IconButton> */}
              </ConnectedStartADiscussion>
              {isTablet && (
                <Box width="100%" style={{ marginTop: 13 }}>
                  <WhatsDue />
                </Box>
              )}
              {saving && (
                <Discussion
                  {...props}
                  userInfo={props.userInfo}
                  class={props.classes[class_id]}
                  post={saving}
                  saving={true}
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
                      userInfo={props.userInfo}
                      class={props.classes[class_id]}
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
                          document.querySelector("#right-panel").scrollTop = 0;
                          document.querySelector("#start-a-discussion").click();
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
                          "class",
                          class_id,
                          schedule_id,
                          "posts",
                          room_name || "",
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
            {!isTablet && (
              <Box minWidth={350} marginLeft={3} className="sticky" top={60}>
                <WhatsDue />
              </Box>
            )}
          </Box>
        </Box>
      )}
    </React.Fragment>
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
}))(Posts);
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
