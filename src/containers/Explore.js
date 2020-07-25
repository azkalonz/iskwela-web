import {
  Backdrop,
  Box,
  Divider,
  Icon,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  Paper,
  Slide,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import Drawer from "../components/Drawer";
import NavBar from "../components/NavBar";
import { makeLinkTo } from "../components/router-dom";

const rightPanelOptions = [
  {
    title: (
      <Box display="flex" alignItems="center">
        <Box marginRight={2}>DepEd commons</Box>
        <Icon fontSize="small">launch</Icon>
      </Box>
    ),
    link: "https://commons.deped.gov.ph/",
    id: "deped-commons",
    external: true,
  },
  {
    title: (
      <Box display="flex" alignItems="center">
        <Box marginRight={2}>Community Resources</Box>
        <Icon fontSize="small">launch</Icon>
      </Box>
    ),
    external: true,
    link:
      "https://drive.google.com/drive/folders/1GSoS1CBQhMHAu85COWNADT_PsP5EYeOK?usp=sharing",
    id: "community",
    external: true,
  },
  {
    title: "Quizizz",
    link: "https://quizizz.com/admin",
    id: "quizizz",
    image: "/explore/explore.svg",
  },
  {
    title: "Jumpstart",
    link: "https://activity.jumpstart.com/#/",
    id: "jumpstart",
    image: "/explore/explore.svg",
  },
  {
    title: (
      <Box display="flex" alignItems="center">
        <Box marginRight={2}>Kahoot</Box>
        <Icon fontSize="small">launch</Icon>
      </Box>
    ),
    link: "http://kahoot.com/",
    id: "kahoot",
    external: true,
  },
  {
    title: (
      <Box display="flex" alignItems="center">
        <Box marginRight={2}>Mentimeter</Box>
        <Icon fontSize="small">launch</Icon>
      </Box>
    ),
    link: "https://www.mentimeter.com/",
    id: "mentimeter",
    external: true,
  },
];

function Explore(props) {
  const query = require("query-string").parse(window.location.search);
  const theme = useTheme();
  const themeColor = theme.palette.primary.main;
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const { screen_name } = props.match.params;
  const [currentIframe, setCurrentIframe] = useState(
    ((screen_name
      ? rightPanelOptions.find((q) => q.id === screen_name)?.link
      : null): null)
  );
  const history = useHistory();
  const styles = useStyles();
  const [collapsePanel, setCollapsePanel] = useState(true);
  const userInfo = props.userInfo;
  const isTeacher = userInfo.user_type === "t" ? true : false;
  const [rightPanelLoading, setRightPanelLoading] = useState(true);
  useEffect(() => {
    if (isMobile) setCollapsePanel(false);
    else setCollapsePanel(true);
    window.panelSlideTransition = setInterval(() => {
      let s = document.querySelector("#panel-slide");
      if (s) {
        s.style.transition =
          "width 225ms cubic-bezier(0, 0, 0.2, 1) 0ms,transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms";
        window.clearInterval(window.panelSlideTransition);
      }
    }, 500);
  }, [isMobile]);
  const adjustIframe = () => {
    let c = document.querySelector("#right-panel-content");
    let n = document.querySelector("#nav-bar");
    if (c && n) c.style.height = window.innerHeight - n.clientHeight + "px";
    else if (c) c.style.height = "100%";
  };
  useEffect(() => {
    if (query.hidepanel) {
      setCollapsePanel(false);
    }
    adjustIframe();
    window.addEventListener("resize", adjustIframe);
  }, []);
  useEffect(() => {
    let i = document.querySelector("#explore-iframe");
    setRightPanelLoading(true);
    i.style.display = "none";
    if (currentIframe) {
      i.src = currentIframe;
      i.onload = function () {
        i.style.display = "block";
        setRightPanelLoading(false);
      };
    } else {
      let x = rightPanelOptions.find((q) => q.id === "jumpstart");
      history.push("/explore/" + x.id);
      setCurrentIframe(x.link);
    }
  }, [currentIframe]);
  const panelOption = (p) => {
    const handleExpand = () => {
      if (p.id && !p.external) {
        history.push(makeLinkTo(["explore", p.id]));
        setCurrentIframe(p.link);
      } else {
        window.open(p.link, "_blank");
      }
      if (isMobile && !p.children) setCollapsePanel(false);

      if (!p.children || !p.children.filter((c) => !c.hidden).length) return;
      let i = {
        expanded: document.querySelector("#is-expanded-" + p.id),
        notexpanded: document.querySelector("#not-expanded-" + p.id),
      };
      i.expanded.style.display = "none";
      i.notexpanded.style.display = "none";
      let o = document.querySelector("#panel-option-" + p.id);
      let h = o.firstElementChild.clientHeight;
      if (o.classList.value.indexOf("opened") < 0) {
        if (p.isChild) {
          let parent = o.parentElement.parentElement;
          let parentHeight = parent.clientHeight - 48;
          parent.style.height = parentHeight + h + "px";
        }
        o.style.height = h + "px";
        i.expanded.style.display = "block";
      } else {
        if (p.isChild) {
          let parent = o.parentElement.parentElement;
          let parentHeight = parent.firstElementChild.clientHeight - h + 48;
          parent.style.height = parentHeight + "px";
        }
        o.style.height = "48px";
        i.notexpanded.style.display = "block";
      }
      o.classList.toggle("opened");
    };
    return !p.external || !p.shrink ? (
      <div
        key={p.id}
        id={"panel-option-" + p.id}
        className="panel-option-container"
        style={{ ...(p.children ? { height: 48, overflow: "hidden" } : {}) }}
      >
        <div
          className="wrapper"
          style={{ ...(p.isChild ? { background: "rgba(0,0,0,0.2)" } : {}) }}
        >
          <Typography
            component="div"
            onClick={() => {
              handleExpand();
            }}
            style={{ cursor: "pointer" }}
          >
            <ListItem
              id={
                screen_name === p.id ||
                (p.children &&
                  p.children.findIndex((q) => q.id === screen_name) >= 0)
                  ? "selected-option"
                  : ""
              }
              className={
                screen_name === p.id ||
                (p.children &&
                  p.children.findIndex((q) => q.id === screen_name) >= 0)
                  ? "selected panel-option"
                  : "panel-option"
              }
              button
              style={{
                ...(p.isChild && !p.shrink ? { paddingLeft: 71 } : {}),
              }}
            >
              {!p.isChild && typeof p.icon === "string" ? (
                <ListItemIcon>
                  <span className={"panel-icon " + p.icon}></span>
                </ListItemIcon>
              ) : (
                p.icon
              )}
              <ListItemText
                primary={!p.shrink ? p.title : p.title[0]}
                primaryTypographyProps={{
                  style: { fontWeight: !p.shrink ? 400 : "bold" },
                }}
                style={{ textAlign: !p.shrink ? "left" : "center" }}
              />
              {p.children && p.children.filter((c) => !c.hidden).length ? (
                <ListItemSecondaryAction style={{ opacity: !p.shrink ? 1 : 0 }}>
                  <Icon id={"not-expanded-" + p.id}>navigate_next</Icon>
                  <Icon id={"is-expanded-" + p.id} style={{ display: "none" }}>
                    expand_more
                  </Icon>
                </ListItemSecondaryAction>
              ) : null}
            </ListItem>
          </Typography>
          {props.dataProgress[p.id] &&
            p.id !== screen_name &&
            Math.ceil(
              (props.dataProgress[p.id].loaded /
                props.dataProgress[p.id].total) *
                100
            ) < 100 && (
              <LinearProgress
                variant="determinate"
                value={Math.ceil(
                  (props.dataProgress[p.id].loaded /
                    props.dataProgress[p.id].total) *
                    100
                )}
              />
            )}
          {p.children &&
            Object.keys(p.children)
              .filter((s) => !p.children[s].hidden)
              .map((k, id) =>
                panelOption({
                  ...p.children[k],
                  isChild: true,
                  ...(p.shrink ? { shrink: p.shrink } : {}),
                })
              )}
        </div>
      </div>
    ) : null;
  };

  const RightPanel = (opts = {}) => {
    return (
      <Slide
        id="panel-slide"
        direction="right"
        in={opts.open || collapsePanel}
        style={{
          height: "100vh",
          overflow: "auto",
          width: opts.mini === true ? 75 : 330,
        }}
      >
        <Box className={styles.panel} width="100vw">
          <React.Fragment>
            {!opts.mini && (
              <React.Fragment>
                <Paper
                  className="box-container"
                  style={{ background: themeColor, height: 440 }}
                >
                  <Toolbar
                    className={styles.toolbar}
                    style={{ background: themeColor }}
                  >
                    {isTablet && (
                      <IconButton
                        aria-label="Collapse Panel"
                        onClick={() => {
                          props.history.push("#menu");
                        }}
                        style={{ color: "#fff", marginLeft: -15 }}
                      >
                        <Icon>menu</Icon>
                      </IconButton>
                    )}
                    <Typography variant="body1" style={{ fontWeight: "bold" }}>
                      {screen_name
                        ? rightPanelOptions.find((q) => q.id === screen_name)
                            ?.title
                        : ""}
                    </Typography>
                    <Tooltip title="Hide class panel" placement="bottom-start">
                      <IconButton
                        style={{
                          position: "absolute",
                          right: 0,
                          color: "#fff",
                        }}
                        aria-label="Collapse Panel"
                        onClick={() => setCollapsePanel(!collapsePanel)}
                      >
                        <span className="icon-menu-close"></span>
                      </IconButton>
                    </Tooltip>
                  </Toolbar>
                  <Box
                    width="100%"
                    height={219}
                    position="relative"
                    overflow="hidden"
                  >
                    <Box
                      style={{
                        background: `url(${
                          screen_name
                            ? rightPanelOptions.find(
                                (q) => q.id === screen_name
                              )?.image
                            : "https://www.iskwela.net/img/on-iskwela.svg"
                        }) no-repeat center`,
                        backgroundSize: "cover",
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  </Box>
                </Paper>
              </React.Fragment>
            )}

            <Paper
              className="box-container"
              style={{
                height: "100%",
                background: themeColor,
              }}
            >
              {opts.mini && !collapsePanel && (
                <Tooltip title="Hide class panel" placement="bottom-start">
                  <IconButton
                    style={{
                      width: "100%",
                      color: "#fff",
                    }}
                    aria-label="Collapse Panel"
                    onClick={() => setCollapsePanel(!collapsePanel)}
                  >
                    <span className="icon-menu-open"></span>
                  </IconButton>
                </Tooltip>
              )}
              <List component="nav" aria-labelledby="nested-list-subheader">
                {rightPanelOptions
                  .filter((s) => !s.hidden)
                  .map((r, id) =>
                    panelOption({
                      ...r,
                      isChild: false,
                      ...(opts.mini ? { shrink: true } : {}),
                    })
                  )}
              </List>
            </Paper>
          </React.Fragment>
        </Box>
      </Slide>
    );
  };
  return (
    <div>
      <Drawer {...props}>
        <Box
          flexDirection="row"
          alignContent="center"
          display="flex"
          minHeight="100vh"
        >
          {collapsePanel || isMobile
            ? RightPanel()
            : RightPanel({ mini: true, open: true })}
          <Box
            flex={1}
            overflow="hidden auto"
            height="100vh"
            id="right-panel"
            position="relative"
          >
            {isMobile && (
              <NavBar
                title={"Explore"}
                left={
                  !collapsePanel && isMobile ? (
                    <Tooltip title="Show class panel" placement="bottom-start">
                      <IconButton
                        aria-label="Collapse Panel"
                        onClick={() => setCollapsePanel(!collapsePanel)}
                        color="primary"
                        style={{ marginRight: 13 }}
                      >
                        <span className="icon-menu-open"></span>
                      </IconButton>
                    </Tooltip>
                  ) : null
                }
              />
            )}
            <Box
              id="right-panel-content"
              flex={1}
              display="flex"
              alignItems="center"
              height="100%"
              justifyContent="center"
              style={{
                position: "relative",
                padding: isMobile ? 0 : "8px",
                paddingLeft: 0,
              }}
            >
              {rightPanelLoading && (
                <Box
                  width="100%"
                  height="100%"
                  display="flex"
                  alignItems="flex-start"
                  flexDirection="column"
                  p={2}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    zIndex: 10,
                  }}
                  justifyContent="flex-start"
                  flexWrap="nowrap"
                >
                  <Box style={{ padding: "6px 0" }} width={200}>
                    <Skeleton width="100%" height={50} />
                  </Box>
                  <Box style={{ padding: "6px 0" }} width="100%">
                    <Skeleton width="100%" height={40} />
                  </Box>
                  <Box style={{ padding: "6px 0" }} width="100%">
                    <Skeleton width="100%" height={40} />
                  </Box>
                  <Box style={{ padding: "6px 0" }} width="100%">
                    <Skeleton width="100%" height={300} />
                  </Box>
                </Box>
              )}
              <iframe
                style={{ display: "none", border: "none" }}
                id="explore-iframe"
                width="100%"
                height="100%"
              ></iframe>
            </Box>
          </Box>
        </Box>
      </Drawer>
      <Backdrop
        open={
          (collapsePanel || props.location.hash === "#menu") && isMobile
            ? true
            : false
        }
        style={{ zIndex: 16, backgroundColor: "rgba(0,0,0,0.7)" }}
        onClick={() => {
          props.history.push("#");
          setCollapsePanel(false);
        }}
      />
    </div>
  );
}
const useStyles = makeStyles((theme) => ({
  endClass: {
    color: "#fff",
    background: theme.palette.error.main,
  },
  startClass: {
    color: "#000",
    background: theme.palette.secondary.main,
  },
  panel: {
    [theme.breakpoints.down("sm")]: {
      color: "#fff",
      zIndex: 20,
      position: "fixed",
      maxWidth: 330,
      minWidth: 330,
    },
    [theme.breakpoints.down("md")]: {
      marginLeft: -8,
    },
    width: 320,
    display: "flex",
    flexDirection: "column",
    position: "relative",
    // background: theme.palette.primary.main,
    // boxShadow: "0 0 5px rgba(0,0,0,0.3)",

    "& .box-container": {
      borderRadius: 4,
      color: "#fff",
      margin: theme.spacing(1),
      "&:first-of-type": {
        marginTop: 0,
      },
    },
    "& .panel-option": {
      "& .panel-icon": {
        color: "rgba(255,255,255,0.75)",
        fontSize: "1.5em",
      },
      "&.selected + div span, &.selected svg": {
        color: "#fff!important",
      },
      "&, & + div span, & svg": {
        color: "rgba(255,255,255,0.75)",
      },
      "&.selected": {
        background: "rgba(0,0,0,0.2)",
        "&, & .panel-icon": {
          color: "#fff!important",
        },
      },
    },
    "& .panel-option-container": {
      transition: "all 0.2s ease-in-out",
      "& .wrapper .wrapper .selected": {
        background: "none",
      },
    },
  },
  toolbar: {
    position: "sticky",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9,
  },
  buttonProgress: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  wrapper: { margin: theme.spacing(1), position: "relative" },
  formControl: {
    width: "100%",
    marginBottom: theme.spacing(1),
  },
  centered: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  spaceBetween: {
    justifyContent: "space-between",
  },
  start: {
    justifyContent: "flex-start",
  },
}));
export default connect((states) => ({
  userInfo: states.userInfo,
  classDetails: states.classDetails,
  pics: states.pics,
  classes: states.classes,
  dataProgress: states.dataProgress,
}))(Explore);
