import React, { useEffect, useState } from "react";
// import ContentCreator from "./contentCreator";
import $ from "jquery";
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
  useTheme,
  Typography,
  Button,
  Grow,
} from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";
import CheckBoxOutlineBlankOutlinedIcon from "@material-ui/icons/CheckBoxOutlineBlankOutlined";
import FiberManualRecordOutlinedIcon from "@material-ui/icons/FiberManualRecordOutlined";
import ImageOutlinedIcon from "@material-ui/icons/ImageOutlined";
import TextFormatOutlinedIcon from "@material-ui/icons/TextFormatOutlined";
import ColorPicker from "material-ui-color-picker";
import SaveOutlinedIcon from "@material-ui/icons/SaveOutlined";
import ChangeHistoryIcon from "@material-ui/icons/ChangeHistory";
import BrushIcon from "@material-ui/icons/Brush";
import EditIcon from "@material-ui/icons/Edit";

function ContentCreator(fabric, id, params = {}) {
  fabric.Object.prototype.transparentCorners = false;
  this.canvas = new fabric.Canvas(id, {
    isDrawingMode: true,
    backgroundColor: "#fff",
    width: 1000,
    height: 1000,
  });
  this.fabric = fabric;
  this.params = params;
  this.history = {
    list: [],
    state: [],
    index: 0,
    index2: 0,
    action: false,
    refresh: true,
    current: null,
  };
  this.circ = (radius, left, top, fill) =>
    new this.fabric.Circle({
      radius,
      left,
      stroke: 1,
      top,
      fill,
      cornerColor: "blue",
    });
  this.text = (left, top, body) =>
    new this.fabric.IText(body, {
      left,
      top,
      cornerColor: "blue",
    });
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

  this.polygonPositionHandler = function (dim, finalMatrix, fabricObject) {
    var x = fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x,
      y = fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y;
    return fabric.util.transformPoint(
      { x: x, y: y },
      fabricObject.calcTransformMatrix()
    );
  };
  this.actionHandler = (eventData, transform, x, y) => {
    var polygon = transform.target,
      currentControl = polygon.controls[polygon.__corner],
      mouseLocalPosition = polygon.toLocalPoint(
        new this.fabric.Point(x, y),
        "center",
        "center"
      ),
      size = polygon._getTransformedDimensions(0, 0),
      finalPointPosition = {
        x:
          (mouseLocalPosition.x * polygon.width) / size.x +
          polygon.pathOffset.x,
        y:
          (mouseLocalPosition.y * polygon.height) / size.y +
          polygon.pathOffset.y,
      };
    polygon.points[currentControl.pointIndex] = finalPointPosition;
    return true;
  };
  this.anchorWrapper = function (anchorIndex, fn) {
    return function (eventData, transform, x, y) {
      var fabricObject = transform.target,
        absolutePoint = fabric.util.transformPoint(
          {
            x: fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x,
            y: fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y,
          },
          fabricObject.calcTransformMatrix()
        );
      var actionPerformed = fn(eventData, transform, x, y);
      var newDim = fabricObject._setPositionDimensions({});
      var newX =
          (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) /
          fabricObject.width,
        newY =
          (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) /
          fabricObject.height;
      fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5);
      return actionPerformed;
    };
  };

  this.editPolygon = () => {
    let poly = this.canvas.getActiveObject();
    if (!poly) return;
    if (!poly.isType("polygon")) return;
    this.canvas.setActiveObject(poly);
    poly.edit = !poly.edit;
    if (poly.edit) {
      var lastControl = poly.points.length - 1;
      poly.cornerStyle = "circle";
      poly.controls = poly.points.reduce((acc, point, index) => {
        acc["p" + index] = new this.fabric.Control({
          positionHandler: this.polygonPositionHandler,
          actionHandler: this.anchorWrapper(
            index > 0 ? index - 1 : lastControl,
            this.actionHandler
          ),
          actionName: "modifyPoligon",
          pointIndex: index,
        });
        return acc;
      }, {});
    } else {
      poly.cornerStyle = "rect";
      poly.controls = this.fabric.Object.prototype.controls;
    }
    poly.hasBorders = !poly.edit;
    this.canvas.requestRenderAll();
  };
  this.rect = (left, top, width, height, fill) =>
    new this.fabric.Rect({
      left,
      top,
      stroke: 1,
      fill,
      width,
      height,
    });

  this.canvas.on("object:added", (e) => {
    var object = e.target;

    if (this.history.action === true) {
      this.history.state = [this.history.state[this.history.index2]];
      this.history.list = [this.history.list[this.history.index2]];

      this.history.action = false;
      this.history.index = 1;
    }
    object.saveState();
    this.history.state[this.history.index] = JSON.stringify(
      object._stateProperties
    );
    this.history.list[this.history.index] = object;
    this.history.index++;
    this.history.index2 = this.history.index - 1;
    this.history.refresh = true;
    params.onModified && params.onModified();
  });
  this.canvas.on("mouse:dblclick", (e) => {
    let object = e.target;
    if (object) {
      if (object.isType("polygon")) this.editPolygon();
    }
  });
  this.canvas.on("selection:updated", (o) => {
    this.currentSelection = o.target;
    this.params.onSelectionUpdated && this.params.onSelectionUpdated(o.target);
  });
  this.canvas.on("selection:created", (o) => {
    this.currentSelection = o.target;
    this.params.onSelectionCreated && this.params.onSelectionCreated(o.target);
  });
  this.canvas.on("selection:cleared", (o) => {
    this.currentSelection = o.target;
    this.isEditingPolygon = false;
    this.params.onSelectionCleared && this.params.onSelectionCleared();
  });
  this.canvas.on("object:modified", (e) => {
    var object = e.target;
    this.canvas.bringToFront(object);

    if (this.history.action === true) {
      this.history.state = [this.history.state[this.history.index2]];
      this.history.list = [this.history.list[this.history.index2]];

      this.history.action = false;
      this.history.index = 1;
    }

    object.saveState();

    this.history.state[this.history.index] = JSON.stringify(
      object._stateProperties
    );
    this.history.list[this.history.index] = object;
    this.history.index++;
    this.history.index2 = this.history.index - 1;

    this.history.refresh = true;
    params.onModified && params.onModified();
    this.save();
  });
  this.paste = () => {
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
  this.copy = () => {
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
  this.addImage = (url, callback = null) => {
    if (!url) return;
    this.fabric.Image.fromURL(url, (myImg) => {
      try {
        var img1 = myImg.set({
          left: 0,
          top: 0,
          width: myImg._originalElement.width,
          height: myImg._originalElement.height,
        });
        img1.scaleToWidth(500);
        this.canvas.add(img1);
      } catch (e) {
        callback && callback(["Invalid Image"]);
      }
    });
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
  this.undo = () => {
    try {
      if (this.history.index <= 0) {
        this.history.index = 0;
        return;
      }

      if (this.history.refresh === true) {
        this.history.index--;
        this.history.refresh = false;
      }

      this.history.index2 = this.history.index - 1;
      this.history.current = this.history.list[this.history.index2];
      this.history.current.setOptions(
        JSON.parse(this.history.state[this.history.index2])
      );

      this.history.index--;
      this.history.current.setCoords();
      this.canvas.renderAll();
      this.history.action = true;
    } catch (e) {}
  };

  this.redo = () => {
    this.history.action = true;
    if (this.history.index >= this.history.state.length - 1) {
      return;
    }

    this.history.index2 = this.history.index + 1;
    this.history.current = this.history.list[this.history.index2];
    this.history.current.setOptions(
      JSON.parse(this.history.state[this.history.index2])
    );

    this.history.index++;
    this.history.current.setCoords();
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
        this.undo();
      } else if (key === 89 && ctrl) {
        this.redo();
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
    img.src = "/content-maker/3.jpg";

    this.texturePatternBrush = new this.fabric.PatternBrush(this.canvas);
    this.texturePatternBrush.source = img;
  }
}
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
  const [errors, setErrors] = useState();
  const [confirmed, setConfirmed] = useState();
  const [modals, setModals] = useState([]);
  const [selectBrush, setSelectBrush] = useState(false);
  const brushes = [
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
      name: "Diamond",
    },
    {
      id: "hLinePatternBrush",
      name: "Diamond",
    },
    {
      id: "vLinePatternBrush",
      name: "Diamond",
    },
    {
      id: "Spray",
      name: "Spray",
    },
  ];
  const images = [
    {
      link: "/content-maker/1.png",
    },
    {
      link: "/content-maker/2.png",
    },
    {
      link: "/content-maker/3.jpg",
    },
    {
      link: "/content-maker/5723.jpg",
    },
  ];
  useEffect(() => {
    setUp();
  }, []);
  const addScript = async (src, loc) => {
    let s = $(`<script src="${src}"></script>`);
    s.onload = () => {
      return;
    };
    loc.append(s);
  };
  const changeBrush = (id) => {
    let { canvas, creator } = getCanvas();
    let { fabric } = creator;
    if (creator[id]) {
      canvas.freeDrawingBrush = creator[id];
    } else if (fabric[id + "Brush"]) {
      canvas.freeDrawingBrush = new fabric[id + "Brush"](canvas);
    }
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = "red";
      canvas.freeDrawingBrush.width = 30;
      canvas.freeDrawingBrush.shadow = new fabric.Shadow({
        blur: 5,
        offsetX: 0,
        offsetY: 0,
        affectStroke: true,
        color: "blue",
      });
    }
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
    const { canvas } = creator;
    window.creator = creator;
    if (window.localStorage["content-creator"]) {
      let savedState = JSON.parse(window.localStorage["content-creator"]);
      await canvas.loadFromJSON(
        JSON.parse(window.localStorage["content-creator"]),
        function () {
          canvas.setWidth(savedState.width || 1000);
          canvas.setHeight(savedState.height || 1000);
          canvas.preserveObjectStacking = true;
          canvas.renderAll();
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
  };
  const addRect = (w = 200, h = 200) => {
    let { canvas, creator, width, top } = getCanvas();
    let rec = creator.rect(width / 2 - w / 2, top - h / 2, w, h, color);
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
    let circle = creator.circ(r, width / 2 - r, top - r, color);
    canvas.add(circle);
  };
  const addImage = (url) => {
    let { creator } = getCanvas();
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
        let file = new File([blob], "Activity Material", { type: blob.type });
        window.file = file;
        window.close();
      },
    });
  };
  const triangle = () => {
    let { canvas, creator, width, top } = getCanvas();
    let poly = creator.poly(
      width / 2 - 100,
      top - 100,
      theme.palette.primary.main,
      [
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
      ]
    );
    canvas.add(poly);
    canvas.renderAll();
  };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        marginTop: 100,
      }}
    >
      <Dialog
        fullWidth
        maxWidth="lg"
        open={modals.indexOf("image") >= 0}
        onClose={() => setModals([])}
      >
        <DialogTitle>Import Image</DialogTitle>
        <DialogContent>
          {images.map((i, ii) => (
            <Button
              key={ii}
              onClick={() => {
                addImage(i.link);
                setModals([]);
              }}
            >
              <img alt={"Image " + i} src={i.link} width="100" height="100" />
            </Button>
          ))}
        </DialogContent>
      </Dialog>
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
        errors.map((e, i) => (
          <Snackbar
            key={i}
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
              <Tooltip title="Rectangle" placement="bottom">
                <IconButton onClick={() => addRect()}>
                  <CheckBoxOutlineBlankOutlinedIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Circle" placement="bottom">
                <IconButton onClick={() => addCircle()}>
                  <FiberManualRecordOutlinedIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Triangle" placement="bottom">
                <IconButton onClick={() => triangle()}>
                  <ChangeHistoryIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Drawing Mode" placement="bottom">
                <IconButton
                  color={
                    window.creator && window.creator.canvas.isDrawingMode
                      ? "primary"
                      : "default"
                  }
                  onClick={() => {
                    let { canvas } = getCanvas();
                    canvas.isDrawingMode = !canvas.isDrawingMode;
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Brush" placement="bottom">
                <IconButton onClick={() => setSelectBrush(!selectBrush)}>
                  <BrushIcon />
                </IconButton>
              </Tooltip>
              {selectBrush &&
                brushes.map((i, ii) => (
                  <Grow in={true} key={ii}>
                    <Button onClick={() => changeBrush(i.id)}>{i.name}</Button>
                  </Grow>
                ))}
              {selectBrush && (
                <div style={{ width: 100 }}>
                  <Tooltip title="Brush Width" placement="bottom">
                    <Slider
                      onChange={(e, val) => {
                        let { canvas } = getCanvas();
                        canvas.freeDrawingBrush.width = val;
                      }}
                      defaultValue={1}
                      id="brush-size"
                    />
                  </Tooltip>
                </div>
              )}
              {!selectBrush && (
                <Grow in={true}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Tooltip title="Image" placement="bottom">
                      <IconButton>
                        <ImageOutlinedIcon
                          onClick={() => setModals([...modals, "image"])}
                        />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Text" placement="bottom">
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
                            background: color
                              ? color
                              : theme.palette.primary.main,
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
                      <IconButton
                        onClick={() => $("#border-color-picker").click()}
                      >
                        <Box
                          width={30}
                          height={30}
                          borderRadius="50%"
                          style={{
                            background: borderColor
                              ? borderColor
                              : theme.palette.primary.main,
                          }}
                        />
                      </IconButton>
                    </Tooltip>
                    <ColorPicker
                      name="color"
                      id="border-color-picker"
                      style={{ display: "none" }}
                      defaultValue={theme.palette.primary.main}
                      value={
                        borderColor ? borderColor : theme.palette.primary.main
                      }
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
                          }}
                          defaultValue={1}
                        />
                      </Tooltip>
                    </div>
                  </div>
                </Grow>
              )}
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
      </div>
    </div>
  );
}

export default ContentMaker;
