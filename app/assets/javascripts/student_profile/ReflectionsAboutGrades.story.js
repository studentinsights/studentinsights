import React from 'react';
import {storiesOf} from '@storybook/react';
import ReflectionsAboutGrades from './ReflectionsAboutGrades';


function storyProps(props = {}) {
  return {
    gradesReflectionInsights: [{
      type: 'imported_form_insight',
      json: {
        form_key: 'shs_q2_self_reflection',
        prompt_text: "At the end of the quarter 3, what would make you most proud of your accomplishments in your course?",
        response_text: "Keeping grades high in all classes since I'm worried about college",
        flattened_form_json: {
          form_title: 'Q2 Self-reflection',
          form_timestamp: '2018-03-06T11:03:00.000Z',
          text: '<the whole survey text>'
        }
      }
    }],
    ...props
  };
}

function storyEl(props = {}) {
  return <ReflectionsAboutGrades {...props} />;
}

storiesOf('profile/ReflectionsAboutGrades', module) // eslint-disable-line no-undef
  .add('normal', () => storyEl(storyProps()));
