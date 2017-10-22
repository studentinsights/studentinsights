import 'es5-shim'; // This has to be first, wkhtmltopdf uses QtWebKit
import './sprocketsShims.js';
import './legacy.js';

$(document).ready(() => {
  window.shared.StudentProfilePdf.load();
  console.log('StudentProfilePdf#load done.'); //eslint-disable-line
});
