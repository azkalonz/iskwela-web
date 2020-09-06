import MomentUtils from "@date-io/moment";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import {
  KeyboardDatePicker,
  KeyboardTimePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import moment from "moment";
import { useHistory } from "react-router-dom";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Api from "../../api";
import {
  CreateDialog as CreateDiag,
  RecorderDialog,
} from "../../components/dialogs";
import Pagination from "../../components/Pagination";
import { ScheduleSelector, SearchInput } from "../../components/Selectors";
import socket from "../../components/socket.io";
import { Table } from "../../components/Table";
import { fetchData } from "../Admin/Dashboard";
const qs = require("query-string");

function Freestyle(props) {
  const theme = useTheme();
  const history = useHistory();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const query = qs.parse(window.location.search);
  const { class_id } = props.match.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingId, setSavingId] = useState([]);
  const [data, setData] = useState([]);
  const [currentItem, setCurrentItem] = useState();

  const [selectedSched, setSelectedSched] = useState(
    parseInt(query.date) || -1
  );
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const isTeacher = useMemo(
    () => props.userInfo?.user_type === "t" || props.userInfo?.user_type === "a"
  );
  const getFilteredData = useCallback(
    (a = data) =>
      [...a]
        .filter((q, i) => {
          let index = a.findIndex((qq) => qq.id === q.id);
          return index === i;
        })
        .filter((q) =>
          selectedSched < 0 ? true : q.schedule.id === selectedSched
        )
        .filter(
          (q) =>
            JSON.stringify(q).toLowerCase().indexOf(search.toLowerCase()) >= 0
        ),
    [data, search, selectedSched]
  );
  const _handleFileOption = (option, file) => {
    switch (option) {
      case "view":
        handleViewItem(file);
        return;
      // case "edit":
      //   handleOpen("CREATE_DIALOG");
      //   setForm({
      //     ...file,
      //     category_id: file.category.id,
      //   });
      //   return;
      // case "publish":
      //   _handleUpdateStatus(file, true);
      //   return;
      // case "unpublish":
      //   _handleUpdateStatus(file, false);
      //   return;
      // case "delete":
      //   _handleDelete(file);
      //   return;
      // default:
      //   return;
    }
  };
  const toggleCreateAssignment = useCallback((t) => {
    let r = window.location.search.replaceUrlParam("create_assignment", t);
    props.history.push(r);
  }, []);
  useEffect(() => {
    fetchData({
      before: () => {
        setLoading(true);
      },
      send: async () => await Api.get("/api/assignments/v2/" + class_id),
      after: (data) => {
        let allData = [];
        if (data?.length) {
          data = data.map((q) => {
            const {
              publishedAssignments,
              unpublishedAssignments,
              from,
              id,
              to,
              teacher,
            } = q;
            const schedule = { from, id, to, teacher };
            if (unpublishedAssignments?.length) {
              unpublishedAssignments.forEach((qq) => {
                allData.push({ ...qq, schedule });
              });
            }
            if (publishedAssignments?.length) {
              unpublishedAssignments.forEach((qq) => {
                allData.push({ ...qq, schedule });
              });
            }
          });
        }
        setData(allData || []);
        setLoading(false);
      },
    });
  }, []);
  const handleViewItem = (item) => {
    history.push("?id=" + item.id);
    setCurrentItem(item);
  };
  return (
    <React.Fragment>
      {!loading && (
        <React.Fragment>
          <Box
            m={2}
            display="flex"
            justifyContent={isTeacher ? "space-between" : "flex-end"}
            flexWrap="wrap"
            alignItems="center"
          >
            {isTeacher && (
              <Button
                variant="contained"
                style={{ order: isMobile ? 2 : 0, fontWeight: "bold" }}
                color="secondary"
                onClick={() => {
                  toggleCreateAssignment(true);
                }}
              >
                Add New Assignment
              </Button>
            )}
            <Box display="flex" alignItems="flex-end">
              <ScheduleSelector
                onChange={(schedId) => setSelectedSched(schedId)}
                schedule={selectedSched >= 0 ? selectedSched : -1}
                match={props.match}
              />
              <SearchInput onChange={(e) => setSearch(e)} />
            </Box>
          </Box>
          <Table
            headers={[
              { id: "title", title: "Title", width: "60%" },
              //status
              { id: "due_date", title: "Due Date", width: "40%" },
            ]}
            saving={saving}
            savingId={savingId}
            data={data}
            filtered={(a) => getFilteredData(a)}
            actions={{
              onDelete: (i, done) => null,
              onUpdate: (a, s, done) => null,
              _handleFileOption: (opt, file) => _handleFileOption(opt, file),
            }}
            options={[
              {
                name: "View",
                value: "view",
              },
            ]}
            teacherOptions={[
              { name: "Edit", value: "edit" },
              { name: "Publish", value: "publish" },
              { name: "Unpublish", value: "unpublish" },
              { name: "Delete", value: "delete" },
            ]}
            pagination={{
              render: (
                <Pagination
                  page={page}
                  match={props.match}
                  noLink
                  icon={
                    search ? (
                      <img
                        src="/hero-img/search.svg"
                        width={180}
                        style={{ padding: "50px 0" }}
                      />
                    ) : (
                      <img
                        src="/hero-img/undraw_Progress_tracking_re_ulfg.svg"
                        width={180}
                        style={{ padding: "50px 0" }}
                      />
                    )
                  }
                  emptyTitle={search ? "Nothing Found" : false}
                  emptyMessage={
                    search
                      ? "Try a different keyword."
                      : "There's no Assignment yet."
                  }
                  onChange={(p) => setPage(p)}
                  count={getFilteredData().length}
                />
              ),
              page,
              onChange: (p) => setPage(p),
            }}
            rowRender={(item, { disabled = false }) => (
              <Box
                display="flex"
                width="100%"
                justifyContent="space-between"
                onClick={() => !disabled && _handleFileOption("view", item)}
              >
                <ListItemText
                  style={{ width: "60%" }}
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
                  primary={item.title}
                  secondary={item.description?.substr(0, 100) + "..."}
                />
                <Box width="40%">
                  {moment(item.due_date).format("LL hh:mm A")}
                </Box>
              </Box>
            )}
          />
        </React.Fragment>
      )}
      {loading && (
        <Box width="100%" display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      )}
      <CreateDialog
        {...props}
        open={query.create_assignment === "true" ? true : false}
        onClose={() => toggleCreateAssignment(false)}
      />
    </React.Fragment>
  );
}
function CreateDialog(props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { class_id, schedule_id } = props.match.params;
  const [form, setForm] = useState({});
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [modals, setModals] = useState({});
  const [confirmed, setConfirmed] = useState(null);
  const handleOpen = (name) => {
    let m = { ...modals };
    m[name] = true;
    setModals(m);
  };
  const handleCreateContent = () => {
    window.open("/content-maker?callback=send_item&to=" + socket.id, "_blank");
  };
  const handleClose = (name) => {
    let m = { ...modals };
    m[name] = false;
    setModals(m);
  };
  const getCategories = async () => {
    props.onLoad(true);
    try {
      let sub = await Api.get(
        "/api/schooladmin/subject-grading-categories/" +
          props.classes[class_id]?.subject?.id
      );
      let cat = await Api.get("/api/schooladmin/school-grading-categories");
      cat = cat.map((q) => {
        let i = sub.findIndex(
          (qq) => parseInt(q.id) === parseInt(qq.category_id)
        );
        if (i >= 0) {
          return {
            ...q,
            category_percentage: parseFloat(sub[i].category_percentage),
          };
        } else return q;
      });
      setCategories(cat);
    } catch (e) {
      console.log(e);
    }
    props.onLoad(false);
  };
  useEffect(() => {
    getCategories();
  }, []);
  return (
    <React.Fragment>
      {confirmed && (
        <Dialog
          open={confirmed ? true : false}
          onClose={() => setConfirmed(null)}
        >
          <DialogTitle>{confirmed.title}</DialogTitle>
          <DialogContent>{confirmed.message}</DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                if (confirmed.no) confirmed.no();
                else setConfirmed(null);
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
      )}
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
        onSave={(a, cb = null) => {
          // handle save audio
          cb && cb();
        }}
      />
      <CreateDiag
        title="Create Assignment"
        open={props.open ? true : false}
        onClose={props.onClose}
        leftContent={
          <React.Fragment>
            <TextField
              label="Title"
              variant="outlined"
              className={[
                props.theme === "dark" ? "themed-input light" : "themed-input",
              ].join(" ")}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              fullWidth
            />
            <MuiPickersUtilsProvider utils={MomentUtils}>
              <Box
                display="flex"
                width="100%"
                justifyContent="space-between"
                alignItems="flex-end"
                marginBottom={2}
                flexWrap={isMobile ? "wrap" : "nowrap"}
                style={{ marginTop: isMobile ? 30 : 0 }}
              >
                <Box width={isMobile ? "100%" : "50%"} display="flex">
                  <KeyboardDatePicker
                    disableToolbar
                    variant="inline"
                    format="MMM DD, YYYY"
                    margin="normal"
                    label="Due Date"
                    className={
                      (props.theme === "dark"
                        ? "themed-input light"
                        : "themed-input") + " date"
                    }
                    value={form.date || new Date()}
                    onChange={(date) =>
                      setForm({
                        ...form,
                        date: moment(date).format("YYYY-MM-DD"),
                      })
                    }
                    KeyboardButtonProps={{
                      "aria-label": "change date",
                    }}
                    style={{
                      marginRight: theme.spacing(2),
                      flex: 1,
                    }}
                  />
                  <KeyboardTimePicker
                    margin="normal"
                    format="hh:mm A"
                    label={String.fromCharCode(160)}
                    value={form.time || new Date()}
                    KeyboardButtonProps={{
                      "aria-label": "change time",
                    }}
                    style={{
                      flex: 1,
                      marginRight: isMobile ? 0 : theme.spacing(2),
                    }}
                    className={
                      (props.theme === "dark"
                        ? "themed-input light"
                        : "themed-input") + " date"
                    }
                    onChange={(date) => {
                      setForm({
                        ...form,
                        time: moment(date).format("LL hh:mm A"),
                      });
                    }}
                  />
                </Box>
                <Box
                  width={isMobile ? "100%" : "50%"}
                  display="flex"
                  flexWrap={isMobile ? "wrap" : "nowrap"}
                  alignItems="flex-end"
                >
                  <TextField
                    label="Total Score"
                    variant="outlined"
                    className={[
                      props.theme === "dark"
                        ? "themed-input light"
                        : "themed-input",
                    ].join(" ")}
                    defaultValue={form.total_score}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        total_score: parseInt(e.target.value),
                      })
                    }
                    type="number"
                    style={{
                      flex: 1,
                      marginRight: theme.spacing(2),
                      ...(isMobile
                        ? {
                            minWidth: "100%",
                            marginBottom: 30,
                          }
                        : {}),
                    }}
                  />
                  <FormControl
                    variant="outlined"
                    fullWidth
                    className={
                      (props.theme === "dark"
                        ? "themed-input light"
                        : "themed-input") + " select"
                    }
                    style={{ flex: 1 }}
                  >
                    <InputLabel>Grading Category</InputLabel>
                    {categories && (
                      <Select
                        label="Grading Category"
                        variant="outlined"
                        padding={10}
                        value={parseInt(form.grading_category)}
                        onChange={(e) => {
                          setForm({
                            ...form,
                            grading_category: e.target.value,
                          });
                        }}
                        style={{ paddingTop: 17 }}
                      >
                        {categories.map((c, index) => (
                          <MenuItem value={c.id} key={index}>
                            {c.category}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  </FormControl>
                </Box>
              </Box>
            </MuiPickersUtilsProvider>
            <TextField
              label="Description"
              className={[
                props.theme === "dark" ? "themed-input light" : "themed-input",
              ].join(" ")}
              variant="outlined"
              rows={10}
              style={{ marginTop: 13 }}
              value={form.description}
              multiline={true}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              fullWidth
            />
          </React.Fragment>
        }
        rightContent={<Box>attachment button & save assignment</Box>}
      />
    </React.Fragment>
  );
}

export default Freestyle;
