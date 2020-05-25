import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import ProgressComponent from "@material-ui/core/CircularProgress";
import FullscreenIcon from "@material-ui/icons/Fullscreen";
import { IconButton, Box } from "@material-ui/core";
import ShareOutlinedIcon from "@material-ui/icons/ShareOutlined";

function VideoConference(props) {
  const [loading, setLoading] = useState(true);
  const [roomId, setRoomId] = useState();
  useEffect(() => {
    console.log(props.match.params.id);
  }, []);
  const containerStyle = {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    height: "100%",
  };

  const jitsiContainerStyle = {
    display: loading ? "none" : "block",
    width: "100%",
    height: "100%",
  };

  function startConference() {
    try {
      const domain = "meet.jit.si"; // jitsi.iskwela.net
      const options = {
        roomName: props.roomName,
        height: 400,
        parentNode: document.getElementById("jitsi-container"),
        interfaceConfigOverwrite: {
          filmStripOnly: false,
          SHOW_JITSI_WATERMARK: false,
        },
        configOverwrite: {
          disableSimulcast: false,
        },
        userInfo: {
          email: props.userEmail,
          displayName: props.userName,
        },
      };

      const api = new window.JitsiMeetExternalAPI(domain, options);
      api.addEventListener("videoConferenceJoined", () => {
        console.log("Local User Joined");
        setLoading(false);
        // api.executeCommand('displayName', props.displayName);
      });
    } catch (error) {
      console.error("Failed to load Jitsi API", error);
    }
  }

  useEffect(() => {
    // verify the JitsiMeetExternalAPI constructor is added to the global..
    if (window.JitsiMeetExternalAPI) startConference();
    else alert("Jitsi Meet API script not loaded");
  }, []);
  return (
    <div style={{ height: "50%" }}>
      <NavBar
        title="Video Conference"
        right={
          <Box display="flex">
            <IconButton>
              <ShareOutlinedIcon color="textPrimary" />
            </IconButton>
            <IconButton
              onClick={() =>
                document.getElementById("stream-container").requestFullscreen()
              }
            >
              <FullscreenIcon color="textPrimary" />
            </IconButton>
          </Box>
        }
        left={props.left}
      />
      <div style={containerStyle} id="stream-container">
        {loading && <ProgressComponent />}
        <div id="jitsi-container" style={jitsiContainerStyle} />
      </div>
    </div>
  );
}

export default VideoConference;
