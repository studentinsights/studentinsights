/* eslint-disable no-undef */
const path = require('path');
const webpack = require('webpack');
const common = require('./webpack.common.js');
const {merge} = require('webpack-merge');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');


module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',

  // Rails looks in this particular place
  // See application.html.erb and Webpack#bundle
  output: {
    filename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, '../../public/build')
  },

  plugins: [
    new CleanWebpackPlugin({
      dry: false, // required for `dangerouslyAllowCleanPatternsOutsideProject` to work
      dangerouslyAllowCleanPatternsOutsideProject: true,
      cleanOnceBeforeBuildPatterns: path.join(process.cwd(), '../../public/build')
    }),
    new WebpackManifestPlugin({fileName: 'manifest.json' }),
    new CompressionPlugin({
      filename: '[path].gz[query]'
    })
  ],

  optimization: {
    moduleIds: 'deterministic',
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          // This config is to preserve React components' names from
          // being compiled away, so we can see them in Rollbar alerts.
          keep_classnames: true,
          kep_fnames: true
        }
      })
    ]
  }
});
/* eslint-disable no-undef */