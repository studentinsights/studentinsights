import {
  studentProfile,
  nowMoment,
  currentEducator
} from './fixtures.jsx';
import SpecSugar from '../support/spec_sugar.jsx';
import ReactTestUtils from 'react-addons-test-utils';
import {merge} from '../../../app/assets/javascripts/helpers/react_helpers.jsx';

describe('RecordService', function() {
  const ReactDOM = window.ReactDOM;
  const RecordService = window.shared.RecordService;

  const helpers = {
    testProps: function(props) {
      return merge({
        studentFirstName: 'Tamyra',
        serviceTypesIndex: studentProfile.serviceTypesIndex,
        educatorsIndex: studentProfile.educatorsIndex,
        nowMoment: nowMoment,
        currentEducator: currentEducator,
        onSave: jest.fn(),
        onCancel: jest.fn(),
        requestState: null,
        studentId: 1
      }, props || {});
    },

    renderInto: function(el, props) {
      const mergedProps = helpers.testProps(props);
      ReactDOM.render(<RecordService {...mergedProps} />, el);
    },

    serviceTypes: function(el) {
      return $(el).find('.btn.service-type').toArray().map(function(el) {
        return $.trim(el.innerHTML);
      });
    },

    findSaveButton: function(el) {
      return $(el).find('.btn.save');
    },

    findStartDateInput: function(el) {
      return $(el).find('.datepicker').get(0);
    },

    findEndDateInput: function(el) {
      return $(el).find('.datepicker').get(1);
    },

    isSaveButtonEnabled: function(el) {
      return helpers.findSaveButton(el).attr('disabled') !== 'disabled';
    },

    isWarningMessageShown(el) {
      return $(el).find('.RecordService-warning').text() === 'Choose a valid date (end date is optional)';
    },

    simulateStartDateChange: function(el, text) {
      const inputEl = helpers.findStartDateInput(el);
      return ReactTestUtils.Simulate.change(inputEl, {target: {value: text}});
    },

    simulateEndDateChange: function(el, text) {
      const inputEl = helpers.findEndDateInput(el);
      return ReactTestUtils.Simulate.change(inputEl, {target: {value: text}});
    },

    simulateEducatorChange: function(el, text) {
      const inputEl = $(el).find('.ProvidedByEducatorDropdown').get(0);
      ReactTestUtils.Simulate.change(inputEl, {target: {value: text}});
    },

    submitForm(el, params = {}) {
      $(el).find('.btn.service-type').click();
      helpers.simulateEducatorChange(el, params.educatorText || 'kevin');
      helpers.simulateStartDateChange(el, params.startDateText || '12/19/2018');
      helpers.simulateEndDateChange(el, params.endDateText);
      $(el).find('.btn.save').click();
    }
  };

  SpecSugar.withTestEl('integration tests', function(container) {
    it('renders dialog for recording services', function() {
      const el = container.testEl;
      helpers.renderInto(el);

      expect($(el).text()).toContain('Which service?');
      expect(helpers.serviceTypes(el)).toEqual([
        'Attendance Officer',
        'Attendance Contract',
        'Behavior Contract',
        'Counseling, in-house',
        'Counseling, outside',
        'Reading intervention',
        'Math intervention',
      ]);

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

    describe('validation', () => {
      it('shows warning on invalid start date', function() {
        const el = container.testEl;
        helpers.renderInto(el);
        helpers.simulateStartDateChange(el, 'fds 1/2/2/22 not a valid date');
        expect(helpers.isWarningMessageShown(el)).toEqual(true);
      });

      it('shows warning on invalid end date', function() {
        const el = container.testEl;
        helpers.renderInto(el);
        helpers.simulateEndDateChange(el, 'fds 1/2/2/22 not a valid date');
        expect(helpers.isWarningMessageShown(el)).toEqual(true);
      });

      it('does not allow save on invalid start date', function() {
        const el = container.testEl;
        helpers.renderInto(el);
        helpers.simulateStartDateChange(el, '1/2/2/22 not a valid date');
        expect(helpers.isSaveButtonEnabled(el)).toEqual(false);
      });

      it('does not allow save on invalid end date', function() {
        const el = container.testEl;
        helpers.renderInto(el);
        helpers.simulateEndDateChange(el, '1/2/2/22 not a valid date');
        expect(helpers.isSaveButtonEnabled(el)).toEqual(false);
      });

      it('does not allow save on end date before start date', function() {
        const el = container.testEl;
        helpers.renderInto(el);
        helpers.simulateStartDateChange(el, '1/20/18');
        helpers.simulateEndDateChange(el, '1/2/18');
        expect(helpers.isSaveButtonEnabled(el)).toEqual(false);
      });

      it('does not allow save without educator', function() {
        const el = container.testEl;
        helpers.renderInto(el);
        $(el).find('.btn.service-type').click();
        helpers.simulateEducatorChange(el, '');
        helpers.simulateStartDateChange(el, '12/19/2018');
        expect(helpers.isSaveButtonEnabled(el)).toEqual(false);
      });

      it('requires service, educator and valid start date set in order to save and allows blank end date', function() {
        const el = container.testEl;
        helpers.renderInto(el);
        $(el).find('.btn.service-type').click();
        helpers.simulateEducatorChange(el, 'kevin');
        helpers.simulateStartDateChange(el, '12/19/2018');
        helpers.simulateEndDateChange(el, '');
        expect(helpers.isSaveButtonEnabled(el)).toEqual(true);
      });
    });

    it('#onSave called as expected', () => {
      const el = container.testEl;
      const props = helpers.testProps();
      ReactDOM.render(<RecordService {...props} />, el);
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
      const el = container.testEl;
      const props = helpers.testProps();
      ReactDOM.render(<RecordService {...props} />, el);
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
      const el = container.testEl;
      const props = helpers.testProps();
      const instance = ReactDOM.render(<RecordService {...props} />, el); // eslint-disable-line react/no-render-return-value
      expect(instance.formatDateTextForRails('12/19/2018')).toEqual('2018-12-19');
      expect(instance.formatDateTextForRails('3/5/2018')).toEqual('2018-03-05');
      expect(instance.formatDateTextForRails('1/15/18')).toEqual('2018-01-15');
      expect(instance.formatDateTextForRails('01/5/18')).toEqual('2018-01-05');
      expect(instance.formatDateTextForRails('01-5-18')).toEqual('2018-01-05');
    });
  });
});
