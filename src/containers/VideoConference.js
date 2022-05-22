import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Typography,
  CircularProgress,
} from "@material-ui/core";
import ShareOutlinedIcon from "@material-ui/icons/ShareOutlined";
import Jitsi from "react-jitsi";
import store from "../components/redux/store";
import { safeURLChange } from "../components/safeUrl";
import { connect } from "react-redux";
import { makeLinkTo } from "../components/router-dom";

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
const jwt =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJqaXRzaSIsImlzcyI6InNjaG9vbGh1YiIsInN1YiI6Imp0cy5pc2t3ZWxhLm5ldCIsInJvb20iOiIqIn0.3BQBpXgHFM51Al1qjPz-sCFDPEnuKwKb47-h2Dctsqg";
function VideoConference(props) {
  const theme = useTheme();
  const { room_name, class_id, schedule_id, option_name } = props.match.params;
  const styles = useStyles();
  const room = props.room;
  const [loading, setLoading] = useState(false);
  const [muted, setMuted] = useState();
  const [isResizing, setisResizing] = useState(false);
  const [confirmed, setConfirmed] = useState();
  const [jApi, setjApi] = useState();
  const [visible, setVisible] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const isTeacher =
    props.userInfo.user_type === "t" || props.userInfo.user_type === "a";
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
  const jitsiOptions = {
    configOverwrite: {
      desktopSharingChromeDisabled: isTeacher ? false : true,
      desktopSharingFirefoxDisabled: isTeacher ? false : true,
      startWithVideoMuted: isTeacher ? false : true,
      startWithAudioMuted: isTeacher ? false : true,
      disableRemoteMute: isTeacher ? false : true, //DISABLE THIS ALSO IF YOU ARE DISABLING MUTE EVERYONE FEATURE
      requireDisplayName: true,
      remoteVideoMenu: {
        // If set to true the 'Kick out' button will be disabled.
        disableKick: isTeacher ? false : true,
      },
    },
    disableSimulcast: false,
    liveStreamingEnabled: false,
    userInfo: {
      displayName: props.userInfo.first_name + " " + props.userInfo.last_name,
    },
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
  const muteSelf = () => {
    setMuted(true);
    jApi && jApi.executeCommand("toggleAudio");
  };
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
    if (visible) safeURLChange(room_name, HandleURLChange);
  }, [props.location, visible]);
  useEffect(() => {
    if (jApi) {
      jApi.removeEventListener("audioMuteStatusChanged");
      jApi.addEventListener("audioMuteStatusChanged", (event) => {
        if (muted === undefined && event.muted && isTeacher)
          jApi.executeCommand("toggleAudio");
        jState.audio = event;
        setMuted(undefined);
      });
    }
  }, [muted]);
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
        setConfirmed(null);
      },
      no: () => {
        setConfirmed(null);
      },
    });
  };
  const openNewTab = () => {
    window.open("https://jitsi.member.fsf.org/" + room.name);
    props.history.push(
      makeLinkTo(["class", class_id, schedule_id, option_name])
    );
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
  const reconnect = useCallback(() => {
    window.clearTimeout(window.recon);
    setVisible(false);
    setReconnecting(true);
    window.recon = setTimeout(() => {
      setVisible(true);
      setReconnecting(false);
    }, 3000);
  }, [reconnecting, visible]);
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
      <NavBar
        title="Video Conference"
        right={
          <Box display="flex" alignItems="center">
            {isTeacher && (
              <IconButton disabled={!visible} onClick={() => muteSelf()}>
                <Icon>
                  {jState.audio && jState.audio.muted
                    ? "volume_mute"
                    : "volume_up"}
                </Icon>
              </IconButton>
            )}
            <Box>
              <IconButton
                disabled={!visible}
                onClick={() => reconnect()}
                className="warn-to-leave"
              >
                <Icon>refresh</Icon>
              </IconButton>
            </Box>
            <IconButton
              disabled={!visible}
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
      {!visible && (
        <Box
          width="inherit"
          height="inherit"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {!reconnecting && (
            <Box display="flex" flexDirection="column" alignItems="center">
              <Box textAlign="center">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setVisible(true)}
                >
                  Show in App
                </Button>
                <Typography>or</Typography>
                <Button onClick={openNewTab}>Show in new tab</Button>
              </Box>
            </Box>
          )}
          {reconnecting && (
            <Box display="flex" flexDirection="column" alignItems="center">
              <Box textAlign="center">
                <CircularProgress size={15} />
                <Typography style={{ marginLeft: 13, fontWeight: 500 }}>
                  Reconnecting...
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      )}
      {visible && (
        <React.Fragment>
          {confirmed && (
            <Dialog
              open={confirmed ? true : false}
              onClose={() => confirmed.no()}
            >
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
                  style={
                    !props.draggable ? { transform: "none!important" } : {}
                  }
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
                    domain="jitsi.member.fsf.org"
                    displayName={room.displayName}
                    roomName={room.name}
                    {...jitsiOptions}
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
