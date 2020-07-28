import {
  Box,
  Button,
  Grow,
  Icon,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Slider,
  TextField,
  Toolbar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  useTheme,
  ButtonGroup,
  Divider,
  CircularProgress,
} from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";
// import ContentCreator from "./contentCreator";
import $ from "jquery";
import ColorPicker from "material-ui-color-picker";
import React, { useEffect, useRef, useState } from "react";
import { GooglePicker } from "../dialogs";
import socket from "../socket.io";
import moment from "moment";
import Api from "../../api";

const screen = {
  width: window.outerWidth,
  height: window.outerHeight,
};
export const config = {
  width: 720,
  height: 900,
  maxWidth: 1500,
  maxHeight: 1500,
  padding: 30,
  background: "#fff",
};
function ContentCreator(fabric, id, params = {}) {
  fabric.Object.prototype.transparentCorners = false;
  this.canvas = new fabric.Canvas(id, {
    isDrawingMode: false,
  });
  this.canvas._historyInit();
  this.fabric = fabric;
  this.circ = (radius, left, top, fill) =>
    new this.fabric.Circle({
      radius,
      left,
      stroke: 1,
      top,
      fill,
      cornerColor: "blue",
    });
  this.text = (left, top, body, style) =>
    new this.fabric.IText(body, {
      left,
      top,
      cornerColor: "blue",
      ...(style ? style : {}),
    });
  this.rect = (left, top, width, height, fill) =>
    new this.fabric.Rect({
      left,
      top,
      stroke: 1,
      fill,
      width,
      height,
    });

  this.paste = () => {
    if (!this._clipboard) return;
    this._clipboard.clone((clonedObj) => {
      this.canvas.discardActiveObject();
      clonedObj.set({
        left: clonedObj.left + 10,
        top: clonedObj.top + 10,
        evented: true,
      });
      if (clonedObj.type === "activeSelection") {
        clonedObj.canvas = this.canvas;
        clonedObj.forEachObject((obj) => {
          this.canvas.add(obj);
        });
        clonedObj.setCoords();
      } else {
        this.canvas.add(clonedObj);
      }
      this.canvas.setActiveObject(clonedObj);
      this.canvas.requestRenderAll();
    });
  };
  this.poly = (left, top, fill, points) =>
    new this.fabric.Polygon(points, {
      left,
      top,
      fill,
      strokeWidth: 0,
      objectCaching: false,
      transparentCorners: false,
      cornerColor: "blue",
    });
  this.copy = () => {
    if (!this.canvas.getActiveObject()) return;
    this.canvas.getActiveObject().clone((cloned) => {
      this._clipboard = cloned;
    });
  };
  this.save = (callback = null) => {
    window.localStorage["content-creator"] = JSON.stringify({
      ...this.canvas.toJSON(),
      width: this.canvas.width,
      height: this.canvas.height,
      background: this.canvas.backgroundColor,
    });
    if (callback) callback();
  };
  this.addImage = (url, callback = null, style = {}) => {
    if (!url) return;
    this.fabric.Image.fromURL(
      url,
      (myImg) => {
        try {
          var img1 = myImg.set({
            left: 0,
            top: 0,
            width: myImg._originalElement.width,
            height: myImg._originalElement.height,
            ...style,
          });
          img1.scaleToWidth(500);
          this.canvas.add(img1);
        } catch (e) {
          callback && callback(["Invalid Image"]);
        }
      }
      // { crossOrigin: "Anonymous" }
    );
  };
  this.remove = () => {
    this.canvas.getActiveObjects().forEach((obj) => {
      this.canvas.remove(obj);
    });
    this.canvas.discardActiveObject().renderAll();
    params.onModified && params.onModified();
  };
  this.changeColor = (color) => {
    if (!this.canvas.getActiveObject()) return;
    this.canvas.getActiveObject().set("fill", color);
    this.canvas.renderAll();
  };
  this.changeBorderColor = (color) => {
    if (!this.canvas.getActiveObject()) return;
    this.canvas.getActiveObject().set("stroke", color);
    this.canvas.renderAll();
  };
  this.changeBorderWidth = (width) => {
    if (!this.canvas.getActiveObject()) return;
    this.canvas.getActiveObject().set("strokeWidth", width);
    this.canvas.renderAll();
  };
  document.body.addEventListener(
    "keydown",
    (e) => {
      e = e || window.event;
      var key = e.which || e.keyCode; // keyCode detection
      var ctrl = e.ctrlKey ? e.ctrlKey : key === 17 ? true : false; // ctrl detection
      if (key === 86 && ctrl) {
        this.paste();
      } else if (key === 67 && ctrl) {
        this.copy();
      } else if (key === 46) {
        this.remove();
      } else if (key === 90 && ctrl) {
        this.canvas.undo();
      } else if (key === 89 && ctrl) {
        this.canvas.redo();
      } else if (key === 83 && ctrl) {
        this.save();
      } else if (key === 88 && ctrl) {
        this.copy();
        this.remove();
      } else if (key === 27) {
        this.canvas.discardActiveObject();
        this.canvas.requestRenderAll();
      } else if (key === 65) {
        if (this.currentSelection) {
          this.currentSelection.fontFamily = "impact";
          this.canvas.renderAll();
        }
      }
    },
    false
  );

  if (this.fabric.PatternBrush) {
    this.vLinePatternBrush = new this.fabric.PatternBrush(this.canvas);
    this.vLinePatternBrush.getPatternSrc = function () {
      var patternCanvas = fabric.document.createElement("canvas");
      patternCanvas.width = patternCanvas.height = 10;
      var ctx = patternCanvas.getContext("2d");

      ctx.strokeStyle = this.color;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(0, 5);
      ctx.lineTo(10, 5);
      ctx.closePath();
      ctx.stroke();

      return patternCanvas;
    };

    this.hLinePatternBrush = new this.fabric.PatternBrush(this.canvas);
    this.hLinePatternBrush.getPatternSrc = function () {
      var patternCanvas = fabric.document.createElement("canvas");
      patternCanvas.width = patternCanvas.height = 10;
      var ctx = patternCanvas.getContext("2d");

      ctx.strokeStyle = this.color;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(5, 0);
      ctx.lineTo(5, 10);
      ctx.closePath();
      ctx.stroke();

      return patternCanvas;
    };

    this.squarePatternBrush = new this.fabric.PatternBrush(this.canvas);
    this.squarePatternBrush.getPatternSrc = function () {
      var squareWidth = 10,
        squareDistance = 2;

      var patternCanvas = fabric.document.createElement("canvas");
      patternCanvas.width = patternCanvas.height = squareWidth + squareDistance;
      var ctx = patternCanvas.getContext("2d");

      ctx.fillStyle = this.color;
      ctx.fillRect(0, 0, squareWidth, squareWidth);

      return patternCanvas;
    };
    this.diamondPatternBrush = new this.fabric.PatternBrush(this.canvas);
    this.diamondPatternBrush.getPatternSrc = function () {
      var squareWidth = 10,
        squareDistance = 5;
      var patternCanvas = fabric.document.createElement("canvas");
      var rect = new fabric.Rect({
        width: squareWidth,
        height: squareWidth,
        angle: 45,
        fill: this.color,
      });

      var canvasWidth = rect.getBoundingRect().width;

      patternCanvas.width = patternCanvas.height = canvasWidth + squareDistance;
      rect.set({ left: canvasWidth / 2, top: canvasWidth / 2 });

      var ctx = patternCanvas.getContext("2d");
      rect.render(ctx);

      return patternCanvas;
    };

    var img = new Image();
    img.src = "/content-maker/pattern.png";

    this.texturePatternBrush = new this.fabric.PatternBrush(this.canvas);
    this.texturePatternBrush.source = img;
  }
}
function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}
export const dataURItoBlob = (dataURI) => {
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
const zoomStart = (e) => {
  let cont = document.querySelector(".canvas-container");
  let z = cont.getAttribute("data-zoom");
  if (!z) {
    z = 1;
    cont.setAttribute("data-zoom", 1);
  } else z = parseFloat(z) + window.zoomScale;
  cont.style.transform = `scale(${z})`;
  cont.style.transformOrigin = `${e.clientX - 325}px ${e.clientY}px`;
  cont.setAttribute("data-zoom", z);
};
const zoomArea = () => {
  let cont = document.querySelector("#right-panel");
  if (!document.querySelector("#zoom-area")) {
    let x = document.createElement("div");
    let i = document.createElement("img");
    x.appendChild(i);
    x.setAttribute("id", "zoom-area");
    x.style.position = "absolute";
    x.style.left = 0;
    x.style.zIndex = 99;
    x.style.overflow = "hidden";
    x.style.top = 0;
    x.style.bottom = 0;
    x.style.right = 0;
    x.style.cursor = window.zoomScale >= 0 ? "zoom-in" : "zoom-out";
    cont.appendChild(x);
    x.removeEventListener("mousedown", zoomStart);
    x.addEventListener("mousedown", zoomStart);
  } else {
    let c = document.querySelector("#zoom-area");
    c.style.display = "block";
    c.style.cursor = window.zoomScale >= 0 ? "zoom-in" : "zoom-out";
  }
};
const zoomStop = (reset = false) => {
  let c = document.querySelector("#zoom-area");
  if (reset)
    document.querySelector(".canvas-container").style.transform = "none";
  if (!c) return;
  c.style.display = "none";
};
const zoom = (scale, relative = false) => {
  if (!relative) {
    window.zoomScale = scale;
    zoomArea();
  } else {
    let cont = document.querySelector(".canvas-container");
    cont.style.transform = `scale(${scale})`;
  }
};
export const scaleContainer = (container = "") => {
  let rpanelToolbar = document.querySelector(
    "#" + container + " #right-panel-toolbar"
  );
  if (!rpanelToolbar) return;
  let screen =
    window.innerHeight -
    rpanelToolbar.clientHeight -
    (config.padding || 0) -
    rpanelToolbar.getBoundingClientRect().y;
  let scale =
    screen /
    document.querySelector("#" + container + " #" + container + "-canvas")
      .clientHeight;
  let rpanel = document.querySelector("#" + container + " #right-panel");
  if (scale < 1) {
    document.querySelector(
      "#" + container + " #content-maker-container"
    ).style.transform = `scale(${scale})`;
    document.querySelector(
      "#" + container + " #content-maker-container"
    ).style.transformOrigin = "center top";
    document.querySelector(
      "#" + container + " .canvas-container"
    ).style.height = "auto";
    rpanel.style.width = screen + "px";
    rpanel.style.height =
      window.innerHeight - rpanelToolbar.clientHeight + "px";
  }
};
const resizeDomEl = (e) => {
  if (!window.resizing) return;
  let el = window.resizing.el.parentElement;
  let isVertical = window.resizing.orientation === "vertical";
  let orientation = isVertical ? "width" : "height";
  let size =
    el[
      window.resizing.orientation === "vertical"
        ? "clientWidth"
        : "clientHeight"
    ];
  let max;
  let initialSize = el.getAttribute("data-initial-size");
  let offset = window.resizing.inverted
    ? isVertical
      ? window.innerWidth
      : window.innerHeight
    : 0;
  let overrideSize = offset - e[isVertical ? "clientX" : "clientY"];
  if (!window.resizing.maxSize) max = parseInt(initialSize);
  else max = window.resizing.maxSize;
  if (size > max && overrideSize < 0) {
    el.style[orientation] = size - (size % max) + "px";
    if (window.resizing.force)
      el.style["min" + orientation.ucfirst()] = size - (size % max) + "px";
    window.resizing.done();
  } else if (
    window.resizing.minSize &&
    size < window.resizing.minSize &&
    overrideSize < 0
  ) {
    el.style[orientation] = window.resizing.minSize + 4 + "px";
    if (window.resizing.force)
      el.style["min" + orientation.ucfirst()] =
        window.resizing.minSize + 4 + "px";
    window.resizing.done();
  } else {
    if (overrideSize < 0) {
      el.style[orientation] =
        e[isVertical ? "clientX" : "clientY"] -
        (window.resizing.offset || 0) -
        (document.querySelector("#toolbar")
          ? document.querySelector("#toolbar").getBoundingClientRect()[
              isVertical ? "x" : "y"
            ]
          : 0) +
        "px";
      if (window.resizing.force)
        el.style["min" + orientation.ucfirst()] =
          e[isVertical ? "clientX" : "clientY"] -
          (window.resizing.offset || 0) -
          (document.querySelector("#toolbar")
            ? document.querySelector("#toolbar").getBoundingClientRect()[
                isVertical ? "x" : "y"
              ]
            : 0) +
          "px";
    } else {
      el.style[orientation] = overrideSize + "px";
      el.style["min" + orientation.ucfirst()] = overrideSize + "px";
    }
    window.resizing.el.classList.add("resizing");
    window.resizing.callback && window.resizing.callback();
  }
};
export function ResizeLine(props) {
  const resizeRef = useRef();
  const styles = useStyles();

  const done = () => {
    window.resizing && window.resizing.el.classList.remove("resizing");
    window.resizing = null;
    document.body.style.userSelect = "initial";
    document.body.style.cursor = "default";
    props.done();
  };
  const start = () => {
    document.body.style.userSelect = "none";
    document.body.style.cursor =
      (props.orientation === "vertical" ? "ew" : "ns") + "-resize";
    window.resizing = {
      el: resizeRef.current,
      orientation: props.orientation,
      maxSize: props.maxSize,
      minSize: props.minSize,
      done,
      offset: props.offset,
      force: props.force,
      inverted: props.inverted,
      callback: props.onResize,
    };
    window.addEventListener("mousemove", resizeDomEl);
    window.addEventListener("mouseup", done);
  };
  const stop = () => {
    window.resizing = null;
    window.removeEventListener("mousemove", resizeDomEl);
    window.removeEventListener("mouseup", done);
  };
  useEffect(() => {
    if (props.resizing) start();
    else stop();
  }, [props.resizing]);
  return (
    <Box
      onMouseDown={() => {
        if (!resizeRef.current.parentElement.getAttribute("data-initial-size"))
          resizeRef.current.parentElement.setAttribute(
            "data-initial-size",
            resizeRef.current.parentElement[
              props.orientation === "vertical" ? "clientWidth" : "clientHeight"
            ]
          );
        props.ready();
      }}
      className={styles.resizeline}
      ref={resizeRef}
      style={{
        position: "relative",
        zIndex: 10,
        cursor: (props.orientation === "vertical" ? "ew" : "ns") + "-resize",
        ...props.style,
      }}
    ></Box>
  );
}
function CircleColorPicker(props) {
  const [color, setColor] = useState();
  const btnRef = useRef();
  const [isVisible, setIsVisible] = useState(false);
  return (
    <Box position="relative">
      <Button
        ref={btnRef}
        onClick={() => {
          if (btnRef.current) {
            btnRef.current.nextElementSibling.querySelector(
              "input"
            ).style.display = "none";
            btnRef.current.nextElementSibling.click();
          }
          setIsVisible(!isVisible);
        }}
        style={{
          background: color || "#fff",
          width: 30,
          minWidth: 30,
          height: 30,
          border: "1px solid rgba(0,0,0,0.17)",
        }}
      ></Button>
      <ColorPicker
        name="color"
        style={{
          display: isVisible ? "block" : "none",
          position: "absolute",
          top: 50,
          left: 0,
        }}
        value={props.value || color || "#fff"}
        onChange={(color) => {
          setColor(color);
          props.onChange && props.onChange(color);
        }}
      />
    </Box>
  );
}
export function getControls(
  {
    addCircle,
    triangle,
    changeBrush,
    setCanvasConfig,
    canvasConfig,
    addText,
    addRect,
  },
  filter = [],
  customControls = [],
  props
) {
  return [
    {
      id: "save",
      title: "Save",
      action: "save",
      icon: "save",
    },
    {
      id: "select",
      title: "Select",
      icon: "highlight_alt",
      action: "closeDrawing",
    },
    {
      id: "shapes",
      title: "Shape",
      icon: "crop_square",
      type: "atomic",
      tools: ["stroke_color", "stroke_width", "shape_color"],
      atomicComponent: (
        <React.Fragment>
          <List>
            {[
              {
                title: "Square",
                icon: "crop_square",
                onClick: addRect,
              },
              { title: "Circle", icon: "lens", onClick: addCircle },
              {
                title: "Triangle",
                icon: "change_history",
                onClick: triangle,
              },
            ].map((c, key) => (
              <ListItem key={key} onClick={() => c.onClick()}>
                <ListItemIcon>
                  <Icon>{c.icon}</Icon>
                </ListItemIcon>
                <ListItemText primary={c.title} />
              </ListItem>
            ))}
          </List>
        </React.Fragment>
      ),
    },
    {
      id: "brush",
      title: "Select Brush",
      type: "atomic",
      action: "toggleDrawing",
      tools: ["brush_color", "brush_size", "brush_shadow", "brush_shadow_blur"],
      atomicComponent: (
        <React.Fragment>
          <List>
            {brushes.map((i, ii) => (
              <ListItem
                key={ii}
                onClick={() => {
                  changeBrush(i.id, {
                    color: "black",
                  });
                  setCanvasConfig({
                    ...canvasConfig,
                    brushIndex: ii,
                  });
                }}
                style={{
                  background:
                    canvasConfig.brushIndex >= 0 &&
                    canvasConfig.brushIndex === ii
                      ? "rgba(0,0,0,0.16)"
                      : "",
                }}
              >
                <ListItemText primary={i.name} />
              </ListItem>
            ))}
          </List>
        </React.Fragment>
      ),
      icon: "brush",
      onClose: (c) => c.actions.closeDrawing(),
    },
    {
      id: "text",
      title: "Text",
      icon: "text_fields",
      type: "atomic",
      atomicComponent: (closeControl) => (
        <Box p={2}>
          <List style={{ maxWidth: 325 }}>
            {textStyles.map((s, index) => (
              <ListItem key={index} onClick={() => addText("Text", s.style)}>
                <ListItemText
                  primary="Lorem ipsum dolor sit amet, consectetur..."
                  primaryTypographyProps={{
                    style: {
                      ...(s.style ? s.style : {}),
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      ),
    },
    {
      id: "image",
      title: "Image",
      icon: "insert_photo",
      type: "atomic",
      atomicComponent: (closeControl) => (
        <Box p={2}>
          <List>
            {[
              {
                title: "Insert URL",
                icon: "link",
                onClick: () => {
                  let url = prompt("Enter URL");
                  if (url) {
                    window.creator.addImage(url);
                  }
                },
              },
              {
                title: "Upload Image",
                icon: "insert_photo",
                onClick: () => {
                  let c = document.querySelector(
                    "#" + props.id + " #upload-image"
                  );
                  if (!c) {
                    let x = document.createElement("input");
                    x.setAttribute("type", "file");
                    x.setAttribute("id", "upload-image");
                    x.setAttribute(
                      "accept",
                      "image/x-png,image/gif,image/jpeg"
                    );
                    x.addEventListener("change", async () => {
                      if (c.files.length) {
                        if (props.upload_to_server) {
                          let body = new FormData();
                          body.append("file", c.files[0]);
                          let uploadedFile = await Api.post(
                            "/api/public/upload",
                            {
                              body,
                            }
                          );
                          if (uploadedFile.url) {
                            window.creator.addImage(uploadedFile.url);
                          }
                        } else {
                          if (URL.createObjectURL(c.files[0]))
                            window.creator.addImage(
                              URL.createObjectURL(c.files[0])
                            );
                        }
                      }
                    });
                    x.style.display = "none";
                    document.querySelector("#" + props.id).appendChild(x);
                  }
                  c = document.querySelector("#" + props.id + " #upload-image");
                  c.click();
                },
              },
              {
                title: "Google Drive",
                onClick: () => window.GPICKER && window.GPICKER(),
                icon: "storage",
              },
            ].map((c, index) => (
              <ListItem key={index} onClick={c.onClick}>
                <ListItemIcon>
                  <Icon>{c.icon}</Icon>
                </ListItemIcon>
                <ListItemText primary={c.title} />
              </ListItem>
            ))}
          </List>
        </Box>
      ),
    },
    {
      id: "zoom",
      title: "Zoom",
      icon: "zoom_in",
      type: "atomic",
      atomicComponent: (closeControl) => (
        <Box p={2}>
          <List>
            {[
              {
                title: "Zoom In",
                icon: "zoom_in",
                onClick: () => zoom(0.1),
              },
              {
                title: "Zoom Out",
                icon: "zoom_out",
                onClick: () => zoom(-0.1),
              },
            ].map((c, index) => (
              <ListItem key={index} onClick={() => c.onClick()}>
                <ListItemIcon>
                  <Icon>{c.icon}</Icon>
                </ListItemIcon>
                <ListItemText primary={c.title} />
              </ListItem>
            ))}
          </List>
          <Slider
            onChange={(e, val) => {
              zoom(parseFloat(val), true);
            }}
            min={0.1}
            max={2}
            step={0.1}
            defaultValue={1}
          />
          <Button onClick={() => zoomStop(true)} variant="contained">
            Reset
          </Button>
        </Box>
      ),
      onClose: () => zoomStop(),
    },
  ]
    .concat(customControls)
    .filter((c) => filter.indexOf(c.id) < 0);
}
export const getDefaultControls = (
  { canvasConfig, setCanvasConfig },
  appendControl = [],
  id
) => (
  <Box p={2} width={325} display="flex" flexWrap="wrap">
    <TextField
      fullWidth
      variant="outlined"
      label="File Title"
      margin="dense"
      defaultValue={canvasConfig.title}
      className="themed-input"
      onChange={(e) => {
        setCanvasConfig({ ...canvasConfig, title: e.target.value });
      }}
    />
    <Box display="flex" fullWidth>
      <TextField
        variant="outlined"
        type="number"
        label="Width"
        className="themed-input"
        style={{ marginRight: 5 }}
        margin="dense"
        inputProps={{
          max: config.maxWidth,
        }}
        value={canvasConfig.width || config.width}
        onChange={(e) => {
          let size = parseFloat(e.target.value);
          if (!size) return;
          setCanvasConfig({ ...canvasConfig, width: size });
          if (size <= config.maxWidth) window.creator.canvas.setWidth(size);
          else alert("Canvas width exceeded");
          scaleContainer(id);
        }}
      />
      <TextField
        variant="outlined"
        style={{ marginLeft: 5 }}
        margin="dense"
        type="number"
        label="Height"
        className="themed-input"
        inputProps={{
          max: config.maxHeight,
        }}
        onChange={(e) => {
          let size = parseFloat(e.target.value);
          if (!size) return;
          setCanvasConfig({ ...canvasConfig, height: size });
          if (size <= config.maxHeight) window.creator.canvas.setHeight(size);
          else alert("Canvas height exceeded");
          scaleContainer(id);
        }}
        value={canvasConfig.height || config.height}
      />
    </Box>
    <Box marginTop={2}>
      <Typography>Background Color</Typography>
      <CircleColorPicker
        value={canvasConfig.background || "#fff"}
        onChange={(color) => {
          setCanvasConfig({ ...canvasConfig, background: color });
          window.creator.canvas.setBackgroundColor(color).renderAll();
        }}
      />
    </Box>
    {appendControl.map((c, key) => (
      <Box marginTop={2} key={key}>
        {c}
      </Box>
    ))}
  </Box>
);
export const blobToBase64 = (blob) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function () {
      resolve(reader.result);
    };
  });
};
function ContentMaker(props) {
  useEffect(() => {
    window.onresize = () => {
      scaleContainer("editor");
    };
    scaleContainer("editor");
  }, []);
  return (
    <Canvas
      id="editor"
      config={config}
      controls={(c) => getControls(c, [], [], { id: "editor" })}
      defaultControl={(c) => getDefaultControls(c, [], "editor")}
    />
  );
}
export function Canvas(props) {
  const theme = useTheme();
  const query = require("query-string").parse(window.location.search);
  const styles = useStyles();
  const [canvasConfig, setCanvasConfig] = useState({
    title: (
      "Activity Material " + moment(new Date()).format("MMM DD, YYYY")
    ).replace(" ", "-"),
  });
  const [saving, setSaving] = useState(false);
  const [isResizing, setIsResizing] = useState({});
  const [confirmed, setConfirmed] = useState();
  const [toolSet, setToolSet] = useState([]);

  useEffect(() => {
    setUp();
  }, []);
  const changeBrush = (id) => {
    let { canvas, creator } = getCanvas();
    let { fabric } = creator;
    if (creator[id]) {
      canvas.freeDrawingBrush = creator[id];
    } else if (fabric[id + "Brush"]) {
      canvas.freeDrawingBrush = new fabric[id + "Brush"](canvas);
    } else {
      // canvas.freeDrawingBrush = ;
    }
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = 30;
    }
  };
  const changeBrushStyle = (styles, addTo = null, fallback) => {
    let { canvas } = getCanvas();
    Object.keys(styles).forEach((s) => {
      if (canvas.freeDrawingBrush) {
        if (!addTo) canvas.freeDrawingBrush[s] = styles[s];
        else {
          if (canvas.freeDrawingBrush[addTo]) {
            canvas.freeDrawingBrush[addTo][s] = styles[s];
          } else {
            canvas.freeDrawingBrush[addTo] = fallback;
          }
        }
      }
    });
  };
  const setUp = async () => {
    $("body").css("overflow", "auto");
    /**
     * Override the initialize function for the _historyInit();
     */
    window.fabric.Canvas.prototype.initialize = (function (originalFn) {
      return function (...args) {
        originalFn.call(this, ...args);
        this._historyInit();
        return this;
      };
    })(window.fabric.Canvas.prototype.initialize);

    /**
     * Override the dispose function for the _historyDispose();
     */
    window.fabric.Canvas.prototype.dispose = (function (originalFn) {
      return function (...args) {
        originalFn.call(this, ...args);
        this._historyDispose();
        return this;
      };
    })(window.fabric.Canvas.prototype.dispose);

    /**
     * Returns current state of the string of the canvas
     */
    window.fabric.Canvas.prototype._historyNext = function () {
      return JSON.stringify(this.toDatalessJSON(this.extraProps));
    };

    /**
     * Returns an object with fabricjs event mappings
     */
    window.fabric.Canvas.prototype._historyEvents = function () {
      return {
        "object:added": this._historySaveAction,
        "object:removed": this._historySaveAction,
        "object:modified": this._historySaveAction,
        "object:skewing": this._historySaveAction,
      };
    };

    /**
     * Initialization of the plugin
     */
    window.fabric.Canvas.prototype._historyInit = function () {
      this.historyUndo = [];
      this.historyRedo = [];
      this.extraProps = ["selectable"];
      this.historyNextState = this._historyNext();

      this.on(this._historyEvents());
    };

    /**
     * Remove the custom event listeners
     */
    window.fabric.Canvas.prototype._historyDispose = function () {
      this.off(this._historyEvents());
    };

    /**
     * It pushes the state of the canvas into history stack
     */
    window.fabric.Canvas.prototype._historySaveAction = function () {
      if (this.historyProcessing) return;

      const json = this.historyNextState;
      this.historyUndo.push(json);
      this.historyNextState = this._historyNext();
      this.fire("history:append", { json: json });
    };

    /**
     * Undo to latest history.
     * Pop the latest state of the history. Re-render.
     * Also, pushes into redo history.
     */
    window.fabric.Canvas.prototype.undo = function (callback) {
      // The undo process will render the new states of the objects
      // Therefore, object:added and object:modified events will triggered again
      // To ignore those events, we are setting a flag.
      this.historyProcessing = true;

      const history = this.historyUndo.pop();
      if (history) {
        // Push the current state to the redo history
        this.historyRedo.push(this._historyNext());
        this.historyNextState = history;
        this._loadHistory(history, "history:undo", callback);
      } else {
        this.historyProcessing = false;
      }
    };

    /**
     * Redo to latest undo history.
     */
    window.fabric.Canvas.prototype.redo = function (callback) {
      // The undo process will render the new states of the objects
      // Therefore, object:added and object:modified events will triggered again
      // To ignore those events, we are setting a flag.
      this.historyProcessing = true;
      const history = this.historyRedo.pop();
      if (history) {
        // Every redo action is actually a new action to the undo history
        this.historyUndo.push(this._historyNext());
        this.historyNextState = history;
        this._loadHistory(history, "history:redo", callback);
      } else {
        this.historyProcessing = false;
      }
    };

    window.fabric.Canvas.prototype._loadHistory = function (
      history,
      event,
      callback
    ) {
      var that = this;

      this.loadFromJSON(history, function () {
        that.renderAll();
        that.fire(event);
        that.historyProcessing = false;

        if (callback && typeof callback === "function") callback();
      });
    };

    /**
     * Clear undo and redo history stacks
     */
    window.fabric.Canvas.prototype.clearHistory = function () {
      this.historyUndo = [];
      this.historyRedo = [];
      this.fire("history:clear");
    };

    /**
     * Off the history
     */
    window.fabric.Canvas.prototype.offHistory = function () {
      this.historyProcessing = true;
    };

    /**
     * On the history
     */
    window.fabric.Canvas.prototype.onHistory = function () {
      this.historyProcessing = false;

      this._historySaveAction();
    };

    const creator = new ContentCreator(window.fabric, props.id + "-canvas", {
      onModified: () => getLayers(),
    });
    const { canvas } = creator;
    window.creator = creator;
    if (props.value) {
      let savedState = props.value;
      await canvas.loadFromJSON(savedState, function () {
        canvas.setWidth(props.config.width || savedState.width || config.width);
        canvas.setHeight(
          props.config.height || savedState.height || config.height
        );
        canvas.preserveObjectStacking = true;
        canvas.renderAll();
      });
    } else {
      if (props.config) {
        canvas.setWidth(props.config.width);
        canvas.setHeight(props.config.height);
        canvas.setBackgroundColor(props.config.backgroundColor || "#fff");
      } else {
        canvas.setWidth(config.width);
        canvas.setHeight(config.height);
      }
    }
    $("#canvas-width").val(canvas.width);
    $("#canvas-height").val(canvas.height);
    scaleContainer(props.id);
  };
  const getLayers = () => {
    const { canvas } = getCanvas();
  };
  const addRect = (w = 200, h = 200) => {
    let { canvas, creator, width, top } = getCanvas();
    let rec = creator.rect(width / 2 - w / 2, top - h / 2, w, h, "blue");
    canvas.add(rec);
  };

  const getCanvas = () => {
    let creator = window.creator;
    let { canvas } = creator;
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
    let circle = creator.circ(r, width / 2 - r, top - r, "blue");
    canvas.add(circle);
  };
  const addImage = (url) => {
    let { creator } = getCanvas();
  };

  const addText = (message, style = null) => {
    let { canvas, creator, width, top } = getCanvas();
    let text = creator.text(width / 2, top / 2, message, style);
    canvas.add(text);
  };

  const handleSave = () => {
    setConfirmed({
      title: "Save Material",
      message: "Continue to uploading this material?",
      yes: async () => {
        setSaving(true);
        let { canvas } = getCanvas();
        let url = canvas.toDataURL();
        let blob = dataURItoBlob(url);
        const b64 = await blobToBase64(blob);
        const jsonString = JSON.stringify({ blob: b64 });
        if (query.callback && query.to) {
          if (!query.upload) {
            socket.emit(query.callback, {
              to: query.to,
              data: {
                b64: jsonString,
                title: canvasConfig.title,
              },
              type: query.origin || "ATTACH_CONTENTCREATOR",
            });
            setSaving(false);
            setTimeout(() => window.close(), 0);
          } else {
            let file = new File([blob], canvasConfig.title, {
              type: blob.type,
            });
            let body = new FormData();
            body.append("file", file);
            let uploadedFile = await Api.post("/api/public/upload", { body });
            if (uploadedFile) {
              socket.emit(query.callback, {
                to: query.to,
                data: {
                  b64: jsonString,
                  title: canvasConfig.title,
                  url: uploadedFile.url,
                },
                type: query.origin || "ATTACH_CONTENTCREATOR",
              });
            }
            setSaving(false);
            setTimeout(() => window.close(), 0);
          }
        }
      },
    });
  };
  const triangle = () => {
    let { canvas, creator, width, top } = getCanvas();
    let poly = creator.poly(width / 2 - 100, top - 100, "blue", [
      {
        x: width / 2,
        y: 0,
      },
      {
        x: width / 2 - 100,
        y: 200,
      },
      {
        x: width / 2 + 100,
        y: 200,
      },
    ]);
    canvas.add(poly);
    canvas.renderAll();
  };
  return (
    <React.Fragment>
      <Dialog
        open={confirmed || false}
        onClose={() => !saving && setConfirmed(null)}
      >
        <DialogTitle>{confirmed && confirmed.title}</DialogTitle>
        <DialogContent>{confirmed && confirmed.message}</DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setConfirmed(null);
            }}
            disabled={saving}
          >
            No
          </Button>

          <Button
            color="primary"
            variant="contained"
            onClick={() => confirmed.yes()}
            style={{ position: "relative" }}
            disabled={saving}
          >
            Yes
            {saving && (
              <CircularProgress
                size={18}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              />
            )}
          </Button>
        </DialogActions>
      </Dialog>
      <GooglePicker type="photo" auth={(s) => (window.GPICKER = s)} />
      <div id={props.id} className={styles.root}>
        <Box id="toolbar-container">
          <CreatorToolbar
            {...props}
            disabledIcon={props.disabledIcon}
            onShowTools={(tool) => setToolSet(tool)}
            defaultControl={
              (props.defaultControl &&
                props.defaultControl({ canvasConfig, setCanvasConfig })) ||
              null
            }
            actions={{
              save: () => handleSave(),
              toggleDrawing: () => {
                let { canvas } = getCanvas();
                canvas.isDrawingMode = !canvas.isDrawingMode;
              },
              closeDrawing: () => {
                let { canvas } = getCanvas();
                canvas.isDrawingMode = false;
              },
            }}
            tools={{
              stroke_color: {
                title: "Border",
                component: (
                  <CircleColorPicker
                    onChange={(color) => {
                      window.creator.changeBorderColor(color);
                    }}
                  />
                ),
              },
              shape_color: {
                title: "Shape",
                component: (
                  <CircleColorPicker
                    onChange={(color) => {
                      window.creator.changeColor(color);
                    }}
                  />
                ),
              },
              brush_color: {
                title: "Brush",
                component: (
                  <CircleColorPicker
                    onChange={(color) => {
                      changeBrushStyle({
                        color,
                      });
                    }}
                  />
                ),
              },
              background_color: {
                title: "Canvas Background",
                component: (
                  <CircleColorPicker
                    onChange={(color) => {
                      window.creator.canvas
                        .setBackgroundColor(color)
                        .renderAll();
                    }}
                  />
                ),
              },
              stroke_width: {
                title: "Stroke",
                component: (
                  <TextField
                    onChange={(e) => {
                      window.creator.changeBorderWidth(
                        parseInt(e.target.value)
                      );
                    }}
                    defaultValue="1"
                    variant="filled"
                    type="number"
                    style={{
                      width: 40,
                      height: 30,
                      border: "1px solid rgba(0,0,0,0.17)",
                    }}
                    inputProps={{
                      min: 0,
                      style: {
                        height: 30,
                        padding: "0 5px",
                      },
                    }}
                  />
                ),
              },
              brush_shadow: {
                title: "Shadow",
                component: (
                  <CircleColorPicker
                    onChange={(color) => {
                      changeBrushStyle(
                        {
                          affectStroke: true,
                          color,
                        },
                        "shadow",
                        new window.creator.fabric.Shadow({
                          affectStroke: true,
                          color,
                        })
                      );
                    }}
                  />
                ),
              },
              brush_shadow_blur: {
                title: "Shadow Blur",
                component: (
                  <TextField
                    onChange={(e) => {
                      changeBrushStyle(
                        {
                          blur: parseInt(e.target.value),
                        },
                        "shadow",
                        new window.creator.fabric.Shadow({
                          blur: parseInt(e.target.value),
                        })
                      );
                    }}
                    defaultValue="0"
                    variant="filled"
                    type="number"
                    style={{
                      width: 50,
                      height: 30,
                      border: "1px solid rgba(0,0,0,0.17)",
                    }}
                    inputProps={{
                      min: 0,
                      style: {
                        height: 30,
                        padding: "0 5px",
                      },
                    }}
                  />
                ),
              },
              brush_size: {
                title: "Size",
                component: (
                  <TextField
                    onChange={(e) => {
                      changeBrushStyle({
                        width: parseInt(e.target.value),
                      });
                    }}
                    defaultValue="30"
                    variant="filled"
                    type="number"
                    style={{
                      width: 50,
                      height: 30,
                      border: "1px solid rgba(0,0,0,0.17)",
                    }}
                    inputProps={{
                      min: 0,
                      style: {
                        height: 30,
                        padding: "0 5px",
                      },
                    }}
                  />
                ),
              },
            }}
            controls={
              props.controls &&
              props.controls({
                addRect,
                addCircle,
                triangle,
                changeBrush,
                setCanvasConfig,
                canvasConfig,
                addText,
              })
            }
          />
        </Box>
        <Box flex={1} position="relative" zIndex={4}>
          <Box position="relative">
            <Toolbar
              id="right-panel-toolbar"
              style={{
                background: theme.palette.type === "dark" ? "#111" : "#fff",
                height: 51,
              }}
            >
              <Box
                marginRight={1}
                height="100%"
                display="flex"
                alignItems="center"
              >
                {props.disabledIcon && (
                  <Button
                    onClick={() => props.onPreview && props.onPreview(false)}
                    variant="contained"
                    color="primary"
                  >
                    EXIT BOARD
                  </Button>
                )}
                <ButtonGroup
                  variant="outlined"
                  color="primary"
                  disabled={props.disabledIcon}
                >
                  <Button onClick={() => window.creator.canvas.undo()}>
                    <Icon>undo</Icon>
                  </Button>
                  <Button onClick={() => window.creator.canvas.redo()}>
                    <Icon>redo</Icon>
                  </Button>
                </ButtonGroup>
                <Divider orientation="vertical" style={{ marginLeft: 13 }} />
              </Box>
              <Box
                marginRight={1}
                height="100%"
                display="flex"
                alignItems="center"
              >
                {toolSet && toolSet.length ? (
                  <React.Fragment>
                    {toolSet.map((t, index) => (
                      <Box
                        key={index}
                        display="flex"
                        alignItems="center"
                        zIndex={11}
                        marginRight={1}
                      >
                        <Typography style={{ marginRight: 7 }}>
                          {t.title}
                        </Typography>
                        {t.component}
                      </Box>
                    ))}
                    <Divider
                      orientation="vertical"
                      style={{ marginLeft: 13 }}
                    />
                  </React.Fragment>
                ) : null}
              </Box>
            </Toolbar>
            <ResizeLine
              orientation="horizontal"
              minSize={6}
              id={props.id}
              resizing={isResizing.TOOLBAR || false}
              ready={() =>
                setIsResizing({ ...isResizing, ...{ TOOLBAR: true } })
              }
              done={() =>
                setIsResizing({ ...isResizing, ...{ TOOLBAR: false } })
              }
              onResize={() => scaleContainer(props.id)}
              style={{
                position: "absolute",
                borderBottom: "1px solid rgba(0,0,0,0.17)",
                height: 4,
                width: "100%",
                right: 0,
                left: 0,
                bottom: 0,
              }}
            />
          </Box>
          <Box flex={1} id="right-panel" overflow="auto" height="100%">
            <Box
              maxWidth="100%"
              id="content-maker-container"
              style={{
                transformOrigin: "top left",
              }}
            >
              <canvas
                id={props.id + "-canvas"}
                style={{ opacity: props.preview ? 0 : 1 }}
              ></canvas>
              {props.preview}
            </Box>
          </Box>
        </Box>
        {/* <div
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
              key={index}
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
                      alt="preview"
                      src={window.creator.canvas.item(index).toDataURL()}
                      width={100}
                      height={100}
                    />
                  )}
                </div>
              </Button>
            </div>
          ))}
      </div> */}
      </div>
    </React.Fragment>
  );
}
export function CreatorToolbar(props) {
  const theme = useTheme();
  const [isResizing, setIsResizing] = useState({});
  const [modals, setModals] = useState(props.controls.map((c) => false));
  const styles = useStyles();
  const toggleAtomic = (c, index, callback = null) => {
    let m = modals.map((cc, i) => (i !== index ? false : !cc));
    setModals(m);
    props.actions[c.action] && props.actions[c.action]();
    modals.forEach((m, i) => {
      if (m) {
        props.controls[i].onClose &&
          props.controls[i].onClose({
            actions: props.actions,
            controls: props.controls,
          });
      }
    });
    callback && callback(c);
    c.tools && props.onShowTools
      ? props.onShowTools(
          c.tools.map((t) => props.tools[t] || null).filter((t) => t !== null)
        )
      : props.onShowTools([]);
    document.querySelector("#toolbar").style.width = "auto";
    setTimeout(() => scaleContainer(props.id), 0);
  };

  return (
    <Box id="toolbar" display="flex" height="100%" position="relative">
      <Box
        style={{
          height: "100%",
          background: theme.palette.type === "dark" ? "#111" : "#fff",
        }}
      >
        <div
          style={{
            position: "relative",
            alignItems: "center",
            justifyContent: "space-between",
            borderRight: "1px solid rgba(0,0,0,0.17)",
            height: "100%",
          }}
        >
          {props.controls.map((c, index) => (
            <React.Fragment key={index}>
              <Box>
                <Tooltip title={c.title} placement="right">
                  <IconButton
                    onClick={() => toggleAtomic(c, index)}
                    {...(c.props || {})}
                    disabled={props.disabledIcon || false}
                    color={modals[index] ? "primary" : "inherit"}
                  >
                    {typeof c.icon === "string" ? (
                      <Icon>{c.icon}</Icon>
                    ) : (
                      c.icon
                    )}
                  </IconButton>
                </Tooltip>
              </Box>
              {/* <Backdrop
              onClick={() => toggleAtomic(c, index, c.onClose)}
              open={modals[index]}
              style={{ zIndex: 10, opacity: 0 }}
            /> */}
            </React.Fragment>
          ))}
        </div>
      </Box>
      <Box
        className={styles.atomicComponent}
        style={{
          minWidth: Object.keys(modals).find((m, i) =>
            modals[m] ? props.controls[i].type === "atomic" : false
          )
            ? 325
            : 0,
        }}
      >
        {!props.disabledIcon &&
          props.controls.map((c, index) => (
            <React.Fragment key={index}>
              {modals[index] && (
                <Grow in={true}>
                  <Box className="control">
                    {typeof c.atomicComponent !== "function"
                      ? c.atomicComponent
                      : c.atomicComponent(() =>
                          toggleAtomic(c, index, c.onClose)
                        )}
                  </Box>
                </Grow>
              )}
            </React.Fragment>
          ))}
        {props.defaultControl &&
        (!Object.keys(modals).find((q) => (modals[q] ? q : null)) ||
          !props.controls[
            Object.keys(modals).find((q) => (modals[q] ? q : null))
          ].atomicComponent)
          ? props.defaultControl
          : null}
      </Box>
      <ResizeLine
        minSize={48}
        maxSize={375}
        id={props.id}
        orientation="vertical"
        resizing={isResizing.CONTROLS || false}
        ready={() => setIsResizing({ ...isResizing, ...{ CONTROLS: true } })}
        done={() => setIsResizing({ ...isResizing, ...{ CONTROLS: false } })}
        onResize={() => scaleContainer(props.id)}
        style={{
          position: "absolute",
          borderRight: "1px solid rgba(0,0,0,0.17)",
          height: "100%",
          width: 3,
          right: 0,
        }}
      />
    </Box>
  );
}

export const brushes = [
  {
    id: "Pencil",
    name: "Pencil",
  },
  {
    id: "Circle",
    name: "Circle Brush",
  },
  {
    id: "diamondPatternBrush",
    name: "Diamond",
  },
  {
    id: "texturePatternBrush",
    name: "Texture",
  },
  {
    id: "squarePatternBrush",
    name: "Square Pattern",
  },
  {
    id: "hLinePatternBrush",
    name: "Horizontal Pattern",
  },
  {
    id: "vLinePatternBrush",
    name: "Vertical Pattern",
  },
  {
    id: "Spray",
    name: "Spray",
  },
];

const useStyles = makeStyles((theme) => ({
  resizeline: {
    transition: "all 0.3s ease-out",
    "&.resizing, &:hover": {
      zIndex: "16!important",
      background: theme.palette.info.main,
    },
  },
  root: {
    overflow: "hidden",
    height: "100vh",
    display: "flex",
    "& #content-maker-container": {},
    "& #right-panel": {
      position: "relative",
      minWidth: "100%",
      background: theme.palette.grey[200],
      display: "flex",
      justifyContent: "center",
    },
    "& .canvas-container": {
      margin: config.padding / 2,
    },
    "& #content-maker": {
      boxShadow: "0 0 102px rgba(0,0,0,0.2), 0 11px 55.5px rgba(0,0,0,0.06)",
    },
  },
  atomicComponent: {
    background: theme.palette.type === "dark" ? "#111" : "#fff",
    width: "100%",
  },
}));
const textStyles = [
  {
    style: {
      fontFamily: "Impact",
      fontWeight: "bold",
      fontSize: 30,
    },
  },
  {
    style: {
      fontFamily: "Arial",
      fontWeight: "bold",
      fontSize: 30,
    },
  },
  {
    style: {
      fontFamily: "Arial",
      fontSize: 26,
    },
  },
  {
    style: {
      fontFamily: "Arial",
      fontSize: 20,
    },
  },
  {
    style: {
      fontFamily: "Arial",
      fontSize: 16,
    },
  },
];
export default ContentMaker;
