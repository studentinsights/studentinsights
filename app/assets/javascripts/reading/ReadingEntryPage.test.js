import React from 'react';
import ReactDOM from 'react-dom';
import {mount} from 'enzyme';
import * as Virtualized from 'react-virtualized';
import fetchMock from 'fetch-mock/es5/client';
import unvirtualize from '../testing/unvirtualize';
import {withNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import ReadingEntryPage from './ReadingEntryPage';
import readingJson from './readingJson.fixture';

function testProps(props = {}) {
  return {
    currentEducatorId: 999999,
    schoolSlug: 'hea',
    grade: '3',
    ...props
  };
}

// Set test time so it's during a benchmark window
function testEl(props = {}) {
  return withNowContext('2019-01-16T11:03:06.123Z',
    <PerDistrictContainer districtKey="somerville">
      <ReadingEntryPage {...props} />
    </PerDistrictContainer>
  );
}


// can't add snapshots with react-virtualized without
// some work, see https://github.com/bvaughn/react-virtualized/issues/1117
// instead, we stub these implementations with naive simple unvirtualized
// ones, to verify the substance of the rendering works
jest.mock('react-virtualized');
unvirtualize(Virtualized, jest.fn);

beforeEach(() => {
  fetchMock.restore();
  fetchMock.get('/api/schools/hea/reading/3/reading_json', readingJson);
});

it('renders without crashing', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(testEl(props), el);
});

describe('integration tests with unvirtualized table', () => {
  it('renders after fetch', done => {
    const props = testProps();
    const wrapper = mount(testEl(props));
    expect(wrapper.text()).toContain('Loading...');

    setTimeout(() => {
      expect(wrapper.text()).toContain('Benchmark Reading Data: 3rd grade at Arthur D Healey');
      expect($(wrapper.html()).find('input').length).toEqual(2 + 24);
      expect($(wrapper.html()).find('input').length).toEqual(2 + 24);
      done();
    }, 0);
  });
});
