// This class is related to styling rules in application.html that we don't
// not all pages want as global.  This works around until we refactor and migrate
// away from those global styles being set globally in the HTML template.

// Reach outside component to change styles for page and conatiner, to take up
// the entire vertical height.
export function updateGlobalStylesToTakeFullHeight() {
  if (window.process && window.process.env.NODE_ENV === 'test') return;

  window.document.documentElement.style.height = '100%';
  window.document.body.style.height = '100%';
  window.document.body.style.display = 'flex';
  window.document.body.style['flex-direction'] = 'column';
  window.document.getElementById('main').style.flex = 1;
  window.document.getElementById('main').style.display = 'flex';
  window.document.getElementById('main').style['flex-direction'] = 'column';
}

// Prevent horizontal scrollbar from showing.
export function updateGlobalStylesToRemoveHorizontalScrollbars() {
  window.document.body.style['min-width'] = '1000px';
}