// This is a temporary file, used for when we need to run our code outside of Rails,
// while we migrate the rest of those over.  Examples: testing, PDF, Storybook.
// Including this code in setupTests doesn't work directly, I'm not sure why.
import $ from 'jquery';
window.$ = window.jQuery = $;
window.$.fn.datepicker = function() {};
window.$.fn.autocomplete = function() {};
