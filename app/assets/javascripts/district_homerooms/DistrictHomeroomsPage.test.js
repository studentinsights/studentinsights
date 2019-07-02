import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import fetchMock from 'fetch-mock/es5/client';
import {withDefaultNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import DistrictHomeroomsPage, {DistrictHomeroomsView} from './DistrictHomeroomsPage';
import districtHomeroomsJson from './districtHomeroomsJson.fixture';

function testProps(props = {}) {
  return {
    ...props
  };
}

function testEl(props, context = {}) {
  const districtKey = context.districtKey || 'somerville';
  return withDefaultNowContext(
    <PerDistrictContainer districtKey={districtKey}>
      <DistrictHomeroomsPage {...props} />
    </PerDistrictContainer>
  );
}

beforeEach(() => {
  fetchMock.restore();
  fetchMock.get('/api/district/homerooms_json', districtHomeroomsJson);
});

it('renders without crashing', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(testEl(props), el);
});

it('renders everything after fetch', done => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(testEl(props), el);

  setTimeout(() => {
    expect($(el).find('table tbody tr').length).toEqual(8);
    done();
  }, 0);
});

describe('DistrictHomeroomsView', () => {
  it('pure component matches snapshot', () => {
    const districtKey = 'somerville';
    const tree = renderer
      .create(withDefaultNowContext(
        <PerDistrictContainer districtKey={districtKey}>
          <DistrictHomeroomsView
            students={districtHomeroomsJson.students}
            districtName={districtHomeroomsJson.district_name} />
        </PerDistrictContainer>
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});


