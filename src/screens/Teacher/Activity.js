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
  MenuItem,
  withStyles,
  Slide,
  Box,
  Button,
  TextField,
  IconButton,
  InputBase,
  ListItemSecondaryAction,
  makeStyles,
  Typography,
  Paper,
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
  listItem: {
    backgroundColor: theme.palette.grey[100],
    borderLeft: "4px solid #fff",
    marginBottom: 7,
  },
}));

function Activity(props) {
  const [myItems, setMyItems] = useState(sampleActivities);
  const [itemsCopy, setItemsCopy] = useState();
  const [sortType, setSortType] = useState("DESCENDING");
  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const userInfo = JSON.parse(window.localStorage["user"]);
  const isTeacher = userInfo.type === "teacher" ? true : false;
  const styles = useStyles();
  console.log(userInfo);

  useEffect(() => {
    setItemsCopy(myItems);
  }, []);
  useEffect(() => {
    setAnchorEl(() => {
      let a = {};
      myItems.forEach((i) => {
        a[i.id] = null;
      });
      return a;
    });
  }, [myItems]);
  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    const items = reorder(
      myItems,
      result.source.index,
      result.destination.index
    );
    // UPDATE ACTIVITY ORDER FROM DATABASE
    setMyItems(items);
  };

  const _handleSort = () => {
    if (sortType === "ASCENDING") {
      setMyItems(
        myItems.sort(
          (a, b) =>
            a.title.toLowerCase().charCodeAt(0) -
            b.title.toLowerCase().charCodeAt(0)
        )
      );
      setSortType("DESCENDING");
    } else {
      setMyItems(
        myItems.sort(
          (a, b) =>
            b.title.toLowerCase().charCodeAt(0) -
            a.title.toLowerCase().charCodeAt(0)
        )
      );
      setSortType("ASCENDING");
    }
  };
  const _handleSearch = (e) => {
    setMyItems(
      itemsCopy.filter(
        (i) => i.title.toLowerCase().indexOf(e.toLowerCase()) >= 0
      )
    );
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box width="100%" alignSelf="flex-start">
      <Box
        m={2}
        display="flex"
        justifyContent={isTeacher ? "space-between" : "flex-end"}
        flexWrap="wrap"
      >
        {isTeacher && (
          <Button variant="contained" color="primary" onClick={handleClickOpen}>
            Add New Activity
          </Button>
        )}
        <Box border={1} p={0.3} borderRadius={7}>
          <InputBase
            onChange={(e) => _handleSearch(e.target.value)}
            placeholder="Search"
            inputProps={{ "aria-label": "search activity" }}
          />
          <IconButton type="submit" aria-label="search" style={{ padding: 0 }}>
            <SearchIcon />
          </IconButton>
        </Box>
      </Box>

      <Box m={2}>
        <List className={styles.hideonmobile}>
          <ListItem
            ContainerComponent="li"
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
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
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <RootRef rootRef={provided.innerRef}>
                <List style={getListStyle(snapshot.isDraggingOver)}>
                  {myItems.map((item, index) => (
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
                          className={styles.listItem}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )}
                        >
                          <ListItemIcon>
                            <InsertDriveFileOutlinedIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={item.title}
                            secondary={item.instruction}
                          />
                          <Typography
                            variant="body1"
                            style={{ marginRight: 10 }}
                          >
                            <Moment className={styles.hideonmobile} fromNow>
                              {item.available_from}
                            </Moment>
                          </Typography>
                          <ListItemSecondaryAction>
                            {isTeacher && (
                              <div>
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
                                      <ListItemText primary="Duplicate" />
                                    </StyledMenuItem>
                                    <StyledMenuItem>
                                      <ListItemText primary="Remove" />
                                    </StyledMenuItem>
                                  </StyledMenu>
                                )}
                              </div>
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
      <Dialog
        open={open}
        keepMounted
        onClose={handleClose}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">Create Activity</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
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
            <Button onClick={handleClose} color="grey.500" variant="outlined">
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

const sampleActivities = [
  {
    id: "item-0",
    title: "English Assignment 1",
    instruction: "read it",
    activity_type: "class activity",
    available_from: "2020-05-11",
    available_to: "2020-05-15",
    status: "unpublished",
    materials: [
      {
        id: 1,
        uploaded_file: "http://talina.local:8080/api/download/1",
        resource_link: "http://read-english.com/basics",
      },
      {
        id: 2,
        uploaded_file: "http://talina.local:8080/api/download/2",
        resource_link: "http://read-english.com/basics2",
      },
      {
        id: 5,
        uploaded_file: "http://talina.local:8080/api/download/5",
        resource_link: null,
      },
    ],
  },
  {
    id: "item-1",
    title: "Math Assignment 2",
    instruction: "read it",
    activity_type: "class activity",
    available_from: "2020-05-11",
    available_to: "2020-05-15",
    status: "unpublished",
    materials: [
      {
        id: 1,
        uploaded_file: "http://talina.local:8080/api/download/1",
        resource_link: "http://read-english.com/basics",
      },
      {
        id: 2,
        uploaded_file: "http://talina.local:8080/api/download/2",
        resource_link: "http://read-english.com/basics2",
      },
      {
        id: 5,
        uploaded_file: "http://talina.local:8080/api/download/5",
        resource_link: null,
      },
    ],
  },
];

export default Activity;
