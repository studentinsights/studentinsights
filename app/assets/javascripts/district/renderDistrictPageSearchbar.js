import React from 'react';
import ReactDOM from 'react-dom';
import StudentSearchbar from '../components/StudentSearchbar';

// This is mostly server-rendered, and the page has a different
// structure than other pages
export function shouldRenderDistrictPageSearchbar() {
  $('body').hasClass('educators') && $('body').hasClass('districtwide_admin_homepage');
}

// Render the student searchbar, but with different styling.
export function renderDistrictPageSearchbar() {
  const searchbarEl = document.querySelector('.StudentSearchbar-root-for-district-page');
  ReactDOM.render(
    <StudentSearchbar
      autocompleteProps={{wrapperStyle: {width: '100%'}}}
      inputStyles={{width: '100%', fontSize: 20, height: 60}}
    />,
    searchbarEl
  );
}


