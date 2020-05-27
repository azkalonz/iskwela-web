import React, { useState, useEffect } from "react";
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Menu,
  Paper,
  MenuItem,
  withStyles,
  Box,
  Button,
  TextField,
  IconButton,
  InputBase,
  ListItemSecondaryAction,
  makeStyles,
  Typography,
  Link,
} from "@material-ui/core";
import RootRef from "@material-ui/core/RootRef";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import InsertDriveFileOutlinedIcon from "@material-ui/icons/InsertDriveFileOutlined";
import MoreHorizOutlinedIcon from "@material-ui/icons/MoreHorizOutlined";
import Moment from "react-moment";
import ArrowDownwardOutlinedIcon from "@material-ui/icons/ArrowDownwardOutlined";
import ArrowUpwardOutlinedIcon from "@material-ui/icons/ArrowUpwardOutlined";
import SearchIcon from "@material-ui/icons/Search";
import AttachFileOutlinedIcon from "@material-ui/icons/AttachFileOutlined";
import store from "../../components/redux/store";
import FileViewer from "../../components/FileViewer";
import moment from "moment";
import { useHistory } from "react-router-dom";
import LaunchIcon from "@material-ui/icons/Launch";
import Grow from "@material-ui/core/Grow";

const queryString = require("query-string");

