import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import fetchMock from 'fetch-mock/es5/client';
import SampleStudentsPage, {SampleStudentsPageView} from './SampleStudentsPage';
import sampleStudentsJson from './sampleStudentsJson.fixture';

function testProps(props = {}) {
  return {
    n: 17,
    seed: 42,
    ...props
  };
}

function mockFetch(props = {}) {
  const {n, seed} = props;
  fetchMock.restore();
  fetchMock.get(`/admin/api/sample_students_json?n=${n}&seed=${seed}`, {
    sample_students: sampleStudentsJson.sample_students.slice(0, n)
  });
}

it('renders without crashing', () => {
  const props = testProps();
  mockFetch(props);
  const el = document.createElement('div');
  ReactDOM.render(<SampleStudentsPage {...props} />, el);
});

it('renders everything after fetch', done => {
  const props = testProps();
  mockFetch(props);
  const el = document.createElement('div');
  ReactDOM.render(<SampleStudentsPage {...props} />, el);

  setTimeout(() => {
    expect($(el).find('table tbody tr').length).toEqual(props.n);
    done();
  }, 0);
});

describe('SampleStudentsPageView', () => {
  it('pure component matches snapshot', () => {
    const props = testProps({sampleStudents: sampleStudentsJson.sample_students});
    mockFetch(props);
    const tree = renderer
      .create(<SampleStudentsPageView {...props} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});


