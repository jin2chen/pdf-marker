<template>
  <v-btn icon tag="label" for="import" style="cursor: pointer;">
    <v-icon>mdi-file-import</v-icon>
    <input ref="import" type="file" id="import" class="input-file" />
  </v-btn>
</template>
<script>
export default {
  created() {
    this.app = this.$root.app();
  },
  mounted() {
    this.bindEvent();
  },
  methods: {
    bindEvent() {
      const change = event => {
        if (event.target.files.length <= 0) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        const file = Array.from(event.target.files).shift();
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const schema = JSON.parse(reader.result);
            this.app.schema = schema;
            this.app.filename = file.name;
          } catch (error) {
            console.error("JSON parsed error.");
          }
        };
        reader.readAsText(file);
      };

      this.$refs.import.addEventListener("change", change);
      this.$once("hook:beforeDestroy", () => {
        this.$refs.import.removeEventListener("change", change);
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.input-file {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}
</style>
