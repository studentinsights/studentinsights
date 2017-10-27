/* eslint-disable no-undef */
module.exports = { 
  entry: {
    bundle: ['./ui/polyfills.js', './ui/index.js'], // force polyfills to be first
    styles: './ui/index.scss',
    student_report_pdf: './ui/student_report_pdf.js'
  },
  module: {
    rules: [
      // Process JS with Babel.
      {
        test: /\.(js|jsx)$/,
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
      // SASS
      {
        test: /\.s?css$/,
        use: [{
          loader: "style-loader" // creates style nodes from JS strings
        }, {
          loader: "css-loader" // translates CSS into CommonJS
        }, {
          loader: "sass-loader" // compiles Sass to CSS
        }, {
          loader: 'postcss-loader',
          options: {
            config: {
              path: './ui/config/postcss.config.js'
            }
          }
        }]
      }
    ]
  }
};
/* eslint-disable no-undef */