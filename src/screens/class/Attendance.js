import React, { useState } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  useTheme,
  Box,
  Paper,
  FormControl,
  InputLabel,
  List,
  CircularProgress,
  withStyles,
  Menu,
  Button,
  ListItem,
  ListItemIcon,
  IconButton,
  ListItemSecondaryAction,
  Checkbox,
  ListItemText,
  Select,
  Grow,
  MenuItem,
  Typography,
  makeStyles,
  Avatar,
} from "@material-ui/core";
import "react-calendar/dist/Calendar.css";
import { connect } from "react-redux";
import { SearchInput } from "../../components/Selectors";
import Pagination, { getPageItems } from "../../components/Pagination";
import ArrowDownwardOutlinedIcon from "@material-ui/icons/ArrowDownwardOutlined";
import ArrowUpwardOutlinedIcon from "@material-ui/icons/ArrowUpwardOutlined";
import { CheckBoxAction } from "../../components/CheckBox";
import MoreHorizOutlinedIcon from "@material-ui/icons/MoreHorizOutlined";
import store from "../../components/redux/store";
import { Calendar } from "react-calendar";

const useStyles = makeStyles((theme) => ({
  calendar: {
    "& .react-calendar__month-view__days__day--weekend": {
      color: theme.palette.primary.main,
    },
    "& .react-calendar__tile--now": {
      background: theme.palette.primary.main + "!important",
      "& > abbr": {
        color: "#fff!important",
      },
    },
  },
}));

