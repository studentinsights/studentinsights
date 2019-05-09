import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import {withDefaultNowContext} from '../testing/NowContainer';
import ClassListCreatorWorkflow from './ClassListCreatorWorkflow';
import {
  testProps,
  chooseYourGradeProps,
  makeAPlanProps,
  shareWithPrincipalProps,
  exportProps,
  exportPropsWithAllPlaced,
  exportPropsWithMoves,
  exportPropsWithTeacherNames
} from './ClassListCreatorWorkflow.fixtures';

function snapshotRender(props) {
  return renderer
    .create(withDefaultNowContext(<ClassListCreatorWorkflow {...props} />))
    .toJSON();
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(withDefaultNowContext(<ClassListCreatorWorkflow {...props} />), el);
});

it('chooseYourGradeProps', () => {
  expect(snapshotRender(chooseYourGradeProps())).toMatchSnapshot();
  expect(snapshotRender(chooseYourGradeProps({ isEditable: false }))).toMatchSnapshot();
  expect(snapshotRender(chooseYourGradeProps({ canChangeSchoolOrGrade: false }))).toMatchSnapshot();
});

it('makeAPlanProps', () => {
  expect(snapshotRender(makeAPlanProps())).toMatchSnapshot();
  expect(snapshotRender(makeAPlanProps({ isEditable: false }))).toMatchSnapshot();
});

it('shareWithPrincipalProps', () => {
  expect(snapshotRender(shareWithPrincipalProps())).toMatchSnapshot();
  expect(snapshotRender(shareWithPrincipalProps({ isEditable: false, isSubmitted: true }))).toMatchSnapshot();
});

describe('exportProps snapshots', () => {
  it('unplaced', () => expect(snapshotRender(exportProps())).toMatchSnapshot());
  it('all placed', () => expect(snapshotRender(exportPropsWithAllPlaced())).toMatchSnapshot());
  it('moves', () => expect(snapshotRender(exportPropsWithMoves({ isEditable: false, isSubmitted: true }))).toMatchSnapshot());
  it('with teachers', () => expect(snapshotRender(exportPropsWithTeacherNames({ isEditable: false, isSubmitted: true }))).toMatchSnapshot());
});
