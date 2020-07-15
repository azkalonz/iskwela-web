import React, { useEffect, useState } from "react";
import socket from "./socket.io";
import { addStyles, EditableMathField, StaticMathField } from "react-mathquill";
import domtoimage from "dom-to-image";
import {
  Box,
  makeStyles,
  Avatar,
  Typography,
  ButtonBase,
  TextField,
  Button,
  IconButton,
  Icon,
  Dialog,
  DialogContent,
  DialogActions,
  CircularProgress,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  Backdrop,
} from "@material-ui/core";
import Scrollbars from "react-custom-scrollbars";
import {
  Canvas,
  getControls,
  getDefaultControls,
  blobToBase64,
  scaleContainer,
} from "./content-creator";
import { connect } from "react-redux";
import { DialogTitle } from "./dialogs";
import { makeLinkTo } from "./router-dom";

addStyles();

const updateWhiteBoard = (id, data = {}) => {
  socket.emit("update whiteboard", {
    id,
    data,
  });
};
function MainBoard(props) {
  const theme = useTheme();
  const { class_id } = props.match.params;
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [configControl, setConfigControl] = useState();
  const [latex, setLatex] = useState("");
  const [infoDialog, setInfoDialog] = useState(false);
  const mqToolbar = [
    "\\frac{i}{j}",
    "\\sqrt{x}",
    "x\\^2",
    "x\\_{2}",
    "\\sum_{j=0}^3",
    "\\int_{j=0}^3,dx",
  ];
  const boardConfigs = [
    // <Button fullWidth variant="contained" color="primary">
    //   SHARE BOARD TO EVERYONE
    // </Button>,
    // <Button fullWidth variant="contained" color="primary">
    //   HIDE BOARD
    // </Button>,
    // <Button fullWidth variant="contained" color="primary">
    //   SAVE
    // </Button>,
    <Button
      onClick={props.onStop}
      fullWidth
      variant="contained"
      style={{ background: theme.palette.error.main, color: "#fff" }}
    >
      EXIT ROOM
    </Button>,
  ];
  const addMath = () => {
    domtoimage
      .toPng(document.querySelector("#math .mq-math-mode"), {
        quality: 1,
      })
      .then(function (dataUrl) {
        window.creator.addImage(dataUrl);
        updateBoard();
      })
      .catch(function (error) {
        console.error("oops, something went wrong!", error);
      });
  };
  const updateBoard = async () => {
    try {
      let json = window.creator.canvas.toJSON();
      let b64 = window.creator.canvas.toDataURL();
      updateWhiteBoard(class_id, {
        user: props.userInfo,
        b64,
        json,
      });
    } catch (e) {}
  };
  const eventListeners = () => {
    window.creator.canvas.on("object:modified", updateBoard);
    window.creator.canvas.on("object:moving", updateBoard);
    window.creator.canvas.on("object:scaling", updateBoard);
    window.creator.canvas.on("object:added", updateBoard);
    window.creator.canvas.on("object:removed", updateBoard);
  };
  const getBoard = () => {
    let b = props.boards.find((q) => q.id === props.board.id);
    if (b) return b;
    else if (props.boards.length) return props.boards[0];
    return null;
  };
  useEffect(() => {
    window.onresize = () => {
      scaleContainer("main-board");
    };
    document.querySelector("#main-board").onmousemove = () => {
      scaleContainer("main-board");
    };
    eventListeners();
  }, []);
  useEffect(() => {
    if (!isMobile) scaleContainer("main-board");
    else {
      window.onresize = () => {};
    }
  }, [props.value, isMobile]);
  return (
    <React.Fragment>
      <Dialog open={infoDialog} onClose={() => setInfoDialog(false)}>
        <DialogTitle>Math Formula Editor</DialogTitle>
        <DialogContent>
          <p>
            We are using a web formula editor that is designed to make typing
            math easy and beautiful. With this editor you can achieve unique
            symbols like{" "}
            <StaticMathField>{"\\sum_{j=0}^3 j^2"}</StaticMathField>
            or
            <StaticMathField>{"\\int_{j=0}^3 j^2"}</StaticMathField>. Just type{" "}
            <b>{"\\sum_{j=0}^3 j^2"}</b> or <b>{"\\int_{j=0}^3 j^2"}</b> in the
            text field or use the tools.
          </p>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={() =>
              window.open(
                "http://mirrors.ibiblio.org/CTAN/info/undergradmath/undergradmath.pdf",
                "_blank"
              )
            }
          >
            Symbol Reference
          </Button>
        </DialogActions>
      </Dialog>
      <Box className="main-board">
        <Box width="100%" style={{ background: "red" }}></Box>
        {isMobile && props.boards && (
          <Box className="mobile-canvas-preview" width="100%">
            {getBoard() ? (
              <React.Fragment>
                <Box display="flex" alignItems="center" marginBottom={2}>
                  <Avatar
                    src={getBoard().info.preferences.profile_picture || ""}
                    alt="Test"
                    style={{ height: 60, width: 60, border: "6px solid #fff" }}
                  />
                  <Typography
                    style={{ marginLeft: 8, color: "#fff", height: "1.2rem" }}
                  >
                    {getBoard().info.first_name +
                      " " +
                      getBoard().info.last_name}
                    's Board
                  </Typography>
                </Box>
                <Box width="100%">
                  {getBoard().b64 ? (
                    <img
                      src={getBoard().b64}
                      alt="preview"
                      width="100%"
                      height="auto"
                    />
                  ) : (
                    <Typography
                      style={{
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: "1.3rem",
                      }}
                    >
                      Not Available
                    </Typography>
                  )}
                </Box>
              </React.Fragment>
            ) : (
              <Typography style={{ fontWeight: "bold" }}>
                No White Board is available
              </Typography>
            )}
          </Box>
        )}
        {!isMobile && (
          <Canvas
            value={props.value}
            id="main-board"
            config={{
              width: 1000,
              height: 1000,
            }}
            onPreview={(p) => props.onPreview(p)}
            disabledIcon={props.preview ? true : false}
            preview={
              props.preview &&
              props.board &&
              getBoard() && (
                <Box
                  className="desktop-canvas-preview"
                  style={{ position: "relative" }}
                >
                  {getBoard().b64 ? (
                    <img src={getBoard().b64} alt="preview" />
                  ) : (
                    "not avaiable"
                  )}
                </Box>
              )
            }
            controls={(c) =>
              getControls(
                c,
                ["zoom", "save", "image"],
                [
                  {
                    id: "math",
                    title: "Math Expression",
                    action: "atomic",
                    atomicComponent: (
                      <Box p={2} width={325}>
                        <Box display="flex" alignItems="center">
                          <Typography style={{ fontWeight: "bold" }}>
                            Math Expression
                          </Typography>
                          <IconButton onClick={() => setInfoDialog(true)}>
                            <Icon color="primary">info_outline</Icon>
                          </IconButton>
                        </Box>
                        {mqToolbar.map((t, index) => (
                          <Button
                            key={index}
                            onClick={() => setLatex(latex + t)}
                            variant="outlined"
                            style={{ textTransform: "none" }}
                          >
                            <StaticMathField style={{ cursor: "pointer" }}>
                              {t}
                            </StaticMathField>
                          </Button>
                        ))}
                        <EditableMathField
                          style={{ width: "100%" }}
                          latex={latex}
                          onChange={(mathField) => {
                            setLatex(mathField.latex());
                          }}
                        />
                        <Button
                          fullWidth
                          color="primary"
                          variant="contained"
                          onClick={addMath}
                        >
                          Done
                        </Button>
                        <div id="math">
                          <StaticMathField style={{ fontSize: 100 }}>
                            {latex}
                          </StaticMathField>
                        </div>
                      </Box>
                    ),
                    icon: "calculate",
                  },
                  {
                    id: "config",
                    title: "Board Options",
                    action: "atomic",
                    tools: ["background_color"],
                    atomicComponent: (
                      <Box p={2}>
                        {boardConfigs.map((c, index) => (
                          <Box key={index} marginTop={1}>
                            {c}
                          </Box>
                        ))}
                      </Box>
                    ),
                    icon: "settings",
                  },
                ],
                { id: "main-board", upload_to_server: true }
              )
            }
          />
        )}
      </Box>
    </React.Fragment>
  );
}
function Board(props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [currentBoard, setCurrentBoard] = useState();

  return (
    <React.Fragment>
      {false && (
        <Dialog
          fullWidth
          maxWidth="lg"
          open={currentBoard || false}
          onClose={() => setCurrentBoard(null)}
        >
          <DialogTitle onClose={() => setCurrentBoard(null)}>
            <Box display="flex" alignItems="center">
              <Avatar
                src={currentBoard.info.preferences.profile_picture || ""}
                alt="Test"
              />
              <Typography style={{ marginLeft: 8 }}>
                {currentBoard.info.first_name +
                  " " +
                  currentBoard.info.last_name}
                's Board
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            {currentBoard.b64 && (
              <img src={currentBoard.b64} alt="preview" width="100%" />
            )}
          </DialogContent>
        </Dialog>
      )}
      <Box key={props.key} className="board">
        <Box display="flex" alignItems="center">
          <Avatar
            src={props.board.info.preferences.profile_picture}
            alt="Test"
          />
          <Typography style={{ marginLeft: 8 }}>
            {props.board.info.first_name + " " + props.board.info.last_name}
          </Typography>
        </Box>
        <Box className="board-preview">
          <ButtonBase
            style={{ width: "100%", height: "100%" }}
            onClick={() => {
              props.onClick(props.board);
              if (!isMobile) {
                props.onPreview(true);
              }
            }}
          >
            {props.board.b64 && (
              <img src={props.board.b64} alt="preview" width="100%" />
            )}
          </ButtonBase>
          {!isMobile && (
            <Box className="options">
              <IconButton
                onClick={() => props.onCopy && props.onCopy(props.board)}
              >
                <Icon color="primary">content_copy</Icon>
              </IconButton>
            </Box>
          )}
        </Box>
      </Box>
    </React.Fragment>
  );
}
function BoardsList(props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const boards = props.boards.filter((b) => b.info.id !== props.userInfo.id);
  return boards.length ? (
    <Box className={"boards-list " + (props.className ? props.className : "")}>
      {props.onClose && (
        <Toolbar>
          {props.onClose}
          <Typography
            style={{ fontWeight: "bold", color: "#fff", marginLeft: 7 }}
          >
            White Boards
          </Typography>
        </Toolbar>
      )}
      <Toolbar>
        <Typography style={{ fontWeight: "bold" }}>White Boards</Typography>
      </Toolbar>
      <Scrollbars autoHide>
        {boards.map((b, index) => (
          <Box p={isMobile ? 0 : 2} key={index}>
            <Board
              {...props}
              board={b}
              onClick={(board) => props.onChange(board)}
            />
          </Box>
        ))}
      </Scrollbars>
    </Box>
  ) : null;
}

