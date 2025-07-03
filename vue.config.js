const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    resolve: {
      extensions: ['.ts', '.js', '.vue', '.json'],
    },
  },
  css: {
    loaderOptions: {
      scss: {
        additionalData: `@use "@/assets/scss/global.scss" as *;`,
      },
    },
  },
})
