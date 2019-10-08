import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import PerDistrictContainer from '../components/PerDistrictContainer';
import RecordService from './RecordService';
import {testProps} from './RecordService.test';

function storyProps(props = {}) {
  return {
    ...testProps(),
    onSave: action('onSave'),
    onCancel: action('onCancel'),
    ...props
  };
}

function storyEl(props, context = {}) {
  const {districtKey} = context;
  return (
    <PerDistrictContainer districtKey={districtKey}>
      <RecordService {...props} />
    </PerDistrictContainer>
  );
}

function acrossDistrictKeys(renderFn) {
  return (
    <div style={{width: 450}}>
      {['bedford', 'somerville', 'new_bedford', 'demo'].map(districtKey => (
        <div key={districtKey} style={{marginBottom: 40}}>
          <h2>{districtKey}</h2>
          {renderFn(districtKey)}
        </div>
      ))}
    </div>
  );
}

storiesOf('profile/RecordService', module) // eslint-disable-line no-undef
  .add('normal', () => (
    acrossDistrictKeys(districtKey => (
      storyEl(storyProps(), {districtKey})
    ))
  ))
  .add('with `show_services_info` and `servicesInfoDocUrl`', () => (
    acrossDistrictKeys(districtKey => {
      const props = storyProps();
      return storyEl({
        ...props,
        servicesInfoDocUrl: 'https://example.com/',
        currentEducator: {
          ...props.currentEducator,
          labels: ['show_services_info']
        }
      }, {districtKey});
    })
  ));