function Attendance(props) {
  const theme = useTheme();
  const { class_id } = props.match.params;
  const query = require("query-string").parse(window.location.search);
  const styles = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savingId, setSavingId] = useState([]);
  const [selectedSched, setSelectedSched] = useState(
    query.date && query.date !== -1 ? parseInt(query.date) : -1
  );
  const [attendance, setAttendance] = useState(
    store.getState().classDetails[class_id].students
  );
  const [page, setPage] = useState(query.page ? parseInt(query.page) : 1);
  const [search, setSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState({});
  const isTeacher = props.userInfo.user_type === "t" ? true : false;
  const [sortType, setSortType] = useState("DESCENDING");

  const data = {
    labels: ["Attendees", "Absentees"],
    datasets: [
      {
        data: [20, 2],
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
        ],
      },
    ],
  };
  const getFilteredAttendance = () =>
    attendance.filter(
      (a) => JSON.stringify(a).toLowerCase().indexOf(search) >= 0
    );
  const _selectAll = () => {
    let filtered = getPageItems(getFilteredAttendance(), page);
    if (Object.keys(selectedItems).length === filtered.length) {
      setSelectedItems({});
      return;
    }
    let b = {};
    filtered.forEach((a) => {
      b[a.id] = a;
    });
    setSelectedItems(b);
  };
  const _handleSort = () => {
    if (sortType === "ASCENDING") {
      setAttendance(
        attendance.sort((a, b) =>
          ("" + a.first_name).localeCompare(b.first_name)
        )
      );
      setSortType("DESCENDING");
    } else {
      setAttendance(
        attendance.sort((a, b) =>
          ("" + b.first_name).localeCompare(a.first_name)
        )
      );
      setSortType("ASCENDING");
    }
  };
  const _handleSearch = (e) => {
    setSearch(e.toLowerCase());
  };
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
  return (
    <Box>
      <Box
        display="flex"
        width="100%"
        justifyContent="center"
        alignItems="stretch"
      >
        <Box p={2} width="100%">
          <Box
            flexDirection="row"
            flexWrap="wrap"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <div>
              {/* <ScheduleSelector
                onChange={(schedId) => setSelectedSched(schedId)}
                schedule={selectedSched >= 0 ? selectedSched : schedule_id}
                match={props.match}
              />
              &nbsp; */}
              <FormControl variant="outlined">
                <InputLabel>Status</InputLabel>
                <Select label="Status" value="present" padding={10}>
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="present">Present</MenuItem>
                  <MenuItem value="absent">Absent</MenuItem>
                </Select>
              </FormControl>
            </div>
            <SearchInput
              onChange={(e) => {
                _handleSearch(e);
              }}
            />
          </Box>
        </Box>
      </Box>
      <Box width="100%" display="flex">
        <Box width="100%" alignSelf="flex-start" m={2}>
          <Paper>
            <Box p={2}>
              {!Object.keys(selectedItems).length ? (
                <List>
                  <ListItem
                    ContainerComponent="li"
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      backgroundColor: "transparent",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {isTeacher && (
                        <ListItemIcon>
                          <Checkbox
                            checked={
                              Object.keys(selectedItems).length ===
                              getPageItems(getFilteredAttendance(), page).length
                                ? getPageItems(getFilteredAttendance(), page)
                                    .length > 0
                                  ? true
                                  : false
                                : false
                            }
                            onChange={() => {
                              _selectAll();
                            }}
                          />
                        </ListItemIcon>
                      )}

                      <Button size="small" onClick={_handleSort}>
                        <ListItemText primary="Name" />
                        {sortType === "ASCENDING" ? (
                          <ArrowUpwardOutlinedIcon />
                        ) : (
                          <ArrowDownwardOutlinedIcon />
                        )}
                      </Button>
                    </div>

                    <Typography variant="body1" style={{ marginRight: 10 }}>
                      REMARKS
                    </Typography>
                    <ListItemSecondaryAction></ListItemSecondaryAction>
                  </ListItem>
                </List>
              ) : (
                <CheckBoxAction
                  checked={
                    Object.keys(selectedItems).length ===
                    getPageItems(getFilteredAttendance(), page).length
                  }
                  onSelect={_selectAll}
                  onCancel={() => setSelectedItems({})}
                />
              )}
              <Grow in={attendance ? true : false}>
                <List>
                  {getPageItems(getFilteredAttendance(), page).map(
                    (item, index) => (
                      <ListItem
                        key={index}
                        className={styles.listItem}
                        style={{
                          borderColor:
                            item.status === "published"
                              ? theme.palette.success.main
                              : "#fff",
                        }}
                      >
                        {isTeacher && (
                          <ListItemIcon>
                            <Checkbox
                              onClick={() => _handleSelectOption(item)}
                              checked={selectedItems[item.id] ? true : false}
                            />
                          </ListItemIcon>
                        )}
                        {saving && savingId.indexOf(item.id) >= 0 && (
                          <div className={styles.itemLoading}>
                            <CircularProgress />
                          </div>
                        )}
                        <ListItemIcon>
                          <Avatar alt={item.first_name} src="" />
                        </ListItemIcon>
                        <ListItemText
                          style={{ marginRight: 10 }}
                          primary={item.first_name + " " + item.last_name}
                          secondary={
                            Math.round(Math.random())
                              ? Math.floor(Math.random() * (5 - 1) + 1) +
                                " absences"
                              : ""
                          }
                        />
                        <Typography
                          variant="body1"
                          style={{ marginRight: 10 }}
                        ></Typography>
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
                            ></StyledMenu>
                          )}
                        </ListItemSecondaryAction>
                      </ListItem>
                    )
                  )}
                </List>
              </Grow>
            </Box>

            <Box p={2}>
              <Pagination
                icon={search ? "search" : "face"}
                emptyTitle={search ? "Nothing Found" : false}
                emptyMessage={
                  search
                    ? "Try a different keyword."
                    : "There's no students to list here."
                }
                match={props.match}
                page={page}
                onChange={(p) => setPage(p)}
                count={getFilteredAttendance().length}
              />
            </Box>
          </Paper>
        </Box>
        <Box m={2} style={{ marginLeft: 0 }} width={330}>
          <Paper style={{ marginBottom: theme.spacing(2) }}>
            <Box p={4}>
              <Typography
                style={{ fontWeight: "bold", marginBottom: theme.spacing(2) }}
              >
                Total Students
              </Typography>
              <Doughnut data={data} />
            </Box>
          </Paper>
          <Paper>
            <Box p={4} className={styles.calendar}>
              <Typography
                style={{ fontWeight: "bold", marginBottom: theme.spacing(2) }}
              >
                Schedule
              </Typography>
              <Calendar style={{ margin: "0 auto" }} />
            </Box>
          </Paper>
        </Box>
      </Box>
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
export default connect((states) => ({ userInfo: states.userInfo }))(Attendance);
