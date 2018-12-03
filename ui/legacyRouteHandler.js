import renderNotesFeedMain from '../app/assets/javascripts/notes_feed/main';


// Placeholder routing (not fully client-side, just on page load).
// Clicking links still reloads the whole page from the server.
//
// Returns true if it could handle a route, false if not (for newer code
// using a client-side router).
export default function legacyRouteHandler(el) {
  if ($('body').hasClass('educators') && $('body').hasClass('notes_feed')) {
    renderNotesFeedMain(el);
    return true;
  }

  return false;
}
