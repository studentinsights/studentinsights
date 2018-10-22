import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import {withDefaultNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import _ from 'lodash';
import {SOMERVILLE, BEDFORD, NEW_BEDFORD} from '../helpers/PerDistrict';
import {TESTING_ONLY_ALL_LANGUAGE_MAPS} from '../helpers/language';
import LanguageStatusLink from './LanguageStatusLink';


export function allCombinations() {
  return _.flatMap([SOMERVILLE, NEW_BEDFORD, BEDFORD], districtKey => {
    const mapForDistrict = TESTING_ONLY_ALL_LANGUAGE_MAPS[districtKey];
    return Object.keys(mapForDistrict).concat([null]).map(limitedEnglishProficiency => {
      return {districtKey, limitedEnglishProficiency};
    });
  });
}

export function testProps(props = {}) {
  return {
    studentFirstName: 'Mari',
    limitedEnglishProficiency: 'Limited',
    access: null,
    style: {
      fontSize: 14
    },
    ...props
  };
}

export function testEl(props, context = {}) {
  const districtKey = context.districtKey || 'somerville';
  return withDefaultNowContext(
    <PerDistrictContainer districtKey={districtKey}>
      <LanguageStatusLink {...props} />
    </PerDistrictContainer>
  );
}

function testRender(props) {
  const el = document.createElement('div');
  ReactDOM.render(testEl(props), el);
  return el;
}

it('renders without crashing', () => {
  testRender(testProps());
});

describe('snapshots', () => {
  const props = testProps();
  const tree = renderer
    .create(testEl(props))
    .toJSON();
  expect(tree).toMatchSnapshot();
});