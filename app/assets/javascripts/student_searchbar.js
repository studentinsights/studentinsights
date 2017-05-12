$(function() {
  const CACHE_KEY = 'student_names_cache';

  function setupSearchBarAutocomplete (names) {
    $(".student-searchbar").autocomplete({
      source: names,
      delay: 0,
      minLength: 2,
      autoFocus: true,
      select: function(e, ui) {
        var MixpanelUtils = window.shared.MixpanelUtils;
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

        if (window.localStorage && window.sessionStorage) {
          const string = JSON.stringify(data);
          window.localStorage.setItem(CACHE_KEY, string);
          window.sessionStorage.setItem(CACHE_KEY, string);
        } else {
          throw 'no localStorage';
        }
      }
    });
  }

  // Cache in localStorage for first page load, but sessionStorage
  // controls when cache is invalidated
  if ($('.student-searchbar').length > 0) {
    // Read names from cache if we can
    try {
      const namesCache = window.localStorage.getItem(CACHE_KEY);
      if (namesCache) {
        setupSearchBarAutocomplete(JSON.parse(namesCache));
      }
    } catch (err) {
      console.error('Could not read from localStorage'); // eslint-disable-line no-console
    }

    // Refresh cache async at the start of every session
    try {
      const sessionCache = window.sessionStorage.getItem(CACHE_KEY);
      if (sessionCache) return;
    } catch (err) {
      console.error('Could not read from sessionStorage'); // eslint-disable-line no-console
    }

    downloadStudentNames();
  }
});
