const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  mode: "development",
  entry: './js/app.js',
  output: {
    filename: 'build.js'
  },

  watch: true,
  watchOptions: {
    aggregateTimeout: 300
  },

  devtool: "source-map",

  plugins: [
    new BrowserSyncPlugin({
      // browse to http://localhost:3000/ during development,
      // ./public directory is being served
      host: 'localhost',
      port: 5500,
      files: ["./css/*.css", "./*.html"],
      server: { baseDir: ['./'] }
    }),
    new webpack.ProvidePlugin({
      noUiSlider: 'nouislider'
    })
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
};