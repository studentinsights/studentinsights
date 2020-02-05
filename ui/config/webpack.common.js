/* eslint-disable no-undef */
module.exports = {
  entry: {
    bundle: ['./ui/polyfills.js', './ui/index.js'], // force polyfills to be first
    student_report_pdf: './ui/student_report_pdf.js',
    rollbar: './ui/rollbar.js',
    sign_in: ['./ui/polyfills.js', './ui/sign_in.js']
  },
  module: {
    rules: [
      // Process JS with Babel.
      {
        test: /\.js$/, // use .js instead of .jsx
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }

        // use: {
        //   loader: 'babel-loader',
        //   options: {
        //     // babelrc: true,
        //     presets: ['babel-preset-react-app'],

        //     // This is a feature of `babel-loader` for webpack (not Babel itself).
        //     // It enables caching results in ./node_modules/.cache/babel-loader/
        //     // directory for faster rebuilds.
        //     cacheDirectory: true,
        //   }
        // }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
};
/* eslint-disable no-undef */
