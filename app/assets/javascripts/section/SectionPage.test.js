import React from 'react';
import ReactDOM from 'react-dom';
import {withDefaultNowContext} from '../testing/NowContainer';
import {SOMERVILLE} from '../helpers/PerDistrict';
import PerDistrictContainer from '../components/PerDistrictContainer';
import fetchMock from 'fetch-mock/es5/client';
import SectionPage from './SectionPage';
import sectionJson from './sectionJson.fixture';

function testProps(props = {}) {
  const sectionId = sectionJson.section.id;
  return {
    sectionId,
    ...props
  };
}

function testRender(props = {}, context = {}) {
  const districtKey = context.districtKey || SOMERVILLE;
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(
    <PerDistrictContainer districtKey={districtKey}>
      <SectionPage {...props} />
    </PerDistrictContainer>
  ), el);
  return {el};
}

beforeEach(() => {
  const sectionId = sectionJson.section.id;

  fetchMock.restore();
  fetchMock.get(`/api/sections/${sectionId}/section_json`, sectionJson);
});

it('renders without crashing', () => {
  const props = testProps();
  testRender(props);
});

it('renders everything after fetch', done => {
  const props = testProps();
  const {el} = testRender(props);
  
  setTimeout(() => {
    expect($(el).text()).toContain('ART MAJOR FOUNDATIONS (ART-302A)');
    expect($(el).text()).toContain('In 201');
    expect($(el).text()).toContain('2(M,R)');
    expect($(el).text()).toContain('Term FY');
    expect($(el).find('.FlexibleRoster tbody > tr').length).toEqual(sectionJson.students.length);
    expect($(el).find('.FlexibleRoster tbody > tr').length).toEqual(9);
    done();
  }, 0);
});
