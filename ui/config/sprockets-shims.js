// Provide dependencies still in Sprockets
// This doesn't work directly in setupTests, not sure why.
import $ from 'jquery';
window.$ = window.jQuery = $;
window.$.fn.datepicker = function() {};
window.$.fn.autocomplete = function() {};
