import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import {
  Typography,
  makeStyles,
  Box,
  useTheme,
  Avatar,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Icon,
  Chip,
  useMediaQuery,
} from "@material-ui/core";
import { SearchInput } from "../../components/Selectors";
import { AvatarGroup } from "@material-ui/lab";

function Todo(props) {
  const { class_id, schedule_id } = props.match.params;
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const styles = useStyles();
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState({});
  const getRandomStudents = () => {
    let s = props.classDetails[class_id].students;
    let x = Math.rand(0, s.length - 5);
    let y = Math.rand(x, s.length);
    return s.slice(x, y);
  };
  useEffect(() => {
    setStudents({
      TODO: getRandomStudents(),
      DOING: getRandomStudents(),
      DONE: getRandomStudents(),
    });
  }, []);
  return (
    <Box
      style={{
        ...(isTablet
          ? {
              margin: theme.spacing(2),
            }
          : {
              margin: "0 auto",
              marginTop: theme.spacing(2),
            }),
        maxWidth: props.maxWidth || "auto",
      }}
    >
      {props.classDetails[class_id] && (
        <React.Fragment>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <AvatarGroup max={3}>
                {props.classDetails[class_id].students
                  .sort((a, b) => a.id - b.id)
                  .sort((a, b) => (a.preferences.profile_picture ? -1 : 0))
                  .map((s) => (
                    <Avatar
                      alt={s.first_name}
                      src={s.preferences.profile_picture}
                    />
                  ))}
              </AvatarGroup>
            </Box>
            <Box width={278}>
              <SearchInput onChange={(s) => setSearch(s.toLowerCase())} />
            </Box>
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            flexDirection={isTablet ? "column" : "row"}
            className={styles.root}
          >
            {props.classDetails[class_id] && (
              <React.Fragment>
                <ProgressTracker
                  {...props}
                  title="TODO"
                  color="#9F190F"
                  background="#FFC7C7"
                  students={students.TODO?.filter(
                    (q) => JSON.stringify(q).toLowerCase().indexOf(search) >= 0
                  )}
                />
                <ProgressTracker
                  {...props}
                  title="DOING"
                  color="#866800"
                  background="#FBE8A5"
                  students={students.DOING?.filter(
                    (q) => JSON.stringify(q).toLowerCase().indexOf(search) >= 0
                  )}
                />
                <ProgressTracker
                  {...props}
                  title="DONE"
                  color="#007F3C"
                  background="#B0E9CB"
                  students={students.DONE?.filter(
                    (q) => JSON.stringify(q).toLowerCase().indexOf(search) >= 0
                  )}
                />
              </React.Fragment>
            )}
          </Box>
        </React.Fragment>
      )}
    </Box>
  );
}

function ProgressTracker(props) {
  const theme = useTheme();
  const styles = useStyles();
  const [expanded, setExpanded] = useState();
  const {
    title,
    color = theme.palette.info.main,
    background = theme.palette.info.main + "1a",
  } = props;
  return (
    <Box className="progress-container">
      <Box className="progress-title" style={{ background }}>
        <Typography
          style={{ fontWeight: "bold", fontSize: 14, color, padding: 12 }}
        >
          {title}
        </Typography>
      </Box>
      <Box width="100%" style={{ marginTop: 5 }}>
        {props.students &&
          props.students.map((s) => (
            <ExpansionPanel
              className={styles.expansion}
              //   expanded={expanded === s.id}
              style={{ boxShadow: "none", border: "none" }}
              onChange={() => {
                if (s.id !== expanded) setExpanded(s.id);
                else setExpanded(null);
              }}
            >
              <ExpansionPanelSummary
                expandIcon={<Icon>expand_more</Icon>}
                style={{ padding: "0 7.3px" }}
              >
                <Box display="flex" alignItems="center">
                  <Avatar
                    src={s.preferences.profile_picture}
                    alt={s.first_name}
                    style={{ width: 30, height: 30 }}
                  />
                  <Typography style={{ marginLeft: 7 }}>
                    {s.first_name + " " + s.last_name}
                  </Typography>
                </Box>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className="expansion-details">
                <Box width="100%" display="block">
                  <Typography style={{ fontWeight: "bold", marginBottom: 7 }}>
                    Activity Title
                  </Typography>
                  <Chip
                    label="ACTIVITY"
                    color="primary"
                    size="small"
                    style={{
                      fontWeight: "bold",
                      background: "#E4D9FF",
                      color: "#5520D0",
                    }}
                  />
                </Box>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          ))}
      </Box>
    </Box>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(2),
    margin: "0 auto",
    height: "100%",
    "& .progress-container": {
      flex: 1,
      height: "100%",
      [theme.breakpoints.up("lg")]: {
        overflow: "hidden auto",
        marginRight: theme.spacing(2),
        "&:last-of-type": {
          marginRight: 0,
        },
      },
      "& .progress-title": {
        borderRadius: "4px 4px 0 0",
        boxShadow:
          theme.palette.type === "dark"
            ? "none"
            : "0 2px 6px 0 rgb(241, 230, 255)",
        height: 44,
        position: "sticky",
        top: 0,
        zIndex: 11,
        display: "flex",
        alignItems: "center",
      },
    },
  },
  expansion: {
    background: "#F5F0FA",
    boxShadow: "none",
    border: "none",
    marginTop: theme.spacing(1),
    "& .expansion-details": {
      margin: 8,
      marginTop: -10,
      zIndex: 5,
      position: "relative",
      background: "#fff",
      borderRadius: 4,
      padding: 8,
      boxShadow: "0 2px 6px 0 #EDE1FB",
    },
  },
}));

export default connect((states) => ({
  classDetails: states.classDetails,
}))(Todo);
