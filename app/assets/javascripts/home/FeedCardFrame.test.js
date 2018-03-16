import React from 'react';
import ReactDOM from 'react-dom';
import FeedCardFrame from './FeedCardFrame';
import {withDefaultNowContext} from '../../../../spec/javascripts/support/NowContainer';

function testStudent() {
  return {
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
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(
    <FeedCardFrame
      student={testStudent()}
      byEl={<div>by</div>}
      whereEl={<div>where</div>}
      whenEl={<div>when</div>}
      badgesEl={<div>badges</div>}>
      kids
    </FeedCardFrame>
  ), el);
  expect($(el).text()).toContain('Mari Skywalker');
  expect($(el).text()).toContain('9th grade');
  expect($(el).text()).toContain('SHS-052');
  expect($(el).text()).toContain('with Lois Teacher');
  expect($(el).text()).toContain('by');
  expect($(el).text()).toContain('where');
  expect($(el).text()).toContain('when');
  expect($(el).text()).toContain('badges');
  expect($(el).text()).toContain('kids');
});
