import {
  Box,
  Dialog,
  DialogContent,
  Icon,
  IconButton,
  Link,
  Toolbar,
  Typography,
  makeStyles,
  useTheme,
  useMediaQuery,
} from "@material-ui/core";
import LaunchIcon from "@material-ui/icons/Launch";
import React, { useEffect, useState } from "react";
import Recorder from "./Recorder";

function FV(props) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const styles = useStyles();
  const [status, setStatus] = useState("");
  const [fullscreen, setFullscreen] = useState(false);
  const [floating, setFloating] = useState(false);
  const [CustomLoader, setCustomLoader] = useState();
  const viewableLinks = [
    {
      link: "drive.google.com",
      type: "google_drive",
    },
    {
      link: "iskwela.sgp1.digitaloceanspaces.com",
      type: "iskwela_file",
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
        return {
          url: x,
          type: "youtube",
        };
      },
    },
    {
      link: "mentimeter.com/s",
      type: "mentimeter",
      format: (url) => {
        let x = url.replace("/s/", "/embed/");
        return {
          url: x,
          type: "mentimeter",
        };
      },
    },
  ];
  const viewAbleTypes = [
    "application/pdf",
    "image/jpeg",
    "image/bmp",
    "image/png",
    "image/gif",
    "video/mp4",
    // "audio/wav",
    // "audio/x-wav",
    // "audio/ogg",
    "video/x-flv",
    "application/x-mpegURL",
    "video/MP2T",
    "video/3gpp",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-ms-wmv",
    "text/plain",
  ].concat(viewableLinks.map((l) => l.type));

  const customFileLoader = {
    audio: {
      load: () => {
        setStatus("CUSTOM_LOADED");
        setCustomLoader(
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            width="100%"
            height="100%"
          >
            <Recorder
              preview={true}
              src={props.file.url}
              wvConfig={{
                height: 90,
              }}
            />
          </Box>
        );
      },
    },
  };

  const getCustomType = (url) => {
    for (let i in viewableLinks) {
      if (url.indexOf(viewableLinks[i].link) >= 0) {
        if (viewableLinks[i].format) {
          return viewableLinks[i].format(url);
        } else {
          return viewableLinks[i].type;
        }
      }
    }
  };
  const getCustomLoader = (type) =>
    customFileLoader[
      Object.keys(customFileLoader).find((k) => type && type.indexOf(k) >= 0)
    ];
  useEffect(() => {
    if (typeof props.open === "function") props.open(() => setOpen(true));
  }, [props.open]);
  useEffect(() => {
    if (props.file) loadFile();
  }, [props.file, fullscreen, floating]);
  const isViewable = (type) => {
    return type && viewAbleTypes.indexOf(type) >= 0 ? true : false;
  };
  const loadFile = () => {
    setStatus("LOADING");
    if (props.file.url) {
      if (isViewable(props.file.type)) {
        loadIframe();
      } else if (getCustomLoader(props.file.type)) {
        getCustomLoader(props.file.type).load();
      } else if (getCustomType(props.file.url)) {
        let f = getCustomType(props.file.url);
        if (typeof f === "string") loadIframe();
        else loadIframe(f.url);
      } else {
        setStatus("INVALID");
      }
    }
  };

  const loadIframe = (url = props.file.url) => {
    setTimeout(() => {
      let i = document.getElementById("file-viewer");
      if (i) {
        i.src = "";
        i.src = url;
        i.onload = function () {
          try {
            let body = this.contentDocument.body;
            body.style.background = "#282828";
            body.style.display = "flex";
            body.style.justifyContent = "center";
            body.style.alignItems = "center";
            let img = body.querySelector("img");
            img.style.transition =
              "all 0.7s cubic-bezier(0.85, -0.04, 0, 1.4) 0s";
            img.style.cursor = "zoom-in";
            img.style.width = "50%";
            img.setAttribute("zoom", "in");
            img.onclick = function () {
              if (this.getAttribute("zoom") === "in") {
                this.style.width = "100%";
                this.style.cursor = "zoom-out";
                this.setAttribute("zoom", "out");
              } else {
                this.style.width = "50%";
                this.style.cursor = "zoom-in";
                this.setAttribute("zoom", "in");
              }
            };
          } catch (e) {}
          setStatus("LOADED");
        };
      }
    }, 500);
  };
  const handleClose = () => {
    setStatus("");
    if (typeof props.file.onCancel === "function") props.file.onCancel();
    if (typeof props.onClose === "function") props.onClose();
  };
  useEffect(() => {
    if (isMobile) setFullscreen(true);
  }, [isMobile]);
  const content = (
    <React.Fragment>
      <Toolbar
        className={[
          styles.toolbar,
          ...(fullscreen && !isMobile ? ["fullscreen"] : []),
        ].join(" ")}
      >
        <Typography
          variant="body1"
          color="textPrimary"
          style={{ fontWeight: "bold", display: "block", flex: 1 }}
        >
          {props.file.title}
        </Typography>
        <div>
          <IconButton onClick={() => setFullscreen(!fullscreen)}>
            {fullscreen ? (
              <Icon fontSize="small">fullscreen_exit</Icon>
            ) : (
              <Icon fontSize="small">fullscreen</Icon>
            )}
          </IconButton>
          {!isMobile && (
            <IconButton onClick={() => setFloating(!floating)}>
              {floating ? (
                <Icon fontSize="small">check_box_outline_blank</Icon>
              ) : (
                <Icon fontSize="small">minimize</Icon>
              )}
            </IconButton>
          )}
          <IconButton onClick={handleClose}>
            <Icon fontSize="small">close</Icon>
          </IconButton>
        </div>
      </Toolbar>
      <Box
        width="100%"
        height={fullscreen ? "100%" : "93%"}
        overflow="hidden"
        position="relative"
      >
        {status === "LOADING" && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            width="100%"
            height="100%"
          >
            {!props.error ? (
              <img src="/login/loader2.svg" alt="Loading..." width={130} />
            ) : (
              "Something went wrong" + props.error
            )}
          </Box>
        )}

        {status === "INVALID" && (
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
                href={props.file.url}
                target="_blank"
              >
                Open the file in new tab insted <LaunchIcon fontSize="small" />
              </Link>
            </Typography>
          </Box>
        )}
        <iframe
          title="File Viewer"
          id="file-viewer"
          width="100%"
          height="100%"
          style={{
            border: "none",
            display: status === "LOADED" ? "block" : "none",
          }}
        ></iframe>
        {status === "CUSTOM_LOADED" && CustomLoader}
      </Box>
    </React.Fragment>
  );
  return (
    open && (
      <React.Fragment>
        {!floating || fullscreen || (isMobile && floating) ? (
          <Dialog
            open={status ? true : false}
            keepMounted
            id="file-viewer-container"
            fullWidth
            maxWidth="xl"
            fullScreen={fullscreen}
            onClose={handleClose}
          >
            <DialogContent style={{ height: "100vh" }}>{content}</DialogContent>
          </Dialog>
        ) : (
          <Box className="floating-file-viewer">{content}</Box>
        )}
      </React.Fragment>
    )
  );
}
const useStyles = makeStyles(() => ({
  toolbar: {
    position: "sticky",
    zIndex: 10,
    background: "#fff",
    top: 0,
    height: "6%",
    right: 0,
    left: 0,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    "&.fullscreen": {
      opacity: 0,
      position: "fixed",
      "&:hover": {
        opacity: 1,
      },
    },
  },
}));
export default FV;
