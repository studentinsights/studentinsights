import {apiFetchJson} from './helpers/apiFetchJson';

const STUDENT_NAMES_CACHE_KEY = 'studentInsights.studentSearchbar.studentNamesCacheKey';

function setupSearchBarAutocomplete (names) {
  $(".student-searchbar").autocomplete({
    source: names,
    minLength: (names.length > 1000) ? 0 : 3,
    select(e, ui) {
      window.location.pathname = '/students/' + ui.item.id;
    },
  });
}

function downloadStudentNames () {
  apiFetchJson('/api/educators/student_searchbar_json').then(data => {
    setupSearchBarAutocomplete(data);

    if (isSessionStorageSupported()) {
      window.sessionStorage.setItem(STUDENT_NAMES_CACHE_KEY, JSON.stringify(data));
    } else {
      throw 'no session storage';
    }
  });
}

export function initSearchBar() {
  if (!isSessionStorageSupported()) {
    downloadStudentNames();       // Query for names if we have no local storage
    throw 'no session storage';   // Let rollbar know we're not caching
  }

  const namesCache = window.sessionStorage.getItem(STUDENT_NAMES_CACHE_KEY);

  if (namesCache) return setupSearchBarAutocomplete(JSON.parse(namesCache));

  return downloadStudentNames();  // Student names haven't cached yet,
                                  // so let's download and cache them
}

export function clearStorage() {
  if (isSessionStorageSupported() && window.sessionStorage.clear) {
    window.sessionStorage.clear();
  }
}


function isSessionStorageSupported() {
  var isSupported; // eslint-disable-line no-var
  try {
    isSupported = 'sessionStorage' in window && window.sessionStorage !== null;
    const testKey = 'studentInsights.studentSearchbar.isSessionStorageSupported';
    window.sessionStorage.setItem(testKey, 'yes');
    window.sessionStorage.removeItem(testKey);
  } catch (e) {
    isSupported = false;
  }

  return isSupported;
}