function WhiteBoard(props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { class_id, schedule_id } = props.match.params;
  const styles = useStyles();
  const [whiteBoard, setWhiteBoard] = useState();
  const [isMenu, setIsMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tail, setTail] = useState();
  const [currentBoard, setCurrentBoard] = useState({});
  const [preview, setPreview] = useState(false);
  const isTeacher = props.userInfo.user_type === "t";
  const getWhiteBoard = (id, callback = () => {}) => {
    socket.off("get whiteboard");
    socket.emit("whiteboard", { id, user: props.userInfo });
    socket.on("get whiteboard", (whiteboard) => callback(whiteboard));
  };
  const hostWhiteBoard = (id, callback = () => {}) => {
    if (!isTeacher) {
      alert("You are eligible to host the White Board");
      return;
    }
    setLoading(true);
    socket.off("get whiteboard");
    socket.emit("whiteboard", { id, user: props.userInfo, is_host: true });
    socket.on("get whiteboard", (whiteboard) => callback(whiteboard));
  };
  const joinWhiteBoard = (id, callback = () => {}) => {
    setLoading(true);
    socket.off("get whiteboard");
    socket.emit("whiteboard", { id, user: props.userInfo, is_host: false });
    socket.on("get whiteboard", (whiteboard) => callback(whiteboard));
  };
  // useEffect(() => {
  //   if (whiteBoard) {
  //     if (tail) {
  //       if (whiteBoard.boards.length !== tail.boards.length)
  //         updateWhiteBoard(1);
  //     }
  //     setTail(whiteBoard);
  //   }
  // }, [whiteBoard]);
  const setUp = () => {
    socket.off("update whiteboard");
    socket.off("delete boards");
    socket.on("update whiteboard", ({ board, id }) => {
      if (id === class_id) setWhiteBoard(board);
    });
    socket.on("delete boards", (id) => {
      if (id === class_id)
        props.history.push(
          makeLinkTo(["class", class_id, schedule_id, "todo"])
        );
    });
    getWhiteBoard(class_id, (whiteboard) => {
      if (whiteboard.host.info) {
        if (whiteboard.host.info.id === props.userInfo.id) {
          hostWhiteBoard(class_id, (board) => {
            setWhiteBoard(board);
          });
        } else {
          joinWhiteBoard(class_id, (newBoard) => {
            setWhiteBoard(newBoard);
          });
        }
      } else {
        setWhiteBoard(whiteboard);
      }
      updateWhiteBoard(class_id);
      setLoading(false);
    });
    props.onLoad && props.onLoad(false);
  };
  const getMyBoard = () => {
    if (!whiteBoard) return;
    let boardIndex = whiteBoard.boards.findIndex(
      (q) => q.info.id === props.userInfo.id
    );
    return boardIndex >= 0
      ? whiteBoard.boards[boardIndex].json
        ? whiteBoard.boards[boardIndex].json
        : null
      : null;
  };
  const handleStop = () => {
    socket.emit("delete boards", class_id);
  };
  useEffect(() => {
    setUp();
    props.history.push("?hidepanel=true&full_width=true");
  }, []);
  return (
    <React.Fragment>
      {isMobile && (
        <AppBar variant="outlined">
          <Toolbar>
            <IconButton onClick={() => setIsMenu(!isMenu)} color="primary">
              {!isMenu && <span className="icon-menu-open"></span>}
            </IconButton>
            <Typography
              style={{
                fontSize: "2rem",
                color: "#e91e63",
                fontWeight: "bold",
              }}
            >
              White Boards
            </Typography>
          </Toolbar>
        </AppBar>
      )}
      <Backdrop
        open={isMenu}
        onClick={() => setIsMenu(false)}
        style={{ zIndex: 1101 }}
      />
      {whiteBoard && !loading && (
        <React.Fragment>
          <Box className={styles.root}>
            <MainBoard
              {...props}
              onStop={() => handleStop()}
              preview={preview}
              value={getMyBoard()}
              board={currentBoard}
              boards={whiteBoard.boards}
              onPreview={(p) => setPreview(p)}
            />
            <BoardsList
              {...props}
              onPreview={(p) => setPreview(p)}
              onCopy={(board) => {
                if (board.json) window.creator.canvas.loadFromJSON(board.json);
              }}
              onClose={
                isMobile && (
                  <IconButton
                    onClick={() => setIsMenu(!isMenu)}
                    style={{ color: "#fff" }}
                  >
                    <span className="icon-menu-close"></span>
                  </IconButton>
                )
              }
              className={
                isMobile
                  ? "boards-list-mobile " + (isMenu ? "visible" : "hidden")
                  : ""
              }
              boards={whiteBoard.boards}
              onChange={(board) => setCurrentBoard(board)}
            />
          </Box>
          <Dialog open={!whiteBoard.boards.length}>
            <DialogTitle>You are about to host this White Board</DialogTitle>
            <DialogContent>
              <p>
                You will have full control on what boards are being displayed on
                this page.
              </p>
              <p>
                Click START to initialize the room or CANCEL to exit the room.
              </p>
            </DialogContent>
            <DialogActions>
              <Button
                color="primary"
                onClick={() => {
                  props.history.push(
                    makeLinkTo(["class", class_id, schedule_id, "todo"])
                  );
                }}
              >
                CANCEL
              </Button>
              <Button
                color="primary"
                variant="contained"
                onClick={() =>
                  hostWhiteBoard(class_id, (board) => {
                    setWhiteBoard(board);
                    updateWhiteBoard(class_id);
                    setLoading(false);
                  })
                }
              >
                START
              </Button>
            </DialogActions>
          </Dialog>
        </React.Fragment>
      )}
      <Dialog open={!whiteBoard || loading}>
        <DialogContent>
          <Box display="flex" alignItems="center">
            <CircularProgress size={18} />
            <Typography style={{ marginLeft: 8 }}>Loading...</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    width: "100%",
    height: "100vh",
    margin: "0 auto",
    justifyContent: "center",
    "& ~ img": {
      userSelect: "none",
      pointerEvents: "none",
    },
    "& #math": {
      position: "relative",
      width: 0,
      height: 0,
      overflow: "hidden",
    },
    "& .main-board": {
      width: "100%",
      height: 500,
      position: "relative",
      "& .desktop-canvas-preview": {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        "& img": {
          userSelect: "none",
          pointerEvents: "none",
        },
      },
      "& .mobile-canvas-preview": {
        padding: theme.spacing(2),
        background: theme.palette.primary.main,
        "& img": {
          userSelect: "none",
          pointerEvents: "none",
        },
      },
    },
    "& .boards-list-mobile": {
      position: "fixed",
      top: 0,
      zIndex: 1102,
      bottom: 0,
      transition: "left 0.3s ease-out",
      "&.hidden": {
        left: -250,
      },
      "&.visible": {
        left: 0,
      },
    },
    "& .boards-list": {
      background: "#fff",
      borderLeft: "1px solid rgba(0, 0, 0, 0.17)",
      minWidth: 250,
      overflow: "auto",
      height: "100%",
      [theme.breakpoints.down("sm")]: {
        background: "none",
      },
      "& .board": {
        [theme.breakpoints.down("sm")]: {
          padding: theme.spacing(2),
          background: "rgba(255,255,255,0.7)",
        },
        width: "100%",
        marginBottom: theme.spacing(1),
        display: "block",
        overflow: "hidden",
        "&, & .board-preview": {
          borderRadius: 8,
        },
        "& .board-preview": {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          width: "100%",
          height: 140,
          background: "#fff",
          border: "1px solid rgba(0,0,0,0.17)",
          marginTop: theme.spacing(1),
          position: "relative",
          "& .options": {
            position: "absolute",
            top: 0,
            right: 0,
          },
        },
      },
    },
  },
}));

export default connect((states) => ({
  userInfo: states.userInfo,
}))(WhiteBoard);
