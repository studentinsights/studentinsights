// Read the stub written by the Rails HTML in the layout.  Intended for the JS
// boot process only.
//
// Use `PerDistrict` if you're trying to get `districtKey` from inside a React component.
export function readEnv() {
  if (window.ENV_FOR_JS === undefined) {
    const el = document.getElementById('env-for-js');
    const jsonString = el.getAttribute('data-env-for-js-json');
    window.ENV_FOR_JS = JSON.parse(jsonString);
  }
  
  return window.ENV_FOR_JS;
}