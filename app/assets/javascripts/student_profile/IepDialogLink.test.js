import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import {withDefaultNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import IepDialogLink from './IepDialogLink';
import serializedDataForPlutoPoppins from './fixtures/serializedDataForPlutoPoppins.fixture';

function testProps(props = {}) {
  return {
    student: serializedDataForPlutoPoppins.student,
    iepDocument: {
      id: 789
    },
    linkEl: null,
    ...props
  };
}

function testEl(props, context = {}) {
  const districtKey = context.districtKey || 'somerville';
  return withDefaultNowContext(
    <PerDistrictContainer districtKey={districtKey}>
      <IepDialogLink {...props} />
    </PerDistrictContainer>
  );
}

export function renderAcrossAllCombinations() {
  const props = testProps();
  const districtKeys = [
    'somerville',
    'bedford',
    'new_bedford'
  ];

  const els = districtKeys.map(districtKey => (
    <div key={districtKey} style={{margin: 10}}>
      <div>{districtKey}</div>
      <div style={{border: '1px solid #ccc'}}>{testEl(props, {districtKey})}</div>
    </div>
  ));
  return <div>{els}</div>;
}

function snapshotTree(districtKey, props = {}) {
  return renderer
    .create(testEl(testProps(props), {districtKey}))
    .toJSON();
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(testEl(props), el);
});

describe('snapshots', () => {
  it('works for Somerville', () => expect(snapshotTree('somerville')).toMatchSnapshot());
  it('works for Bedford', () => expect(snapshotTree('bedford')).toMatchSnapshot());
  it('works for New Bedford', () => expect(snapshotTree('new_bedford')).toMatchSnapshot());
});
