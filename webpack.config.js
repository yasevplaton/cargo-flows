const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

module.exports = {
  mode: "development",
  entry: './js/app.js',
  output: {
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
      files: ["./css/*.css", "./*.html"],
      server: { baseDir: ['./'] }
    }),
    new webpack.ProvidePlugin({
      noUiSlider: 'nouislider'
    })
  ],

  optimization: {
    minimize: false
  }
};