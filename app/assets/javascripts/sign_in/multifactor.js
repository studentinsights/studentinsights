// This runs on load - no other dependencies like jQuery are yet loaded.

// The intent is that this is only needed for multifactor authentication; simple login
// should work with only jQuery and UJS.
//
// This code has implicit dependencies on:
// - the form, rendered by Rails
// - jQuery and jQuery UJS, for submitting the form and for listening to form submit events
export function multifactorMain(options = {}) {
  const el = options.el || document.querySelector('.SignInPage');

  // page elements and shared state for cleaning up listeners
  const simpleForm = el.querySelector('.SignInPage-form');
  const switchModeLink = el.querySelector('.SignInPage-authentication-type-link');
  const loginCode = el.querySelector('.SignInPage-input-login-code');
  const simpleLogin = simpleForm.querySelector('.SignInPage-input-login');
  const simplePassword = simpleForm.querySelector('.SignInPage-input-password');
  const flashMessage = el.querySelector('.SignInPage-flash-alert');
  const listeners = {};
  const shared = {
    el,
    switchModeLink,
    simpleLogin,
    simplePassword,
    loginCode,
    flashMessage,
    simpleForm,
    listeners
  };
  
  allowSwitchToMultiFactor(shared);

  return shared; // for testing
}

function allowSwitchToMultiFactor(shared) {
  const {switchModeLink, listeners} = shared;
  listeners.link = e => {
    e.preventDefault();
    switchToMultiFactor(shared);
  };
  switchModeLink.addEventListener('click', listeners.link);
}

function switchToMultiFactor(shared) {
  const {
    switchModeLink,
    simpleForm,
    simpleLogin,
    simplePassword,
    loginCode,
    flashMessage
  } = shared;
  
  // check validation first, and if it fails do the submit
  // to show the user validation feedback
  if (!simpleForm.checkValidity()) {
    simpleForm.querySelector('input[type=submit]').click();
    return;
  }  

  // Submit multifactor form without password
  // simplePassword.disabled = true;
  // simpleForm.setAttribute('action', '/educators/multifactor');
  // simpleForm.querySelector('input[type=submit]').click();

  // create form
  // debugger
  // const multifactorLoginText = document.createElement('input');
  // multifactorLoginText.name = 'multifactor[login_text]';
  // multifactorLoginText.value = simpleLogin.value;

  // const cloneForm = document.createElement('form');
  // cloneForm.setAttribute('accept-charset', 'UTF-8');
  // cloneForm.setAttribute('action', '/educators/multifactor');
  // cloneForm.setAttribute('method', 'post');
  // cloneForm.setAttribute('data-remote', true);
  // cloneForm.appendChild(multifactorLoginText);
  // cloneForm.submit();

  const multifactorForm = document.querySelector('.SignInPage-multifactor-form');
  const multifactorLoginText = document.querySelector('.SignInPage-multifactor-login-text');
  multifactorLoginText.value = simpleLogin.value;
  multifactorForm.querySelector('input[type=submit]').click();
  

  // Update visuals to enter login code
  flashMessage.innerText = '';
  simpleLogin.readOnly = true;
  simplePassword.readOnly = true;
  switchModeLink.classList.add('hidden');
  loginCode.value = '';
  loginCode.classList.remove('hidden');
  loginCode.focus();

  // And allow password again
  simplePassword.disabled = false;
}
