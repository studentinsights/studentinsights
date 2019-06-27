import React from 'react';
import _ from 'lodash';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import fetchMock from 'fetch-mock/es5/client';
import {withDefaultNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import NoteCard from './NoteCard';
import {testProps, testScenarios} from './NoteCard.test';


function storyProps(props = {}) {
  return {
    ...testProps(),
    text: "Ryan's really motivated by working with a younger students as a mentor.  Set up a weekly system with LM so he read with him as a way to build reading stamina.",
    ...props,
    
    // to allow null or actual value from testProps
    onSave: (props.onSave === _.identity)
      ? action('onSave')
      : props.onSave,
    onEventNoteAttachmentDeleted: (props.onEventNoteAttachmentDeleted === _.identity)
      ? action('onEventNoteAttachmentDeleted')
      : props.onEventNoteAttachmentDeleted
  };
}

function storyRender(props = {}, context = {}) {
  const districtKey = context.districtKey || 'somerville';
  return withDefaultNowContext(
    <div style={{display: 'flex', flexDirection: 'column', margin: 20, width: 470}}>
      <PerDistrictContainer districtKey={districtKey}>
        <NoteCard {...props} />
      </PerDistrictContainer>
    </div>
  );
}

storiesOf('profile/NoteCard', module) // eslint-disable-line no-undef
  .add('all', () => {
    fetchMock.restore();
    fetchMock.get('/mocked-url-for-restricted-note-content', { text: 'DANGEROUS restricted note content' });
    return (<div>
      {testScenarios().map(scenario => (
        <div key={scenario.label} style={{marginLeft: 10, marginTop: 20}}>
          <h3>{scenario.label}</h3>
          <hr />
          {storyRender(storyProps(scenario.propsDiff))}
        </div>
      ))}
    </div>
    );
  })
  .add('substanceOnly', () => (
    <div>
      {storyRender(storyProps({
        ...testScenarios()[0].propsDiff,
        substanceOnly: true
      }))}
    </div>
  ));
