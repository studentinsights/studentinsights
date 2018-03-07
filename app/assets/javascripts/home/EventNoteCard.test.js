import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import EventNoteCard from './EventNoteCard';
import {withDefaultNowContext} from '../../../../spec/javascripts/support/NowContainer';


function testProps(props = {}) {
  return {
    eventNoteCardJson: {
      recorded_at: '2004-03-05T00:00:00.000Z',
      event_note_type_id: 305,
      text: 'hello!',
      educator: {
        id: 4,
        email: 'kt@demo.studentinsights.org',
        full_name: 'Teacher, Kevin',
      },
      student: {
        id: 55,
        first_name: 'Mari',
        last_name: 'Skywalker',
        grade: '9',
        house: 'Beacon',
        homeroom: {
          id: 13,
          name: 'SHS-052',
          educator: {
            id: 5,
            email: 'lt@demo.studentinsights.org',
            full_name: 'Teacher, Lois',
          }
        }
      }
    },
    ...props
  };
}

it('renders without crashing', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(<EventNoteCard {...props} />), el);
});

it('matches snapshot', () => {
  const props = testProps();
  const tree = renderer
    .create(withDefaultNowContext(<EventNoteCard {...props} />))
    .toJSON();
  expect(tree).toMatchSnapshot();
});
