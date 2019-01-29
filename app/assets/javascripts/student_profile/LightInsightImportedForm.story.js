import React from 'react';
import {storiesOf} from '@storybook/react';
import {withDefaultNowContext} from '../testing/NowContainer';
import LightInsightImportedForm from './LightInsightImportedForm';


function storyProps(props = {}) {
  return {
    student: {
      id: 9,
      first_name: 'Mari',
      last_name: 'Kenobi'
    },
    insightPayload: {
      prompt_text: "At the end of the quarter 3, what would make you most proud of your accomplishments in your course?",
      response_text: "Keeping grades high in all classes since I'm worried about college",
      flattened_form_json: {
        form_title: 'Q2 Self-reflection',
        form_timestamp: '2018-03-06T11:03:00.000Z',
        text: '<the whole survey text>'
      }
    },
    ...props
  };
}

function storyEl(props = {}) {
  return withDefaultNowContext(<LightInsightImportedForm {...props} />);
}

storiesOf('profile/LightInsightImportedForm', module) // eslint-disable-line no-undef
  .add('normal', () => storyEl(storyProps()));
