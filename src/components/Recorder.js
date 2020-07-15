import React, { useEffect, useRef, useState } from "react";
import { saveAs } from "file-saver";
import AudioSpectrum from "react-audio-spectrum";
import {
  Paper,
  Box,
  IconButton,
  Icon,
  Typography,
  Divider,
  Slider,
  ButtonGroup,
  Menu,
  MenuItem,
  Grow,
  useTheme,
  useMediaQuery,
} from "@material-ui/core";
import moment from "moment";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
const RecordRTC = require("recordrtc");

const tickInterval = 100;
const hasGetUserMedia = !!(
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia
);
let timer;
let playerTimer;
let DURATION = 0;

function Recorder(props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const audioRef = useRef();
  const [duration, setDuration] = useState(0);
  const [timerDuration, setTimerDuration] = useState(0);
  const [status, setStatus] = useState({});
  const [audio, setAudio] = useState({ muted: false, volume: 1 });
  const [recorder, setRecorder] = useState();
  const [stream, setStream] = useState();
  const captureDevice = () => {
    navigator.mediaDevices
      .getUserMedia({
        video: false,
        audio: true,
      })
      .then(async function (stream) {
        setStream(stream);
        let r = RecordRTC(stream, {
          type: "audio",
          mimeType: "audio/wav",
        });
        r.onStateChanged = (state) => {
          window.clearInterval(timer);
          switch (state) {
            case "recording":
              timer = setInterval(() => {
                DURATION++;
                setDuration(DURATION);
              }, 1000);
              break;
            case "paused":
              break;
            case "stopped":
              DURATION = 0;
          }
          setStatus({ ...status, recorder: state });
        };
        setRecorder(r);
      });
  };
  const startRecording = () => {
    if (!recorder) return;
    DURATION = 0;
    setDuration(DURATION);
    window.clearInterval(timer);
    recorder.startRecording();
  };
  const pauseRecording = () => {
    if (!recorder) return;
    recorder.pauseRecording();
  };
  const resumeRecording = () => {
    if (!recorder) return;
    recorder.resumeRecording();
  };
  const reset = () => {
    stopRecording(false);
    audioRef.current.src = "";
  };
  const downloadAudio = () => {
    window.getSeekableBlob(recorder.getBlob(), function (seekableBlob) {
      window.invokeSaveAsDialog(
        seekableBlob,
        "iSkwela-Audio-Recording-" +
          new Date().toString().replace(" ", "-") +
          ".wav"
      );
    });
  };
  const stopRecording = (save = true) => {
    if (!recorder) return;
    recorder.stopRecording(() => {
      if (save) {
        let blob = recorder.getBlob();
        let url = URL.createObjectURL(blob);
        audioRef.current.src = url;
        drawSpectrum(url);
        props.onSave && props.onSave(blob);
      }
    });
  };
  const drawSpectrum = (url) => {
    let wv = document.querySelector("#waveform");
    wv.innerHTML = "";
    let wavesurfer = window.WaveSurfer.create({
      container: wv,
      barWidth: 2,
      barHeight: 1,
      barGap: null,
    });
    wavesurfer.load(url);
    initListeners();
  };
  const initListeners = () => {
    let wv = document.querySelector("#waveform wave");
    wv.addEventListener("click", (e) => {
      let d = (e.offsetX / parseInt(wv.clientWidth)) * duration;
      audioRef.current.currentTime = d;
      setDuration(d);
    });
  };
  const handlePlay = () => {
    if (!status.player || status.player === "paused") {
      let wv = document.querySelector("#waveform wave wave");
      playerTimer = setInterval(() => {
        if (!audioRef.current) return;
        let { currentTime } = audioRef.current;
        setTimerDuration(currentTime);
      }, 1000);
      timer = setInterval(() => {
        if (!audioRef.current) return;
        let { currentTime } = audioRef.current;
        let width = (currentTime / duration) * 100;
        wv.style.width = width + "%";
        if (Math.round(width) >= 100) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          wv.style.width = "0%";
          window.clearInterval(timer);
          setStatus({ ...status, player: "paused" });
        }
      }, tickInterval);
      setStatus({ ...status, player: "playing" });
      audioRef.current.volume = audio.volume;
      audioRef.current.play();
    } else {
      setStatus({ ...status, player: "paused" });
      window.clearInterval(playerTimer);
      window.clearInterval(timer);
      audioRef.current.pause();
    }
  };
  const playUploadedFile = () => {
    let d = document.querySelector("#audio-upload");
    if (d?.files.length) {
      let url = URL.createObjectURL(d.files[0]);
      let preview = document.createElement("audio");
      preview.src = url;
      preview.addEventListener(
        "loadedmetadata",
        function () {
          if (preview.duration && preview.duration !== Infinity) {
            DURATION = preview.duration;
            setDuration(DURATION);
            audioRef.current.src = "";
            audioRef.current.src = url;
            drawSpectrum(url);
            setStatus({ recorder: "stopped", player: "pause" });
            props.onSave && props.onSave(d.files[0]);
          }
        },
        false
      );
    }
  };
  useEffect(() => {
    if (!hasGetUserMedia) {
      alert(
        "Your browser cannot stream from your webcam. Please switch to Chrome or Firefox."
      );
    } else {
      captureDevice();
    }
  }, []);
  useEffect(() => {
    if (stream && props.getStream) props.getStream(stream);
  }, [stream]);
  return (
    <Paper style={{ boxShadow: "none!important" }}>
      <Box width="100%" height={127} position="relative">
        <input
          style={{ display: "none" }}
          type="file"
          accept="audio/*"
          id="audio-upload"
          onChange={() => playUploadedFile()}
        />
        <Box position="absolute" right={10} top={10} zIndex={4}>
          <PopupState variant="popover" popupId="publish-btn">
            {(popupState) => (
              <React.Fragment>
                <IconButton color="primary" {...bindTrigger(popupState)}>
                  <Icon>more_vert</Icon>
                </IconButton>
                <Menu {...bindMenu(popupState)}>
                  <MenuItem
                    onClick={downloadAudio}
                    disabled={!status.recorder || status.recorder !== "stopped"}
                  >
                    Download
                  </MenuItem>
                  <MenuItem
                    onClick={() =>
                      document.querySelector("#audio-upload").click()
                    }
                  >
                    Upload Audio
                  </MenuItem>
                </Menu>
              </React.Fragment>
            )}
          </PopupState>
        </Box>
        <div
          id="waveform"
          style={{
            background: "#eee6ff",
            display: status.recorder === "stopped" ? "block" : "none",
          }}
        ></div>
        {status.player !== "playing" && (
          <Grow in={true}>
            <Box
              width="100%"
              height="100%"
              display="flex"
              alignItems="center"
              flexDirection="column"
              justifyContent="center"
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              zIndex={3}
              style={{ background: "rgba(255,255,255,0.60)" }}
            >
              {status.recorder && status.recorder !== "stopped" ? (
                <React.Fragment>
                  <IconButton
                    onClick={stopRecording}
                    style={{ borderRadius: "50%", border: "1px solid red" }}
                  >
                    <Icon style={{ fontSize: "1em" }} color="error">
                      stop
                    </Icon>
                  </IconButton>
                  <Typography style={{ marginTop: 7 }}>
                    {moment
                      .utc(moment.duration(duration * 1000).as("milliseconds"))
                      .format("mm:ss")}
                  </Typography>
                </React.Fragment>
              ) : (
                <IconButton onClick={startRecording} color="primary">
                  <Icon style={{ fontSize: "4em" }} color={"error"}>
                    mic
                  </Icon>
                </IconButton>
              )}
            </Box>
          </Grow>
        )}
        <audio
          ref={audioRef}
          controls
          autoplay
          playsinline
          style={{ display: "none" }}
        ></audio>
      </Box>
      <Divider />
      <Box
        width="100%"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        p={isMobile ? 0 : 2}
      >
        <Box
          display="flex"
          alignItems="center"
          minWidth={isMobile ? "auto" : 100}
        >
          {status.recorder && (
            <React.Fragment>
              <IconButton
                onClick={
                  status.recorder === "recording"
                    ? pauseRecording
                    : status.recorder === "paused"
                    ? resumeRecording
                    : startRecording
                }
                color="primary"
              >
                <Icon
                  color={
                    status.recorder === "recording"
                      ? "default"
                      : status.recorder === "paused"
                      ? "primary"
                      : "error"
                  }
                >
                  {status.recorder === "recording"
                    ? "pause"
                    : status.recorder === "paused"
                    ? "play_arrow"
                    : "mic"}
                </Icon>
              </IconButton>
              {!isMobile && status.recorder === "stopped" && (
                <Typography>
                  {moment
                    .utc(
                      moment.duration(timerDuration * 1000).as("milliseconds")
                    )
                    .format("mm:ss")}
                </Typography>
              )}
            </React.Fragment>
          )}
        </Box>
        <Box>
          <ButtonGroup disabled={status.recorder !== "stopped"}>
            <IconButton>
              <Icon>fast_rewind</Icon>
            </IconButton>
            <IconButton onClick={handlePlay}>
              <Icon>
                {status.player === "playing" ? "pause" : "play_arrow"}
              </Icon>
            </IconButton>
            <IconButton>
              <Icon>fast_forward</Icon>
            </IconButton>
          </ButtonGroup>
        </Box>
        <Box
          display="flex"
          alignItems="center"
          minWidth={isMobile ? "auto" : 100}
        >
          <IconButton
            onClick={() => {
              audioRef.current.volume = audio.muted ? 1 : 0;
              setAudio({ ...audio, muted: !audio.muted });
            }}
          >
            <Icon>{audio.muted ? "volume_mute" : "volume_up"}</Icon>
          </IconButton>
          {!isMobile && (
            <Slider
              min={0}
              max={1}
              defaultValue={1}
              step={0.1}
              onChange={(e, val) => {
                audioRef.current.volume = val;
                setAudio({
                  muted: val > 0 ? false : true,
                  volume: parseFloat(val),
                });
              }}
            />
          )}
        </Box>
      </Box>
    </Paper>
  );
}

export default Recorder;
