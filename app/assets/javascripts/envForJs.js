// Read the stub written by the Rails HTML in the layout
export function readEnv() {
  if (window.ENV_FOR_JS === undefined) {
    const el = document.getElementById('env-for-js');
    const jsonString = el.getAttribute('data-env-for-js-json');
    window.ENV_FOR_JS = JSON.parse(jsonString);
  }
  
  return window.ENV_FOR_JS;
}