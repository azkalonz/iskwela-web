import React, { useRef, useState, useEffect } from "react";
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
} from "@material-ui/core";
import { connect } from "react-redux";
import MUIRichTextEditor from "mui-rte";
import moment from "moment";
import { makeLinkTo } from "../../components/router-dom";
import UserData from "../../components/UserData";
import socket from "../../components/socket.io";
import PopupState, { bindMenu, bindTrigger } from "material-ui-popup-state";
import { EditorState, convertToRaw } from "draft-js";
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
      <Avatar src="/" alt={props.user.first_name} style={{ marginRight: 10 }} />
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
          src={props.author.preferences.profile_picture}
          alt={props.author.first_name}
        />
      </Box>
      <Box
        width="100%"
        marginLeft={1}
        style={{ borderRadius: 6, background: "rgb(249, 245, 254)" }}
      >
        <Box p={1}>
          <Typography style={{ fontWeight: "bold" }}>
            {props.author.first_name + " " + props.author.last_name}
          </Typography>
          <Editor
            toolbar={false}
            inlineToolbar={false}
            readOnly={true}
            value={props.comment}
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
  const handleSave = (data) => {
    socket.emit("save post", {
      class_id: props.class.id,
      value: data,
      author: props.userInfo,
      date: moment(new Date()).format("MMMM DD, YYYY hh:mm:ss"),
    });
    handleClose("DISCUSSION");
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
      <Paper
        style={{
          zIndex: !states.DISCUSSION ? 1 : 1302,
          position: "relative",
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
                  // focused={true}
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
      </Paper>
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
}))(StartADiscussion);

function WriteAComment(props) {
  const theme = useTheme();
  const [editorRef, setEditorRef] = useState();
  const [content, setContent] = useState("");
  const handleAddComment = (class_id, post_id, comment) => {
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
    socket.emit("add comment", {
      class_id,
      post_id,
      comment,
      author: props.userInfo,
    });
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
        }}
        className="nonMui-themed-input"
      >
        <Editor
          toolbar={false}
          getRef={(ref) => setEditorRef(ref)}
          inlineToolbar={false}
          label="Write a comment"
          value={content}
          onSave={(data) => {
            handleAddComment(props.class.id, props.data.id, data);
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
  const count = 5;
  const [commentsPerPage, setCommentsPerPage] = useState(count);
  const [date, setDate] = useState(moment(props.data.date).fromNow());
  const tick = () =>
    setInterval(() => setDate(moment(props.data.date).fromNow()), 60000);
  const handleDelete = (class_id, id) => {
    socket.emit("delete post", { class_id, id });
  };
  useEffect(() => {
    tick();
  }, []);
  return (
    <Paper style={{ marginTop: 13 }} id={"discussion-" + props.data.id}>
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
              src={props.data.author.preferences.profile_picture}
              alt="Profile pic"
            />
            <Box marginLeft={2}>
              <Typography style={{ fontWeight: "bold" }}>
                {props.data.author.first_name +
                  " " +
                  props.data.author.last_name}
              </Typography>
              <Typography color="textSecondary" style={{ marginTop: -6 }}>
                {date}
              </Typography>
            </Box>
          </Box>
          <Box>
            {props.data.author.id === props.userInfo.id && (
              <PopupState variant="popover" popupId="publish-btn">
                {(popupState) => (
                  <React.Fragment>
                    <IconButton color="primary" {...bindTrigger(popupState)}>
                      <Icon>more_vert</Icon>
                    </IconButton>
                    <Menu {...bindMenu(popupState)}>
                      <MenuItem
                        onClick={() => {
                          handleDelete(props.data.class_id, props.data.id);
                          popupState.close();
                        }}
                      >
                        Delete
                      </MenuItem>
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
        >
          <Editor
            toolbar={false}
            inlineToolbar={false}
            readOnly={true}
            value={props.data.value}
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
            {(props.data.comments && props.data.comments.length) || 0} comments
          </Typography>
        </Box>
        <Divider />
        <Box p={2}>
          {props.data.comments &&
            props.data.comments
              .reverse()
              .slice(0, commentsPerPage)
              .map((c) => <Comment {...c} />)}
          {props.data.comments &&
          props.data.comments.length &&
          commentsPerPage < props.data.comments.length - 1 ? (
            <a
              href="#"
              onClick={() => setCommentsPerPage(commentsPerPage + count)}
            >
              Show more comments
            </a>
          ) : null}
        </Box>
        <Box p={2}>
          <WriteAComment {...props} />
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
  const { class_id } = props.match.params;
  const theme = useTheme();
  const styles = useStyles();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [posts, setPosts] = useState([]);
  const [discussionPage, setDiscussionPage] = useState(1);
  useEffect(() => {
    props.onLoad(true);
    socket.on("get post", (posts) => {
      props.onLoad(false);
      setPosts(posts || []);
    });
    socket.emit("get post", class_id);
  }, []);
  useEffect(() => {
    if (posts) {
      socket.off("add items");
      socket.off("delete items");
      socket.off("update post");
      socket.on("update post", (data) => {
        let p = [...posts];
        let index = p.findIndex((q) => q.id === data.id);
        p[index] = data;
        setPosts(p);
      });
      socket.on("delete items", (data) => {
        if (data.type === "POST")
          setPosts(posts.filter((q) => q.id !== data.id));
      });
      socket.on("add items", (data) => {
        if (
          data.type === "POST" &&
          parseInt(data.items.class_id) === parseInt(class_id)
        )
          setPosts([...posts, data.items]);
      });
    }
  }, [posts]);
  return (
    <React.Fragment>
      {props.classes[class_id] && props.classes[class_id].students && (
        <Box p={2} className={styles.root}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Box width="100%">
              <ConnectedStartADiscussion
                class={props.classes[class_id]}
                author={props.userInfo}
                onPost={() => setDiscussionPage(1)}
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
              {getPageItems(
                posts
                  .sort((a, b) => b.id - a.id)
                  .map((p) => (
                    <Discussion
                      userInfo={props.userInfo}
                      class={props.classes[class_id]}
                      data={p}
                    />
                  )),
                discussionPage,
                10
              )}
              <Box marginTop={2} marginBottom={2}>
                <Pagination
                  count={posts.length}
                  itemsPerPage={10}
                  icon="sms_outline"
                  emptyTitle="There are no posts in this Class yet."
                  emptyMessage={
                    <Button
                      onClick={() =>
                        document.querySelector("#start-a-discussion").click()
                      }
                    >
                      Start a Discussion
                    </Button>
                  }
                  nolink
                  page={discussionPage}
                  onChange={(p) => setDiscussionPage(p)}
                />
              </Box>
            </Box>
            {!isTablet && (
              <Box minWidth={350} marginLeft={3} position="sticky" top={60}>
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
