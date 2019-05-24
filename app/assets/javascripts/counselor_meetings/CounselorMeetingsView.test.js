import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import fetchMock from 'fetch-mock/es5/client';
import {withDefaultNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import CounselorMeetingsView from './CounselorMeetingsView';
import meetingsJson from './meetingsJson.fixture';


function testProps(props = {}) {
  return {
    currentEducatorId: 9,
    schoolYear: meetingsJson.school_year,
    educatorsIndex: meetingsJson.educators_index,
    students: meetingsJson.students,
    meetings: meetingsJson.meetings,
    ...props
  };
}

function testEl(props = {}) {
  return withDefaultNowContext(
    <PerDistrictContainer districtKey="somerville">
      <CounselorMeetingsView {...props} />
    </PerDistrictContainer>
  );
}

beforeEach(() => {
  fetchMock.restore();
  fetchMock.get('/api/counselor_meetings/meetings_json', meetingsJson);
});

it('renders without crashing', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(testEl(props), el);
});


it('snapshots view', () => {
  const tree = renderer
    .create(testEl(testProps()))
    .toJSON();
  expect(tree).toMatchSnapshot();
});