import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import changeTextValue from '../testing/changeTextValue';
import fetchMock from 'fetch-mock/es5/client';
import StudentSearchbar from './StudentSearchbar';

const FIRST_NAMES = [
  'Aaliyah',
  'Aaron',
  'Abagail',
  'Abbey',
  'Abbie',
  'Abbigail',
  'Abby',
  'Abdiel',
  'Abdul',
  'Abdullah',
  'Abe',
  'Abel',
  'Abelardo',
  'Abigail',
  'Abigale',
  'Abigayle',
  'Abner'
];

beforeEach(() => {
  fetchMock.restore();
  fetchMock.get('express:/api/educators/student_searchbar_json', testStudents({fromServer: true}));
});

function testStudents(params = {}) {
  return _.range(0, 20).map(i => {
    return { ...params, label: `${FIRST_NAMES[i]} #${i}`, id: i };
  });
}

function testStorage() {
  var storage = {}; // eslint-disable-line no-var
  return {
    getItem(key) { return storage[key]; },
    setItem(key, value) { storage[key] = value; },
    debug() { return JSON.stringify(storage); }
  };
}

function testProps(props = {}) {
  return {
    onStudentSelected: jest.fn(),
    sessionStorage: testStorage(),
    ...props
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<StudentSearchbar {...testProps()} />, el);
});

it('fetches from the server, updates sessionStorage', done => {
  const storage = testStorage();
  const props = testProps({sessionStorage: storage});
  const el = document.createElement('div');
  ReactDOM.render(<StudentSearchbar {...props} />, el);

  expect($(el).html()).toContain('Find student...');

  setTimeout(() => {
    const calls = fetchMock.calls();
    expect(calls.length).toEqual(1);
    expect(calls[0][0]).toEqual('/api/educators/student_searchbar_json');
    const cachedNames = JSON.parse(storage.getItem('studentInsights.studentSearchbar.studentNamesCacheKey'));
    expect(cachedNames.length).toEqual(20);
    done();
  }, 10);
});

it('filters for `abi` as test', done => {
  const props = testProps();
  const el = document.createElement('div');
  const instance = ReactDOM.render(<StudentSearchbar {...props} />, el); // eslint-disable-line react/no-render-return-value
  changeTextValue($(el).find('input').get(0), 'abi');

  setTimeout(() => {
    const {studentsForList, studentsForListById, countOverLimit} = instance.filteredAndTruncated();
    expect(studentsForList.length).toEqual(3);
    expect(Object.keys(studentsForListById).length).toEqual(3);
    expect(countOverLimit).toEqual(0);
    done();
  }, 10);
});

it('truncates for `a` as test', done => {
  const props = testProps({matchesLimit: 4});
  const el = document.createElement('div');
  const instance = ReactDOM.render(<StudentSearchbar {...props} />, el); // eslint-disable-line react/no-render-return-value
  changeTextValue($(el).find('input').get(0), 'a');

  setTimeout(() => {
    const {studentsForList, studentsForListById, countOverLimit} = instance.filteredAndTruncated();
    expect(studentsForList.length).toEqual(4);
    expect(Object.keys(studentsForListById).length).toEqual(4);
    expect(countOverLimit).toEqual(16);
    done();
  }, 10);
});

