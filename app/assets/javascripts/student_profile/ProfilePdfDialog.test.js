import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import {mount} from 'enzyme';
import {withDefaultNowContext, testContext} from '../testing/NowContainer';
import ProfilePdfDialog from './ProfilePdfDialog';

function testProps(props = {}) {
  return {
    studentId: 42,
    showTitle: true,
    style: {},
    ...props
  };
}

function testEl(props = {}) {
  return withDefaultNowContext(<ProfilePdfDialog {...props} />);
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(testEl(props), el);
});

it('snapshots view', () => {
  const props = testProps();
  const tree = renderer
    .create(testEl(props))
    .toJSON();
  expect(tree).toMatchSnapshot();
});

describe('PDF', () => {
  it('creates download URL in correct format', () => {
    const context = testContext();
    const wrapper = mount(<ProfilePdfDialog {...testProps()} />, {context});
    expect(wrapper.instance().studentReportURL()).toEqual('/students/42/student_report.pdf?sections=notes,services,attendance,discipline_incidents,assessments&from_date=08/15/2016&to_date=03/13/2018');
  });
});