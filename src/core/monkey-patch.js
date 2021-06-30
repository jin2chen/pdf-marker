import { fabric } from "fabric";
import { TAG_TYPE, SIGNATURE_TYPE } from "@/core/constant";

class Rect extends fabric.Rect {
  _shape = {
    section: "",
    name: "",
    type: TAG_TYPE.TEXT,
    value: "",
    signatureType: SIGNATURE_TYPE.SIGNATURE,
    scaleValue: 1
  };
  get shape() {
    const { left, top, width, height } = this;
    return Object.assign(this._shape, { left, top, width, height });
  }
  set shape(shape) {
    const { left, top, width, height } = shape;

    this._shape = shape;
    this.set({
      left,
      top,
      width,
      height
    });
    this.setCoords();
  }
}

fabric.Rect = Rect;
