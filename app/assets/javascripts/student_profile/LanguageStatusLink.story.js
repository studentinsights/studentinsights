import React from 'react';
import _ from 'lodash';
import {storiesOf} from '@storybook/react';
import {allCombinations, testProps, testEl} from './LanguageStatusLink.test';
import {testProps as accessTestProps} from './AccessPanel.test';


function storyRender(props, context) {
  return (
    <div style={{display: 'flex', flexDirection: 'column', margin: 20}}>
      {testEl(props, context)}
    </div>
  );
}

storiesOf('profile-v3/LanguageStatusLink', module) // eslint-disable-line no-undef
  .add('all combinations', () => {
    // Add all districts and all possible values for language proficiency
    const valuesByDistrictKey = _.groupBy(allCombinations(), 'districtKey');
    return (
      <div style={{display: 'flex', flexDirection: 'row', width: 800, fontSize: 14, padding: 10}}>
        {Object.keys(valuesByDistrictKey).map(districtKey => (
          <div key={districtKey} style={{flex: 1}}>
            <h4>{districtKey}</h4>
            <div>
              {valuesByDistrictKey[districtKey].map(({limitedEnglishProficiency}) => (
                <div key={limitedEnglishProficiency}>
                  <div>{limitedEnglishProficiency === null ? '(null)' : limitedEnglishProficiency}</div>
                  {storyRender(testProps({limitedEnglishProficiency}), {districtKey})}
                  {storyRender(testProps({limitedEnglishProficiency, access: accessTestProps().access}), {districtKey})}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  });