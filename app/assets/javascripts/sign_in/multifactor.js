// This runs on load - no other dependencies like jQuery are yet loaded.

// The intent is that this is only needed for multifactor authentication;
// simple login should work with only jQuery and UJS.
//
// This code has implicit dependencies on:
// - the form, rendered by Rails
// - jQuery and jQuery UJS, for submitting the form and for listening to form submit events

export function multifactorMain(options = {}) {
  const el = options.el || document.querySelector('.SignInPage');

  const screensContainer = el.querySelector('.SCREENS-CONTAINER');
  const signInForm = el.querySelector('.SignInPage-form');

  // validate username, then slide
  el.querySelector('.SignInPage-username-next-button').addEventListener('click', e => {
    e.preventDefault();

    // check validation first, and if it fails do the submit
    // to show the user validation feedback
     // TODO not sure about blank password
    // if (!isUsernameValid(el.querySelector('.SignInPage-input-login').value)) {
    //   alert('invalid');
    //   signInForm.querySelector('input[type=submit]').click();
    //   return;
    // }

    // slide animation
    screensContainer.classList.add('SLIDE-TWO');
    // screensContainer.classList.remove('SLIDE-ONE');
  });

}


function isUsernameValid(text) {
  return (text !== '');
}
// export function DEPRECATEDmultifactorMain(options = {}) {
//   const el = options.el || document.querySelector('.SignInPage');

//   // page elements
//   const signInForm = el.querySelector('.SignInPage-form');
//   const switchModeLink = el.querySelector('.SignInPage-authentication-type-link');
//   const loginCodeText = el.querySelector('.SignInPage-input-login-code');
//   const loginText = signInForm.querySelector('.SignInPage-input-login');
//   const passwordText = signInForm.querySelector('.SignInPage-input-password');
//   const flashMessage = el.querySelector('.SignInPage-flash-alert');
//   const multifactorForm = el.querySelector('.SignInPage-multifactor-form');
//   const multifactorLoginText = el.querySelector('.SignInPage-multifactor-login-text');
//   const shared = {
//     el,
//     switchModeLink,
//     signInForm,
//     loginText,
//     passwordText,
//     loginCodeText,
//     flashMessage,
//     multifactorForm,
//     multifactorLoginText
//   };
  
//   // link to switch to multifactor
//   switchModeLink.addEventListener('click', e => {
//     e.preventDefault();
//     switchToMultiFactor(shared);
//   });

//   return shared; // for testing
// }


// function switchToMultiFactor(shared) {
//   const {
//     switchModeLink,
//     signInForm,
//     loginText,
//     passwordText,
//     loginCodeText,
//     multifactorLoginText,
//     multifactorForm,

//     flashMessage
//   } = shared;
  
//   // check validation first, and if it fails do the submit
//   // to show the user validation feedback
//   if (!signInForm.checkValidity()) {
//     signInForm.querySelector('input[type=submit]').click();
//     return;
//   }  

//   // Submit multifactor form separately
//   multifactorLoginText.value = loginText.value;
//   multifactorForm.querySelector('input[type=submit]').click();
  
//   // Update visuals to allow entering login code
//   flashMessage.innerText = '';
//   loginText.readOnly = true;
//   passwordText.readOnly = true;
//   switchModeLink.classList.add('hidden');
//   loginCodeText.value = '';
//   loginCodeText.classList.remove('hidden');
//   loginCodeText.focus();
// }
