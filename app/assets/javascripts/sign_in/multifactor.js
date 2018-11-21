// This runs on load - no other dependencies like jQuery are yet loaded.

// The intent is that this is only needed for multifactor authentication; simple login
// should work with only jQuery and UJS.
//
// This code has implicit dependencies on:
// - the form, rendered by Rails
// - jQuery and jQuery UJS, for submitting the form and for listening to form submit events
export function multifactorMain(options = {}) {
  const el = options.el || document.querySelector('.SignInPage');
  const windowHash = options.hash || window.location.hash;

  // page elements and shared state for cleaning up listeners
  const switchModeLink = el.querySelector('.SignInPage-authentication-type-link');
  const simpleForm = el.querySelector('.SignInPage-form');
  const multiFactorForm = el.querySelector('.SignInPage-multifactor-form');
  const multiFactorLogin = multiFactorForm.querySelector('.SignInPage-input-login');
  const multiFactorPassword = multiFactorForm.querySelector('.SignInPage-input-password');
  const loginCode = el.querySelector('.SignInPage-input-login-code');
  const loginCodeContainer = el.querySelector('.SignInPage-item-containing-login-code');
  const sentLoginCodeMessage = el.querySelector('.SignInPage-multifactor-sent-code');
  const simpleLogin = simpleForm.querySelector('.SignInPage-input-login');
  const simplePassword = simpleForm.querySelector('.SignInPage-input-password');
  const flashMessage = el.querySelector('.SignInPage-alert');
  const listeners = {};
  const shared = {
    el,
    switchModeLink,
    multiFactorForm,
    multiFactorLogin,
    multiFactorPassword,
    loginCode,
    loginCodeContainer,
    sentLoginCodeMessage,
    simpleForm,
    simpleLogin,
    simplePassword,
    flashMessage,
    listeners
  };
  
  if (windowHash.indexOf('multiFactor') !== -1) {
    switchToMultiFactor(shared);
  } else {
    allowSwitchToMultiFactor(shared);
  }

  return shared; // for testing
}

function allowSwitchToMultiFactor(shared) {
  const {switchModeLink, listeners} = shared;
  listeners.link = e => {
    e.preventDefault();
    switchToMultiFactor(shared);
  };
  switchModeLink.addEventListener('click', listeners.link);
  switchModeLink.classList.remove('hidden');
}

function switchToMultiFactor(shared) {
  const {el, switchModeLink, multiFactorForm, loginCode, flashMessage, listeners} = shared;
  
  // copy any values already typed into fields over
  copyFromSimpleToMultiFactor(shared);

  // clear placeholder login_code
  loginCode.value = '';

  // Visuals
  multiFactorForm.classList.remove('hidden');
  el.querySelector('.SignInPage-form').classList.add('hidden');
  switchModeLink.innerText = 'Use simple login';
  switchModeLink.href = '/educators/sign_in';
  switchModeLink.removeEventListener('click', listeners.link);
  flashMessage.innerText = '';

  // Listeners (never removed)
  multiFactorForm.addEventListener('submit', (event, data) => {
    $(multiFactorForm).on('ajax:success', afterSubmitMultiFactorStepOne.bind(null, shared));
  });
}

// If we copy empty strings, it triggers browser validations
function copyIfValue(fromEl, toEl) {
  if (fromEl.value === '') return;
  toEl.value = fromEl.value;
}

function copyFromSimpleToMultiFactor(shared) {
  const {simplePassword, simpleLogin, multiFactorLogin, multiFactorPassword} = shared;
  
  copyIfValue(simpleLogin, multiFactorLogin);
  copyIfValue(simplePassword, multiFactorPassword);
  simpleLogin.value = '';
  simplePassword.value = '';
}

function copyFromMultiFactorToSimple(shared) {
  const {simplePassword, simpleLogin, multiFactorLogin, multiFactorPassword} = shared;
  copyIfValue(multiFactorLogin, simpleLogin);
  copyIfValue(multiFactorPassword, simplePassword);

  multiFactorLogin.value = '';
  multiFactorPassword.value = '';
}

export function afterSubmitMultiFactorStepOne(shared, event, data) {
  const {
    simpleLogin,
    simplePassword,
    switchModeLink,
    multiFactorForm,
    simpleForm,
    loginCode,
    loginCodeContainer,
    sentLoginCodeMessage
  } = shared;

  copyFromMultiFactorToSimple(shared);

  // disable login and password, clear loginCode from placeholder
  simpleLogin.readOnly = true;
  simplePassword.readOnly = true;

  // switch to step 2
  switchModeLink.classList.add('hidden');
  multiFactorForm.classList.add('hidden');
  simpleForm.classList.remove('hidden');
  loginCodeContainer.classList.remove('hidden');
  sentLoginCodeMessage.classList.remove('hidden');

  loginCode.focus();
}
