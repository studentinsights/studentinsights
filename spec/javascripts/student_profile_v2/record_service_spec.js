//= require ./fixtures

describe('RecordService', function() {
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var RecordService = window.shared.RecordService;
  var SpecSugar = window.shared.SpecSugar;
  var Fixtures = window.shared.Fixtures;
  var eventNotesFixture = [{"id":4,"student_id":24,"educator_id":1,"event_note_type_id":1,"text":"cool!","recorded_at":"2016-02-15T18:42:45.937Z","created_at":"2016-02-15T18:42:45.943Z","updated_at":"2016-02-15T18:42:45.943Z"},{"id":5,"student_id":24,"educator_id":1,"event_note_type_id":3,"text":"this tiss thie this tiss thie this tiss thie this tiss thie this tiss thie this tiss thie this tiss thie ","recorded_at":"2016-02-15T20:01:02.086Z","created_at":"2016-02-15T20:01:02.087Z","updated_at":"2016-02-15T20:01:02.087Z"},{"id":6,"student_id":24,"educator_id":1,"event_note_type_id":5,"text":"okay!","recorded_at":"2016-02-15T20:03:28.232Z","created_at":"2016-02-15T20:03:28.233Z","updated_at":"2016-02-15T20:03:28.233Z"},{"id":7,"student_id":24,"educator_id":1,"event_note_type_id":2,"text":"yep :)","recorded_at":"2016-02-15T20:03:36.699Z","created_at":"2016-02-15T20:03:36.700Z","updated_at":"2016-02-15T20:03:36.700Z"}];

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