import 'es5-shim'; // This has to be first, wkhtmltopdf uses QtWebKit
import './config/sprockets-shims';
import {load} from '../app/assets/javascripts/student_profile/pdf/studentProfilePdf';

$(document).ready(() => {
  load();
  console.log('studentProfilePdf#load done.'); //eslint-disable-line
});
