import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import {mount} from 'enzyme';
import fetchMock from 'fetch-mock/es5/client';
import PerDistrictContainer from '../components/PerDistrictContainer';
import {
  studentProfile,
  nowMoment,
  currentEducator
} from './fixtures/fixtures';
import RecordService from './RecordService';


export function testProps(props) {
  return {
    studentFirstName: 'Tamyra',
    serviceTypesIndex: studentProfile.serviceTypesIndex,
    educatorsIndex: studentProfile.educatorsIndex,
    nowMoment: nowMoment,
    currentEducator: currentEducator,
    onSave: jest.fn(),
    onCancel: jest.fn(),
    requestState: null,
    studentId: 1,
    ...props
  };
}

function propsWithServiceInfoLabel(props = {}) {
  return {
    ...props,
    servicesInfoDocUrl: 'https://example.com/',
    currentEducator: {
      ...props.currentEducator,
      labels: ['show_services_info']
    }
  };
}

function forDistrict(el, districtKey) {
  return <PerDistrictContainer districtKey={districtKey}>{el}</PerDistrictContainer>;
}

function mountWithContext(props, context = {districtKey: 'demo'}) {
  return mount(<RecordService {...props} />, {context});
}

function testRender(props, options = {}) {
  const el = document.createElement('div');
  const districtKey = options.districtKey || 'somerville';
  ReactDOM.render(forDistrict(<RecordService {...props} />, districtKey), el);
  return {el};
}

const helpers = {
  serviceTypes(el) {
    return $(el).find('.btn.service-type').toArray().map(el => {
      return $(el).text().trim();
    });
  },

  findServiceButton(el, serviceTypeId) {
    return $(el).find(`.btn.service-type-${serviceTypeId}`).get(0);
  },

  findSaveButton(el) {
    return $(el).find('.btn.save');
  },

  findStartDateInput(el) {
    return $(el).find('.datepicker').get(0);
  },

  findEndDateInput(el) {
    return $(el).find('.datepicker').get(1);
  },

  findServiceInfoText(el) {
    return $(el).find('.RecordService-service-info-box').text().trim();
  },

  isSaveButtonEnabled(el) {
    return helpers.findSaveButton(el).attr('disabled') !== 'disabled';
  },

  isWarningMessageShown(el) {
    return $(el).find('.RecordService-warning').text() === 'Choose a valid date (end date is optional)';
  },

  simulateClickOnService(el, serviceTypeId) {
    const buttonEl = helpers.findServiceButton(el, serviceTypeId);
    ReactTestUtils.Simulate.click(buttonEl);
  },

  simulateStartDateChange(el, text) {
    const inputEl = helpers.findStartDateInput(el);
    return ReactTestUtils.Simulate.change(inputEl, {target: {value: text}});
  },

  simulateEndDateChange(el, text) {
    const inputEl = helpers.findEndDateInput(el);
    return ReactTestUtils.Simulate.change(inputEl, {target: {value: text}});
  },

  simulateEducatorChange(el, text) {
    const inputEl = $(el).find('.ProvidedByEducatorDropdown').get(0);
    ReactTestUtils.Simulate.change(inputEl, {target: {value: text}});
  },

  submitForm(el, params = {}) {
    helpers.simulateClickOnService(el, 507);
    helpers.simulateEducatorChange(el, params.educatorText || 'kevin');
    helpers.simulateStartDateChange(el, params.startDateText || '12/19/2018');
    helpers.simulateEndDateChange(el, params.endDateText);
    ReactTestUtils.Simulate.click($(el).find('.btn.save').get(0));
  }
};

beforeEach(() => {
  fetchMock.restore();
  fetchMock.get('/api/educators/possible_names_for_service_json', {
    names: ['Martinez, Pedro', 'Garciaparra, Nomar']
  });
});

