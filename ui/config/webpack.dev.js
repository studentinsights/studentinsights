/* eslint-disable no-undef */
const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = merge(common, {
  devtool: 'cheap-module-eval-source-map',

  // Rails looks in this particular place
  // See application.html.erb and ApplicationHelper#webpack_bundle
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../../public/dev')
  },

  plugins: [
    new CleanWebpackPlugin(['../../public/dev'], { verbose: false })
  ]
});
/* eslint-disable no-undef */