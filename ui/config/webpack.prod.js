/* eslint-disable no-undef */
const path = require('path');
const webpack = require('webpack');
const common = require('./webpack.common.js');
const merge = require('webpack-merge');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = merge(common, {
  devtool: 'source-map',

  // Rails looks in this particular place
  // See application.html.erb and Webpack#bundle
  output: {
    filename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, '../../public/build')
  },

  plugins: [
    new CleanWebpackPlugin(['../../public/build'], { allowExternal: true }),
    new UglifyJSPlugin({sourceMap: true}),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.HashedModuleIdsPlugin(),
    new ManifestPlugin({fileName: 'manifest.json' }),
    new CompressionPlugin({
      asset: '[path].gz[query]'
    })
  ]
});
/* eslint-disable no-undef */