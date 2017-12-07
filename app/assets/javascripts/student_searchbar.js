import MixpanelUtils from './helpers/MixpanelUtils';


function setupSearchBarAutocomplete (names) {
  $(".student-searchbar").autocomplete({
    source: names,
    select: function(e, ui) {
      MixpanelUtils.track('SEARCHBAR_SELECTED_STUDENT', {});
      window.location.pathname = '/students/' + ui.item.id;
    },
  });
}

function downloadStudentNames () {
  $.get({
    url: '/students/names',
    success: function (data) {
      setupSearchBarAutocomplete(data);

      if (window.sessionStorage) {
        window.sessionStorage.student_names_cache = JSON.stringify(data);
      } else {
        throw 'no session storage';
      }
    }
  });
}

export default function studentSearchbar() {
  if (!(window.sessionStorage)) {
    downloadStudentNames();       // Query for names if we have no local storage
    throw 'no session storage';   // Let rollbar know we're not caching
  }

  const namesCache = window.sessionStorage.student_names_cache;

  if (namesCache) return setupSearchBarAutocomplete(JSON.parse(namesCache));

  return downloadStudentNames();  // Student names haven't cached yet,
                                  // so let's download and cache them
}
