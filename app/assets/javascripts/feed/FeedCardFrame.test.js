import React from 'react';
import ReactDOM from 'react-dom';
import FeedCardFrame from './FeedCardFrame';
import {withDefaultNowContext} from '../testing/NowContainer';

function testStudent() {
  return {
    id: 55,
    first_name: 'Mari',
    last_name: 'Skywalker',
    grade: '9',
    house: 'Beacon',
    school: {
      local_id: 'SHS',
      school_type: 'HS'
    },
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

function testStudentElementary() {
  return {
    id: 32,
    first_name: 'Pluto',
    last_name: 'Skywalker',
    grade: '3',
    house: null,
    school: {
      local_id: 'HEA',
      school_type: 'ESMS'
    },
    homeroom: {
      id: 32,
      name: 'HEA-011',
      educator: {
        id: 3,
        email: 'alex@demo.studentinsights.org',
        full_name: 'Teacher, Alex',
      }
    }
  };
}

function testProps(student) {
  return {
    byEl: <div>by</div>,
    whereEl: <div>where</div>,
    whenEl: <div>when</div>,
    badgesEl: <div>badges</div>,
    children: 'kids',
    student
  };
}

function testRender(props) {
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(<FeedCardFrame {...props} />), el);
  return el;
}

it('renders for HS without crashing', () => {
  const el = testRender(testProps(testStudent()));
  expect($(el).text()).toContain('Mari Skywalker');
  expect($(el).text()).toContain('9th grade');
  expect($(el).text()).not.toContain('SHS-052');
  expect($(el).text()).not.toContain('with Lois Teacher');
  expect($(el).text()).toContain('by');
  expect($(el).text()).toContain('where');
  expect($(el).text()).toContain('when');
  expect($(el).text()).toContain('badges');
  expect($(el).text()).toContain('kids');
});

it('renders homeroom for ESMS', () => {
  const el = testRender(testProps(testStudentElementary()));
  expect($(el).text()).toContain('HEA-011');
  expect($(el).text()).toContain('with Alex Teacher');
});
