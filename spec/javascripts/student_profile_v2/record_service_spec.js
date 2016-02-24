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
        serviceTypesIndex: {},
        educatorsIndex: {},
        nowMoment: Fixtures.nowMoment,
        currentEducator: Fixtures.currentEducator,
        onSave: jasmine.createSpy('onSave'),
        onCancel: jasmine.createSpy('onCancel'),
        requestState: null
      });
      return ReactDOM.render(createEl(RecordService, mergedProps), el);
    },

    serviceTypes: function(el) {
      return $(el).find('.btn.service-type').toArray().map(function(el) {
        return $.trim(el.innerText);
      });
    }
  };

  SpecSugar.withTestEl('high-level integration tests', function() {
    it('renders dialog for recording services', function() {
      var el = this.testEl;
      helpers.renderInto(el);

      expect(el).toContainText('Which service?');
      expect(helpers.serviceTypes(el)).toEqual([
        'Counseling, in-house',
        'Counseling, outside',
         'Reading intervention',
         'Math intervention',
         'Attendance Officer',
         'Attendance Contract',
         'Behavior Contract' 
      ]);

      expect(el).toContainText('Who is working with Tamyra?');
      expect($(el).find('.Select').length).toEqual(1);
      expect(el).toContainText('When did they start?');
      expect($(el).find('.datepicker.hasDatepicker').length).toEqual(1);
      expect($(el).find('.btn.save').length).toEqual(1);
      expect($(el).find('.btn.cancel').length).toEqual(1);
    });
  });
});