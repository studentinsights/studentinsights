import React from 'react';
import moment from 'moment';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import {withDefaultNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import NoteCard from './NoteCard';
import {testProps} from './NoteCard.test';


function storyProps(props = {}) {
  return {
    ...testProps(),
    text: "Ryan's really motivated by working with a younger students as a mentor.  Set up a weekly system with LM so he read with him as a way to build reading stamina.",
    onSave: action('onSave'),
    ...props
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
  .add('just text', () => storyRender(storyProps()))
  .add('recent revision', () => storyRender(storyProps({lastRevisedAtMoment: moment.utc('2018-03-01T09:00:01.123Z')})))
  .add('old revision', () => storyRender(storyProps({lastRevisedAtMoment: moment.utc('2016-12-19T19:19:19.123Z')})))
  .add('xss escaping', () => storyRender(storyProps({text: 'hello <script src="xss.js"></script>world'})));