import React from 'react';
import ReactDOM from 'react-dom';
import {mount} from 'enzyme';
import fetchMock from 'fetch-mock/es5/client';
import MyStudentsPage from './MyStudentsPage';
import myStudentsJson from './myStudentsJson.fixture';
import renderer from 'react-test-renderer';

function testProps() {
  return {};
}

beforeEach(() => {
  fetchMock.restore();
  fetchMock.get('/api/educators/my_students_json', myStudentsJson);
});

it('renders without crashing', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(<MyStudentsPage {...props} />, el);
});

describe('integration tests', () => {
  it('renders everything after fetch', done => {
    const props = testProps();
    const wrapper = mount(<MyStudentsPage {...props} />);
    expect(wrapper.text()).toContain('Loading...');

    setTimeout(() => {
      expect(wrapper.html()).toContain('My students');
      const tableRows = $(wrapper.html()).find('table tbody tr').toArray();
      expect(tableRows.length).toEqual(18);
      done();
    }, 0);
  });
});

it('snapshots', () => {
  const props = testProps();
  const tree = renderer
    .create(<MyStudentsPage {...props} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
