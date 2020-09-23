import * as webpack from 'webpack'

const config: webpack.Configuration = {
  entry: {
    index: './online/index'
  },
  output: {
    path: __dirname,
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
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
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      vue$: 'vue/dist/vue.esm-bundler.js'
    }
  }
}

export default config
