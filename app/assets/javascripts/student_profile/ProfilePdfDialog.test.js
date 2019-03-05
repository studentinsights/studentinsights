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
    allowRestrictedNotes: false,
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
    expect(wrapper.instance().studentReportURL()).toEqual('/students/42/student_report.pdf?from_date=08%2F15%2F2016&include_restricted_notes=false&sections=notes%2Cservices%2Cattendance%2Cdiscipline_incidents%2Cassessments&to_date=03%2F13%2F2018');
  });

  it('creates download URL in correct format with include_restricted_notes', () => {
    const context = testContext();
    const wrapper = mount(<ProfilePdfDialog {...testProps()} />, {context});
    wrapper.setState({includeRestrictedNotes: true});
    expect(wrapper.instance().studentReportURL()).toEqual('/students/42/student_report.pdf?from_date=08%2F15%2F2016&include_restricted_notes=true&sections=notes%2Cservices%2Cattendance%2Cdiscipline_incidents%2Cassessments&to_date=03%2F13%2F2018');
  });
});
