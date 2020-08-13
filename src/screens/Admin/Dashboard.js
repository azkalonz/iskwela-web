import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { Table } from "../../components/Table";
import Pagination from "../../components/Pagination";
import { SearchInput } from "../../components/Selectors";
import { Button } from "@material-ui/core";
import { CalendarProvider, Weekdays, Dates } from "../../components/Calendar";

export default function VerticalTabs() {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className={classes.root}>
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs example"
        className={classes.tabs}
      >
        <Tab label="Classes" {...a11yProps(0)} />
        <Tab label="Sections" {...a11yProps(1)} />
        <Tab label="Students" {...a11yProps(2)} />
        <Tab label="Parents" {...a11yProps(3)} />
      </Tabs>
      <Box width="100%">
        <TabPanel value={value} index={0}>
          <Classes />
        </TabPanel>
        <TabPanel value={value} index={1}>
          Item Two
        </TabPanel>
        <TabPanel value={value} index={2}>
          Item Three
        </TabPanel>
        <TabPanel value={value} index={3}>
          Item Four
        </TabPanel>
      </Box>
    </div>
  );
}

function Classes(props) {
  const data = [
    {
      id: 1,
      name: "English 101",
      teacher: "Mark Joseph Judaya",
      description: "Class",
      frequency: "M,W,F",
    },
    {
      id: 3,
      name: "English 103",
      teacher: "Mark Joseph Judaya",
      frequency: "M,W,F",
      description: "Class",
    },
    {
      id: 2,
      name: "English 102",
      teacher: "Mark Joseph Judaya",
      frequency: "M,W,F",
      description: "Class",
    },
  ];
  const columnHeaders = useMemo(() => [
    {
      id: "id",
      title: "ID",
      width: "5%",
    },
    { id: "name", title: "Name", width: "23%" },
    { id: "description", title: "Description", width: "23%" },
    { id: "teacher", title: "Teacher", width: "23%" },
    { id: "frequency", title: "Frequency", width: "23%" },
  ]);
  const _handleFileOption = (option, item) => {};
  return (
    <React.Fragment>
      <Box
        width="100%"
        display="flex"
        justifyContent="space-between"
        marginBottom={4}
      >
        <Box>
          <Button variant="contained" color="secondary">
            New Class
          </Button>
        </Box>
        <Box>
          <SearchInput onChange={(e) => null} />
        </Box>
      </Box>
      <Table
        headers={columnHeaders}
        filtered={(t) => data}
        style={{ margin: 0 }}
        data={data}
        actions={{
          _handleFileOption: (opt, item) => _handleFileOption(opt, item),
        }}
        options={[
          { key: "view", name: "View Details" },
          { key: "edit", name: "Edit" },
        ]}
        pagination={{
          page: 1,
          render: <Pagination page={1} count={1} nolink />,
        }}
        rowRender={(item) => (
          <Box p={2} display="flex" width="100%" onClick={() => alert()}>
            <Box width="5%">
              <Typography>{item.id}</Typography>
            </Box>
            <Box width="23%">
              <Typography>{item.name}</Typography>
            </Box>
            <Box width="23%">
              <Typography>{item.description}</Typography>
            </Box>
            <Box width="23%">
              <Typography>{item.teacher}</Typography>
            </Box>
            <Box width="23%">
              <Typography>{item.frequency}</Typography>
            </Box>
          </Box>
        )}
      />
      <CalendarProvider
        style={{ minWidth: 240 }}
        variant={"large"}
        events={[]}
        schedules={[]}
      >
        <Weekdays />
        <Dates />
      </CalendarProvider>
    </React.Fragment>
  );
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    display: "flex",
    height: "100vh",
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));
