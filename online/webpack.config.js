const resolve = {
  alias: {
    vue$: 'vue/dist/vue.esm.js'
  }
}

module.exports = {
  entry: {
    index: './online/index'
  },
  output: {
    path: __dirname,
    filename: '[name].bundle.js'
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all'
        }
      }
    }
  },
  resolve
}
