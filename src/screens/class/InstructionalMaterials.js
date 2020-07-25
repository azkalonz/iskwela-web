import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grow,
  Icon,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Menu,
  MenuItem,
  Snackbar,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  withStyles,
} from "@material-ui/core";
import AttachFileOutlinedIcon from "@material-ui/icons/AttachFileOutlined";
import CloudUploadOutlinedIcon from "@material-ui/icons/CloudUploadOutlined";
import ExpandMoreOutlinedIcon from "@material-ui/icons/ExpandMoreOutlined";
import InsertLinkOutlinedIcon from "@material-ui/icons/InsertLinkOutlined";
import MuiAlert from "@material-ui/lab/Alert";
import { saveAs } from "file-saver";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Api from "../../api";
import { GooglePicker, RecorderDialog } from "../../components/dialogs";
import FileUpload, { stageFiles } from "../../components/FileUpload";
import FileViewer from "../../components/FileViewer";
import Pagination from "../../components/Pagination";
import Progress from "../../components/Progress";
import store from "../../components/redux/store";
import {
  ScheduleSelector,
  SearchInput,
  StatusSelector,
} from "../../components/Selectors";
import socket from "../../components/socket.io";
import { Table as MTable } from "../../components/Table";
import UserData, { asyncForEach } from "../../components/UserData";

