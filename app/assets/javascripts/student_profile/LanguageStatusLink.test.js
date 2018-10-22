import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import {withDefaultNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import _ from 'lodash';
import {allCombinationsForTest} from '../helpers/language';
import {testProps as accessTestProps} from './AccessPanel.test';
import LanguageStatusLink from './LanguageStatusLink';


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

// Render across all districts and all possible values for language proficiency
// This lets us see them all at once visually in the story, and to snapshot all the combinations
export function renderAcrossAllCombinations() {
  const valuesByDistrictKey = _.groupBy(allCombinationsForTest(), 'districtKey');
  return (
    <div style={{display: 'flex', flexDirection: 'row', width: 900, fontSize: 14, padding: 10}}>
      {Object.keys(valuesByDistrictKey).map(districtKey => (
        <div key={districtKey} style={{flex: 1}}>
          <h4>{districtKey}</h4>
          <div>
            {valuesByDistrictKey[districtKey].map(({limitedEnglishProficiency}) => (
              <div key={limitedEnglishProficiency} style={{padding: 10, margin: 10, marginLeft: 0, border: '1px solid #ccc'}}>
                <div>{limitedEnglishProficiency === null ? '(null)' : `"${limitedEnglishProficiency}"`}</div>
                <div style={{padding: 10}}>
                  {testEl(testProps({limitedEnglishProficiency}), {districtKey})}
                  {testEl(testProps({
                    limitedEnglishProficiency,
                    access: accessTestProps().access
                  }), {districtKey})}
                  {testEl(testProps({
                    limitedEnglishProficiency,
                    access: accessTestProps().access,
                    ellTransitionDate: '2018-06-28'
                  }), {districtKey})}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}


it('renders without crashing', () => {
  testRender(testProps());
});

it('snapshots', () => {
  const props = testProps();
  const tree = renderer
    .create(testEl(props))
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('snapshots across all combinations', () => {
  const tree = renderer
    .create(renderAcrossAllCombinations())
    .toJSON();
  expect(tree).toMatchSnapshot();
});
