const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,

  // GitHub Pages deployment configuration
  publicPath:
    process.env.NODE_ENV === 'production' ? '/action-list-tracker/' : '/',

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

  // Disable source maps in production for smaller files
  productionSourceMap: false,

  // Configure the dev server
  devServer: {
    port: 8081,
  },
})
