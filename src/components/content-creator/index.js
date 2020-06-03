import React, { useEffect, useState } from "react";
import $ from "jquery";
import ContentCreator from "./contentCreator";
import {
  Toolbar,
  IconButton,
  AppBar,
  Tooltip,
  Paper,
  Input,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Slider,
  Snackbar,
  Avatar,
  useTheme,
  Typography,
  Button,
} from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";
import CheckBoxOutlineBlankOutlinedIcon from "@material-ui/icons/CheckBoxOutlineBlankOutlined";
import FiberManualRecordOutlinedIcon from "@material-ui/icons/FiberManualRecordOutlined";
import ImageOutlinedIcon from "@material-ui/icons/ImageOutlined";
import TextFormatOutlinedIcon from "@material-ui/icons/TextFormatOutlined";
import ColorPicker from "material-ui-color-picker";
import SaveOutlinedIcon from "@material-ui/icons/SaveOutlined";
import BorderColorOutlinedIcon from "@material-ui/icons/BorderColorOutlined";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}
const screen = {
  width: window.outerWidth,
  height: window.outerHeight,
};
function ContentMaker(props) {
  const theme = useTheme();
  const [success, setSuccess] = useState();
  const [currentSelection, setCurrentSelection] = useState();
  const [color, setColor] = useState(theme.palette.primary.main);
  const [borderColor, setBorderColor] = useState("#222");
  const [canvasColor, setCanvasColor] = useState("#777");
  const [layers, setLayers] = useState();
  const [borderWidth, setBorderWidth] = useState(1);
  const [errors, setErrors] = useState();
  const [confirmed, setConfirmed] = useState();
  const [title, setTitle] = useState("Activity Material");
  useEffect(() => {
    setUp();
  }, []);
  useEffect(() => {
    if (currentSelection) {
      console.log("as", currentSelection);
    }
  }, [currentSelection]);
  const addScript = async (src, loc) => {
    let s = $(`<script src="${src}"></script>`);
    s.onload = () => {
      return;
    };
    loc.append(s);
  };
  const setUp = async () => {
    await addScript("/fabric.min.js", $("head"));
    $("body").css("overflow", "auto");
    const creator = new ContentCreator(window.fabric, "content-maker", {
      onSelectionCreated: (object) => setCurrentSelection(object),
      onSelectionUpdated: (object) => setCurrentSelection(object),
      onSelectionCleared: () => setCurrentSelection(null),
      onModified: () => getLayers(),
    });
    const { canvas, fabric } = creator;
    window.creator = creator;
    if (window.localStorage["content-creator"]) {
      let savedState = JSON.parse(window.localStorage["content-creator"]);
      await canvas.loadFromJSON(
        JSON.parse(window.localStorage["content-creator"]),
        function () {
          canvas.setWidth(savedState.width || 1000);
          canvas.setHeight(savedState.height || 1000);
          canvas.renderAll();
        },
        function (o, object) {
          console.log(o, object);
        }
      );
    } else {
      canvas.setWidth(1000);
      canvas.setHeight(1000);
    }
    $("#canvas-width").val(canvas.width);
    $("#canvas-height").val(canvas.height);
    setTimeout(() => getLayers(), 500);
  };
  const getLayers = () => {
    const { canvas } = getCanvas();
    setLayers(
      canvas.getObjects().map((object, index) => ({
        ...object,
        id: "item-" + index,
        object_id: object.id,
      }))
    );
    console.log(canvas.getObjects()[0]);
  };
  const addRect = (w = 500, h = 500) => {
    let { canvas, creator, width, top } = getCanvas();
    let rec = creator.rect(width / 2 - w / 2, top - h / 2, w, h, color);
    canvas.add(rec);
  };

  const getCanvas = () => {
    let creator = window.creator;
    let { canvas, fabric } = creator;
    let { width, height } = canvas;
    let top = window.scrollY + screen.height / 2;
    return {
      creator,
      canvas,
      width,
      height,
      top,
    };
  };
  const addCircle = (r = 100) => {
    let { canvas, creator, width, top } = getCanvas();
    let circle = creator.circ(r, width / 2 - r, top - r, color);
    canvas.add(circle);
  };
  const addImage = () => {
    let url = prompt("Enter URL");
    let { canvas, creator, width, top } = getCanvas();
    creator.addImage(url, (e) => setErrors(e));
  };

  const addText = (message) => {
    let { canvas, creator, width, top } = getCanvas();
    let text = creator.text(width / 2, top / 2, message);
    canvas.add(text);
  };
  const dataURItoBlob = (dataURI) => {
    var byteString = atob(dataURI.split(",")[1]);
    var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    var blob = new Blob([ab], { type: mimeString });
    return blob;
  };
  const handleSave = () => {
    setConfirmed({
      title: "Save Material",
      message: "Continue to uploading this material?",
      yes: () => {
        let { canvas } = getCanvas();
        let url = canvas.toDataURL();
        let blob = dataURItoBlob(url);
        let file = new File(
          [blob],
          title.length ? title : "Activity Material",
          { type: blob.type }
        );
        window.file = file;
        window.close();
      },
    });
  };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
      }}
    >
      <Dialog open={confirmed} onClose={() => setConfirmed(null)}>
        <DialogTitle>{confirmed && confirmed.title}</DialogTitle>
        <DialogContent>{confirmed && confirmed.message}</DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setConfirmed(null);
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
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Saved
        </Alert>
      </Snackbar>
      {errors &&
        errors.map((e) => (
          <Snackbar
            open={true}
            autoHideDuration={6000}
            onClose={() => setErrors(null)}
          >
            <Alert severity="error" onClose={() => setErrors(null)}>
              {e}
            </Alert>
          </Snackbar>
        ))}
      <AppBar position="fixed">
        <Paper>
          <Toolbar
            style={{
              justifyContent: "space-between",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Tooltip title="Save" placement="bottom">
                <IconButton onClick={() => handleSave()}>
                  <SaveOutlinedIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Add Rectang" placement="bottom">
                <IconButton onClick={() => addRect()}>
                  <CheckBoxOutlineBlankOutlinedIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Add Circle" placement="bottom">
                <IconButton onClick={() => addCircle()}>
                  <FiberManualRecordOutlinedIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Add Image" placement="bottom">
                <IconButton>
                  <ImageOutlinedIcon onClick={addImage} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Add Text" placement="bottom">
                <IconButton onClick={() => addText("Some text")}>
                  <TextFormatOutlinedIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Shape Color" placement="bottom">
                <IconButton onClick={() => $("#color-picker").click()}>
                  <Box
                    width={30}
                    height={30}
                    borderRadius="50%"
                    style={{
                      background: color ? color : theme.palette.primary.main,
                    }}
                  />
                </IconButton>
              </Tooltip>
              <ColorPicker
                name="color"
                id="color-picker"
                style={{ display: "none" }}
                defaultValue={theme.palette.primary.main}
                value={color ? color : theme.palette.primary.main}
                onChange={(color) => {
                  window.creator.changeColor(color);
                  setColor(color);
                }}
              />
              <Tooltip title="Canvas Color" placement="bottom">
                <IconButton onClick={() => $("#canvas-color").click()}>
                  <Box
                    width={30}
                    height={30}
                    borderRadius="50%"
                    style={{
                      background: canvasColor,
                    }}
                  />
                </IconButton>
              </Tooltip>
              <ColorPicker
                name="color"
                id="canvas-color"
                style={{ display: "none" }}
                defaultValue={canvasColor}
                value={canvasColor}
                onChange={(color) => {
                  window.creator.canvas
                    .setBackgroundColor(color)
                    .requestRenderAll();
                  setCanvasColor(color);
                }}
              />
              <Tooltip title="Border Color" placement="bottom">
                <IconButton onClick={() => $("#border-color-picker").click()}>
                  <BorderColorOutlinedIcon />
                </IconButton>
              </Tooltip>
              <ColorPicker
                name="color"
                id="border-color-picker"
                style={{ display: "none" }}
                defaultValue={theme.palette.primary.main}
                value={borderColor ? borderColor : theme.palette.primary.main}
                onChange={(color) => {
                  window.creator.changeBorderColor(color);
                  setBorderColor(color);
                }}
              />
              <div style={{ width: 100 }}>
                <Tooltip title="Stroke Width" placement="bottom">
                  <Slider
                    onChange={(e, val) => {
                      window.creator.changeBorderWidth(val);
                      setBorderWidth(val);
                    }}
                    defaultValue={1}
                  />
                </Tooltip>
              </div>
            </div>
            <div>
              <Input
                type="text"
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
                value={title}
                label="Material Title"
              />
            </div>

            <div style={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body1" color="textSecondary">
                Canvas Size
              </Typography>
              <Input
                style={{ width: 80 }}
                type="number"
                color="primary"
                label="Width"
                id="canvas-width"
                onChange={(e) => {
                  window.creator.canvas.setHeight(parseFloat(e.target.value));
                }}
              />
              &times;
              <Input
                style={{ width: 80 }}
                type="number"
                color="primary"
                label="Height"
                id="canvas-height"
                onChange={(e) => {
                  window.creator.canvas.setWidth(parseFloat(e.target.value));
                }}
              />
            </div>
          </Toolbar>
        </Paper>
      </AppBar>
      <canvas id="content-maker"></canvas>

      <div
        style={{
          position: "fixed",
          padding: 13,
          height: "80vh",
          right: 0,
          top: 85,
          overflow: "auto",
        }}
      >
        {layers &&
          layers.map((item, index) => (
            <div
              style={{
                background: theme.palette.type === "dark" ? "#222" : "#fff",
                marginBottom: 13,
              }}
            >
              <Button
                onClick={() => {
                  window.creator.canvas.setActiveObject(
                    window.creator.canvas.item(index)
                  );
                  window.creator.canvas.bringToFront(
                    window.creator.canvas.item(index)
                  );
                  console.log(item);
                  window.creator.canvas.requestRenderAll();
                }}
              >
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    margin: 7,
                    padding: 7,
                  }}
                >
                  {window.creator.canvas.item(index) && (
                    <img
                      src={window.creator.canvas.item(index).toDataURL()}
                      width={100}
                      height={100}
                    />
                  )}
                </div>
              </Button>
            </div>
          ))}
      </div>
    </div>
  );
}

export default ContentMaker;
