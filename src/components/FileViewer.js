import React, { useState, useEffect } from "react";
import { Box, CircularProgress, Typography, Link } from "@material-ui/core";
import LaunchIcon from "@material-ui/icons/Launch";

function FV(props) {
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState();
  const [timer, setTimer] = useState();
  const [abort, setAbort] = useState(false);

  useEffect(() => {
    setUrl(props.url);
  }, [props.url]);
  useEffect(() => {
    if (url && !abort) {
      loadFile();
    }
  }, [url]);

  const loadFile = () => {
    setTimer(false);
    setAbort(false);
    setLoading(true);
    console.log("Opening file from ", url);
    document.getElementById("file-viewer").src += "";
    document.getElementById("file-viewer").onload = () => setLoading(false);
    setTimeout(() => {
      setTimer(true);
    }, 5000);
  };
  useEffect(() => {
    if (timer) {
      if (loading) setAbort(true);
    }
  }, [timer]);

  const reload = () => {
    loadFile();
  };

  return (
    <Box width="100%" height="90vh" overflow="hidden">
      {loading && url && !abort && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="100%"
          height="100%"
        >
          <CircularProgress />
          <Typography variant="body1">
            &nbsp;&nbsp;Opening {props.title}...
          </Typography>
        </Box>
      )}

      {abort && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="100%"
          height="100%"
        >
          <Typography variant="body2">
            No preview is available.
            <Link
              variant="body2"
              style={{ cursor: "pointer" }}
              onClick={() => reload()}
            >
              &nbsp;Try again?
            </Link>
            &nbsp;or&nbsp;
            <Link
              variant="body2"
              style={{ cursor: "pointer" }}
              onClick={() => window.open(url, "_blank")}
            >
              Open the file in new tab insted <LaunchIcon fontSize="small" />
            </Link>
          </Typography>
        </Box>
      )}
      {url && (
        <iframe
          id="file-viewer"
          src={`https://docs.google.com/gview?url=${url}&embedded=true`}
          width="100%"
          height="100%"
          style={{ border: "none" }}
        ></iframe>
      )}
    </Box>
  );
}

export default FV;
