import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import StudentPhotoCropped from './StudentPhotoCropped';

function testEl(props = {}, context = {}) {
  const districtKey = context.districtKey || 'somerville';
  return (
    <PerDistrictContainer districtKey={districtKey}>
      <StudentPhotoCropped {...props} />
    </PerDistrictContainer>
  );
}

function snapshotForDistrictKey(districtKey) {
  return renderer
    .create(testEl({studentId: 42}, {districtKey}))
    .toJSON();
}
it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(testEl({studentId: 42}), el);
});

describe('snapshots', () => {
  it('for Somerville', () => expect(snapshotForDistrictKey('somerville')).toMatchSnapshot());
  it('for Bedford', () => expect(snapshotForDistrictKey('bedford')).toMatchSnapshot());
  it('for New Bedford', () => expect(snapshotForDistrictKey('new_bedford')).toMatchSnapshot());
  it('for demo', () => expect(snapshotForDistrictKey('demo')).toMatchSnapshot());
});
