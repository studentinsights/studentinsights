import './freeze';

it('prevents changing Object.prototype', () => {
  expect(() => {
    "use strict";
    Object.prototype.toString = function() { return "ok"; };
  }).toThrow();
});