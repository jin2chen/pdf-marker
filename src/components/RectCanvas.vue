<template>
  <div
    class="page"
    :style="{ width: viewport.width + 'px', height: viewport.height + 'px' }"
  >
    <canvas
      ref="canvas"
      :style="{
        width: viewport.width + 'px',
        height: viewport.height + 'px',
        'outline-style': 'none'
      }"
    ></canvas>
  </div>
</template>
<script>
import { fabric } from "fabric";
import { TAG_TYPE } from "@/core/constant";
import Rectangle from "@/core/rectangle";
import Utils from "@/core/utils";

export default {
  name: "RectCanvas",
  props: ["page"],
  created() {
    this.app = this.$root.app();
    this.shape = null;
    this.rectangle = null;
    this.viewport = this.page.viewport;
    this.outputScale = this.page.outputScale;
    this.pid = this.page.id;

    this.watch();
  },
  mounted() {
    const { viewport, outputScale } = this;
    const canvas = new fabric.Canvas(this.$refs.canvas, {
      width: viewport.width,
      height: viewport.height
    });

    canvas.setBackgroundImage(
      this.page.dataUrl,
      canvas.renderAll.bind(canvas),
      { scaleX: 1 / outputScale.sx, scaleY: 1 / outputScale.sy }
    );

    this.rectangle = new Rectangle(canvas, fabric, this);
  },
  methods: {
    watch() {
      this.$watch("app.shape", this.watchAppShape, { deep: true });
      this.$watch("page.sections", this.watchPageSections, { deep: false });
    },
    watchAppShape(n, o) {
      if (Object.keys(n).length <= 0) {
        return;
      }

      if (n.pid !== this.pid) {
        this.rectangle.discardActiveObject();
        return;
      }

      this.rectangle.setShape(n);
    },
    watchPageSections(n, o) {
      // n data structure
      // [['sec1', [tag1, tag2]], ['sec2', [tag1, tag2]]]

      const tags = Utils.simpleClone(n).flatMap(entry => {
        const [key, items] = entry;
        return items.flatMap(Utils.flatCheckbox).map(tag => {
          return Utils.tag2shape(tag, key, this.viewport, this.pid);
        });
      });

      this.rectangle.drawTags(tags);
    },
    setShape(shape) {
      shape = shape || {};
      shape = Utils.simpleClone(shape);

      if (Object.keys(shape).length > 0) {
        shape = Utils.tidyShape(shape, this.viewport, this.pid);
      }

      this.app.shape = shape;
    },
    serialize() {
      return this.rectangle.shapes().map(Utils.shape2tag);
    }
  }
};
</script>
<style lang="scss" scoped>
.page {
  box-sizing: content-box;
}
</style>
