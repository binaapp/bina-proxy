const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  chainWebpack: config => {
    config.plugin('define').tap(args => {
      args[0].__VUE_PROD_DEVTOOLS__ = false
      args[0].__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false
      return args
    })
  }
});
