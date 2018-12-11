import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import fetchMock from 'fetch-mock/es5/client';
import DistrictOverviewPage, {DistrictOverviewPageView} from './DistrictOverviewPage';
import districtOverviewJson from './districtOverviewJson.fixture';

function testProps(props = {}) {
  return {
    ...props
  };
}

beforeEach(() => {
  fetchMock.restore();
  fetchMock.get('/api/district/overview_json', districtOverviewJson);
});

it('renders without crashing', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(<DistrictOverviewPage {...props} />, el);
});

it('renders everything after fetch', done => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(<DistrictOverviewPage {...props} />, el);

  setTimeout(() => {
    expect($(el).text()).toContain('District');
    expect($(el).text()).toContain('Schools');
    expect($(el).text()).toContain('Administration');
    done();
  }, 0);
});

describe('DistrictOverviewPageView', () => {
  it('pure component matches snapshot, without work board', () => {
    const json = districtOverviewJson;
    const tree = renderer
      .create(
        <DistrictOverviewPageView
          enableStudentVoiceUploads={json.enable_student_voice_uploads}
          showWorkBoard={false}
          schools={json.schools}
          currentEducator={json.current_educator}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});


