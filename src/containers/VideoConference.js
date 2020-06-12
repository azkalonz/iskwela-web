import React, { useState } from "react";
import NavBar from "../components/NavBar";
import FullscreenIcon from "@material-ui/icons/Fullscreen";
import { IconButton, Box } from "@material-ui/core";
import ShareOutlinedIcon from "@material-ui/icons/ShareOutlined";
import Jitsi from "react-jitsi";
import store from "../components/redux/store";

function VideoConference(props) {
  const { getRoom } = props;
  const room = getRoom();
  const [loading, setLoading] = useState(false);
  const handleAPI = (JitsiApi) => {
    JitsiApi.executeCommand("toggleVideo");
    JitsiApi.on("readyToClose", () => {
      setLoading(true);
      props.updateClass("PENDING");
    });
  };
  return loading ? null : (
    <Box width="100%" id="video-conference-container" overflow="hidden">
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
      <Box width="100%" justifyContent="center" alignItems="center">
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
    </Box>
  );
}

export default VideoConference;
