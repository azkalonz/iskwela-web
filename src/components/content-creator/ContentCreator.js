export default function ContentCreator(fabric, id, params = {}) {
  this.fabric = fabric;
  this.params = params;
  this.canvas = new fabric.Canvas(id, {
    backgroundColor: "#fff",
    width: 1000,
    height: 1000,
    preserveObjectStacking: true,
  });
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
    });
  this.text = (left, top, body) =>
    new fabric.IText(body, {
      left,
      top,
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
  this.canvas.on("object:added", (e) => {
    var object = e.target;
    console.log("object:modified", object);

    if (this.history.action === true) {
      this.history.state = [this.history.state[this.history.index2]];
      this.history.list = [this.history.list[this.history.index2]];

      this.history.action = false;
      console.log(this.history.state);
      this.history.index = 1;
    }
    object.saveState();
    console.log(object._stateProperties);
    this.history.state[this.history.index] = JSON.stringify(
      object._stateProperties
    );
    this.history.list[this.history.index] = object;
    this.history.index++;
    this.history.index2 = this.history.index - 1;
    this.history.refresh = true;
    params.onModified && params.onModified();
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
    this.params.onSelectionCleared && this.params.onSelectionCleared();
  });
  this.canvas.on("object:modified", (e) => {
    var object = e.target;
    console.log("object:modified");
    this.canvas.bringToFront(object);

    if (this.history.action === true) {
      this.history.state = [this.history.state[this.history.index2]];
      this.history.list = [this.history.list[this.history.index2]];

      this.history.action = false;
      console.log(this.history.state);
      this.history.index = 1;
    }

    object.saveState();

    this.history.state[this.history.index] = JSON.stringify(
      object._stateProperties
    );
    this.history.list[this.history.index] = object;
    this.history.index++;
    this.history.index2 = this.history.index - 1;

    console.log(this.history.state);
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
    if (this.history.index <= 0) {
      this.history.index = 0;
      return;
    }

    if (this.history.refresh === true) {
      this.history.index--;
      this.history.refresh = false;
    }

    console.log("undo");

    this.history.index2 = this.history.index - 1;
    this.history.current = this.history.list[this.history.index2];
    this.history.current.setOptions(
      JSON.parse(this.history.state[this.history.index2])
    );

    this.history.index--;
    this.history.current.setCoords();
    this.canvas.renderAll();
    this.history.action = true;
  };

  this.redo = () => {
    this.history.action = true;
    if (this.history.index >= this.history.state.length - 1) {
      return;
    }

    console.log("redo");

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
      if (key == 86 && ctrl) {
        this.paste();
      } else if (key == 67 && ctrl) {
        this.copy();
      } else if (key == 46) {
        this.remove();
      } else if (key == 90 && ctrl) {
        this.undo();
      } else if (key == 89 && ctrl) {
        this.redo();
      } else if (key == 83 && ctrl) {
        this.save();
      } else if (key == 88 && ctrl) {
        this.copy();
        this.remove();
      } else if (key == 27) {
        this.canvas.discardActiveObject();
        this.canvas.requestRenderAll();
      } else if (key == 65) {
        if (this.currentSelection) {
          this.currentSelection.fontFamily = "impact";
          console.log(this.currentSelection);
          this.canvas.renderAll();
        }
      }
    },
    false
  );
}
