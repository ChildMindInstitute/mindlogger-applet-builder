module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  "css": { extract: false },
  chainWebpack: config => {
    config.module
      .rule('readme')
      .test(/\.(md|txt)(\?.*)?$/)
      .use('raw-loader')
        .loader('raw-loader')
        .end()

    // config.module
    //   .rule('images')
    //   .test(/\.(png|jpe?g|gif)$/i)
    //   .use('file-loader')
    //     .loader('file-loader')
    //     .end()
  }
}