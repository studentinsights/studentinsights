import React from 'react';
import ReactDOM from 'react-dom';
import PerDistrictContainer from '../components/PerDistrictContainer';
import {mergeAtPath} from '../helpers/mergeAtPath';
import LightHeaderSupportBits from './LightHeaderSupportBits';
import {
  testPropsForPlutoPoppins,
  testPropsForOlafWhite
} from './LightProfilePage.fixture';


function testEl(props, context = {}) {
  const districtKey = context.districtKey || 'somerville';
  return (
    <PerDistrictContainer districtKey={districtKey}>
      <LightHeaderSupportBits {...props} />
    </PerDistrictContainer>
  );
}

function testRender(props, context = {}) {
  const el = document.createElement('div');
  ReactDOM.render(testEl(props, context), el);
  return el;
}

it('renders without crashing', () => {
  testRender(testPropsForPlutoPoppins());
});

describe('IEP, ACCESS and 504 details vary by district', () => {
  it('Bedford does not show any links', () => {
    const props = mergeAtPath(testPropsForOlafWhite(), ['profileJson', 'student'], {
      disability: 'Health',
      plan_504: '504',
      limited_english_proficiency: 'Not Fluent'
    });
    const el = testRender(props, {districtKey: 'bedford'});
    expect($(el).find('.LightHeaderSupportBits a').length).toEqual(0);
  });

  it('Somervile can show all links', () => {
    const props = mergeAtPath(testPropsForOlafWhite(), ['profileJson', 'student'], {
      disability: 'Health',
      plan_504: '504',
      limited_english_proficiency: 'Not Fluent'
    });
    const el = testRender(props, {districtKey: 'somerville'});
    expect($(el).find('.LightHeaderSupportBits a').length).toEqual(3);
  });
});