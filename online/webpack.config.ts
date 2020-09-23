import * as webpack from 'webpack'
import VueLoaderPlugin from 'vue-loader/dist/plugin'

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
      { test: /\.tsx?$/, loader: 'ts-loader', options: { appendTsSuffixTo: [/\.vue$/] } },
      { test: /\.vue$/, loader: 'vue-loader' }
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
    extensions: ['.ts', '.tsx', '.js']
  },
  plugins: [
    new VueLoaderPlugin()
  ]
}

export default config
