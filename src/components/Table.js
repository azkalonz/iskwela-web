import React, { useState, useEffect } from "react";
import {
  Box,
  Icon,
  List,
  ListItem,
  ListItemText,
  Grow,
  ListItemSecondaryAction,
  withStyles,
  Menu,
  MenuItem,
  useTheme,
  Typography,
  ListItemIcon,
  CircularProgress,
  IconButton,
  Checkbox,
  useMediaQuery,
  makeStyles,
} from "@material-ui/core";
import { getPageItems } from "./Pagination";
import { connect } from "react-redux";
import { CheckBoxAction } from "./CheckBox";
import moment from "moment";

export function Table(props) {
  const styles = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [anchorEl, setAnchorEl] = useState(null);
  const saving = props.saving;
  const savingId = props.savingId;
  const [selectedItems, setSelectedItems] = useState({});
  const [sortType, setSortType] = useState({ order: "asc" });
  const [items, setItems] = useState([]);
  const isTeacher = true;
  const page = props.pagination.page;

  useEffect(() => {
    if (props.data) setItems(props.data);
  }, [props.data]);
  const _selectAll = () => {
    let filtered = getPageItems(
      props.filtered(items),
      page,
      props.pagination.itemsPerPage || 10
    );
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
  const _handleSort = (sortBy) => {
    if (sortType.order === "asc") {
      setItems(() => {
        if (isNaN(Date.parse(items[0][sortBy])))
          return items.sort(
            (a, b) =>
              "" +
              JSON.stringify(a[sortBy]).localeCompare(JSON.stringify(b[sortBy]))
          );
        else
          return items.sort(
            (a, b) => new Date(a[sortBy]) - new Date(b[sortBy])
          );
      });
      setSortType({ id: sortBy, order: "desc" });
    } else {
      setItems(() => {
        if (isNaN(Date.parse(items[0][sortBy])))
          return items.sort(
            (b, a) =>
              "" +
              JSON.stringify(a[sortBy]).localeCompare(JSON.stringify(b[sortBy]))
          );
        else
          return items.sort(
            (b, a) => new Date(a[sortBy]) - new Date(b[sortBy])
          );
      });
      setSortType({ id: sortBy, order: "asc" });
    }
  };
  return (
    <React.Fragment>
      <Box width="100%" alignSelf="flex-start">
        <Box m={2}>
          {!Object.keys(selectedItems).length && items.length ? (
            <List
              style={{
                padding: 0,
                marginBottom: -8,
                background: !isMobile ? "#fff" : "",
              }}
            >
              <ListItem
                ContainerComponent="li"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingLeft: 20,
                  backgroundColor: "transparent",
                  boxShadow: !isMobile ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  {isTeacher && (
                    <ListItemIcon>
                      <Checkbox
                        checked={
                          Object.keys(selectedItems).length ===
                          getPageItems(
                            props.filtered(items),
                            page,
                            props.pagination.itemsPerPage || 10
                          ).length
                            ? getPageItems(
                                props.filtered(items),
                                page,
                                props.pagination.itemsPerPage || 10
                              ).length > 0
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
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    width="100%"
                    alignItems="center"
                  >
                    {isMobile && (
                      <React.Fragment>
                        <Typography
                          style={{
                            fontWeight: "bold",
                            fontSize: "1em",
                          }}
                        >
                          Select All
                        </Typography>
                        <Box>
                          <IconButton
                            disabled={page <= 1}
                            onClick={() => {
                              props.pagination.onChangePage(page - 1);
                            }}
                          >
                            <Icon>navigate_before</Icon>
                          </IconButton>
                          <IconButton
                            disabled={
                              page >=
                              Math.ceil(
                                items.length /
                                  (props.pagination.itemsPerPage || 10)
                              )
                            }
                            onClick={() => {
                              props.pagination.onChangePage(page + 1);
                            }}
                          >
                            <Icon>navigate_next</Icon>
                          </IconButton>
                        </Box>
                      </React.Fragment>
                    )}
                    {!isMobile &&
                      props.headers.map((c) => (
                        <Box
                          display="flex"
                          width={c.width ? c.width : "auto"}
                          style={{ paddingRight: 15 }}
                          onClick={() => _handleSort(c.id)}
                        >
                          <Typography
                            variant="body1"
                            style={{
                              marginRight: 10,
                              fontWeight: "bold",
                              fontSize: "1em",
                            }}
                          >
                            {c.title.toUpperCase()}
                          </Typography>

                          <div
                            style={{ opacity: sortType.id === c.id ? 1 : 0 }}
                          >
                            {sortType.order === "asc" ? (
                              <Icon fontSize="small">arrow_upward</Icon>
                            ) : (
                              <Icon fontSize="small">arrow_downward</Icon>
                            )}
                          </div>
                        </Box>
                      ))}
                  </Box>
                </div>
              </ListItem>
            </List>
          ) : Object.keys(selectedItems).length ? (
            <CheckBoxAction
              checked={
                Object.keys(selectedItems).length ===
                props.filtered(items).length
              }
              onSelect={() => _selectAll()}
              onDelete={
                props.actions["onDelete"]
                  ? () => props.actions["onDelete"](selectedItems)
                  : null
              }
              onCancel={() => setSelectedItems({})}
              onUnpublish={
                props.actions["onUpdate"]
                  ? () => props.actions["onUpdate"](selectedItems, 0)
                  : null
              }
              onPublish={
                props.actions["onUpdate"]
                  ? () => props.actions["onUpdate"](selectedItems, 1)
                  : null
              }
            />
          ) : null}
          <Grow in={items ? true : false}>
            <List>
              {getPageItems(
                props.filtered(items),
                page,
                props.pagination.itemsPerPage || 10
              ).map((item, index) => (
                <ListItem
                  key={index}
                  className={styles.listItem}
                  style={{
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    borderColor:
                      item.status === "published"
                        ? theme.palette.success.main
                        : theme.palette.error.main,
                    backgroundColor: index % 2 ? "#f8f8f8" : "#fff",
                  }}
                >
                  {isTeacher && (
                    <ListItemIcon>
                      <Checkbox
                        checked={selectedItems[item.id] ? true : false}
                        onChange={() => {
                          _handleSelectOption(item);
                        }}
                      />
                    </ListItemIcon>
                  )}
                  {saving && savingId.indexOf(item.id) >= 0 && (
                    <div className={styles.itemLoading}>
                      <CircularProgress />
                    </div>
                  )}
                  {!isMobile
                    ? props.rowRender && props.rowRender(item)
                    : props.rowRenderMobile && props.rowRenderMobile(item)}
                  <ListItemSecondaryAction
                    style={{ ...(isMobile ? { top: 30 } : {}) }}
                  >
                    <IconButton
                      onClick={(event) =>
                        setAnchorEl(() => {
                          let a = {};
                          a[item.id] = event.currentTarget;
                          return { ...anchorEl, ...a };
                        })
                      }
                      color="primary"
                    >
                      <Icon>{isMobile ? "more_vert" : "more_horiz"}</Icon>
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
                        {props.options.map((t) => (
                          <StyledMenuItem
                            onClick={() => {
                              if (props.actions["_handleFileOption"]) {
                                props.actions["_handleFileOption"](
                                  t.value,
                                  item
                                );
                                setAnchorEl(() => {
                                  let a = {};
                                  a[item.id] = null;
                                  return { ...anchorEl, ...a };
                                });
                              }
                            }}
                          >
                            <ListItemText primary={t.name} />
                          </StyledMenuItem>
                        ))}
                        {isTeacher && (
                          <div>
                            {props.teacherOptions &&
                              props.teacherOptions.map((t) => (
                                <StyledMenuItem
                                  onClick={() => {
                                    if (props.actions["_handleFileOption"]) {
                                      props.actions["_handleFileOption"](
                                        t.value,
                                        item
                                      );
                                      setAnchorEl(() => {
                                        let a = {};
                                        a[item.id] = null;
                                        return { ...anchorEl, ...a };
                                      });
                                    }
                                  }}
                                >
                                  <ListItemText primary={t.name} />
                                </StyledMenuItem>
                              ))}
                          </div>
                        )}
                      </StyledMenu>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Grow>
        </Box>
        {props.pagination && props.pagination.render && (
          <Box p={2}>{props.pagination.render}</Box>
        )}
      </Box>
    </React.Fragment>
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
  listItem: {
    padding: theme.spacing(1) + " 0px",
    borderLeft: "4px solid",
    marginBottom: 7,
  },
}));
export default connect((states) => ({ userInfo: states.userInfo }))(Table);
