//test
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
export default ContentCreator;
