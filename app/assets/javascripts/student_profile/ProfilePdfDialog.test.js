import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import ReactTestUtils from 'react-dom/test-utils';
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

const helpers = {
  findStartDateInput(el) {
    return $(el).find('.datepicker').get(0);
  },

  findEndDateInput(el) {
    return $(el).find('.datepicker').get(1);
  },

  simulateStartDateChange(el, text) {
    const inputEl = helpers.findStartDateInput(el);
    return ReactTestUtils.Simulate.change(inputEl, {target: {value: text}});
  },

  simulateEndDateChange(el, text) {
    const inputEl = helpers.findEndDateInput(el);
    return ReactTestUtils.Simulate.change(inputEl, {target: {value: text}});
  },

  findGenerateReportButton(el) {
    return $(el).find('.btn.btn-warning');
  },

  isWarningMessageShown(el) {
    return $(el).find('.PdfDialogue-warning').text() === 'Choose a valid date';
  },
};

it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(testEl(props), el);
});

describe('date validation', () => {
  it('shows warning on invalid start date', () => {
    const el = document.createElement('div');
    const props = testProps();
    ReactDOM.render(testEl(props), el);
    helpers.simulateStartDateChange(el, '1/2/3/4');
    expect(helpers.isWarningMessageShown(el)).toEqual(true);
  });
  it('disables the generate report button when start date is invalid', () => {
    const el = document.createElement('div');
    const props = testProps();
    ReactDOM.render(testEl(props), el);
    helpers.simulateStartDateChange(el, '1/not a date');
    expect(helpers.findGenerateReportButton(el).attr('disabled')).toEqual('disabled');
  });
  it('shows warning on invalid end date', () => {
    const el = document.createElement('div');
    const props = testProps();
    ReactDOM.render(testEl(props), el);
    helpers.simulateEndDateChange(el, '1/not a date');
    expect(helpers.isWarningMessageShown(el)).toEqual(true);
  });
  it('disables the generate report button when end date is invalid', () => {
    const el = document.createElement('div');
    const props = testProps();
    ReactDOM.render(testEl(props), el);
    helpers.simulateEndDateChange(el, '1/not a date');
    expect(helpers.findGenerateReportButton(el).attr('disabled')).toEqual('disabled');
  });
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
    expect(wrapper.instance().studentReportURL()).toEqual('/students/42/student_report.pdf?from_date=08%2F15%2F2016&include_restricted_notes=false&sections=notes%2Cservices%2Cattendance%2Cdiscipline_incidents%2Cassessments&to_date=03%2F14%2F2018');
  });

  it('creates download URL in correct format with include_restricted_notes', () => {
    const context = testContext();
    const wrapper = mount(<ProfilePdfDialog {...testProps()} />, {context});
    wrapper.setState({includeRestrictedNotes: true});
    expect(wrapper.instance().studentReportURL()).toEqual('/students/42/student_report.pdf?from_date=08%2F15%2F2016&include_restricted_notes=true&sections=notes%2Cservices%2Cattendance%2Cdiscipline_incidents%2Cassessments&to_date=03%2F14%2F2018');
  });
});
