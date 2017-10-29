import renderStudentMain from '../app/assets/javascripts/student_profile/main.jsx';
import homeroomMain from '../app/assets/javascripts/homeroom_table/main.jsx';
import renderRestrictedNotesMain from '../app/assets/javascripts/restricted_notes/main.jsx';
import renderSectionMain from '../app/assets/javascripts/section/main.jsx';
import renderServiceUploadsMain from '../app/assets/javascripts/service_uploads/main.jsx';
import renderStarMathMain from '../app/assets/javascripts/star_math/main.jsx';
import renderStarReadingMain from '../app/assets/javascripts/star_reading/main.jsx';


// Placeholder routing (not fully client-side, just on page load).
// Clicking links still reloads the whole page from the server.
export default function handleLegacyRoutes(el) {
  if ($('body').hasClass('students') && $('body').hasClass('show')) {
    renderStudentMain(el);
    return true;
  }

  if ($('body').hasClass('homerooms') && $('body').hasClass('show')) {
    homeroomMain(); // different HTML
    return true;
  }

  if ($('body').hasClass('students') && $('body').hasClass('restricted_notes')) {
    renderRestrictedNotesMain(el);
    return true;
  }

  if ($('body').hasClass('sections') && $('body').hasClass('show')) {
    renderSectionMain(el);
    return true;
  }

  if ($('body').hasClass('service_uploads') && $('body').hasClass('index')) {
    renderServiceUploadsMain(el);
    return true;
  }

  if ($('body').hasClass('schools') && $('body').hasClass('star_math')) {
    renderStarMathMain(el);
    return true;
  }

  if ($('body').hasClass('schools') && $('body').hasClass('star_reading')) {
    renderStarReadingMain(el);
    return true;
  }

  return false;
}