<template>
  <div class="uploader-container">
    <form
      method="post"
      action=""
      enctype="multipart/form-data"
      novalidate=""
      class="box advance"
      :class="{ 'is-dragover': isDragover }"
    >
      <div class="input-box">
        <svg
          class="upload-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="50"
          height="43"
          viewBox="0 0 50 43"
        >
          <path
            d="M48.4 26.5c-.9 0-1.7.7-1.7 1.7v11.6h-43.3v-11.6c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7 1.7v13.2c0 .9.7 1.7 1.7 1.7h46.7c.9 0 1.7-.7 1.7-1.7v-13.2c0-1-.7-1.7-1.7-1.7zm-24.5 6.1c.3.3.8.5 1.2.5.4 0 .9-.2 1.2-.5l10-11.6c.7-.7.7-1.7 0-2.4s-1.7-.7-2.4 0l-7.1 8.3v-25.3c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7 1.7v25.3l-7.1-8.3c-.7-.7-1.7-.7-2.4 0s-.7 1.7 0 2.4l10 11.6z"
          ></path>
        </svg>
        <input
          ref="file"
          type="file"
          name="files[]"
          id="file"
          class="input-file"
          data-multiple-caption="{count} files selected"
        />
        <label for="file"
          ><strong>Choose a file</strong
          ><span class="dragndrop-text"> or drag it here</span>.</label
        >
      </div>
    </form>
  </div>
</template>
<script>
import pdfjs from "pdfjs-dist/webpack";

export default {
  data() {
    return {
      isDragover: false
    };
  },
  mounted() {
    this.bindEvent();
  },
  methods: {
    bindEvent() {
      const events = [
        "drag",
        "dragstart",
        "dragend",
        "dragover",
        "dragenter",
        "dragleave",
        "drop"
      ];
      const dragoverEvents = ["dragover", "dragenter"];
      const dragoutEvents = ["dragleave", "dragend", "drop"];
      const prevent = event => {
        event.preventDefault();
        event.stopPropagation();
      };
      const dragover = event => {
        this.isDragover = true;
      };
      const dragout = event => {
        this.isDragover = false;
      };
      const readFile = list => {
        if (list.length <= 0) {
          return;
        }

        const file = Array.from(list).shift();
        if (file.type !== "application/pdf") {
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          this.$emit("pdf-loaded", reader.result);
        };
        reader.readAsArrayBuffer(file);
      };
      const drop = event => {
        readFile(event.dataTransfer.files);
      };
      const change = event => {
        readFile(event.target.files);
      };

      events.forEach(name => {
        this.$el.addEventListener(name, prevent);
      });
      dragoverEvents.forEach(name => {
        this.$el.addEventListener(name, dragover);
      });
      dragoutEvents.forEach(name => {
        this.$el.addEventListener(name, dragout);
      });
      this.$el.addEventListener("drop", drop);
      this.$refs.file.addEventListener("change", change);

      this.$once("hook:beforeDestroy", () => {
        events.forEach(name => {
          this.$el.removeEventListener(name, prevent);
        });
        dragoverEvents.forEach(name => {
          this.$el.removeEventListener(name, dragover);
        });
        dragoutEvents.forEach(name => {
          this.$el.removeEventListener(name, dragout);
        });
        this.$el.removeEventListener("drop", drop);
        this.$refs.file.removeEventListener("change", change);
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.uploader-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 100%;
}
.box {
  width: 100%;
  height: 100%;
  font-size: 1.25rem; /* 20 */
  background-color: #c8dadf;
  position: relative;
  text-align: center;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.advance {
  outline: 2px dashed #92b0b3;
  outline-offset: -10px;
  transition: outline-offset 0.15s ease-in-out, background-color 0.15s linear;

  .dragndrop-text {
    display: inline;
  }

  .upload-icon {
    width: 100%;
    height: 80px;
    fill: #92b0b3;
    display: block;
    margin-bottom: 40px;
  }

  .input-file {
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
    position: absolute;
    z-index: -1;

    + label {
      max-width: 80%;
      text-overflow: ellipsis;
      white-space: nowrap;
      cursor: pointer;
      display: inline-block;
      overflow: hidden;
    }
  }
}

.is-dragover {
  outline-offset: -20px;
  outline-color: #c8dadf;
  background-color: #fff;
}

// @keyframes appear-from-inside {
//   from {
//     transform: translateY(-50%) scale(0);
//   }
//   75% {
//     transform: translateY(-50%) scale(1.1);
//   }
//   to {
//     transform: translateY(-50%) scale(1);
//   }
// }
</style>
