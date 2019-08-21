// Prevent further Object.prototype pollution from happening after
// our code initially loads.
// (example: https://snyk.io/vuln/SNYK-JS-SETVALUE-450213)
//
// This is split out as a separate file, since unfortunately
// some vendor code (eg, Moment.js) modifies `Object.prototype` unnecessarily,
// so we want that to be able to load and do its thing first.
//
// Other vendor code (eg, Lunr.js) does the "override mistake" which means
// its overrides to things like `toString` no longer work.
// see http://web.archive.org/web/20141230041441/http://wiki.ecmascript.org/doku.php?id=strawman:fixing_override_mistake
// or https://github.com/tc39/ecma262/pull/1307#issuecomment-421606419
// or https://esdiscuss.org/topic/object-freeze-object-prototype-vs-reality
try {
  Object.freeze(Object.prototype);
} catch (err) {
  console.error('Object.freeze(Object.prototype) failed', err);
}