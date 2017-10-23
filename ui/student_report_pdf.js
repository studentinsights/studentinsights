import './config/sprockets-shims.js';
import './legacy.js';
import $ from 'jquery';

$(document).ready(() => {
  window.shared.StudentProfilePdf.load();
});