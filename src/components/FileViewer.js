import React, { useState, useEffect } from "react";
import { Box, CircularProgress, Typography, Link } from "@material-ui/core";
import LaunchIcon from "@material-ui/icons/Launch";

function FV(props) {
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState();
  const [newUrl, setNewUrl] = useState();
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
  const viewableLinks = [
    {
      link: "drive.google.com",
      type: "google_drive",
    },
    {
      link: "docs.google.com",
      type: "google_docs",
    },
    {
      link: "youtube.com",
      type: "youtube",
      format: (url) => {
        let id = url.substr(url.indexOf("?v=") + 3, url.length);
        let x = (url = url.replace(
          url.substr(url.indexOf("watch?v="), url.length),
          "embed/" + id
        ));
        setNewUrl(x);
        setType("youtube");
      },
    },
  ];
  const [viewAbleTypes, setViewableTypes] = useState([
    "application/pdf",
    "image/jpeg",
    "image/bmp",
    "image/png",
    "image/gif",
  ]);
  const getCustomType = (url) => {
    for (let i in viewableLinks) {
      if (url.indexOf(viewableLinks[i].link) >= 0) {
        setViewableTypes([...viewAbleTypes, viewableLinks[i].type]);
        if (viewableLinks[i].format) {
          viewableLinks[i].format(url);
        } else {
          setType(viewableLinks[i].type);
        }
        return;
      }
    }
    setType("external_page");
  };
  useEffect(() => {
    if (props.url && props.type) {
      if (types.indexOf(props.type) >= 0)
        setType(types[types.indexOf(props.type)]);
    } else if (props.url) {
      getCustomType(props.url);
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
    let i = document.getElementById("file-viewer");
    i.src = "";
    i.src = !newUrl ? props.url : newUrl;
    i.onload = function () {
      try {
        let body = this.contentDocument.body;
        body.style.background = "#282828";
        body.style.display = "flex";
        body.style.justifyContent = "center";
        body.style.alignItems = "center";
        let img = body.querySelector("img");
        img.style.transition = "all 0.7s cubic-bezier(0.85, -0.04, 0, 1.4) 0s";
        img.style.cursor = "zoom-in";
        img.style.width = "50%";
        img.setAttribute("initial-width", img.clientWidth);
        img.onclick = function () {
          if (
            parseFloat(this.getAttribute("initial-width")) < this.clientWidth
          ) {
            this.style.width = this.getAttribute("initial-width");
            this.style.cursor = "zoom-in";
          } else {
            this.style.width = "100%";
            this.style.cursor = "zoom-out";
          }
        };
      } catch (e) {}
      setLoading(false);
    };
  };

  return (
    <Box width="100%" height="93%" overflow="hidden" position="relative">
      {loading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="100%"
          height="100%"
        >
          <Typography variant="body1">
            <img src="/login/loader2.svg" width={130} />
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
            <Link
              variant="body2"
              style={{ cursor: "pointer" }}
              onClick={() =>
                window.open(!newUrl ? props.url : newUrl, "_blank")
              }
            >
              Open the file in new tab insted <LaunchIcon fontSize="small" />
            </Link>
          </Typography>
        </Box>
      )}
      {type && (
        <iframe
          title="File Viewer"
          id="file-viewer"
          src={!newUrl ? props.url : newUrl}
          width="100%"
          height="100%"
          style={{ border: "none" }}
        ></iframe>
      )}
    </Box>
  );
}

export default FV;
