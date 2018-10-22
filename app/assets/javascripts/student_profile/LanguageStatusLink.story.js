import React from 'react';
import _ from 'lodash';
import {storiesOf} from '@storybook/react';
import PerDistrictContainer from '../components/PerDistrictContainer';
import {withDefaultNowContext} from '../testing/NowContainer';
import LanguageStatusLink from './LanguageStatusLink';
import {allCombinations} from './LanguageStatusLink.test';
import {testProps as accessTestProps} from './AccessPanel.test';


function storyProps(props = {}) {
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

function storyRender(props, context) {
  const {districtKey} = context;
  return (
    <div style={{display: 'flex', flexDirection: 'column', margin: 20}}>
      {withDefaultNowContext(
        <PerDistrictContainer districtKey={districtKey}>
          <LanguageStatusLink {...props} />
        </PerDistrictContainer>
      )}
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
                  {storyRender(storyProps({limitedEnglishProficiency}), {districtKey})}
                  {storyRender(storyProps({limitedEnglishProficiency, access: accessTestProps().access}), {districtKey})}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  });