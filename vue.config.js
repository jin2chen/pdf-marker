module.exports = {
  lintOnSave: false,
  publicPath: process.env.NODE_ENV === "production" ? "/pdf-marker/" : "/",
  // configureWebpack: {
  //   devtool: "source-map"
  // },
  transpileDependencies: ["vuetify"]
};
