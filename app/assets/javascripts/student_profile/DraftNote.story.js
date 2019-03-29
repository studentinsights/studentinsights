import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import {withDefaultNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import {SOMERVILLE} from '../helpers/PerDistrict';
import DraftNote from './DraftNote';
import {testProps, testScenarios} from './DraftNote.test';


function storyProps(props = {}) {
  return {
    ...testProps(),
    onSave: action('onSave'),
    onCancel: action('onCancel'),
    onClickNoteType: action('onClickNoteType'),
    onChangeNoteInProgressText: action('onChangeNoteInProgressText'),
    onChangeAttachmentUrl: action('onChangeAttachmentUrl'),
    ...props
  };
}

function storyRender(props, context = {}) {
  const districtKey = context.districtKey || SOMERVILLE;
  return withDefaultNowContext(
    <div style={{display: 'flex', flexDirection: 'column', margin: 20, width: 470}}>
      <PerDistrictContainer districtKey={districtKey}>
        <DraftNote {...props} />
      </PerDistrictContainer>
    </div>
  );
}

storiesOf('profile/DraftNote', module) // eslint-disable-line no-undef
  .add('all', () => (
    <div>
      {testScenarios().map(({labelText, propsDiff, contextDiff}) => (
        <div key={labelText}>
          <h3>{labelText}</h3>
          {storyRender(storyProps(propsDiff), contextDiff)}
        </div>
      ))}
    </div>
  ));