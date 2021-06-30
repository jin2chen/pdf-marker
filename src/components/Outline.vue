<template>
  <div style="padding: 8px 12px;">
    <v-card outlined style="position: relative">
      <v-btn icon style="position: absolute; right: 0;" @click="copy()">
        <v-icon>mdi-content-copy</v-icon>
      </v-btn>
      <v-card-text>
        <pre class="code">{{ result }}</pre>
      </v-card-text>
    </v-card>
    <v-form ref="form">
      <v-text-field
        v-model="app.shape.section"
        label="Section"
        type="text"
        dense
      ></v-text-field>
      <v-select
        v-model="app.shape.type"
        :items="tagTypes"
        label="Type"
      ></v-select>
      <v-select
        v-model="app.shape.signatureType"
        :items="signatureTypes"
        label="Signature Type"
        v-show="app.shape.type === TAG_TYPE.SIGNATURE"
      ></v-select>
      <v-text-field
        v-model.number="app.shape.scaleValue"
        label="Scale Value"
        type="text"
        v-show="app.shape.type === TAG_TYPE.SIGNATURE"
        dense
      ></v-text-field>
      <v-text-field
        v-model.trim="app.shape.name"
        label="Name"
        type="text"
        dense
      ></v-text-field>
      <v-text-field
        v-model.trim="app.shape.value"
        label="Value"
        type="text"
        dense
        v-show="app.shape.type === TAG_TYPE.CHECKBOX"
      ></v-text-field>
      <v-text-field
        v-model.number="app.shape.left"
        label="Left"
        type="number"
        dense
      ></v-text-field>
      <v-text-field
        v-model.number="app.shape.top"
        label="Top"
        type="number"
        dense
      ></v-text-field>
      <v-text-field
        v-model.number="app.shape.width"
        label="Width"
        type="number"
        dense
      ></v-text-field>
      <v-text-field
        v-model.number="app.shape.height"
        label="Height"
        type="number"
        dense
      ></v-text-field>
    </v-form>
  </div>
</template>
<script>
import { TAG_TYPE, SIGNATURE_TYPE } from "@/core/constant";
import Utils from "@/core/utils";

export default {
  data: () => ({
    tagTypes: Object.values(TAG_TYPE),
    signatureTypes: Object.values(SIGNATURE_TYPE)
  }),
  created() {
    this.app = this.$root.app();
    this.TAG_TYPE = TAG_TYPE;
  },
  computed: {
    result() {
      if (Number.isNaN(Number.parseInt(this.app.shape.left))) {
        return "";
      }

      const tag = Utils.shape2tag(this.app.shape);
      ["section"].forEach(key => delete tag[key]);

      return tag;
    }
  },
  methods: {
    copy() {
      this.$copyText(JSON.stringify(this.result));
    }
  }
};
</script>
<style lang="scss" scoped>
.code {
  min-height: 176px;
}
</style>
