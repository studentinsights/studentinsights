import {
  studentProfile,
  nowMoment,
  currentEducator
} from './fixtures.jsx';
import SpecSugar from '../support/spec_sugar.jsx';


describe('RecordService', () => {
  const merge = window.shared.ReactHelpers.merge;
  const ReactDOM = window.ReactDOM;
  const RecordService = window.shared.RecordService;

  const helpers = {
    renderInto(el, props) {
      const mergedProps = merge(props || {}, {
        studentFirstName: 'Tamyra',
        serviceTypesIndex: studentProfile.serviceTypesIndex,
        educatorsIndex: studentProfile.educatorsIndex,
        nowMoment,
        currentEducator,
        onSave: jasmine.createSpy('onSave'),
        onCancel: jasmine.createSpy('onCancel'),
        requestState: null,
        studentId: 1
      });
      ReactDOM.render(<RecordService {...mergedProps} />, el);
    },

    serviceTypes(el) {
      return $(el).find('.btn.service-type').toArray().map(el => $.trim(el.innerText));
    },

    findSaveButton(el) {
      return $(el).find('.btn.save');
    }
  };

  SpecSugar.withTestEl('integration tests', () => {
    it('renders dialog for recording services', function () {
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
