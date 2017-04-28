import {
  studentProfile,
  nowMoment,
  currentEducator
} from './fixtures.jsx';
import SpecSugar from '../support/spec_sugar.jsx';


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
        onSave: jasmine.createSpy('onSave'),
        onCancel: jasmine.createSpy('onCancel'),
        requestState: null,
        studentId: 1
      });
      ReactDOM.render(<RecordService {...mergedProps} />, el);
    },

    serviceTypes: function(el) {
      return $(el).find('.btn.service-type').toArray().map(function(el) {
        return $.trim(el.innerText);
      });
    },

    findSaveButton: function(el) {
      return $(el).find('.btn.save');
    }
  };

  SpecSugar.withTestEl('integration tests', function() {
    it('renders dialog for recording services', function() {
      const el = this.testEl;
      helpers.renderInto(el);

      expect(el).toContainText('Which service?');
      expect(helpers.serviceTypes(el)).toEqual([
        'Attendance Contract',
        'Attendance Officer',
        'Behavior Contract',
        'Counseling, in-house',
        'Counseling, outside',
        'Reading intervention'
      ]);


      expect(el).toContainText('Who is working with Tamyra?');
      // TODO (as): test staff dropdown autocomplete async
      expect(el).toContainText('When did they start?');
      expect($(el).find('.Datepicker .datepicker.hasDatepicker').length).toEqual(1);
      expect(helpers.findSaveButton(el).length).toEqual(1);
      expect(helpers.findSaveButton(el).attr('disabled')).toEqual('disabled');
      expect($(el).find('.btn.cancel').length).toEqual(1);
    });
  });
});
