import fs from 'fs';
import {multifactorMain, afterSubmitMultiFactorStepOne} from './multifactor';


function testEl() {
  const el = document.createElement('div');
  const signInHtml = fs.readFileSync('app/assets/javascripts/sign_in/sign_in.fixture.html').toString();
  el.innerHTML = signInHtml;
  return el;
}

function isHidden(el) {
  return el.classList.contains('hidden');
}


it('passes html sanity check', () => {
  const el = testEl();
  expect(el.querySelectorAll('form').length).toEqual(2);
});

describe('simple login', () => {
  it('works without other JS', () => {
    const el = testEl();

    expect($(el).text()).toContain('Login');
    expect($(el).text()).toContain('Password');
    expect(el.querySelectorAll('.btn').length).toEqual(2);
    expect(isHidden(el.querySelector('.SignInPage-form'))).toEqual(false);
    expect(isHidden(el.querySelector('.SignInPage-multifactor-form'))).toEqual(true);
    expect(isHidden(el.querySelector('.SignInPage-authentication-type-link'))).toEqual(true);
  });
});

describe('multifactorMain', () => {
  it('shows multifactor link', () => {
    const el = testEl();
    multifactorMain({el, hash: ''});

    expect(isHidden(el.querySelector('.SignInPage-form'))).toEqual(false);
    expect(isHidden(el.querySelector('.SignInPage-multifactor-form'))).toEqual(true);
    expect(isHidden(el.querySelector('.SignInPage-authentication-type-link'))).toEqual(false);
    expect(el.querySelector('.SignInPage-authentication-type-link').innerHTML).toEqual('Use multifactor login');
  });

  it('swaps the form when link is clicked', () => {
    const el = testEl();
    multifactorMain({el, hash: ''});
    el.querySelector('.SignInPage-authentication-type-link').click();

    expect(isHidden(el.querySelector('.SignInPage-form'))).toEqual(true);
    expect(isHidden(el.querySelector('.SignInPage-multifactor-form'))).toEqual(false);
    expect(el.querySelector('.SignInPage-authentication-type-link').href).toEqual('http://localhost/educators/sign_in');
  });

  it('copies over anything already entered', () => {
    const el = testEl();
    multifactorMain({el, hash: ''});
    
    el.querySelector('.SignInPage-form .SignInPage-input-login').value = 'uri@demo.studentinsights.org';
    el.querySelector('.SignInPage-form .SignInPage-input-password').value = 'demo-password';
    el.querySelector('.SignInPage-authentication-type-link').click();

    expect(el.querySelector('.SignInPage-multifactor-form .SignInPage-input-login').value).toEqual('uri@demo.studentinsights.org');
    expect(el.querySelector('.SignInPage-multifactor-form .SignInPage-input-password').value).toEqual('demo-password');
  });

  it('submitting sends code and changes form to multifactor step 2', () => {
    const el = testEl();
    const shared = multifactorMain({el, hash: ''});
    
    el.querySelector('.SignInPage-authentication-type-link').click();
    el.querySelector('.SignInPage-multifactor-form .SignInPage-input-login').value = 'uri@demo.studentinsights.org';
    el.querySelector('.SignInPage-multifactor-form .SignInPage-input-password').value = 'demo-password';
    el.querySelector('.SignInPage-send-code-button').click();

    // simulate form submit (no UJS in test)
    afterSubmitMultiFactorStepOne(shared, {}, {});
  
    // expect simple form, with login code visible, and message
    expect(isHidden(el.querySelector('.SignInPage-form'))).toEqual(false);
    expect(isHidden(el.querySelector('.SignInPage-multifactor-form'))).toEqual(true);
    expect(el.querySelector('.SignInPage-input-login-code').value).toEqual('');
    expect(isHidden(el.querySelector('.SignInPage-multifactor-sent-code'))).toEqual(false);
  });
});
