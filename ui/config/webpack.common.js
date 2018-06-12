/* eslint-disable no-undef */
module.exports = { 
  // Export two artifacts, one for the main app and one for running within
  // the PDF export.
  entry: {
    bundle: ['./ui/polyfills.js', './ui/index.js'], // force polyfills to be first
    student_report_pdf: './ui/student_report_pdf.js'
  },
  // node: {
  //   fs: "empty"  // https://github.com/webpack-contrib/css-loader/issues/447
  // },
  module: {
    rules: [
      // Process JS with Babel.
      {
        test: /\.js$/, // use .js instead of .jsx

        loader: require.resolve('babel-loader'),
        options: {
          // @remove-on-eject-begin
          babelrc: false,
          presets: [require.resolve('babel-preset-react-app')],
          // @remove-on-eject-end
          // This is a feature of `babel-loader` for webpack (not Babel itself).
          // It enables caching results in ./node_modules/.cache/babel-loader/
          // directory for faster rebuilds.
          cacheDirectory: true,
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
};
/* eslint-disable no-undef */
