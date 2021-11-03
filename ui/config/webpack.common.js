/* eslint-disable no-undef */
module.exports = {
  target: ['web', 'es5'],
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
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            // This is a feature of `babel-loader` for webpack (not Babel itself).
            // It enables caching results in ./node_modules/.cache/babel-loader/
            // directory for faster rebuilds.
            cacheDirectory: true,
            
            // define config for Babel itself and its plugins there, not
            // in here.
            babelrc: true
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
};
/* eslint-disable no-undef */
