// Prevent further Object.prototype pollution from happening
// (example: https://snyk.io/vuln/SNYK-JS-SETVALUE-450213)

// This is split out as a separate file, since unfortunately
// Moment.js modifies `Object.prototype` unnecessarily.
// So this works around by importing it before freezing Object.prototype.
import 'moment';

// Prevent further Object.prototype pollution from happening
// (example: https://snyk.io/vuln/SNYK-JS-SETVALUE-450213)
try {
  Object.freeze(Object.prototype);
} catch (err) {
  console.error('Object.freeze(Object.prototype) failed', err);
}
