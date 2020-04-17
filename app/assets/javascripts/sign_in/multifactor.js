// This runs on load - no other dependencies like jQuery are yet loaded.

// The intent is that this is only needed for multifactor authentication;
// simple login should work with only jQuery and UJS.
//
// This code has implicit dependencies on:
// - the form, rendered by Rails
// - jQuery and jQuery UJS, for submitting the form and for listening to form submit events


/*
- flow
- submit steps
- validation
- focus
- enter keystrokes
- error handling
*/
export function multifactorMain(options = {}) {
  const el = options.el || document.querySelector('.SignInPage');

  const screensContainer = el.querySelector('.SCREENS-CONTAINER');
  const signInForm = el.querySelector('.SignInPage-form');
  const loginText = el.querySelector('.SignInPage-input-login');
  const passwordText = el.querySelector('.SignInPage-input-password');
  const loginCodeText = el.querySelector('.SignInPage-input-login-code');
  const multifactorForm = el.querySelector('.SignInPage-multifactor-form');
  const multifactorLoginText = el.querySelector('.SignInPage-multifactor-login-text');

  // initial
  loginText.focus();

  // username
  el.querySelector('.SignInPage-username-next-button').addEventListener('click', e => {
    e.preventDefault();
    el.querySelector('.SignInPage-username-next-button').classList.add('hidden');
    el.querySelector('.SignInPage-password-next-button').classList.remove('hidden');

    // TODO validation

    // transition
    screensContainer.classList.add('SLIDE-TWO');
    setTimeout(() => passwordText.focus(), 400);
    console.log('username done');
  });


  // password
  el.querySelector('.SignInPage-password-next-button').addEventListener('click', e => {
    e.preventDefault();
    el.querySelector('.SignInPage-password-next-button').classList.add('hidden');
    el.querySelector('.SignInPage-multifactor-next-button').classList.remove('hidden');

    // TODO validation 

    // Submit multifactor form separately
    multifactorLoginText.value = loginText.value;
    // if (!signInForm.checkValidity()) {
    //   console.log('signInForm not valid', signInForm);
    // }
    // if (!multifactorForm.checkValidity()) {
    //  console.log('multifactorForm not valid', multifactorForm); 
    // }
    // multifactorForm.submit();
    // console.log('submitted...', multifactorForm.querySelector('input[type=submit]'));

    // slide animation
    screensContainer.classList.add('SLIDE-THREE');
    setTimeout(() => loginCodeText.focus(), 400);

    // signInForm.querySelector('input[type=submit]').click();

    // Enable multifactor form separately
    // multifactorLoginText.value = loginText.value;
    console.log('password done', loginText.value, multifactorForm.querySelector('input[type=submit]'));
    return false;
  });

  // el.querySelector('.SignInPage-multifactor-next-button').addEventListener('click', e => {
  //   alert('go!')
  //   // multifactorForm.querySelector('input[type=submit]').click();
  // });
}


// function isUsernameValid(text) {
//   return (text !== '');
// }
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
