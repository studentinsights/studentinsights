import fs from 'fs';
import {multifactorMain} from './multifactor';


function testEl() {
  const el = document.createElement('div');
  const signInHtml = fs.readFileSync('app/assets/javascripts/sign_in/sign_in.fixture.html').toString();
  el.innerHTML = signInHtml; // eslint-disable-line no-unsanitized/property
  return el;
}

function isHidden(el) {
  return el.classList.contains('hidden');
}

function serializedForm(form) {
  // This uses URLSearchParams, which isn't widely supported in browsers,
  // but this is supported in test, and is good enough for the smoke test
  // here.
  return new URLSearchParams(new FormData(form)).toString(); // eslint-disable-line compat/compat
}


it('passes html sanity check', () => {
  const el = testEl();
  expect(el.querySelectorAll('form').length).toEqual(2);
});

describe('simple login', () => {
  it('renders as expected and can submit form without other JS', () => {
    const el = testEl();

    expect(el.querySelectorAll('input[placeholder=Login]').length).toEqual(1);
    expect(el.querySelectorAll('input[placeholder=Password]').length).toEqual(1);
    expect(el.querySelectorAll('.btn').length).toEqual(1);
    expect(el.querySelector('.SignInPage-form').method).toEqual('post');
    expect(el.querySelector('.SignInPage-form').action).toEqual('http://localhost/educators/sign_in');
    expect(isHidden(el.querySelector('.SignInPage-authentication-type-link'))).toEqual(false);
    expect(isHidden(el.querySelector('.SignInPage-multifactor-form'))).toEqual(true);
  });
});

describe('multifactorMain', () => {
  it('shows multifactor link', () => {
    const el = testEl();
    multifactorMain({el});

    expect(isHidden(el.querySelector('.SignInPage-form'))).toEqual(false);
    expect(isHidden(el.querySelector('.SignInPage-multifactor-form'))).toEqual(true);
    expect(isHidden(el.querySelector('.SignInPage-authentication-type-link'))).toEqual(false);
    expect(el.querySelector('.SignInPage-authentication-type-link').textContent).toEqual('Use multifactor login');
  });

  it('checks login presence before allowing submit', () => {
    const el = testEl();
    multifactorMain({el});
    el.querySelector('.SignInPage-input-password').value = 'demo-password';
    el.querySelector('.SignInPage-authentication-type-link').click();
    expect(isHidden(el.querySelector('.SignInPage-input-login-code'))).toEqual(true);
  });

  it('checks password presence before allowing submit', () => {
    const el = testEl();
    multifactorMain({el});
    el.querySelector('.SignInPage-input-login').value = 'uri@demo.studentinsights.org';
    el.querySelector('.SignInPage-authentication-type-link').click();

    expect(isHidden(el.querySelector('.SignInPage-input-login-code'))).toEqual(true);
  });

  it('submits the multifactor the form when link is clicked', () => {
    const el = testEl();
    multifactorMain({el});
    el.querySelector('.SignInPage-input-login').value = 'uri@demo.studentinsights.org';
    el.querySelector('.SignInPage-input-password').value = 'demo-password';
    el.querySelector('.SignInPage-authentication-type-link').click();

    expect(isHidden(el.querySelector('.SignInPage-authentication-type-link'))).toEqual(true);
    expect(isHidden(el.querySelector('.SignInPage-input-login-code'))).toEqual(false);
    // form submit
  });

  it('copies over login_text', () => {
    const el = testEl();
    multifactorMain({el});
    
    el.querySelector('.SignInPage-input-login').value = 'uri@demo.studentinsights.org';
    el.querySelector('.SignInPage-input-password').value = 'demo-password';
    el.querySelector('.SignInPage-authentication-type-link').click();

    expect(el.querySelector('.SignInPage-multifactor-form .SignInPage-multifactor-login-text').value).toEqual('uri@demo.studentinsights.org');
  });

  it('after multifactor, verify form submits data as expected, with login code', done => {
    const el = testEl();
    multifactorMain({el});
    
    // login and password
    el.querySelector('.SignInPage-input-login').value = 'uri@demo.studentinsights.org';
    el.querySelector('.SignInPage-input-password').value = 'demo-password';
    el.querySelector('.SignInPage-authentication-type-link').click();

    // login code and sign in
    expect(isHidden(el.querySelector('.SignInPage-input-login-code'))).toEqual(false);
    el.querySelector('.SignInPage-input-login-code').value = '123789';

    // check form data and UI
    el.querySelector('.SignInPage-login-button').addEventListener('click', e => {
      expect(serializedForm(el.querySelector('.SignInPage-form'))).toEqual([
        'utf8=%E2%9C%93',
        'authenticity_token=bM7qFGlYDu2ecYebQ94MUkMMl%2FIW7%2FazPOwr%2Bk1ajQIEb%2F3z98qbWUTdNKxzkG69j3FN0w9vHKdFLVGNSDhV4A%3D%3D',
        'educator%5Blogin_text%5D=uri%40demo.studentinsights.org',
        'educator%5Bpassword%5D=demo-password',
        'educator%5Blogin_code%5D=123789'        
      ].join('&'));
      done();
    });
    el.querySelector('.SignInPage-login-button').click();
    expect(isHidden(el.querySelector('.SignInPage-form'))).toEqual(false);
    expect(isHidden(el.querySelector('.SignInPage-multifactor-form'))).toEqual(true);
  });
});
