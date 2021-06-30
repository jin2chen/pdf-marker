const simpleClone = o => {
  return JSON.parse(JSON.stringify(o));
};

class Rectangle {
  constructor(canvas, fabric, vm = null) {
    this.canvas = canvas;
    this.fabric = fabric;
    this.isDrawing = false;
    this.origX = 0;
    this.origY = 0;
    this.activeObj = null;
    this.clipboard = null;
    this.vm = vm;
    this.selected = null;

    this.bindEvents();
  }

  drawTags(tags) {
    this.canvas.remove(...this.canvas.getObjects());

    tags.forEach(shape => {
      shape = simpleClone(shape);

      const rect = new this.fabric.Rect({
        left: shape.left,
        top: shape.top,
        width: shape.width,
        height: shape.height,
        stroke: "red",
        strokeWidth: 1,
        strokeUniform: true,
        fill: "transparent"
      });

      this.setCoords(rect);
      rect.shape = shape;
      this.canvas.add(rect);
    });
  }

  shapes() {
    return this.canvas.getObjects().map(o => o.shape);
  }

  setShape(shape) {
    if (this.selected) {
      this.selected.shape = simpleClone(shape);
      this.canvas.requestRenderAll();
    }
  }

  setCoords(o) {
    o.set({
      cornerSize: 4,
      cornerColor: "green",
      transparentCorners: true,
      hasRotatingPoint: false
    });
    o.setCoords();
  }

  discardActiveObject() {
    this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();
  }

  setRectangle(rect = null) {
    this.selected = rect;
    if (this.vm) {
      this.vm.setShape(rect ? rect.shape : {});
    }
  }

  bindEvents() {
    let map = this.map;
    this.canvas.on("mouse:down", this.onMouseDown.bind(this));
    this.canvas.on("mouse:move", this.onMouseMove.bind(this));
    this.canvas.on("mouse:up", this.onMouseUp.bind(this));

    this.canvas.on("selection:updated", o => {
      if (o.target && o.target.type === "activeSelection") {
        this.setCoords(o.target);
      }
    });

    "object:moving,object:scaling,object:rotating,object:skewing,object:moved,object:scaled,object:rotated,object:skewed"
      .split(",")
      .forEach(name => {
        this.canvas.on(name, e => this.disable());
      });

    this.canvas.upperCanvasEl.tabIndex = -1;
    this.canvas.upperCanvasEl.addEventListener(
      "keydown",
      e => {
        const move = (d, m, e) => {
          const o = this.canvas.getActiveObject();

          if (!o) {
            return;
          }

          o.set({
            [d]: o[d] + m
          });
          this.canvas.requestRenderAll();
          this.setRectangle(o);
          e.stopPropagation();
          e.preventDefault();
        };

        if (e.key === "Backspace") {
          this.canvas.getActiveObjects().forEach(o => this.canvas.remove(o));
          this.canvas.discardActiveObject();
        } else if (e.key === "d") {
          this.duplicate();
        } else if (e.key === "ArrowUp") {
          move("top", -1, e);
        } else if (e.key === "ArrowDown") {
          move("top", 1, e);
        } else if (e.key === "ArrowLeft") {
          move("left", -1, e);
        } else if (e.key === "ArrowRight") {
          move("left", 1, e);
        }
      },
      false
    );
  }

  onMouseDown(o) {
    this.enable();

    let pointer = this.canvas.getPointer(o.e);
    this.origX = pointer.x;
    this.origY = pointer.y;

    this.activeObj = new this.fabric.Rect({
      left: this.origX,
      top: this.origY,
      width: pointer.x - this.origX,
      height: pointer.y - this.origY,
      stroke: "red",
      strokeWidth: 1,
      strokeUniform: true,
      fill: "transparent"
    });

    this.setCoords(this.activeObj);
    this.canvas.add(this.activeObj);
  }

  onMouseMove(o) {
    if (!this.isEnable()) {
      return;
    }

    let pointer = this.canvas.getPointer(o.e);
    let activeObj = this.activeObj;

    pointer.x = Math.max(0, pointer.x);
    pointer.y = Math.max(0, pointer.y);

    if (this.origX > pointer.x) {
      activeObj.set({ left: Math.abs(pointer.x) });
    }
    if (this.origY > pointer.y) {
      activeObj.set({ top: Math.abs(pointer.y) });
    }

    activeObj.set({ width: Math.abs(this.origX - pointer.x) });
    activeObj.set({ height: Math.abs(this.origY - pointer.y) });
    activeObj.setCoords();

    this.canvas.requestRenderAll();
  }

  onMouseUp(e) {
    this.disable();

    let activeObj = this.activeObj;

    if (activeObj) {
      if (activeObj.width < 5 || activeObj.height < 5) {
        this.canvas.remove(activeObj);
        this.activeObj = null;
      } else {
        this.canvas.setActiveObject(activeObj);
        this.canvas.requestRenderAll();
        this.activeObj = null;
      }
    }

    activeObj = this.canvas.getActiveObject();
    if (activeObj) {
      if (activeObj.type === "activeSelection") {
        activeObj.forEachObject(o => {
          this.tidy(o);
        });
        this.setRectangle(null);
      } else {
        this.tidy(activeObj);
        this.setRectangle(activeObj);
      }
    } else {
      this.setRectangle(null);
    }
  }

  isEnable() {
    return this.isDrawing;
  }

  enable() {
    this.isDrawing = true;
  }

  disable() {
    this.isDrawing = false;
  }

  tidy(o) {
    let { width, height, scaleX, scaleY } = o;
    o.set({
      scaleX: 1,
      scaleY: 1,
      width: Math.round(width * scaleX),
      height: Math.round(height * scaleY)
    });
    o.setCoords();
    this.canvas.requestRenderAll();
  }

  bindObjectEvents(o) {
    o.on("moving", e => {
      let { target } = e;
      let { left, top, width, height } = target;
      let { width: cWidth, height: cHeight } = target.canvas;

      left = Math.max(left, 0);
      top = Math.max(top, 0);

      left = Math.min(left, cWidth - width - 2);
      top = Math.min(top, cHeight - height - 2);
      target.set({ left, top });
      target.setCoords();
      this.setRectangle(e.target);
    });

    return o;
  }

  duplicate() {
    const activeObject = this.canvas.getActiveObject();

    if (!activeObject) {
      return;
    }

    activeObject.clone(cloned => {
      this.canvas.discardActiveObject();

      cloned.set({
        left: cloned.left + 10,
        top: cloned.top + 10,
        evented: true
      });
      this.setCoords(cloned);

      if (cloned.type === "activeSelection") {
        cloned.canvas = this.canvas;
        cloned.forEachObject(o => {
          this.canvas.add(o);
          this.setCoords(o);
        });
        cloned.setCoords();
      } else {
        const shape = simpleClone(activeObject.shape);
        cloned.shape = shape;
        this.canvas.add(cloned);
      }

      cloned.top += 10;
      cloned.left += 10;
      cloned.setCoords();
      this.canvas.setActiveObject(cloned);
      this.canvas.requestRenderAll();
    });
  }
}

export default Rectangle;
