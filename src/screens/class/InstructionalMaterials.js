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
  Snackbar,
  Paper,
  CircularProgress,
  Grow,
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
import FileViewer from "../../components/FileViewer";
import { connect } from "react-redux";
import FileUpload, { stageFiles } from "../../components/FileUpload";
import MuiAlert from "@material-ui/lab/Alert";
import UserData, { asyncForEach } from "../../components/UserData";
import Api from "../../api";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}
const queryString = require("query-string");

function InstructionalMaterials(props) {
  const { class_id, schedule_id } = props.match.params;
  const [materials, setMaterials] = useState();
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("DESCENDING");
  const [modals, setModals] = useState([false, false]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [addNewFileAnchor, setAddNewFileAnchor] = useState(null);
  const classSched = props.classSched;
  const isTeacher = props.userInfo.user_type === "t" ? true : false;
  const styles = useStyles();
  const [file, setFile] = useState();
  const [fileViewerOpen, setfileViewerOpen] = useState(false);
  const [form, setForm] = useState();
  const [hasFiles, setHasFiles] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState();
  const [confirmed, setConfirmed] = useState();

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
      case "delete":
        _handleRemoveMaterial(file);
        return;
    }
  };

  const _getMaterials = () => {
    if (!classSched) return;
    try {
      let a =
        props.classDetails[class_id].schedules[props.match.params.schedule_id];
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

  const _handleMaterialUpload = async () => {
    if (!form) {
      setErrors(["Invalid title"]);
      return;
    }
    let m = document.querySelector("#materials-upload");
    if (!m.files.length) {
      setErrors(["Attach file/s"]);
      return;
    }
    let err = [];
    setErrors(null);
    setSaving(true);
    await asyncForEach(m.files, async (file) => {
      let body = new FormData();
      body.append("class_id", class_id);
      body.append("file", file);
      body.append("schedule_id", schedule_id);
      body.append("title", form.title);
      let res = await FileUpload.upload("/api/upload/class/material", {
        body,
      });
      if (res.errors) {
        for (let e in res.errors) {
          err.push(res.errors[e][0]);
        }
      }
    });
    if (!err.length) {
      setSuccess(true);
      await UserData.updateClassDetails(class_id);
      FileUpload.removeFiles("materials");
      setHasFiles(false);
      setModals([modals[0], false]);
    } else setErrors(err);
    setSaving(true);
    setErrors(null);
  };
  const _handleRemoveMaterial = (activity) => {
    setConfirmed({
      yes: async () => {
        setErrors(null);
        setSaving(true);
        setConfirmed(null);
        let id = parseInt(activity.id.replace("item-", ""));
        let res = await Api.post("/api/teacher/remove/class-material/" + id, {
          body: {
            id,
          },
        });
        console.log(res);
        if (!res.errors) {
          setSuccess(true);
          await UserData.updateClassDetails(class_id);
        } else {
          let err = [];
          for (let e in res.errors) {
            err.push(res.errors[e][0]);
          }
          setErrors(err);
        }
        setSaving(false);
      },
    });
  };
  return (
    <Box width="100%" alignSelf="flex-start">
      <Dialog open={confirmed} onClose={() => setConfirmed(null)}>
        <DialogTitle>Remove File</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this file?
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setConfirmed(null);
            }}
          >
            No
          </Button>

          <Button
            color="primary"
            variant="contained"
            disabled={saving}
            onClick={() => confirmed.yes()}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Success
        </Alert>
      </Snackbar>
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
                        .reverse()
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
                                {saving && (
                                  <div className={styles.itemLoading}>
                                    <CircularProgress />
                                  </div>
                                )}
                                <ListItemIcon>
                                  <InsertDriveFileOutlinedIcon />
                                </ListItemIcon>
                                <ListItemText
                                  primary={item.title}
                                  secondary={
                                    item.resource_link
                                      ? item.resource_link
                                      : item.uploaded_file
                                  }
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
                                      <StyledMenuItem
                                        onClick={() =>
                                          _handleFileOption("view", item)
                                        }
                                      >
                                        <ListItemText primary="View" />
                                      </StyledMenuItem>
                                      <StyledMenuItem>
                                        <ListItemText primary="Download" />
                                      </StyledMenuItem>
                                      {isTeacher && (
                                        <div>
                                          <StyledMenuItem>
                                            <ListItemText primary="Edit" />
                                          </StyledMenuItem>
                                          <StyledMenuItem
                                            onClick={() =>
                                              _handleFileOption("delete", item)
                                            }
                                          >
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
        onClose={() => {
          if (!saving) {
            FileUpload.removeFiles("materials");
            setHasFiles(false);
            setForm(null);
            setModals([modals[0], !modals[1]]);
          }
        }}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">Upload</DialogTitle>
        <DialogContent>
          <Box style={{ marginBottom: 18 }}>
            {errors &&
              errors.map((e, i) => (
                <Grow in={true}>
                  <Alert key={i} style={{ marginBottom: 9 }} severity="error">
                    {e}
                  </Alert>
                </Grow>
              ))}
          </Box>
          <DialogContentText id="alert-dialog-slide-description">
            <Box display="flex" flexWrap="wrap">
              <TextField
                label="Title"
                className={styles.textField}
                value={form && form.title}
                onChange={(e) => setForm({ title: e.target.value })}
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
              />
            </Box>
          </DialogContentText>
          {hasFiles &&
            FileUpload.getFiles("materials").map((f) => (
              <div>{f.uploaded_file}</div>
            ))}
        </DialogContent>
        <DialogActions style={{ justifyContent: "space-between" }}>
          <div>
            <input
              style={{ display: "none" }}
              type="file"
              id="materials-upload"
              onChange={(e) => {
                stageFiles("materials", e.target.files);
                setHasFiles(true);
              }}
              multiple
            />
            <Button
              onClick={() =>
                document.querySelector("#materials-upload").click()
              }
              variant="outlined"
              style={{ float: "left" }}
              disabled={saving ? true : false}
            >
              <AttachFileOutlinedIcon />
              Add
            </Button>
          </div>
          <DialogActions>
            <Button
              onClick={() => {
                if (!saving) {
                  FileUpload.removeFiles("materials");
                  setHasFiles(false);
                  setForm(null);
                  setModals([modals[0], false]);
                }
              }}
              disabled={saving ? true : false}
              variant="outlined"
            >
              Cancel
            </Button>
            <div style={{ position: "relative" }}>
              <Button
                variant="contained"
                onClick={_handleMaterialUpload}
                className={styles.wrapper}
                color="primary"
                disabled={saving ? true : false}
              >
                Upload
              </Button>
              {saving && (
                <CircularProgress size={24} className={styles.buttonProgress} />
              )}
            </div>
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
  itemLoading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    zIndex: 5,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    "& > div": {
      position: "relative",
      zIndex: 2,
    },
    "&::before": {
      content: "''",
      position: "absolute",
      backgroundColor: theme.palette.type === "dark" ? "#111" : "#fff",
      opacity: 0.7,
      top: 0,
      zIndex: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
  },
  buttonProgress: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  wrapper: { margin: theme.spacing(1), position: "relative" },
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

export default connect((states) => ({
  userInfo: states.userInfo,
  classDetails: states.classDetails,
}))(InstructionalMaterials);
