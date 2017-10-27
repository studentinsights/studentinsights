// See https://github.com/facebookincubator/create-react-app/blob/2e82ebb3371731a5c4e346f310848ddb23fd0976/packages/react-scripts/config/jest/cssTransform.js
// This is a custom Jest transformer turning style imports into empty objects.
// http://facebook.github.io/jest/docs/tutorial-webpack.html

module.exports = {
  process() {
    return 'module.exports = {};';
  },
  getCacheKey() {
    // The output is always the same.
    return 'cssTransform';
  },
};