import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import StudentVoiceCard from './StudentVoiceCard';
import {withDefaultNowContext} from '../testing/NowContainer';

function testStudents() {
  return [{
    id: 4,
    first_name: 'Luke',
    last_name: 'Skywalker'
  }, {
    id: 5,
    first_name: 'Mari',
    last_name: 'Kenobi'
  }, {
    id: 6,
    first_name: 'Kylo',
    last_name: 'Ren'
  }, {
    id: 7,
    first_name: 'Darth',
    last_name: 'Tater'
  }];
}

export function testProps(props = {}) {
  return {
    shuffleSeed: 42,
    studentVoiceCardJson: {
      latest_form_timestamp: '2018-03-11T11:03:00.000Z',
      imported_forms_for_date_count: 2,
      students: testStudents()
    },
    ...props
  };
}

export function propsWithNStudents(n) {
  const props = testProps();
  return {
    ...props,
    studentVoiceCardJson: {
      ...props.studentVoiceCardJson,
      students: testStudents().slice(0, n)
    }
  };
}


export function testEl(props) {
  return withDefaultNowContext(<StudentVoiceCard {...props} />);
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(testEl(testProps()), el);
  expect($(el).text()).toContain('💬 Darth Tater, Kylo Ren and 2 more students shared new student voice surveys.');
  expect($(el).find('a').toArray().map(el => $(el).attr('href'))).toEqual([
    '/students/7',
    '/students/6',
    '#'
  ]);
});

describe('snapshots', () => {
  it('works with one student', () => {
    const tree = renderer.create(testEl(propsWithNStudents(1))).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('works with two students', () => {
    const tree = renderer.create(testEl(propsWithNStudents(2))).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('works with three students', () => {
    const tree = renderer.create(testEl(propsWithNStudents(3))).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('works with four students', () => {
    const tree = renderer.create(testEl(propsWithNStudents(4))).toJSON();
    expect(tree).toMatchSnapshot();
  });
});