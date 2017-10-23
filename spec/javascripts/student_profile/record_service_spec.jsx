import {
  studentProfile,
  nowMoment,
  currentEducator
} from './fixtures.jsx';
import SpecSugar from '../support/spec_sugar.jsx';
import ReactTestUtils from 'react-addons-test-utils';


describe('RecordService', function() {
  const merge = window.shared.ReactHelpers.merge;
  const ReactDOM = window.ReactDOM;
  const RecordService = window.shared.RecordService;

  const helpers = {
    renderInto: function(el, props) {
      const mergedProps = merge(props || {}, {
        studentFirstName: 'Tamyra',
        serviceTypesIndex: studentProfile.serviceTypesIndex,
        educatorsIndex: studentProfile.educatorsIndex,
        nowMoment: nowMoment,
        currentEducator: currentEducator,
        onSave: jest.fn(),
        onCancel: jest.fn(),
        requestState: null,
        studentId: 1
      });
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

    findDateInput: function(el) {
      return $(el).find('.datepicker');
    },

    isSaveButtonEnabled: function(el) {
      return helpers.findSaveButton(el).attr('disabled') !== 'disabled';
    },

    simulateDateChange: function(el, text) {
      const inputEl = helpers.findDateInput(el).get(0);
      return ReactTestUtils.Simulate.change(inputEl, {target: {value: text}});
    },

    simulateEducatorChange: function(el, text) {
      const inputEl = $(el).find('.ProvidedByEducatorDropdown').get(0);
      ReactTestUtils.Simulate.change(inputEl, {target: {value: text}});
    }
  };

  SpecSugar.withTestEl('integration tests', function(container) {
    it('renders dialog for recording services', function() {
      const el = container.testEl;
      helpers.renderInto(el);

      expect($(el).text()).toContain('Which service?');
      expect(helpers.serviceTypes(el)).toEqual([
        'Attendance Contract',
        'Attendance Officer',
        'Behavior Contract',
        'Counseling, in-house',
        'Counseling, outside',
        'Reading intervention'
      ]);


      expect($(el).text()).toContain('Who is working with Tamyra?');
      // TODO (as): test staff dropdown autocomplete async
      expect($(el).text()).toContain('When did they start?');
      expect($(el).text()).toContain('When did/will they end');
      expect(helpers.findDateInput(el).length).toEqual(2);
      expect($(el).text()).not.toContain('Invalid date');
      expect(helpers.findSaveButton(el).length).toEqual(1);
      expect(helpers.isSaveButtonEnabled(el)).toEqual(false);
      expect($(el).find('.btn.cancel').length).toEqual(1);
    });

    it('shows warning on invalid date', function() {
      const el = container.testEl;
      helpers.renderInto(el);
      helpers.simulateDateChange(el, 'fds 1/2/2/22 not a valid date');
      expect($(el).text()).toContain('Choose a valid date');
    });

    it('does not allow save on invalid date', function() {
      const el = container.testEl;
      helpers.renderInto(el);
      helpers.simulateDateChange(el, '1/2/2/22 not a valid date');
      expect(helpers.isSaveButtonEnabled(el)).toEqual(false);
    });

    it('does not allow without educator', function() {
      const el = container.testEl;
      helpers.renderInto(el);
      $(el).find('.btn:first').click();
      helpers.simulateEducatorChange(el, '');
      helpers.simulateDateChange(el, '12/19/2018');
      expect(helpers.isSaveButtonEnabled(el)).toEqual(false);
    });

    it('requires service, educator and valid date set in order to save', function() {
      const el = container.testEl;
      helpers.renderInto(el);
      $(el).find('.btn:first').click();
      helpers.simulateEducatorChange(el, 'kevin');
      helpers.simulateDateChange(el, '12/19/2018');
      expect(helpers.isSaveButtonEnabled(el)).toEqual(true);
    });
  });
});
