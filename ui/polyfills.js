/*
These are polyfills for ES5/ES6 features that aren't supported in
IE11 in particular.  This is trying to track create-react-app.
See https://github.com/facebook/create-react-app/tree/master/packages/react-app-polyfill

These polyfills have to be run before other code, so they're included first
in the webpack build config, rather than `imported` from `index.js`.

For lint support, keep `eslint-plugin-compat` configuration in .eslintrc in sync.
*/
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
