import renderStudentMain from '../app/assets/javascripts/student_profile/main';
import renderNotesFeedMain from '../app/assets/javascripts/notes_feed/main';
import renderRestrictedNotesMain from '../app/assets/javascripts/restricted_notes/main';
import renderDistrictPageMain from '../app/assets/javascripts/district/main';


// Placeholder routing (not fully client-side, just on page load).
// Clicking links still reloads the whole page from the server.
//
// Returns true if it could handle a route, false if not (for newer code
// using a client-side router).
export default function legacyRouteHandler(el) {
  // deprecated
  if ($('body').hasClass('students') && $('body').hasClass('show')) {
    renderStudentMain(el);
    return true;
  }

  // deprecated
  if ($('body').hasClass('students') && $('body').hasClass('restricted_notes')) {
    renderRestrictedNotesMain(el);
    return true;
  }

  if ($('body').hasClass('educators') && $('body').hasClass('notes_feed')) {
    renderNotesFeedMain(el);
    return true;
  }

  return false;
}