describe('integration tests', () => {
  it('renders dialog for recording services', () => {
    const {el} = testRender(testProps());
    expect($(el).text()).toContain('Which service?');

    expect($(el).text()).toContain('Who is working with Tamyra?');
    // TODO (as): test staff dropdown autocomplete async
    expect($(el).text()).toContain('When did they start?');
    expect($(el).text()).toContain('When did/will they end');
    expect($(el).text()).not.toContain('Invalid date');
    expect(helpers.findStartDateInput(el).value).toContain('02/11/2016');
    expect(helpers.findEndDateInput(el).value).toEqual('06/30/2016');
    expect(helpers.findSaveButton(el).length).toEqual(1);
    expect($(el).find('.btn.cancel').length).toEqual(1);

    expect(helpers.isWarningMessageShown(el)).toEqual(false);
    expect(helpers.isSaveButtonEnabled(el)).toEqual(false);
  });

  describe('shows different service types across districts', () => {
    it('works for bedford', () => {
      const props = propsWithServiceInfoLabel(testProps());
      const {el} = testRender(props, {districtKey: 'bedford'});
      expect(helpers.serviceTypes(el)).toEqual([
        'Soc.emo check in',
        'Lunch bunch',
        'Social Group',
        'Individual Counseling',
        'Formal Behavior Plan',
        'LLI Reading Instruction',
        'Reading intervention, with specialist',
        'Title 1 Math intervention',
        'Math Intervention, small group',
      ]);
    });

    it('works for somerville', () => {
      const props = propsWithServiceInfoLabel(testProps());
      const {el} = testRender(props, {districtKey: 'somerville'});
      expect(helpers.serviceTypes(el)).toEqual([
        'Attendance Contract',
        'Attendance Officer',
        'Behavior Contract',
        'Counseling, in-house',
        'Counseling, outside',
        'Reading intervention'
      ]);
    });

    it('works for new_bedford', () => {
      const props = propsWithServiceInfoLabel(testProps());
      const {el} = testRender(props, {districtKey: 'new_bedford'});
      expect(helpers.serviceTypes(el)).toEqual([
        'Attendance Contract',
        'Attendance Officer',
        'Behavior Contract',
        'Counseling, in-house',
        'Counseling, outside',
        'Reading intervention'
      ]);
    });

    it('works for demo', () => {
      const props = propsWithServiceInfoLabel(testProps());
      const {el} = testRender(props, {districtKey: 'demo'});
      expect(helpers.serviceTypes(el)).toEqual([
        'Attendance Contract',
        'Attendance Officer',
        'Behavior Contract',
        'Counseling, in-house',
        'Counseling, outside',
        'Reading intervention'
      ]);
    });
  });

  describe('service info', () => {
    it('shows service info as tooltip', () => {
      const props = testProps({servicesInfoDocUrl: 'https://example.com/'});
      const {el} = testRender(props, {districtKey: 'bedford'});
      const buttonEl = helpers.findServiceButton(el, 703);
      expect(buttonEl.getAttribute('title')).toEqual([
        'Soc.emo check in',
        'Short regular check ins',
        '1-3x 10min',
        'Data owner: counselor'
      ].join('\n'));
    });

    it('shows no info at first, then shows details on click', () => {
      const props = testProps({servicesInfoDocUrl: 'https://example.com/'});
      const {el} = testRender(props, {districtKey: 'bedford'});
      expect(helpers.findServiceInfoText(el)).toEqual('Select a service for more description.');
      helpers.simulateClickOnService(el, 703);
      expect(helpers.findServiceInfoText(el)).toEqual([
        'Short regular check ins',
        '1-3x 10min',
        'Data owner: counselor',
        'Learn more'
      ].join(''));
    });

    it('does not show service info if not set in PerDistrict and no label', () => {
      const props = testProps({servicesInfoDocUrl: 'https://example.com/'});
      const {el} = testRender(props, {districtKey: 'somerville'});
      helpers.simulateClickOnService(el, 502);
      expect(helpers.findServiceInfoText(el)).toEqual('');
    });

    it('would show info if not set in PerDistrict but label is set', () => {
      const props = propsWithServiceInfoLabel(testProps());
      const {el} = testRender(props, {districtKey: 'somerville'});
      helpers.simulateClickOnService(el, 502);
      expect(helpers.findServiceInfoText(el)).toEqual('No service info found.');
    });

    it('says `no info` if enabled but no service type info is found', () => {
      const props = propsWithServiceInfoLabel(testProps());
      const {el} = testRender(props, {districtKey: 'somerville'});
      helpers.simulateClickOnService(el, 502);
      expect(helpers.findServiceInfoText(el)).toEqual('No service info found.');
    });    
  });

  describe('validation', () => {
    it('shows warning on invalid start date', () => {
      const {el} = testRender(testProps());
      helpers.simulateStartDateChange(el, 'fds 1/2/2/22 not a valid date');
      expect(helpers.isWarningMessageShown(el)).toEqual(true);
    });

    it('shows warning on invalid end date', () => {
      const {el} = testRender(testProps());
      helpers.simulateEndDateChange(el, 'fds 1/2/2/22 not a valid date');
      expect(helpers.isWarningMessageShown(el)).toEqual(true);
    });

    it('does not allow save on invalid start date', () => {
      const {el} = testRender(testProps());
      helpers.simulateStartDateChange(el, '1/2/2/22 not a valid date');
      expect(helpers.isSaveButtonEnabled(el)).toEqual(false);
    });

    it('does not allow save on invalid end date', () => {
      const {el} = testRender(testProps());
      helpers.simulateEndDateChange(el, '1/2/2/22 not a valid date');
      expect(helpers.isSaveButtonEnabled(el)).toEqual(false);
    });

    it('does not allow save on end date before start date', () => {
      const {el} = testRender(testProps());
      helpers.simulateStartDateChange(el, '1/20/18');
      helpers.simulateEndDateChange(el, '1/2/18');
      expect(helpers.isSaveButtonEnabled(el)).toEqual(false);
    });

    it('does not allow save without educator', () => {
      const {el} = testRender(testProps());
      helpers.simulateClickOnService(el, 507);
      helpers.simulateEducatorChange(el, '');
      helpers.simulateStartDateChange(el, '12/19/2018');
      expect(helpers.isSaveButtonEnabled(el)).toEqual(false);
    });

    it('requires service, educator and valid start date set in order to save and allows blank end date', () => {
      const {el} = testRender(testProps());
      helpers.simulateClickOnService(el, 507);
      helpers.simulateEducatorChange(el, 'kevin');
      helpers.simulateStartDateChange(el, '12/19/2018');
      helpers.simulateEndDateChange(el, '');
      expect(helpers.isSaveButtonEnabled(el)).toEqual(true);
    });
  });

  it('#onSave called as expected', () => {
    const props = testProps();
    const {el} = testRender(props);
    helpers.submitForm(el, { endDateText: '06/30/2019' });

    expect(props.onSave).toBeCalledWith({
      serviceTypeId: 507,
      providedByEducatorName: 'kevin',
      dateStartedText: '2018-12-19',
      estimatedEndDateText: '2019-06-30',
      recordedByEducatorId: 1
    });
  });

  it('#onSave called as expected when blank end date', () => {
    const props = testProps();
    const {el} = testRender(props);
    helpers.submitForm(el, { endDateText: '' });

    expect(props.onSave).toBeCalledWith({
      serviceTypeId: 507,
      providedByEducatorName: 'kevin',
      dateStartedText: '2018-12-19',
      estimatedEndDateText: null,
      recordedByEducatorId: 1
    });
  });

  it('#formatDateTextForRails', () => {
    const wrapper = mountWithContext(testProps());
    expect(wrapper.instance().formatDateTextForRails('12/19/2018')).toEqual('2018-12-19');
    expect(wrapper.instance().formatDateTextForRails('3/5/2018')).toEqual('2018-03-05');
    expect(wrapper.instance().formatDateTextForRails('1/15/18')).toEqual('2018-01-15');
    expect(wrapper.instance().formatDateTextForRails('01/5/18')).toEqual('2018-01-05');
    expect(wrapper.instance().formatDateTextForRails('01-5-18')).toEqual('2018-01-05');
  });
});
