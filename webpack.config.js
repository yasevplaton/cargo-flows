const path = require('path');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const webpack = require('webpack');
// const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {

  mode: "development",
  entry: './js/app.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },

  watch: true,
  watchOptions: {
    aggregateTimeout: 300
  },

  devtool: "source-map",

  plugins: [
    new BrowserSyncPlugin({
      host: 'localhost',
      port: 5500,
      files: ["./css/**/*.scss", "./css/**/*.css", "./*.html"],
      server: { baseDir: ['./'] }
    }),
    new webpack.ProvidePlugin({
      noUiSlider: 'nouislider'
    })
  ],

  optimization: {
    minimize: false
  },

  module: {
    rules: [{
        test: /\.scss$/,
        use: [
            "style-loader", // creates style nodes from JS strings
            "css-loader", // translates CSS into CommonJS
            "sass-loader" // compiles Sass to CSS, using Node Sass by default
        ]
    }]
}
};