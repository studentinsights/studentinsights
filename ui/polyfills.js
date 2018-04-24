// These are polyfills for ES5/ES6 features that aren't supported in
// IE11.  If we want to use other things like fetch, Map/Set or Array methods,
// add them in here.
//
// Object.assign is particularly tricky since it doesn't come from our source directly,
// but from our Babel transpilation process.
import assign from 'object-assign';
Object.assign = assign;

import Promise from 'promise-polyfill';

if (!window.Promise) {
  window.Promise = Promise;
}

import 'whatwg-fetch';

import ArrayFindPolyfill from 'array.prototype.find';
ArrayFindPolyfill.shim();
