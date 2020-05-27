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
import ExpandMoreOutlinedIcon from "@material-ui/icons/ExpandMoreOutlined";
import InsertLinkOutlinedIcon from "@material-ui/icons/InsertLinkOutlined";
import CloudUploadOutlinedIcon from "@material-ui/icons/CloudUploadOutlined";
import store from "../../components/redux/store";
import FileViewer from "../../components/FileViewer";

const queryString = require("query-string");

function InstructionalMaterials(props) {
  const { class_id } = props.match.params;
  const [materials, setMaterials] = useState();
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("DESCENDING");
  const [modals, setModals] = useState([false, false]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [addNewFileAnchor, setAddNewFileAnchor] = useState(null);
  const classSched = props.classSched;
  const isTeacher = store.getState().userInfo.user_type === "t" ? true : false;
  const styles = useStyles();
  const [file, setFile] = useState();
  const [fileViewerOpen, setfileViewerOpen] = useState(false);

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

  const _getMaterials = () => {
    if (!classSched) return;
    try {
      let a = store.getState().classSchedules[class_id][classSched];
      a = a.materials.map((i) => ({ ...i, id: "item-" + i.id }));
      setMaterials(a);
    } catch (e) {
      //handle invalid schedule
    }
  };
  useEffect(() => {
    _getMaterials();
  }, []);
  useEffect(() => {
    if (!fileViewerOpen) setFile();
  }, [fileViewerOpen]);
  useEffect(() => {
    if (materials)
      setAnchorEl(() => {
        let a = {};
        materials.forEach((i) => {
          a[i.id] = null;
        });
        return a;
      });
  }, [materials]);
  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    const items = reorder(
      materials,
      result.source.index,
      result.destination.index
    );
    // UPDATE ACTIVITY ORDER FROM DATABASE
    setMaterials(items);
  };

  const _handleSort = () => {
    if (sortType === "ASCENDING") {
      setMaterials(
        materials.sort((a, b) => ("" + a.title).localeCompare(b.title))
      );
      setSortType("DESCENDING");
    } else {
      setMaterials(
        materials.sort((a, b) => ("" + b.title).localeCompare(a.title))
      );
      setSortType("ASCENDING");
    }
  };
  const _handleSearch = (e) => {
    setSearch(e.toLowerCase());
  };

  const handleClickOpen = (event) => {
    setAddNewFileAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAddNewFileAnchor(null);
  };
  return (
    <Box width="100%" alignSelf="flex-start">
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
          <div>
            <Button
              variant="contained"
              color="primary"
              onClick={handleClickOpen}
            >
              Add New File
              <ExpandMoreOutlinedIcon />
            </Button>
            <StyledMenu
              id="customized-menu"
              anchorEl={addNewFileAnchor}
              keepMounted
              open={Boolean(addNewFileAnchor)}
              onClose={handleClose}
            >
              <StyledMenuItem onClick={() => setModals([true, modals[1]])}>
                <ListItemIcon>
                  <InsertLinkOutlinedIcon />
                </ListItemIcon>
                <ListItemText primary="Web Link" />
              </StyledMenuItem>
              <StyledMenuItem onClick={() => setModals([modals[0], true])}>
                <ListItemIcon>
                  <CloudUploadOutlinedIcon />
                </ListItemIcon>
                <ListItemText primary="Upload" />
              </StyledMenuItem>
            </StyledMenu>
          </div>
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

      {materials && (
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
                  ADDED BY
                </Typography>
                <ListItemSecondaryAction></ListItemSecondaryAction>
              </ListItem>
            </List>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="droppable">
                {(provided, snapshot) => (
                  <RootRef rootRef={provided.innerRef}>
                    <List style={getListStyle(snapshot.isDraggingOver)}>
                      {materials
                        .filter(
                          (i) =>
                            JSON.stringify(i).toLowerCase().indexOf(search) >= 0
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
                                style={getItemStyle(
                                  snapshot.isDragging,
                                  provided.draggableProps.style
                                )}
                                onClick={() => _handleFileOption("view", item)}
                                className={styles.listItem}
                              >
                                <ListItemIcon>
                                  <InsertDriveFileOutlinedIcon />
                                </ListItemIcon>
                                <ListItemText
                                  primary={item.title}
                                  secondary={item.resource_link}
                                />
                                <Typography
                                  variant="body1"
                                  style={{ marginRight: 10 }}
                                >
                                  {item.added_by.first_name}{" "}
                                  {item.added_by.last_name}
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
                                      <StyledMenuItem>
                                        <ListItemText primary="Download" />
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
        open={modals[0]}
        keepMounted
        onClose={() => setModals([!modals[0], modals[1]])}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">Web Link</DialogTitle>
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
                label="link"
                variant="filled"
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
              />
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setModals([false, modals[1]])}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={handleClose} color="primary">
            Add Link
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={modals[1]}
        keepMounted
        onClose={() => setModals([modals[0], !modals[1]])}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">Upload</DialogTitle>
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
            <Button
              onClick={() => setModals(modals[0], false)}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => setModals(modals[0], false)}
              color="primary"
            >
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
  listItem: {
    backgroundColor: theme.palette.grey[100],
    borderLeft: "4px solid #fff",
    marginBottom: 7,
  },
}));

export default InstructionalMaterials;
