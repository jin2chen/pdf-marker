<template>
  <v-app id="inspire">
    <v-navigation-drawer app permanent clipped width="25%">
      <outline></outline>
    </v-navigation-drawer>

    <v-app-bar app clipped-left>
      <v-toolbar-title>PDF MARK TOOL</v-toolbar-title>
      <v-spacer></v-spacer>
      <import></import>
      <v-btn icon @click="exportCount++">
        <v-icon>mdi-file-export</v-icon>
      </v-btn>
      <span>{{ filename }}</span>
    </v-app-bar>

    <v-content>
      <v-container
        fluid
        style="height: 100%; padding-top: 0; padding-bottom: 0;"
      >
        <v-row class="fill-height" align="stretch" justify="center">
          <v-col>
            <viewer></viewer>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import Viewer from "@/components/Viewer";
import Outline from "@/components/Outline";
import Import from "@/components/Import";

export default {
  name: "App",
  components: {
    Viewer,
    Outline,
    Import
  },
  data: () => ({
    drawer: null,
    shape: {},
    schema: {},
    exportCount: 0,
    filename: "export.json"
  }),
  created() {
    this.$root.app = () => {
      return this.$root.$children[0];
    };
    this.$vuetify.theme.dark = true;
  }
};
</script>
