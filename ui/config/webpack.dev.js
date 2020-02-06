/* eslint-disable no-undef */
const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',

  // Rails looks in this particular place
  // See application.html.erb and Webpack#bundle
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../../public/dev')
  },

  plugins: [
    new CleanWebpackPlugin({
      dry: false, // required for `dangerouslyAllowCleanPatternsOutsideProject` to work
      dangerouslyAllowCleanPatternsOutsideProject: true,
      cleanOnceBeforeBuildPatterns: path.join(process.cwd(), '../../public/dev')
    })
  ]
});
/* eslint-disable no-undef */