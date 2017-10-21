import './config/sprockets-shims.js';
import './legacy.js';

$(document).ready(() => {
  window.shared.StudentProfilePdf.load();
});