import renderStudentMain from '../app/assets/javascripts/student_profile/main';
import renderSchoolOverviewMain from '../app/assets/javascripts/school_overview/main';
import renderNotesFeedMain from '../app/assets/javascripts/notes_feed/main';
import renderRestrictedNotesMain from '../app/assets/javascripts/restricted_notes/main';
import renderSectionMain from '../app/assets/javascripts/section/main';
import renderServiceUploadsMain from '../app/assets/javascripts/service_uploads/main';


// Placeholder routing (not fully client-side, just on page load).
// Clicking links still reloads the whole page from the server.
//
// Returns true if it could handle a route, false if not (for newer code
// using a client-side router).
export default function legacyRouteHandler(el) {
  if ($('body').hasClass('students') && $('body').hasClass('show')) {
    renderStudentMain(el);
    return true;
  }

  if ($('body').hasClass('schools') && $('body').hasClass('show')) {
    renderSchoolOverviewMain(el);
    return true;
  }

  if ($('body').hasClass('schools') && $('body').hasClass('overview')) {
    renderSchoolOverviewMain(el, { json: true });
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

  if ($('body').hasClass('educators') && $('body').hasClass('notes_feed')) {
    renderNotesFeedMain(el);
    return true;
  }

  return false;
}
