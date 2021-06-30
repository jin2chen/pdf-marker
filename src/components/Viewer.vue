<template>
  <div
    ref="viewerContainer"
    id="viewerContainer"
    :class="{ overflow: isRendering }"
  >
    <div class="pdfViewer" v-show="isRendering"></div>
    <div class="pdfViewer" v-show="isUploaded">
      <rect-canvas
        v-for="page in pages"
        :page="page"
        :key="page.id"
        :pid="page.id"
      ></rect-canvas>
    </div>
    <uploader v-if="!isUploaded" @pdf-loaded="onPdfLoaded($event)"></uploader>
    <full-loading v-if="isRendering"></full-loading>
  </div>
</template>

<script>
import FileSaver from "file-saver";
import PDFViewer from "@/core/viewer";
import RectCanvas from "@/components/RectCanvas";
import Uploader from "@/components/Uploader";
import FullLoading from "@/components/FullLoading";
import Utils from "@/core/utils";
import { TAG_TYPE } from "@/core/constant";

export default {
  components: { RectCanvas, Uploader, FullLoading },
  data() {
    return {
      isRendering: false,
      isUploaded: false,
      pages: []
    };
  },
  created() {
    this.app = this.$root.app();
    this.watch();
  },
  mounted() {
    this.bindEvents();
  },
  methods: {
    watch() {
      this.$watch("app.exportCount", this.export);
      this.$watch("app.schema", this.exactTags, { deep: false });
    },
    bindEvents() {
      const handler = () => {
        this.pages = this.pdfViewer.collect();
        this.isRendering = false;
      };
      document.addEventListener("pagesRenderCompleted", handler);

      this.$once("hook:beforeDestroy", () => {
        document.removeEventListener("pagesRenderCompleted", handler);
      });
    },
    onPdfLoaded(data) {
      this.isRendering = true;
      this.isUploaded = true;

      window.pdfViewer = this.pdfViewer = PDFViewer.instance({
        container: this.$refs.viewerContainer,
        textLayerMode: 0
      });
      this.pdfViewer.load({ data });
    },
    onClose() {
      this.isRendering = false;
      this.isUploaded = false;
      this.pages = [];
    },
    serialize() {
      const tags = this.$children
        .filter(vm => {
          return vm.$options.name === "RectCanvas";
        })
        .flatMap(vm => {
          return vm.serialize();
        });

      const sections = {};
      const checkboxes = {};
      const checkboxesCounter = {};
      let tagNameCounter = 0;

      tags.forEach(tag => {
        let isTag = true;
        const { section } = tag;
        delete tag["section"];

        tag.name = tag.name || `tag${++tagNameCounter}`;
        sections[section] = sections[section] || [];

        if (tag.type.toLowerCase() === TAG_TYPE.CHECKBOX) {
          const { area, name } = tag;
          const key = `${section}#${name}`;

          checkboxesCounter[key] = checkboxesCounter[key] || 0;
          const value = tag.value || `ckb${++checkboxesCounter[key]}`;
          ["area", "value"].forEach(key => delete tag[key]);

          if (!checkboxes[key]) {
            tag["areas"] = checkboxes[key] = {};
            checkboxes[key][value] = area;
          } else {
            isTag = false;
            checkboxes[key][value] = area;
          }
        }

        if (isTag) {
          sections[section].push(tag);
        }
      });

      return sections;
    },
    export(n, o) {
      const schema = Utils.simpleClone(this.app.schema);
      const sections = this.serialize();

      schema.sections = schema.sections || {};

      Object.entries(sections).forEach(entry => {
        const [key, tags] = entry;

        schema.sections[key] = schema.sections[key] || {};
        schema.sections[key].tags = tags;
      });

      var blob = new Blob([JSON.stringify(schema, null, 2)], {
        type: "text/plain;charset=utf-8"
      });
      FileSaver.saveAs(blob, this.app.filename);
    },
    exactTags(n, o) {
      const sections = n.sections || {};
      const result = {};

      Object.entries(sections).forEach(entry => {
        const [key, section] = entry;
        const pid = Number.parseInt(
          section.tplIdx || key.replace(/-.*/g, "").replace(/\D/g, "")
        );
        const tags = [];

        if (Number.isNaN(pid)) {
          return;
        }

        result[pid] = result[pid] || [];
        result[pid].push([key, section.tags || []]);
      });

      this.pages.forEach(page => {
        const pid = page.id;
        if (result[pid]) {
          page.sections = result[pid];
        }
      });
    }
  }
};
</script>

<style lang="scss">
#viewerContainer {
  width: 100%;
  height: 100%;
}
.overflow {
  overflow: hidden;
}
.close {
  position: fixed;
  top: 0;
  right: 20px;
  background-color: bisque;
  cursor: pointer;
}
</style>
