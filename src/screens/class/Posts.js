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
    let s = students.find(
      (s) => s.username === props.decoratedText.replace("@", "")
    );
    return s.first_name + " " + s.last_name;
  };
  return (
    <React.Fragment>
      {students.findIndex(
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
          component: TagSomeone,
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
          <Typography>Okay maam!</Typography>
        </Box>
      </Box>
    </Box>
  );
}
function StartADiscussion(props) {
  const theme = useTheme();
  const [editorRef, setEditorRef] = useState();
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
  classesAutocomplete = propsclasses;
  const [states, setStates] = useState({
    DISCUSSION: false,
  });
  const handlePost = () => {
    if (editorRef.current) {
      editorRef.current.save();
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
              <Box width="100%" style={{ position: "relative" }}>
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
                        items: students.map((c) => ({
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
  classes: states.classes,
}))(StartADiscussion);

function WriteAComment(props) {
  const theme = useTheme();
  return (
    <Box width="100%" display="flex" alignItems="flex-start">
      <Box>
        <Avatar src="/" alt="C" />
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
                items: students.map((c) => ({
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
            <Avatar src="/" alt="Profile pic" />
            <Box marginLeft={1}>
              <Typography style={{ fontWeight: "bold" }}>
                Rim Chong-uk
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
          <Comment />
        </Box>
        <Box p={2}>
          <WriteAComment />
        </Box>
      </Box>
    </Paper>
  );
}
const ConnectedDiscussion = connect((states) => ({
  userInfo: states.userInfo,
  classes: states.classes,
}))(Discussion);
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
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  return (
    <React.Fragment>
      <Box p={2}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box width="100%">
            <ConnectedStartADiscussion>
              <IconButton>
                <Icon>insert_photo</Icon>
              </IconButton>
            </ConnectedStartADiscussion>
            {isTablet && (
              <Box width="100%" style={{ marginTop: 13 }}>
                <WhatsDue />
              </Box>
            )}
            <ConnectedDiscussion value='{"blocks":[{"key":"c602k","text":"Submission of Activities","type":"header-two","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"4pbnh","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"df51u","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"6chnj","text":"Activities","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":10,"style":"BOLD"}],"entityRanges":[],"data":{}},{"key":"7upst","text":"Activity # 1","type":"unordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"7luks","text":"Activity # 2","type":"unordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"emnbv","text":"Activity # 3","type":"unordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"esgh0","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"a6euv","text":" ","type":"atomic","depth":0,"inlineStyleRanges":[],"entityRanges":[{"offset":0,"length":1,"key":0}],"data":{}},{"key":"5f556","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"1tsfk","text":"@smark ","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[{"offset":0,"length":6,"key":1}],"data":{}}],"entityMap":{"0":{"type":"CLASS","mutability":"IMMUTABLE","data":{"value":{"id":1,"name":"English 101","description":null,"room_number":"PCmcutuzVTDGtfWwWo2O05CO1pZz3qSA","frequency":"DAILY","date_from":null,"date_to":null,"time_from":"08:00:00","time_to":"09:00:00","next_schedule":{"id":311,"from":"2020-07-03 08:00:00","to":"2020-07-03 09:00:00","status":"PENDING"},"subject":{"id":1,"name":"English"},"teacher":{"id":1,"first_name":"Teacher","last_name":"Jenelyn","pic":"blob:http://localhost:3000/a9550f4f-8036-4742-850f-b58eaf890775"},"theme":"#424a9a"}}},"1":{"type":"AC_ITEM","mutability":"IMMUTABLE","data":{}}}}' />
            <ConnectedDiscussion value='{"blocks":[{"key":"8dl04","text":"Editor Features","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"2if2v","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"emch8","text":"Tag user","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"34opk","text":"@sjenelyn @sgrace @svhenjoseph ","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[{"offset":0,"length":9,"key":0},{"offset":10,"length":7,"key":1},{"offset":18,"length":12,"key":2}],"data":{}},{"key":"2sfr","text":"@sdavyjones  ","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[{"offset":0,"length":11,"key":3}],"data":{}},{"key":"2lkes","text":"#HashTag","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"5lkgn","text":"http://link.com","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"9rpo9","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"52v8","text":"Custom element","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":14,"style":"BOLD"}],"entityRanges":[],"data":{}},{"key":"6rkg9","text":"Class Schedule Card","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"d4e6d","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"6hba1","text":" ","type":"atomic","depth":0,"inlineStyleRanges":[],"entityRanges":[{"offset":0,"length":1,"key":4}],"data":{}},{"key":"ae22q","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"9ktnl","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"8a7f3","text":" ","type":"atomic","depth":0,"inlineStyleRanges":[],"entityRanges":[{"offset":0,"length":1,"key":5}],"data":{}},{"key":"9pijt","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"b45mr","text":"Title","type":"header-two","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"15hbp","text":"Bold","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":4,"style":"BOLD"}],"entityRanges":[],"data":{}},{"key":"eupst","text":"Italic","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":6,"style":"ITALIC"}],"entityRanges":[],"data":{}},{"key":"ibur","text":"Underlined","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":10,"style":"UNDERLINE"}],"entityRanges":[],"data":{}},{"key":"54k6r","text":"Strike-through","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":14,"style":"STRIKETHROUGH"}],"entityRanges":[],"data":{}},{"key":"aptaj","text":"Combination","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":11,"style":"STRIKETHROUGH"},{"offset":0,"length":11,"style":"UNDERLINE"},{"offset":0,"length":11,"style":"ITALIC"},{"offset":0,"length":11,"style":"BOLD"}],"entityRanges":[],"data":{}},{"key":"9rdji","text":"Highlight Text","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":14,"style":"HIGHLIGHT"}],"entityRanges":[],"data":{}},{"key":"8kt99","text":"Inline Toolbar","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"2ad3a","text":"Ordered List","type":"ordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"6j12l","text":"Unordered List","type":"unordered-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"baj0p","text":"A ","type":"blockquote","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"asn81","text":"Quote","type":"blockquote","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{"0":{"type":"AC_ITEM","mutability":"IMMUTABLE","data":{}},"1":{"type":"AC_ITEM","mutability":"IMMUTABLE","data":{}},"2":{"type":"AC_ITEM","mutability":"IMMUTABLE","data":{}},"3":{"type":"AC_ITEM","mutability":"IMMUTABLE","data":{}},"4":{"type":"CLASS","mutability":"IMMUTABLE","data":{"value":{"id":1,"name":"English 101","description":null,"room_number":"PCmcutuzVTDGtfWwWo2O05CO1pZz3qSA","frequency":"DAILY","date_from":null,"date_to":null,"time_from":"08:00:00","time_to":"09:00:00","next_schedule":{"id":311,"from":"2020-07-03 08:00:00","to":"2020-07-03 09:00:00","status":"PENDING"},"subject":{"id":1,"name":"English"},"teacher":{"id":1,"first_name":"Teacher","last_name":"Jenelyn","pic":"blob:http://localhost:3000/a9550f4f-8036-4742-850f-b58eaf890775"},"theme":"#424a9a"}}},"5":{"type":"CLASS","mutability":"IMMUTABLE","data":{"value":{"id":3,"name":"Science 101","description":null,"room_number":"OkWhSfEqRPoC8aRo7ZfStwItdXaVN4LB","frequency":"DAILY","date_from":null,"date_to":null,"time_from":"10:00:00","time_to":"11:00:00","next_schedule":{"id":713,"from":"2020-07-03 10:00:00","to":"2020-07-03 11:00:00","status":"PENDING"},"subject":{"id":2,"name":"Science"},"teacher":{"id":1,"first_name":"Teacher","last_name":"Jenelyn","pic":"blob:http://localhost:3000/a9550f4f-8036-4742-850f-b58eaf890775"},"theme":"#a74ff8"}}}}}' />
          </Box>
          {!isTablet && (
            <Box minWidth={300} marginLeft={1} position="sticky" top={60}>
              <WhatsDue />
            </Box>
          )}
        </Box>
      </Box>
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
  classes: states.classes,
}))(Posts);
export { ConnectedStartADiscussion as StartADiscussion };

const propsclasses = [
  {
    keys: ["class", "english 101", "ENGLISH 101", "English 101", "1"],
    value: {
      id: 1,
      name: "English 101",
      description: null,
      room_number: "PCmcutuzVTDGtfWwWo2O05CO1pZz3qSA",
      frequency: "DAILY",
      date_from: null,
      date_to: null,
      time_from: "08:00:00",
      time_to: "09:00:00",
      next_schedule: {
        id: 311,
        from: "2020-07-03 08:00:00",
        to: "2020-07-03 09:00:00",
        status: "PENDING",
      },
      subject: { id: 1, name: "English" },
      teacher: {
        id: 1,
        first_name: "Teacher",
        last_name: "Jenelyn",
        pic: "blob:http://localhost:3000/a9550f4f-8036-4742-850f-b58eaf890775",
      },
      theme: "#424a9a",
    },
    content: "English 101",
  },
  {
    keys: ["class", "math 101", "MATH 101", "Math 101", "2"],
    value: {
      id: 2,
      name: "Math 101",
      description: null,
      room_number: "plVOp71UJRPm5CrAsC4mMVGdpdOO0hn4",
      frequency: "DAILY",
      date_from: null,
      date_to: null,
      time_from: "09:00:00",
      time_to: "10:00:00",
      next_schedule: {
        id: 512,
        from: "2020-07-03 09:00:00",
        to: "2020-07-03 10:00:00",
        status: "PENDING",
      },
      subject: { id: 6, name: "Math" },
      teacher: {
        id: 1,
        first_name: "Teacher",
        last_name: "Jenelyn",
        pic: "blob:http://localhost:3000/a9550f4f-8036-4742-850f-b58eaf890775",
      },
      theme: "#67c6bc",
    },
    content: "Math 101",
  },
  {
    keys: ["class", "science 101", "SCIENCE 101", "Science 101", "3"],
    value: {
      id: 3,
      name: "Science 101",
      description: null,
      room_number: "OkWhSfEqRPoC8aRo7ZfStwItdXaVN4LB",
      frequency: "DAILY",
      date_from: null,
      date_to: null,
      time_from: "10:00:00",
      time_to: "11:00:00",
      next_schedule: {
        id: 713,
        from: "2020-07-03 10:00:00",
        to: "2020-07-03 11:00:00",
        status: "PENDING",
      },
      subject: { id: 2, name: "Science" },
      teacher: {
        id: 1,
        first_name: "Teacher",
        last_name: "Jenelyn",
        pic: "blob:http://localhost:3000/a9550f4f-8036-4742-850f-b58eaf890775",
      },
      theme: "#a74ff8",
    },
    content: "Science 101",
  },
  {
    keys: ["class", "geography 101", "GEOGRAPHY 101", "Geography 101", "4"],
    value: {
      id: 4,
      name: "Geography 101",
      description: null,
      room_number: "CnSmgwMrTj6UPzblcQEqG5FiyFf8jWj2",
      frequency: "DAILY",
      date_from: null,
      date_to: null,
      time_from: "11:00:00",
      time_to: "12:00:00",
      next_schedule: {
        id: 914,
        from: "2020-07-03 11:00:00",
        to: "2020-07-03 12:00:00",
        status: "PENDING",
      },
      subject: { id: 3, name: "Geography" },
      teacher: {
        id: 1,
        first_name: "Teacher",
        last_name: "Jenelyn",
        pic: "blob:http://localhost:3000/a9550f4f-8036-4742-850f-b58eaf890775",
      },
      theme: "#9a425d",
    },
    content: "Geography 101",
  },
  {
    keys: ["class", "p.e 101", "P.E 101", "P.E 101", "5"],
    value: {
      id: 5,
      name: "P.E 101",
      description: null,
      room_number: "NbAbhYxgbNntcW4sJRaB6VBWgQZqOyFX",
      frequency: "DAILY",
      date_from: null,
      date_to: null,
      time_from: "12:00:00",
      time_to: "13:00:00",
      next_schedule: {
        id: 1115,
        from: "2020-07-03 12:00:00",
        to: "2020-07-03 13:00:00",
        status: "PENDING",
      },
      subject: { id: 4, name: "P.E" },
      teacher: {
        id: 1,
        first_name: "Teacher",
        last_name: "Jenelyn",
        pic: "blob:http://localhost:3000/a9550f4f-8036-4742-850f-b58eaf890775",
      },
      theme: "#1d8568",
    },
    content: "P.E 101",
  },
  {
    keys: ["class", "recess 101", "RECESS 101", "Recess 101", "6"],
    value: {
      id: 6,
      name: "Recess 101",
      description: null,
      room_number: "H6JAKpNod2f0QUhWH8sSBefq2x1MsIVo",
      frequency: "DAILY",
      date_from: null,
      date_to: null,
      time_from: "13:00:00",
      time_to: "14:00:00",
      next_schedule: {
        id: 1316,
        from: "2020-07-03 13:00:00",
        to: "2020-07-03 14:00:00",
        status: "PENDING",
      },
      subject: { id: 5, name: "Recess" },
      teacher: {
        id: 1,
        first_name: "Teacher",
        last_name: "Jenelyn",
        pic: "blob:http://localhost:3000/a9550f4f-8036-4742-850f-b58eaf890775",
      },
      theme: "#e16b45",
    },
    content: "Recess 101",
  },
];
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

const students = [
  {
    id: 11,
    first_name: "Student",
    last_name: "Jenelyn",
    school_id: 1,
    user_type: "s",
    username: "sjenelyn",
    email: null,
    phone_number: 12345678,
    status: 1,
  },
  {
    id: 12,
    first_name: "Student",
    last_name: "Davy Jones",
    school_id: 1,
    user_type: "s",
    username: "sdavyjones",
    email: null,
    phone_number: 12345679,
    status: 1,
  },
  {
    id: 13,
    first_name: "Student",
    last_name: "Grace",
    school_id: 1,
    user_type: "s",
    username: "sgrace",
    email: null,
    phone_number: 12345680,
    status: 1,
  },
  {
    id: 14,
    first_name: "Student",
    last_name: "Jayson",
    school_id: 1,
    user_type: "s",
    username: "sjayson",
    email: null,
    phone_number: 12345681,
    status: 1,
  },
  {
    id: 15,
    first_name: "Student",
    last_name: "Vhen Joseph",
    school_id: 1,
    user_type: "s",
    username: "svhenjoseph",
    email: null,
    phone_number: 12345682,
    status: 1,
  },
  {
    id: 16,
    first_name: "Student",
    last_name: "Catherine",
    school_id: 1,
    user_type: "s",
    username: "scatherine",
    email: null,
    phone_number: 12345683,
    status: 1,
  },
  {
    id: 17,
    first_name: "Student",
    last_name: "Dhame",
    school_id: 1,
    user_type: "s",
    username: "sdhame",
    email: null,
    phone_number: 12345684,
    status: 1,
  },
  {
    id: 18,
    first_name: "Student",
    last_name: "Jacque",
    school_id: 1,
    user_type: "s",
    username: "sjacque",
    email: null,
    phone_number: 12345685,
    status: 1,
  },
  {
    id: 19,
    first_name: "Student",
    last_name: "Tom",
    school_id: 1,
    user_type: "s",
    username: "stom",
    email: null,
    phone_number: 12345686,
    status: 1,
  },
  {
    id: 20,
    first_name: "Student",
    last_name: "Mark",
    school_id: 1,
    user_type: "s",
    username: "smark",
    email: null,
    phone_number: 12345687,
    status: 1,
  },
  {
    id: 51,
    first_name: "Student",
    last_name: "Jenelyn",
    school_id: 1,
    user_type: "s",
    username: "sjenelyn2",
    email: null,
    phone_number: 12345678,
    status: 1,
  },
  {
    id: 52,
    first_name: "Student",
    last_name: "Davy Jones",
    school_id: 1,
    user_type: "s",
    username: "sdavyjones2",
    email: null,
    phone_number: 12345679,
    status: 1,
  },
  {
    id: 53,
    first_name: "Student",
    last_name: "Grace",
    school_id: 1,
    user_type: "s",
    username: "sgrace2",
    email: null,
    phone_number: 12345680,
    status: 1,
  },
  {
    id: 54,
    first_name: "Student",
    last_name: "Jayson",
    school_id: 1,
    user_type: "s",
    username: "sjayson2",
    email: null,
    phone_number: 12345681,
    status: 1,
  },
  {
    id: 55,
    first_name: "Student",
    last_name: "Vhen Joseph",
    school_id: 1,
    user_type: "s",
    username: "svhenjoseph2",
    email: null,
    phone_number: 12345682,
    status: 1,
  },
  {
    id: 56,
    first_name: "Student",
    last_name: "Catherine",
    school_id: 1,
    user_type: "s",
    username: "scatherine2",
    email: null,
    phone_number: 12345683,
    status: 1,
  },
  {
    id: 57,
    first_name: "Student",
    last_name: "Dhame",
    school_id: 1,
    user_type: "s",
    username: "sdhame2",
    email: null,
    phone_number: 12345684,
    status: 1,
  },
  {
    id: 58,
    first_name: "Student",
    last_name: "Jacque",
    school_id: 1,
    user_type: "s",
    username: "sjacque2",
    email: null,
    phone_number: 12345685,
    status: 1,
  },
  {
    id: 59,
    first_name: "Student",
    last_name: "Tom",
    school_id: 1,
    user_type: "s",
    username: "stom2",
    email: null,
    phone_number: 12345686,
    status: 1,
  },
  {
    id: 60,
    first_name: "Student",
    last_name: "Mark",
    school_id: 1,
    user_type: "s",
    username: "smark2",
    email: null,
    phone_number: 12345687,
    status: 1,
  },
  {
    id: 71,
    first_name: "Jayvilea",
    last_name: "Siton",
    school_id: 1,
    user_type: "s",
    username: "jsiton",
    email: null,
    phone_number: 12345688,
    status: 1,
  },
  {
    id: 72,
    first_name: "Myrna",
    last_name: "Epe",
    school_id: 1,
    user_type: "s",
    username: "mepe",
    email: null,
    phone_number: 12345689,
    status: 1,
  },
  {
    id: 73,
    first_name: "Niña Mae",
    last_name: "Manto",
    school_id: 1,
    user_type: "s",
    username: "nmmanto",
    email: null,
    phone_number: 12345690,
    status: 1,
  },
  {
    id: 74,
    first_name: "Gina",
    last_name: "Lacanaria",
    school_id: 1,
    user_type: "s",
    username: "glacanaria",
    email: null,
    phone_number: 12345691,
    status: 1,
  },
  {
    id: 75,
    first_name: "Donabella",
    last_name: "Caballero",
    school_id: 1,
    user_type: "s",
    username: "dcaballero",
    email: null,
    phone_number: 12345692,
    status: 1,
  },
  {
    id: 76,
    first_name: "Dona Jill",
    last_name: "Jabon",
    school_id: 1,
    user_type: "s",
    username: "djjabon",
    email: null,
    phone_number: 12345693,
    status: 1,
  },
  {
    id: 77,
    first_name: "Daniella",
    last_name: "Pahugot",
    school_id: 1,
    user_type: "s",
    username: "dpahugot",
    email: null,
    phone_number: 12345694,
    status: 1,
  },
  {
    id: 78,
    first_name: "Sylvia",
    last_name: "Batac",
    school_id: 1,
    user_type: "s",
    username: "sbatac",
    email: null,
    phone_number: 12345695,
    status: 1,
  },
  {
    id: 79,
    first_name: "Diane",
    last_name: "Gadje",
    school_id: 1,
    user_type: "s",
    username: "dgadje",
    email: null,
    phone_number: 12345696,
    status: 1,
  },
  {
    id: 80,
    first_name: "Sheina",
    last_name: "Yoo",
    school_id: 1,
    user_type: "s",
    username: "syoo",
    email: null,
    phone_number: 12345697,
    status: 1,
  },
  {
    id: 81,
    first_name: "Leo",
    last_name: "Celes",
    school_id: 1,
    user_type: "s",
    username: "lceles",
    email: null,
    phone_number: 12345698,
    status: 1,
  },
  {
    id: 82,
    first_name: "Efren",
    last_name: "Encarguez",
    school_id: 1,
    user_type: "s",
    username: "eencarguez",
    email: null,
    phone_number: 12345699,
    status: 1,
  },
  {
    id: 83,
    first_name: "Susan",
    last_name: "Encarguez",
    school_id: 1,
    user_type: "s",
    username: "sencarguez",
    email: null,
    phone_number: 12345700,
    status: 1,
  },
];