const queryString = require("query-string");
function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function InstructionalMaterials(props) {
  const query = queryString.parse(window.location.search);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { class_id, option_name, schedule_id } = props.match.params;
  const [materials, setMaterials] = useState();
  const [search, setSearch] = useState("");
  const [modals, setModals] = useState({});
  const [addNewFileAnchor, setAddNewFileAnchor] = useState(null);
  const classSched = props.classSched;
  const isTeacher = props.userInfo.user_type === "t" ? true : false;
  const styles = useStyles();
  const [form, setForm] = useState({});
  const [hasFiles, setHasFiles] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState();
  const [confirmed, setConfirmed] = useState();
  const [saving, setSaving] = useState(false);
  const [savingId, setSavingId] = useState([]);
  const [selectedSched, setSelectedSched] = useState(
    query.date && query.date !== -1 ? parseInt(query.date) : -1
  );
  const [selectedStatus, setSelectedStatus] = useState(
    isTeacher
      ? query.status && query.status !== "all"
        ? query.status
        : null
      : "published"
  );
  const [page, setPage] = useState(query.page ? parseInt(query.page) : 1);
  const [selectedItems, setSelectedItems] = useState({});
  const cellheaders = [
    { id: "title", title: "Title", width: "50%" },
    { id: "added_by", title: "Added By", width: "50%", align: "flex-end" },
  ];

  const _handleFileOption = (option, file) => {
    switch (option) {
      case "view":
        _handleOpenFile(file);
        return;
      case "open-material":
        _markMaterial(file, "not-done");
        return;
      case "close-material":
        _markMaterial(file, "done");
        return;
      case "publish":
        updateMaterialStatus(file, "publish");
        return;
      case "unpublish":
        updateMaterialStatus(file, "unpublish");
        return;
      case "download":
        _downloadFile(file);
        return;
      case "delete":
        _handleRemoveMaterial(file);
        return;
      default:
        return;
    }
  };
  useEffect(() => {
    _getMaterials();
  }, [props.classDetails]);
  const _getMaterials = () => {
    if (!classSched) return;
    try {
      let a = props.classDetails[class_id].schedules;
      let allMaterials = [];
      a.forEach((s) => {
        s.materials.forEach((ss) => {
          allMaterials.push({ ...ss, schedule_id: s.id });
        });
      });
      setMaterials(allMaterials);
    } catch (e) {
      //handle invalid schedule
    }
  };

  useEffect(
    () =>
      setSelectedSched(
        query.date && query.date !== -1 ? parseInt(query.date) : -1
      ),
    [query.date]
  );

  const _downloadFile = async (file) => {
    setErrors(null);
    setSaving(true);
    setSavingId([...savingId, file.id]);
    let res = await Api.postBlob(
      "/api/download/class/material/" + file.id
    ).then((resp) => (resp.ok ? resp.blob() : null));
    if (res) saveAs(new File([res], file.title, { type: res.type }));
    else setErrors(["Cannot download file."]);
    setSaving(false);
    setSavingId([]);
  };

  const handleClickOpen = (event) => {
    if (event.currentTarget) setAddNewFileAnchor(event.currentTarget);
    else {
      let m = { ...modals };
      m[event] = true;
      setModals(m);
    }
  };

  const handleClose = (name) => {
    if (name) {
      let m = { ...modals };
      m[name] = false;
      setModals(m);
    }
    setAddNewFileAnchor(null);
  };

  const _handleOpenFile = async (f) => {
    const controller = new AbortController();
    const signal = controller.signal;
    let filetoopen = {};
    if (!f.uploaded_file) {
      filetoopen = {
        ...filetoopen,
        title: f.title,
        url: f.resource_link,
        error: false,
      };
    } else {
      filetoopen = {
        title: f.title,
        error: false,
        onCancel: () => controller.abort(),
      };
      props.openFile(filetoopen);
      let res = await Api.postBlob("/api/download/class/material/" + f.id, {
        config: {
          signal,
        },
      }).then((resp) => (resp.ok ? resp.blob() : null));
      if (res)
        filetoopen = {
          ...filetoopen,
          title: f.title,
          url: URL.createObjectURL(
            new File([res], "activity-material-" + f.id, { type: res.type })
          ),
          error: false,
          type: res.type,
        };
      else {
        setErrors(["Cannot open file."]);
        filetoopen = {
          ...filetoopen,
          title: f.title,
          error: true,
        };
      }
    }
    props.openFile(filetoopen);
  };

  const _handleMaterialAddLink = async () => {
    if (!form) {
      setErrors(["Invalid title"]);
      return;
    }
    if (!form.title) {
      setErrors(["Invalid url"]);
      return;
    }
    if (!form.url) {
      setErrors(["Invalid link"]);
      return;
    }
    let err = [];
    setErrors(null);
    setSaving(true);
    let res;
    try {
      res = await Api.post("/api/class/material/save", {
        body: {
          class_id,
          schedule_id: selectedSched >= 0 ? selectedSched : classSched,
          ...form,
        },
      });
    } catch (e) {
      setSuccess(true);
      let newScheduleDetails = await UserData.updateScheduleDetails(
        class_id,
        selectedSched >= 0 ? selectedSched : schedule_id
      );
      socket.emit("update schedule details", {
        id: class_id,
        details: newScheduleDetails,
      });
      setForm({});
      handleClose("WEB_LINK");
      setSavingId([]);
      setSaving(false);
      setErrors(null);
      // setErrors(["Oops! Something went wrong. Please try again."]);
      // setSavingId([]);
      // setSaving(false);
    }
    if (res) {
      if (res.errors) {
        for (let e in res.errors) {
          err.push(res.errors[e][0]);
        }
      }
      if (!err.length) {
        setSuccess(true);
        let newScheduleDetails = await UserData.updateScheduleDetails(
          class_id,
          selectedSched >= 0 ? selectedSched : schedule_id
        );
        socket.emit("update schedule details", {
          id: class_id,
          details: newScheduleDetails,
        });
        setForm({});
        handleClose("WEB_LINK");
      } else setErrors(err);
      setSavingId([]);
      setSaving(false);
      setErrors(null);
    }
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
      body.append(
        "schedule_id",
        selectedSched >= 0 ? selectedSched : schedule_id
      );
      body.append("title", form.title);
      let res = await FileUpload.upload("/api/upload/class/material", {
        body,
        onUploadProgress: (event, source) =>
          store.dispatch({
            type: "SET_PROGRESS",
            id: option_name,
            data: {
              title: file.name,
              loaded: event.loaded,
              total: event.total,
              onCancel: source,
            },
          }),
      });

      if (res.errors) {
        for (let e in res.errors) {
          err.push(res.errors[e][0]);
        }
      }
    });
    if (!err.length) {
      setSuccess(true);
      let newScheduleDetails = await UserData.updateScheduleDetails(
        class_id,
        selectedSched >= 0 ? selectedSched : schedule_id
      );
      socket.emit("update schedule details", {
        id: class_id,
        details: newScheduleDetails,
      });
      setForm({});
      setHasFiles(false);
      FileUpload.removeFiles("materials");
      handleClose("MATERIALS");
    } else setErrors(["Oops! Something went wrong. Please try again."]);
    setSavingId([]);
    setSaving(false);
  };
  const updateMaterialStatus = async (item, stat) => {
    let { id } = item;
    setConfirmed(null);
    setErrors(null);
    setSuccess(false);
    setConfirmed({
      title:
        stat.charAt(0).toUpperCase() +
        stat.substr(1, stat.length) +
        " Material",
      message: "Are you sure you want to " + stat + " this material?",
      yes: async () => {
        setSavingId([...savingId, id]);
        setSaving(true);
        setConfirmed(null);
        let res;
        try {
          res = await Api.post("/api/class/material/" + stat + "/" + id);
        } catch (e) {
          setErrors(["Oops! Something went wrong. Please try again."]);
        }
        if (res) {
          if (!res.errors) {
            setSuccess(true);
            let newScheduleDetails = await UserData.updateScheduleDetails(
              class_id,
              item.schedule_id
            );
            socket.emit("update schedule details", {
              id: class_id,
              details: newScheduleDetails,
            });
          } else {
            let err = [];
            for (let e in res.errors) {
              err.push(res.errors[e][0]);
            }
            setErrors(err);
          }
        }
        setSavingId([]);
        setSaving(false);
      },
    });
  };
  const _handleUpdateMaterialsStatus = (a, s, callback = null) => {
    let stat = s ? "Publish" : "Unpublish";
    setConfirmed({
      title: stat + " " + Object.keys(a).length + " Materials",
      message: "Are you sure to " + stat + " this materials?",
      yes: async () => {
        setErrors(null);
        setSaving(true);
        setConfirmed(null);
        setSavingId([...savingId, ...Object.keys(a).map((i) => a[i].id)]);
        await asyncForEach(Object.keys(a), async (i) => {
          try {
            await Api.post(
              "/api/class/material/" + stat.toLowerCase() + "/" + a[i].id
            );
          } catch (e) {
            setErrors(["Oops! Something went wrong. Please try again."]);
            setSaving(false);
            setSavingId([]);

            return;
          }
        });
        if (!errors) {
          if (selectedSched < 0) {
            let newClassDetails = await UserData.updateClassDetails(class_id);
            UserData.updateClass(class_id, newClassDetails[class_id]);
            socket.emit(
              "new class details",
              JSON.stringify({ details: newClassDetails, id: class_id })
            );
          } else {
            let newScheduleDetails = await UserData.updateScheduleDetails(
              class_id,
              selectedSched
            );
            socket.emit("update schedule details", {
              id: class_id,
              details: newScheduleDetails,
            });
          }
        }
        callback && callback();
        setSavingId([]);
        setSaving(false);
      },
    });
  };
  const _markMaterial = async (activity, mark) => {
    let done = mark === "done" ? true : false;
    setConfirmed({
      title: (done ? "Close " : "Open ") + " Class Material",
      message:
        "Are you sure to " +
        (done ? "Close" : "Open") +
        " this Class Material?",
      yes: async () => {
        setErrors(null);
        setSaving(true);
        setConfirmed(null);
        setSavingId([...savingId, activity.id]);
        let res = await Api.post(
          "/api/class/class-material/mark-" + mark + "/" + activity.id
        );
        if (res) {
          let newClassDetails = await UserData.updateClassDetails(class_id);
          UserData.updateClass(class_id, newClassDetails[class_id]);
          socket.emit(
            "new class details",
            JSON.stringify({ details: newClassDetails, id: class_id })
          );
        }

        setSavingId([]);
        setSaving(false);
      },
    });
  };
  const _handleRemoveMaterial = (activity) => {
    setConfirmed({
      title: "Remove Material",
      message: "Are you sure you want to remove this material?",
      yes: async () => {
        setErrors(null);
        setSaving(true);
        setConfirmed(null);
        setSavingId([...savingId, activity.id]);
        let res;
        try {
          res = await Api.post(
            "/api/teacher/remove/class-material/" + activity.id,
            {
              body: {
                id: activity.id,
              },
            }
          );
        } catch (e) {
          setErrors(["Oops! Something went wrong. Please try again."]);
        }
        if (res) {
          if (!res.errors) {
            setSuccess(true);
            let newScheduleDetails = await UserData.updateScheduleDetails(
              class_id,
              activity.schedule_id
            );
            socket.emit("update schedule details", {
              id: class_id,
              details: newScheduleDetails,
            });
          } else {
            let err = [];
            for (let e in res.errors) {
              err.push(res.errors[e][0]);
            }
            setErrors(err);
          }
        }
        setSavingId([]);

        setSaving(false);
      },
    });
  };
  const _handleRemoveMaterials = (materials, callback = null) => {
    setConfirmed({
      title: "Remove " + Object.keys(materials).length + " materials",
      message: "Are you sure to remove this materials?",
      yes: async () => {
        setErrors(null);
        setSaving(true);
        setConfirmed(null);
        setSavingId([
          ...savingId,
          ...Object.keys(materials).map((i) => materials[i].id),
        ]);
        let err = [];
        await asyncForEach(Object.keys(materials), async (i) => {
          let id = parseInt(i);
          let res;
          try {
            await Api.post("/api/teacher/remove/class-material/" + id, {
              body: {
                id,
              },
            });
          } catch (e) {
            setErrors(["Oops! Something went wrong. Please try again."]);
          }
          if (res) {
            if (res.errors) {
              for (let e in res.errors) {
                err.push(res.errors[e][0]);
              }
              setErrors(err);
            }
          }
        });
        if (!errors) {
          if (selectedSched < 0) {
            let newClassDetails = await UserData.updateClassDetails(class_id);
            UserData.updateClass(class_id, newClassDetails[class_id]);
            socket.emit(
              "new class details",
              JSON.stringify({ details: newClassDetails, id: class_id })
            );
          } else {
            let newScheduleDetails = await UserData.updateScheduleDetails(
              class_id,
              selectedSched
            );
            socket.emit("update schedule details", {
              id: class_id,
              details: newScheduleDetails,
            });
          }
        }
        callback && callback();
        setSavingId([]);
        setSaving(false);
      },
    });
  };

  const getFilteredMaterials = (ma = materials) =>
    ma
      .filter((i) => (isTeacher ? true : i.status === "published"))
      .filter((a) => (selectedStatus ? selectedStatus === a.status : true))
      .filter((i) => JSON.stringify(i).toLowerCase().indexOf(search) >= 0)
      .filter((a) =>
        selectedSched >= 0 ? selectedSched === a.schedule_id : true
      )
      .reverse();
  const _handleSelectOption = (item) => {
    if (selectedItems[item.id]) {
      let b = { ...selectedItems };
      delete b[item.id];
      setSelectedItems(b);
      return;
    }
    let newitem = {};
    newitem[item.id] = item;
    setSelectedItems({ ...selectedItems, ...newitem });
  };
  const handleFileCreator = () => {
    socket.off("get item");
    socket.on("get item", async (details) => {
      if (details.type === "ATTACH_INSTRUCTIONAL_MATERIALS") {
        const { url, b64, title } = details.data;
        setForm({ ...form, url, title });
        handleClickOpen("WEB_LINK");
      }
    });
    window.open(
      "/content-maker?origin=ATTACH_INSTRUCTIONAL_MATERIALS&upload=true&callback=send_item&to=" +
        socket.id,
      "_blank"
    );
  };
  const saveAudio = async (audio) => {
    let title = prompt("Enter file name ");
    let file = new File([audio], title + " 🎧" || "Audio 🎧", {
      type: audio.type,
    });
    let body = new FormData();
    body.append("class_id", class_id);
    body.append("file", file);
    body.append(
      "schedule_id",
      selectedSched >= 0 ? selectedSched : schedule_id
    );
    body.append("title", file.name || "Audio 🎧");
    let res = await FileUpload.upload("/api/upload/class/material", {
      body,
      onUploadProgress: (event, source) =>
        store.dispatch({
          type: "SET_PROGRESS",
          id: option_name,
          data: {
            title: file.name,
            loaded: event.loaded,
            total: event.total,
            onCancel: source,
          },
        }),
    });
    if (!res.errors) {
      let newScheduleDetails = await UserData.updateScheduleDetails(
        class_id,
        selectedSched >= 0 ? selectedSched : schedule_id
      );
      socket.emit("update schedule details", {
        id: class_id,
        details: newScheduleDetails,
      });
      setSuccess(true);
    }
  };
  return (
    <Box width="100%" alignSelf="flex-start">
      <RecorderDialog
        open={modals.VOICE_RECORDER}
        onClose={(done, cb = null) =>
          done
            ? handleClose("VOICE_RECORDER")
            : setConfirmed({
                title: "Cancel",
                message: "Do you want to cancel the voice recording?",
                yes: () => {
                  cb && cb();
                  handleClose("VOICE_RECORDER");
                  setConfirmed(null);
                },
              })
        }
        onSave={(a) => saveAudio(a)}
      />
      <GooglePicker
        auth={(s) => (modals.OPEN_GDRIVE = s)}
        form={form}
        onSelect={({ url, name }) => {
          if (url && name) {
            let l = url;
            l = l.replace(l.substr(l.indexOf("/view"), l.length), "/preview");
            let newM = {
              title: name,
              resource_link: l,
            };
            setForm({ ...form, title: name, url: l });
            handleClickOpen("WEB_LINK");
          }
        }}
      />
      {props.dataProgress[option_name] && (
        <Progress id={option_name} data={props.dataProgress[option_name]} />
      )}
      <Dialog
        open={confirmed ? true : false}
        onClose={() => setConfirmed(null)}
      >
        <DialogTitle>{confirmed && confirmed.title}</DialogTitle>
        <DialogContent>{confirmed && confirmed.message}</DialogContent>
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
            onClick={() => confirmed.yes()}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      {errors &&
        errors.map((e, i) => (
          <Snackbar
            key={i}
            open={errors ? true : false}
            autoHideDuration={6000}
            onClose={() => setErrors(null)}
          >
            <Grow in={true}>
              <Alert
                key={i}
                style={{ marginBottom: 9 }}
                severity="error"
                onClose={() => {
                  setErrors(() => {
                    let e = [...errors];
                    e.splice(i, 1);
                    return e;
                  });
                }}
              >
                {e}
              </Alert>
            </Grow>
          </Snackbar>
        ))}
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Success
        </Alert>
      </Snackbar>
      <Box
        m={2}
        display="flex"
        justifyContent={isTeacher ? "space-between" : "flex-end"}
        flexWrap="wrap"
        alignItems="center"
      >
        {isTeacher && (
          <div style={isMobile ? { width: "100%", order: 2 } : {}}>
            <Button
              variant="contained"
              color="secondary"
              style={{ fontWeight: "bold" }}
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
              onClose={() => handleClose()}
            >
              <StyledMenuItem
                onClick={() => modals.OPEN_GDRIVE && modals.OPEN_GDRIVE()}
              >
                <ListItemIcon>
                  <Icon>storage</Icon>
                </ListItemIcon>
                <ListItemText primary="Google Drive" />
              </StyledMenuItem>
              <StyledMenuItem onClick={() => handleFileCreator()}>
                <ListItemIcon>
                  <Icon>create</Icon>
                </ListItemIcon>
                <ListItemText primary="Editor" />
              </StyledMenuItem>
              <StyledMenuItem onClick={() => handleClickOpen("WEB_LINK")}>
                <ListItemIcon>
                  <InsertLinkOutlinedIcon />
                </ListItemIcon>
                <ListItemText primary="Web Link" />
              </StyledMenuItem>
              <StyledMenuItem onClick={() => handleClickOpen("MATERIALS")}>
                <ListItemIcon>
                  <CloudUploadOutlinedIcon />
                </ListItemIcon>
                <ListItemText primary="Upload" />
              </StyledMenuItem>
              <StyledMenuItem onClick={() => handleClickOpen("VOICE_RECORDER")}>
                <ListItemIcon>
                  <Icon>mic</Icon>
                </ListItemIcon>
                <ListItemText primary="Audio" />
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
          style={{ width: isMobile ? "100%" : "auto" }}
        >
          <Box
            style={{
              ...(isMobile
                ? {
                    order: 2,
                    width: "100%",
                    justifyContent: "space-between",
                    margin: "10px 0",
                  }
                : {}),
              ...{
                display: "flex",
              },
            }}
          >
            <Box flex={1}>
              <ScheduleSelector
                onChange={(schedId) => setSelectedSched(schedId)}
                schedule={selectedSched >= 0 ? selectedSched : -1}
                match={props.match}
              />
            </Box>
            {!isMobile && String.fromCharCode(160)}
            {isTeacher && (
              <Box flex={1} style={{ marginLeft: 10 }}>
                <StatusSelector
                  onChange={(statusId) => setSelectedStatus(statusId)}
                  status={selectedStatus ? selectedStatus : "all"}
                  match={props.match}
                />
              </Box>
            )}
            {!isMobile && String.fromCharCode(160)}
          </Box>
          <SearchInput onChange={(e) => setSearch(e.toLowerCase())} />
        </Box>
      </Box>

      {materials && (
        <MTable
          page={page}
          headers={cellheaders}
          data={materials}
          saving={saving}
          savingId={savingId}
          pagination={{
            render: (
              <Pagination
                icon={search ? "search" : "library_books"}
                emptyTitle={search ? "Nothing Found" : false}
                emptyMessage={
                  search
                    ? "Try a different keyword."
                    : "There's no Class Materials yet."
                }
                match={props.match}
                page={page}
                onChange={(p) => setPage(p)}
                count={getFilteredMaterials().length}
              />
            ),
            page,
            onChangePage: (p) => setPage(p),
          }}
          options={[
            {
              name: "View",
              value: "view",
            },
          ]}
          teacherOptions={[
            { name: "Close Material", value: "close-material" },
            { name: "Open Material", value: "open-material" },
            { name: "Download", value: "download" },
            { name: "Publish", value: "publish" },
            { name: "Unpublish", value: "unpublish" },
            { name: "Delete", value: "delete" },
          ]}
          filtered={(a) => getFilteredMaterials(a)}
          actions={{
            onDelete: (s, done) => _handleRemoveMaterials(s, done),
            onUpdate: (a, s, done) => _handleUpdateMaterialsStatus(a, s, done),
            _handleFileOption: (opt, file) => _handleFileOption(opt, file),
          }}
          rowRenderMobile={(item, { disabled = false }) => (
            <Box
              display="flex"
              flexWrap="wrap"
              flexDirection="column"
              justifyContent="space-between"
              width="90%"
              style={{ padding: "30px 0" }}
              onClick={() => !disabled && _handleFileOption("view", item)}
            >
              <Box width="100%" marginBottom={1}>
                <Typography
                  style={{
                    fontWeight: "bold",
                    color: "#38108d",
                    fontSize: "1em",
                  }}
                >
                  TITLE
                </Typography>
                <Typography variant="body1">{item.title}</Typography>
              </Box>
              <Box width="100%">
                <Typography
                  style={{
                    fontWeight: "bold",
                    color: "#38108d",
                    fontSize: "1em",
                  }}
                >
                  ADDED BY
                </Typography>
                <Box display="flex" alignItems="center">
                  {item.added_by.first_name} {item.added_by.last_name}
                </Box>
              </Box>
            </Box>
          )}
          rowRender={(item, { disabled = false }) => (
            <Box
              width="100%"
              display="flex"
              onClick={() => !disabled && _handleFileOption("view", item)}
            >
              <Box width="50%" overflow="hidden" maxWidth="50%">
                <ListItemText
                  primary={item.title}
                  secondaryTypographyProps={{
                    style: {
                      width: isMobile ? "80%" : "100%",
                      whiteSpace: "pre-wrap",
                    },
                  }}
                  primaryTypographyProps={{
                    style: {
                      whiteSpace: "pre-wrap",
                    },
                  }}
                />
              </Box>
              <Box
                justifyContent="flex-end"
                width="50%"
                overflow="hidden"
                display="flex"
                maxWidth="50%"
              >
                <Typography
                  variant="body1"
                  style={{ marginRight: 45 }}
                  className={styles.hideonmobile}
                >
                  {item.added_by.first_name} {item.added_by.last_name}
                </Typography>
              </Box>
            </Box>
          )}
        />
      )}
      <Dialog
        open={modals.WEB_LINK || false}
        keepMounted
        onClose={() => {
          setForm({});
          handleClose("WEB_LINK");
        }}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">Web Link</DialogTitle>
        <DialogContent id="alert-dialog-slide-description">
          <Box display="flex" flexWrap="wrap">
            <TextField
              label="Title"
              className={styles.textField}
              InputLabelProps={{
                shrink: true,
              }}
              value={form.title ? form.title : ""}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              fullWidth
            />
            <TextField
              label="link"
              InputLabelProps={{
                shrink: true,
              }}
              value={form.url ? form.url : ""}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setForm({});
              handleClose("WEB_LINK");
            }}
            variant="outlined"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={_handleMaterialAddLink}
            color="primary"
            disabled={saving}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={modals.MATERIALS || false}
        keepMounted
        onClose={() => {
          setForm({});
          handleClose("MATERIALS");
        }}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">Upload</DialogTitle>
        <DialogContent id="alert-dialog-slide-description">
          <Box display="flex" flexWrap="wrap">
            <TextField
              label="Title"
              className={styles.textField}
              value={form.title ? form.title : ""}
              onChange={(e) => setForm({ title: e.target.value })}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
            />
          </Box>
          <List>
            {hasFiles &&
              FileUpload.getFiles("materials").map((f, i) => (
                <ListItem key={i}>
                  <ListItemText primary={f.uploaded_file} />
                </ListItem>
              ))}
          </List>
        </DialogContent>

        <DialogActions style={{ justifyContent: "space-between" }}>
          <div>
            <input
              style={{ display: "none" }}
              type="file"
              id="materials-upload"
              onChange={(e) => {
                let isfiles = e.target.files.length ? true : false;
                if (!isfiles) FileUpload.removeFiles("materials");
                stageFiles("materials", e.target.files);
                setHasFiles(isfiles);
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
                  setForm({});
                  handleClose("MATERIALS");
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
    borderLeft: "4px solid",
    marginBottom: 7,
  },
}));

export default connect((states) => ({
  userInfo: states.userInfo,
  classDetails: states.classDetails,
  dataProgress: states.dataProgress,
}))(InstructionalMaterials);
