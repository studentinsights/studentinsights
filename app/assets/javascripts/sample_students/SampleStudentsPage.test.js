import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import fetchMock from 'fetch-mock/es5/client';
import SampleStudentsPage, {SampleStudentsPageView} from './SampleStudentsPage';
import sampleStudentsJson from './sampleStudentsJson.fixture';

function testProps(props = {}) {
  return {
    n: 20,
    seed: 42,
    ...props
  };
}

beforeEach(() => {
  fetchMock.restore();
  fetchMock.get('/admin/api/sample_students_json?n=20&seed=42', sampleStudentsJson);
});

it('renders without crashing', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(<SampleStudentsPage {...props} />, el);
});

it('renders everything after fetch', done => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(<SampleStudentsPage {...props} />, el);

  setTimeout(() => {
    expect($(el).find('table tbody tr').length).toEqual(20);
    done();
  }, 0);
});

describe('SampleStudentsPageView', () => {
  it('pure component matches snapshot', () => {
    const tree = renderer
      .create(<SampleStudentsPageView sampleStudents={sampleStudentsJson.sample_students} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});


