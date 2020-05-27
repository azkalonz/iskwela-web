import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import ProgressComponent from "@material-ui/core/CircularProgress";
import FullscreenIcon from "@material-ui/icons/Fullscreen";
import { IconButton, Box, Typography } from "@material-ui/core";
import ShareOutlinedIcon from "@material-ui/icons/ShareOutlined";
import Jitsi from "react-jitsi";

function VideoConference(props) {
  const [roomName, setRoomName] = useState();

  useEffect(() => {
    setRoomName(props.roomName);
  }, []);
  const handleAPI = (JitsiApi) => {
    JitsiApi.executeCommand("toggleVideo");
  };
  return (
    <Box width="100%">
      <NavBar
        title="Video Conference"
        right={
          <Box display="flex" alignItems="center">
            <IconButton>
              <ShareOutlinedIcon color="textPrimary" />
            </IconButton>
            <IconButton
              onClick={() =>
                document
                  .getElementById("react-jitsi-container")
                  .requestFullscreen()
              }
            >
              <FullscreenIcon color="textPrimary" />
            </IconButton>
          </Box>
        }
        left={props.left}
      />
      <Box width="100%" justifyContent="center" alignItems="center">
        {roomName && (
          <Jitsi
            roomName={roomName}
            onAPILoad={handleAPI}
            displayName="testing"
            containerStyle={{ margin: "0 auto", width: "100%" }}
          />
        )}
      </Box>
    </Box>
  );
}

export default VideoConference;
