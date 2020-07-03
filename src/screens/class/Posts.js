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
} from "@material-ui/core";
import { connect } from "react-redux";
import MUIRichTextEditor from "mui-rte";
import moment from "moment";
import { makeLinkTo } from "../../components/router-dom";
import UserData from "../../components/UserData";
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
        <Tooltip title={getTitle()} placement="top">
          <a style={{ color: theme.palette.primary.main, fontWeight: "bold" }}>
            {props.children}
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
      <a href={url} style={{ color: theme.palette.info.main }}>
        {props.children}
      </a>
    </React.Fragment>
  );
}
function LinkTag(props) {
  const theme = useTheme();
  return (
    <React.Fragment>
      <a href={props.decoratedText} style={{ color: theme.palette.info.main }}>
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
      customControls={[
        {
          name: "class",
          type: "atomic",
          atomicComponent: ClassCard,
        },
      ]}
    />
  );
}
function Comment(props) {
  return (
    <Box width="100%" display="flex" alignItems="flex-start">
      <Box>
        <Avatar src="/" alt="C" />
      </Box>
      <Box
        width="100%"
        marginLeft={1}
        style={{ borderRadius: 7 }}
        bgcolor="grey.100"
      >
        <Box p={1}>
          <Typography style={{ fontWeight: "bold" }}>Yi Hanying</Typography>
          <Editor
            toolbar={false}
            inlineToolbar={false}
            readOnly={true}
            value={props.value}
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
    } else {
      handleOpen("DISCUSSION");
    }
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
  return (
    <React.Fragment>
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
                    src={(props.userInfo && props.userInfo.pic_url) || "/"}
                    alt="Picture"
                  />
                </Box>
                <Box
                  width="100%"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleOpen("DISCUSSION")}
                >
                  <TextField
                    variant="outlined"
                    type="text"
                    multiline
                    placeholder="Start a discussion"
                    fullWidth
                    style={{ pointerEvents: "none" }}
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
                  controls={toolbarcontrols}
                  inlineToolbarControls={inlinetoolbarcontrols}
                  getRef={(ref) => setEditorRef(ref)}
                  inlineToolbar={true}
                  onSave={(data) => console.log(data)}
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
                          content: c.first_name + " " + c.last_name,
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
                style={{ boxShadow: "none", marginLeft: 13 }}
                onClick={handlePost}
              >
                Post
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
  return (
    <Box width="100%" display="flex" alignItems="flex-start">
      <Box>
        <Avatar src={props.user.pic_url} alt={props.user.first_name} />
      </Box>
      <Box
        width="100%"
        marginLeft={1}
        style={{
          borderRadius: 7,
          minHeight: 42,
          paddingLeft: theme.spacing(2),
          background: theme.palette.primary.main + "1a",
          border: "1px solid grey",
        }}
      >
        <Editor
          toolbar={false}
          inlineToolbar={false}
          label="Write a comment"
          onChange={(state) => {
            if (state.getCurrentContent().getPlainText().indexOf("\n") >= 0) {
              console.log("Post comment");
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
                  content: c.first_name + " " + c.last_name,
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
  return (
    <Paper style={{ marginTop: 13 }}>
      <Box>
        <Box
          width="100%"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          p={2}
        >
          <Box display="flex" alignItems="flex-start">
            <Avatar
              src={props.pics[props.class.teacher.id]}
              alt="Profile pic"
            />
            <Box marginLeft={1}>
              <Typography style={{ fontWeight: "bold" }}>
                {props.class.teacher.first_name +
                  " " +
                  props.class.teacher.last_name}
              </Typography>
              <Typography color="textSecondary">1 hour ago</Typography>
            </Box>
          </Box>
          <Box>
            <IconButton color="primary">
              <Icon>more_vert</Icon>
            </IconButton>
          </Box>
        </Box>
        <Box
          width="100%"
          p={2}
          className={[
            styles.discussionPost,
            expanded ? "expanded" : "not-expanded",
          ].join(" ")}
        >
          <Editor
            toolbar={false}
            inlineToolbar={false}
            readOnly={true}
            value={props.value}
          />
          {!expanded && (
            <Box className="show-more">
              <Button onClick={() => setExpanded(true)} fullWidth>
                <Icon>expand_more</Icon>
              </Button>
            </Box>
          )}
        </Box>
        <Divider />
        <Box p={2}>
          <Typography style={{ fontWeight: "bold" }}>5 Comments</Typography>
        </Box>
        <Divider />
        <Box p={2}>
          <Comment value='{"blocks":[{"key":"dm726","text":"Hello @sjenelyn ","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[{"offset":6,"length":9,"key":0}],"data":{}}],"entityMap":{"0":{"type":"AC_ITEM","mutability":"IMMUTABLE","data":{}}}}' />
        </Box>
        <Box p={2}>
          <WriteAComment user={props.userInfo || {}} class={props.class} />
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
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  return (
    <React.Fragment>
      {props.classes[class_id] && props.classes[class_id].students && (
        <Box p={2}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Box width="100%">
              <ConnectedStartADiscussion class={props.classes[class_id]}>
                <IconButton>
                  <Icon>insert_photo</Icon>
                </IconButton>
              </ConnectedStartADiscussion>
              {isTablet && (
                <Box width="100%" style={{ marginTop: 13 }}>
                  <WhatsDue />
                </Box>
              )}
              <Discussion
                userInfo={props.userInfo}
                pics={props.pics}
                class={props.classes[class_id]}
                value='{"blocks":[{"key":"c602k","text":"Submission of Activities","type":"header-two","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"4pbnh","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"df51u","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"6chnj","text":"Activities","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":10,"style":"BOLD"}],"entityRanges":[],"data":{}},{"key":"7upst","text":"Activity # 1","type":"unordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"7luks","text":"Activity # 2","type":"unordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"emnbv","text":"Activity # 3","type":"unordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"esgh0","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"a6euv","text":" ","type":"atomic","depth":0,"inlineStyleRanges":[],"entityRanges":[{"offset":0,"length":1,"key":0}],"data":{}},{"key":"5f556","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"1tsfk","text":"@smark ","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[{"offset":0,"length":6,"key":1}],"data":{}}],"entityMap":{"0":{"type":"CLASS","mutability":"IMMUTABLE","data":{"value":{"id":1,"name":"English 101","description":null,"room_number":"PCmcutuzVTDGtfWwWo2O05CO1pZz3qSA","frequency":"DAILY","date_from":null,"date_to":null,"time_from":"08:00:00","time_to":"09:00:00","next_schedule":{"id":311,"from":"2020-07-03 08:00:00","to":"2020-07-03 09:00:00","status":"PENDING"},"subject":{"id":1,"name":"English"},"teacher":{"id":1,"first_name":"Teacher","last_name":"Jenelyn","pic":"blob:http://localhost:3000/a9550f4f-8036-4742-850f-b58eaf890775"},"theme":"#424a9a"}}},"1":{"type":"AC_ITEM","mutability":"IMMUTABLE","data":{}}}}'
              />
              <Discussion
                userInfo={props.userInfo}
                pics={props.pics}
                class={props.classes[class_id]}
                value='{"blocks":[{"key":"8dl04","text":"Editor Features","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"2if2v","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"emch8","text":"Tag user","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"34opk","text":"@sjenelyn @sgrace @svhenjoseph ","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[{"offset":0,"length":9,"key":0},{"offset":10,"length":7,"key":1},{"offset":18,"length":12,"key":2}],"data":{}},{"key":"2sfr","text":"@sdavyjones  ","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[{"offset":0,"length":11,"key":3}],"data":{}},{"key":"2lkes","text":"#HashTag","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"5lkgn","text":"http://link.com","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"9rpo9","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"52v8","text":"Custom element","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":14,"style":"BOLD"}],"entityRanges":[],"data":{}},{"key":"6rkg9","text":"Class Schedule Card","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"d4e6d","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"6hba1","text":" ","type":"atomic","depth":0,"inlineStyleRanges":[],"entityRanges":[{"offset":0,"length":1,"key":4}],"data":{}},{"key":"ae22q","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"9ktnl","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"8a7f3","text":" ","type":"atomic","depth":0,"inlineStyleRanges":[],"entityRanges":[{"offset":0,"length":1,"key":5}],"data":{}},{"key":"9pijt","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"b45mr","text":"Title","type":"header-two","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"15hbp","text":"Bold","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":4,"style":"BOLD"}],"entityRanges":[],"data":{}},{"key":"eupst","text":"Italic","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":6,"style":"ITALIC"}],"entityRanges":[],"data":{}},{"key":"ibur","text":"Underlined","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":10,"style":"UNDERLINE"}],"entityRanges":[],"data":{}},{"key":"54k6r","text":"Strike-through","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":14,"style":"STRIKETHROUGH"}],"entityRanges":[],"data":{}},{"key":"aptaj","text":"Combination","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":11,"style":"STRIKETHROUGH"},{"offset":0,"length":11,"style":"UNDERLINE"},{"offset":0,"length":11,"style":"ITALIC"},{"offset":0,"length":11,"style":"BOLD"}],"entityRanges":[],"data":{}},{"key":"9rdji","text":"Highlight Text","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":14,"style":"HIGHLIGHT"}],"entityRanges":[],"data":{}},{"key":"8kt99","text":"Inline Toolbar","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"2ad3a","text":"Ordered List","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"6j12l","text":"Unordered List","type":"unordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"baj0p","text":"A ","type":"blockquote","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"asn81","text":"Quote","type":"blockquote","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{"0":{"type":"AC_ITEM","mutability":"IMMUTABLE","data":{}},"1":{"type":"AC_ITEM","mutability":"IMMUTABLE","data":{}},"2":{"type":"AC_ITEM","mutability":"IMMUTABLE","data":{}},"3":{"type":"AC_ITEM","mutability":"IMMUTABLE","data":{}},"4":{"type":"CLASS","mutability":"IMMUTABLE","data":{"value":{"id":1,"name":"English 101","description":null,"room_number":"PCmcutuzVTDGtfWwWo2O05CO1pZz3qSA","frequency":"DAILY","date_from":null,"date_to":null,"time_from":"08:00:00","time_to":"09:00:00","next_schedule":{"id":311,"from":"2020-07-03 08:00:00","to":"2020-07-03 09:00:00","status":"PENDING"},"subject":{"id":1,"name":"English"},"teacher":{"id":1,"first_name":"Teacher","last_name":"Jenelyn","pic":"blob:http://localhost:3000/a9550f4f-8036-4742-850f-b58eaf890775"},"theme":"#424a9a"}}},"5":{"type":"CLASS","mutability":"IMMUTABLE","data":{"value":{"id":3,"name":"Science 101","description":null,"room_number":"OkWhSfEqRPoC8aRo7ZfStwItdXaVN4LB","frequency":"DAILY","date_from":null,"date_to":null,"time_from":"10:00:00","time_to":"11:00:00","next_schedule":{"id":713,"from":"2020-07-03 10:00:00","to":"2020-07-03 11:00:00","status":"PENDING"},"subject":{"id":2,"name":"Science"},"teacher":{"id":1,"first_name":"Teacher","last_name":"Jenelyn","pic":"blob:http://localhost:3000/a9550f4f-8036-4742-850f-b58eaf890775"},"theme":"#a74ff8"}}}}}'
              />
            </Box>
            {!isTablet && (
              <Box minWidth={300} marginLeft={1} position="sticky" top={60}>
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