function Activity(props) {
  const { class_id } = props.match.params;
  const [activities, setActivities] = useState();
  const [sortType, setSortType] = useState("DESCENDING");
  const [search, setSearch] = useState("");
  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [file, setFile] = useState();
  const [fileViewerOpen, setfileViewerOpen] = useState(false);
  const isTeacher = store.getState().userInfo.user_type === "t" ? true : false;
  const styles = useStyles();
  const classSched = props.classSched;
  const [currentActivity, setCurrentActivity] = useState();
  const history = useHistory();

  const _handleFileOption = (option, file) => {
    setAnchorEl(() => {
      let a = {};
      a[file.id] = null;
      return { ...anchorEl, ...a };
    });
    switch (option) {
      case "view":
        setFile({
          url:
            file.id === "item-1"
              ? "https://gsi.berkeley.edu/media/Learning.pdf"
              : "https://sustainabledevelopment.un.org/content/documents/1545Climate_Action_Plan_Publication_Part_1.pdf",
          title: file.title,
        });
        setfileViewerOpen(true);
        return;
      case "download":
    }
  };
  const _getActivities = () => {
    if (!classSched) return;
    try {
      let a = store.getState().classSchedules[class_id][classSched];
      a = a.activities.map((i) => ({ ...i, id: "item-" + i.id }));
      setActivities(a);
    } catch (e) {
      // handle invalid schedule
    }
  };
  useEffect(() => {
    _getActivities();
  }, []);
  useEffect(() => {
    if (!fileViewerOpen) setFile();
  }, [fileViewerOpen]);
  useEffect(() => {
    if (activities) {
      setAnchorEl(() => {
        let a = {};
        activities.forEach((i) => {
          a[i.id] = null;
        });
        return a;
      });
    }
  }, [activities]);
  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    const items = reorder(
      activities,
      result.source.index,
      result.destination.index
    );
    setActivities(items);
  };

  const _handleSort = () => {
    if (sortType === "ASCENDING") {
      setActivities(
        activities.sort((a, b) => "" + a.title.localeCompare(b.title))
      );
      setSortType("DESCENDING");
    } else {
      setActivities(
        activities.sort((a, b) => "" + b.title.localeCompare(a.title))
      );
      setSortType("ASCENDING");
    }
  };
  const _handleSearch = (e) => {
    setSearch(e.toLowerCase());
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const _handleItemClick = (item) => {
    setCurrentActivity(
      currentActivity && item.id === currentActivity.id ? undefined : item
    );
  };

  return (
    <Box width="100%" alignSelf="flex-start" height="100%">
      <Dialog
        open={fileViewerOpen}
        keepMounted
        id="file-viewer-container"
        fullWidth
        onClose={() => setfileViewerOpen(false)}
        maxWidth="xl"
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogContent>
          {file && <FileViewer url={file.url} title={file.title} />}
        </DialogContent>
      </Dialog>
      <Box
        m={2}
        display="flex"
        justifyContent={isTeacher ? "space-between" : "flex-end"}
        flexWrap="wrap"
        alignItems="center"
      >
        {isTeacher && (
          <Button variant="contained" color="primary" onClick={handleClickOpen}>
            Add New Activity
          </Button>
        )}
        <Box
          flexDirection="row"
          flexWrap="wrap"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          {props.utilities}
          <Box border={1} p={0.3} borderRadius={7}>
            <InputBase
              onChange={(e) => _handleSearch(e.target.value)}
              placeholder="Search"
              inputProps={{ "aria-label": "search activity" }}
            />
            <IconButton
              type="submit"
              aria-label="search"
              style={{ padding: 0 }}
            >
              <SearchIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
      {currentActivity && currentActivity && (
        <Grow in={true}>
          <Box p={2}>
            <Paper>
              <Box p={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography style={{ fontWeight: "bold" }} variant="body1">
                    {currentActivity.title}
                  </Typography>
                  <Typography>
                    {moment(currentActivity.available_from).format("LL")} -{" "}
                    {moment(currentActivity.available_to).format("LL")}
                  </Typography>
                </Box>
                <Box m={2} style={{ marginLeft: 0, marginRight: 0 }}>
                  <Typography>{currentActivity.description}</Typography>
                </Box>
                <Box display="inline-block">
                  <Typography color="textSecondary">Resources</Typography>
                  {currentActivity.materials.map((m) => (
                    <Typography component="div">
                      <Link
                        component="div"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                        }}
                        onClick={() => window.open(m.resource_link)}
                      >
                        {m.resource_link}
                        <LaunchIcon fontSize="small" />
                      </Link>
                    </Typography>
                  ))}
                </Box>
              </Box>
            </Paper>
            {!isTeacher && (
              <Box marginTop={2}>
                <Typography
                  style={{ fontWeight: "bold", marginBottom: 7 }}
                  color="textSecondary"
                >
                  Upload your Answer
                </Typography>

                <Paper>
                  <Box width="100%" p={2} style={{ boxSizing: "border-box" }}>
                    <Box className={styles.upload}>
                      <Link
                        component="div"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        <AttachFileOutlinedIcon fontSize="small" />
                        Add file&nbsp;
                      </Link>
                      or drag file in here
                    </Box>
                  </Box>
                </Paper>
              </Box>
            )}
          </Box>
        </Grow>
      )}
      {!activities && (
        <Box
          width="100%"
          alignItems="center"
          justifyContent="center"
          display="flex"
          height="70%"
        >
          <Typography variant="h6" component="h2">
            No activities
          </Typography>
        </Box>
      )}
      {activities && (
        <Box width="100%" alignSelf="flex-start">
          <Box m={2}>
            <List className={styles.hideonmobile}>
              <ListItem
                ContainerComponent="li"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  backgroundColor: "transparent",
                }}
              >
                <Button size="small" onClick={_handleSort}>
                  <ListItemText primary="Title" />
                  {sortType === "ASCENDING" ? (
                    <ArrowUpwardOutlinedIcon />
                  ) : (
                    <ArrowDownwardOutlinedIcon />
                  )}
                </Button>
                <Typography variant="body1" style={{ marginRight: 10 }}>
                  MODIFIED
                </Typography>
                <ListItemSecondaryAction></ListItemSecondaryAction>
              </ListItem>
            </List>
            {!activities.length && (
              <Box
                width="100%"
                alignItems="center"
                justifyContent="center"
                display="flex"
                height="70%"
              >
                <Typography variant="h6" component="h2">
                  No activities
                </Typography>
              </Box>
            )}
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="droppable">
                {(provided, snapshot) => (
                  <RootRef rootRef={provided.innerRef}>
                    <List style={getListStyle(snapshot.isDraggingOver)}>
                      {activities
                        .filter(
                          (a) =>
                            JSON.stringify(a).toLowerCase().indexOf(search) >= 0
                        )
                        .map((item, index) => (
                          <Draggable
                            key={item.id}
                            draggableId={item.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <ListItem
                                ContainerComponent="li"
                                ContainerProps={{ ref: provided.innerRef }}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => _handleItemClick(item)}
                                className={styles.listItem}
                                style={{
                                  ...getItemStyle(
                                    snapshot.isDragging,
                                    provided.draggableProps.style
                                  ),
                                  ...(currentActivity &&
                                  item.id === currentActivity.id
                                    ? {
                                        background:
                                          store.getState().theme === "dark"
                                            ? "#111"
                                            : "#fff",
                                      }
                                    : {}),
                                }}
                              >
                                <ListItemIcon>
                                  <InsertDriveFileOutlinedIcon />
                                </ListItemIcon>
                                <ListItemText
                                  primary={item.title}
                                  secondary={
                                    item.description.substr(0, 50) + "..."
                                  }
                                />
                                <Typography
                                  variant="body1"
                                  component="div"
                                  style={{ marginRight: 10 }}
                                >
                                  <Moment
                                    className={styles.hideonmobile}
                                    fromNow
                                  >
                                    {item.available_from}
                                  </Moment>
                                </Typography>
                                <ListItemSecondaryAction>
                                  <IconButton
                                    onClick={(event) =>
                                      setAnchorEl(() => {
                                        let a = {};
                                        a[item.id] = event.currentTarget;
                                        return { ...anchorEl, ...a };
                                      })
                                    }
                                  >
                                    <MoreHorizOutlinedIcon />
                                  </IconButton>
                                  {anchorEl && (
                                    <StyledMenu
                                      id="customized-menu"
                                      anchorEl={anchorEl[item.id]}
                                      keepMounted
                                      open={Boolean(anchorEl[item.id])}
                                      onClose={() =>
                                        setAnchorEl(() => {
                                          let a = {};
                                          a[item.id] = null;
                                          return { ...anchorEl, ...a };
                                        })
                                      }
                                    >
                                      <StyledMenuItem>
                                        <ListItemText
                                          primary="View"
                                          onClick={() =>
                                            _handleFileOption("view", item)
                                          }
                                        />
                                      </StyledMenuItem>
                                      {isTeacher && (
                                        <div>
                                          <StyledMenuItem>
                                            <ListItemText primary="Edit" />
                                          </StyledMenuItem>
                                          <StyledMenuItem>
                                            <ListItemText primary="Delete" />
                                          </StyledMenuItem>
                                        </div>
                                      )}
                                    </StyledMenu>
                                  )}
                                </ListItemSecondaryAction>
                              </ListItem>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </List>
                  </RootRef>
                )}
              </Droppable>
            </DragDropContext>
          </Box>
        </Box>
      )}
      <Dialog
        open={open}
        keepMounted
        onClose={handleClose}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">Create Activity</DialogTitle>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-slide-description"
            component="div"
          >
            <Box display="flex" flexWrap="wrap">
              <TextField
                label="Title"
                className={styles.textField}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
              />
              <TextField
                label="Description"
                style={{ marginTop: 13 }}
                rows={4}
                multiline={true}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
              />
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions style={{ justifyContent: "space-between" }}>
          <div>
            <Button
              onClick={handleClose}
              variant="outlined"
              style={{ float: "left" }}
            >
              <AttachFileOutlinedIcon />
              Add
            </Button>
          </div>
          <DialogActions>
            <Button onClick={handleClose} variant="outlined">
              Cancel
            </Button>
            <Button variant="contained" onClick={handleClose} color="primary">
              Done
            </Button>
          </DialogActions>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const getItemStyle = (isDragging, draggableStyle) => ({
  ...draggableStyle,
});

const getListStyle = (isDraggingOver) => ({});
const StyledMenu = withStyles({
  paper: {
    border: "1px solid #d3d4d5",
  },
})((props) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "center",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "center",
    }}
    {...props}
  />
));

const StyledMenuItem = withStyles((theme) => ({
  root: {
    "&:focus": {
      backgroundColor: theme.palette.grey[200],
      "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
        color: theme.palette.common.primary,
      },
    },
  },
}))(MenuItem);

const useStyles = makeStyles((theme) => ({
  hideonmobile: {
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
    },
  },
  upload: {
    borderColor: theme.palette.primary.main,
    borderWidth: 2,
    borderRadius: 6,
    height: 170,
    width: "100%",
    borderStyle: "dashed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    "&:before": {
      content: "''",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.palette.primary.main,
      opacity: 0.1,
    },
  },
  listItem: {
    backgroundColor: theme.palette.grey[100],
    borderLeft: "4px solid #fff",
    marginBottom: 7,
  },
}));

export default Activity;
