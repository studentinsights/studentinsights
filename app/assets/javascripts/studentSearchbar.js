import {apiFetchJson} from './helpers/apiFetchJson';

const STUDENT_NAMES_CACHE_KEY = 'studentInsights.studentSearchbar.studentNamesCacheKey';

function setupSearchBarAutocomplete(names) {
  // Four ways to mitigate impact of large lists:
  // 1. increased delay until searching happens
  // 2. add min length for typing
  // 3. only render first 100
  // 4. set max-height and scroll overflow
  $(".student-searchbar").autocomplete({
    source: names,
    delay: (names.length > 1000) ? 500 : 200,
    minLength: (names.length > 1000) ? 3 : 0,
    select(e, ui) {
      window.location.pathname = '/students/' + ui.item.id;
    },
    _renderMenu: function(ul, items) {
      const truncatedItems = (names.length > 100)
        ? names.slice(0, 100)
        : names;
      truncatedItems.forEach((index, item) => this._renderItemData(ul, item));
      if (names.length > 100) {
        $(ul).append('<li>And ' + (names.length - truncatedItems.length) + ' more items</li>');
      }
    }
  }).css({
    'max-height': '400px',
    'overflow-y': 'scroll'
  });
}

function downloadStudentNames() {
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