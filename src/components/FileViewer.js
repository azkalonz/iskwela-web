import React, { useState, useEffect } from "react";
import { Box, CircularProgress, Typography, Link } from "@material-ui/core";
import LaunchIcon from "@material-ui/icons/Launch";
import FileView from "react-file-viewer";

function FV(props) {
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState();
  const types = [
    "image/jpeg",
    "image/bmp",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];
  const viewAbleTypes = [
    "application/pdf",
    "image/jpeg",
    "image/bmp",
    "image/png",
    "image/gif",
  ];

  useEffect(() => {
    if (props.url && props.type) {
      if (types.indexOf(props.type) >= 0)
        setType(types[types.indexOf(props.type)]);
    } else {
      setLoading(true);
    }
  }, [props.url, props.type]);
  useEffect(() => {
    if (type) loadFile();
  }, [type]);

  const isViewable = () => {
    return type && viewAbleTypes.indexOf(type) >= 0 ? true : false;
  };
  const loadFile = () => {
    if (!isViewable()) {
      setLoading(false);
      setType(null);
      return;
    }
    setLoading(true);
    document.getElementById("file-viewer").src = "";
    document.getElementById("file-viewer").src = props.url;
    document.getElementById("file-viewer").onload = () => setLoading(false);
  };

  return (
    <Box width="100%" height="90vh" overflow="hidden">
      {loading && (
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

      {!type && !loading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="100%"
          height="100%"
        >
          <Typography variant="body2">
            No preview is available.
            {/* <Link
              variant="body2"
              style={{ cursor: "pointer" }}
              onClick={() => reload()}
            >
              &nbsp;Try again?
            </Link> */}
            &nbsp;or&nbsp;
            <Link
              variant="body2"
              style={{ cursor: "pointer" }}
              onClick={() => window.open(props.url, "_blank")}
            >
              Open the file in new tab insted <LaunchIcon fontSize="small" />
            </Link>
          </Typography>
        </Box>
      )}
      {type && (
        <iframe
          id="file-viewer"
          src={props.url}
          width="100%"
          height="100%"
          style={{ border: "none" }}
        ></iframe>
      )}
    </Box>
  );
}

export default FV;
