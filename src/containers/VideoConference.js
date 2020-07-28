import React, { useState, useEffect, useMemo } from "react";
import NavBar from "../components/NavBar";
import FullscreenIcon from "@material-ui/icons/Fullscreen";
import Draggable from "react-draggable";
import {
  IconButton,
  Box,
  Divider,
  makeStyles,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme,
  useMediaQuery,
  Icon,
} from "@material-ui/core";
import ShareOutlinedIcon from "@material-ui/icons/ShareOutlined";
import Jitsi from "react-jitsi";
import store from "../components/redux/store";
import { safeURLChange } from "../components/safeUrl";
import { connect } from "react-redux";

const resize = (e) => {
  let v = document.querySelector("#video-conference-container");
  let p = e.clientY + v.getBoundingClientRect().top * -1;
  if (p > window.innerHeight - 30) return;
  v.style.height = p + "px";
};
const useStyles = makeStyles((theme) => ({
  vcontainer: {
    // "& #react-jitsi-container": {
    //   height: "90%!important",
    // },
  },
}));
const jState = {};
function VideoConference(props) {
  const theme = useTheme();
  const { room_name } = props.match.params;
  const styles = useStyles();
  const room = props.room;
  const [loading, setLoading] = useState(false);
  const [isResizing, setisResizing] = useState(false);
  const [confirmed, setConfirmed] = useState();
  const [jApi, setjApi] = useState();
  const handleAPI = (JitsiApi) => {
    JitsiApi.executeCommand("toggleVideo");
    JitsiApi.on("readyToClose", () => {
      setLoading(true);
      props.updateClass("PENDING");
    });
    if (props.userInfo)
      JitsiApi.executeCommand(
        "avatarUrl",
        props.userInfo.preferences.profile_picture
      );
    JitsiApi.addEventListener(
      "filmstripDisplayChanged",
      (event) => (jState.filmStrip = event)
    );
    JitsiApi.addEventListener(
      "tileViewChanged",
      (event) => (jState.tileView = event)
    );
    if (!jApi) setjApi(JitsiApi);
  };
  const doneResizing = () => {
    document.body.style.userSelect = "initial";
    noLightVresize();
    setisResizing(false);
  };
  const noLightVresize = () =>
    document.querySelector("#v-resize") &&
    (document.querySelector("#v-resize").style.backgroundColor =
      "rgba(0, 0, 0, 0.12)");
  const highLightVresize = () =>
    document.querySelector("#v-resize") &&
    (document.querySelector("#v-resize").style.backgroundColor = "#7539ff");
  useEffect(() => {
    if (isResizing) {
      document.body.style.userSelect = "none";
      highLightVresize();
      document.querySelector("#voverlay").style.display = "block";
      window.removeEventListener("mouseup", doneResizing);
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", doneResizing);
    } else {
      document.querySelector("#voverlay").style.display = "none";
      window.removeEventListener("mousemove", resize);
    }
  }, [isResizing]);

  useEffect(() => {
    safeURLChange(room_name, HandleURLChange);
  }, []);
  useEffect(() => {
    safeURLChange(room_name, HandleURLChange);
  }, [props.location]);
  const HandleURLChange = (x) => {
    setConfirmed({
      title: "You are about to leave the Video Conference.",
      message: "Do you wish to continue?",
      yes: () => {
        x.style.display = "none";
        x.previousElementSibling.click();
        x.parentElement.firstElementChild.click();
        document
          .querySelectorAll(".safe-to-url")
          .forEach((i) => (i.style.display = "none"));
      },
      no: () => {
        setConfirmed(null);
      },
    });
  };
  useEffect(() => {
    if (props.draggable && jApi) {
      if (jState.filmStrip) {
        if (jState.filmStrip.visible) jApi.executeCommand("toggleFilmStrip");
      } else jApi.executeCommand("toggleFilmStrip");
      if (jState.tileView) {
        if (jState.tileView.enabled) jApi.executeCommand("toggleTileView");
      } else jApi.executeCommand("toggleTileView");
    }
  }, [props.draggable, jApi]);
  return loading ? null : (
    <Box
      width="100%"
      id="video-conference-container"
      height={400}
      minHeight={400}
      overflow="hidden"
      position="relative"
      className={styles.vcontainer}
    >
      {confirmed && (
        <Dialog open={confirmed ? true : false} onClose={() => confirmed.no()}>
          <DialogTitle>{confirmed.title}</DialogTitle>
          <DialogContent>{confirmed.message}</DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                confirmed.no();
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
      <NavBar
        title="Video Conference"
        right={
          <Box display="flex" alignItems="center">
            <IconButton
              onClick={() => {
                try {
                  document
                    .getElementById("react-jitsi-container")
                    .requestFullscreen();
                } catch (e) {}
              }}
            >
              <FullscreenIcon color="textPrimary" />
            </IconButton>
          </Box>
        }
        left={props.left}
      />
      {/* width="100%"
        height="100%"
        justifyContent="center"
        alignItems="center" */}

      {room.name && (
        <React.Fragment>
          {React.createElement(
            Draggable,
            !props.draggable
              ? {
                  position: { x: 0, y: 0 },
                  disabled: true,
                }
              : {
                  bounds: "#root",
                  onDrag: () => {
                    document.querySelector(
                      "#react-jitsi-container"
                    ).style.pointerEvents = "none";
                  },
                  onStop: () => {
                    document.querySelector(
                      "#react-jitsi-container"
                    ).style.pointerEvents = "initial";
                  },
                },
            <Box
              id="draggable-jitsi-container"
              height="100%"
              width="100%"
              bgcolor="#7539ff"
              color="#fff"
              className={props.draggable ? "floating" : ""}
              style={!props.draggable ? { transform: "none!important" } : {}}
            >
              {props.draggable && (
                <Box display="flex" alignItems="center">
                  <IconButton
                    onClick={() => {
                      try {
                        document
                          .getElementById("react-jitsi-container")
                          .requestFullscreen();
                      } catch (e) {}
                    }}
                  >
                    <Icon style={{ color: "#000", opacity: 0.2 }}>
                      fullscreen
                    </Icon>
                  </IconButton>
                  <Icon style={{ color: "#000", opacity: 0.2 }}>
                    drag_indicator
                  </Icon>
                </Box>
              )}
              <Jitsi
                domain="jts.iskwela.net"
                jwt={
                  true || store.getState().userInfo.user_type === "t"
                    ? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJqaXRzaSIsImlzcyI6InNjaG9vbGh1YiIsInN1YiI6Imp0cy5pc2t3ZWxhLm5ldCIsInJvb20iOiIqIn0.3BQBpXgHFM51Al1qjPz-sCFDPEnuKwKb47-h2Dctsqg"
                    : null
                }
                displayName={room.displayName}
                roomName={room.name}
                onAPILoad={handleAPI}
                containerStyle={{
                  margin: "0 auto",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
            </Box>
          )}
        </React.Fragment>
      )}
      <div
        id="voverlay"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          top: 0,
          display: "none",
          zIndex: 9999,
        }}
      />
      <Divider
        style={{
          height: 4,
          position: "absolute",
          left: 0,
          cursor: "ns-resize",
          right: 0,
          bottom: 0,
          zIndex: 2,
        }}
        onMouseOut={() => !isResizing && noLightVresize()}
        onMouseOver={highLightVresize}
        id="v-resize"
        onMouseDown={() => setisResizing(true)}
      />
    </Box>
  );
}
export default connect((states) => ({ userInfo: states.userInfo }))(
  VideoConference
);
