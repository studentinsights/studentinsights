//= require ./fixtures

describe('RecordService', function() {
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var RecordService = window.shared.RecordService;
  var SpecSugar = window.shared.SpecSugar;
  var Fixtures = window.shared.Fixtures;

  var helpers = {
    renderInto: function(el, props) {
      var mergedProps = merge(props || {}, {
        studentFirstName: 'Tamyra',
        serviceTypesIndex: Fixtures.studentProfile.serviceTypesIndex,
        educatorsIndex: Fixtures.studentProfile.educatorsIndex,
        nowMoment: Fixtures.nowMoment,
        currentEducator: Fixtures.currentEducator,
        onSave: jasmine.createSpy('onSave'),
        onCancel: jasmine.createSpy('onCancel'),
        requestState: null,
        studentId: 1
      });
      return ReactDOM.render(createEl(RecordService, mergedProps), el);
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
      var el = this.testEl;
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
