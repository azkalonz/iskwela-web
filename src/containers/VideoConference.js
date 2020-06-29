import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import FullscreenIcon from "@material-ui/icons/Fullscreen";
import { IconButton, Box, Divider, makeStyles } from "@material-ui/core";
import ShareOutlinedIcon from "@material-ui/icons/ShareOutlined";
import Jitsi from "react-jitsi";
import store from "../components/redux/store";

const resize = (e) => {
  let v = document.querySelector("#video-conference-container");
  let p = e.clientY + v.getBoundingClientRect().top * -1;
  if (p > window.innerHeight - 30) return;
  v.style.height = p + "px";
};
const useStyles = makeStyles((theme) => ({
  vcontainer: {
    "& #react-jitsi-container": {
      height: "90%!important",
    },
  },
}));
function VideoConference(props) {
  const { getRoom } = props;
  const styles = useStyles();
  const room = getRoom();
  const [loading, setLoading] = useState(false);
  const [isResizing, setisResizing] = useState(false);
  const handleAPI = (JitsiApi) => {
    JitsiApi.executeCommand("toggleVideo");
    JitsiApi.on("readyToClose", () => {
      setLoading(true);
      props.updateClass("PENDING");
    });
  };
  const doneResizing = () => {
    document.body.style.userSelect = "initial";
    noLightVresize();
    setisResizing(false);
  };
  const noLightVresize = () =>
    (document.querySelector("#v-resize").style.backgroundColor =
      "rgba(0, 0, 0, 0.12)");
  const highLightVresize = () =>
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
            <IconButton>
              <ShareOutlinedIcon color="textPrimary" />
            </IconButton>
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
      <Box
        width="100%"
        height="100%"
        justifyContent="center"
        alignItems="center"
      >
        {room.name && (
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
        )}
      </Box>
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

export default VideoConference;
