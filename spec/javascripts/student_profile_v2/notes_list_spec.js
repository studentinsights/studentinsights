//= require ./fixtures

describe('NotesList', function() {
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var SpecSugar = window.shared.SpecSugar;
  var NotesList = window.shared.NotesList;
  var Fixtures = window.shared.Fixtures;
  var feed = {"event_notes":[{"id":3,"student_id":5,"educator_id":1,"event_note_type_id":2,"text":"Awesome!","recorded_at":"2016-02-26T22:20:55.398Z","created_at":"2016-02-26T22:20:55.416Z","updated_at":"2016-02-26T22:20:55.416Z"},{"id":4,"student_id":5,"educator_id":1,"event_note_type_id":2,"text":"Sweet!","recorded_at":"2016-02-27T19:23:26.835Z","created_at":"2016-02-27T19:23:26.836Z","updated_at":"2016-02-27T19:23:26.836Z"}],"services":[{"id":133,"service_type_id":503,"recorded_by_educator_id":1,"assigned_to_educator_id":1,"date_started":"2016-02-09","date_discontinued":null,"discontinued_by_educator_id":1},{"id":134,"service_type_id":506,"recorded_by_educator_id":1,"assigned_to_educator_id":1,"date_started":"2016-02-08","date_discontinued":null,"discontinued_by_educator_id":1}],"deprecated":{"notes":[{"id":5,"content":"We talked with the family.","educator_id":1,"educator_email":"demo@example.com","created_at_timestamp":"2016-02-24T01:24:32.950Z","created_at":"February 24, 2016"},{"id":6,"content":"We talked with an outside therapist.","educator_id":1,"educator_email":"demo@example.com","created_at_timestamp":"2016-02-24T01:24:32.955Z","created_at":"February 24, 2016"},{"id":7,"content":"We talked with an outside therapist.","educator_id":1,"educator_email":"demo@example.com","created_at_timestamp":"2016-02-24T01:24:32.960Z","created_at":"February 24, 2016"},{"id":8,"content":"We talked with the family.","educator_id":1,"educator_email":"demo@example.com","created_at_timestamp":"2016-02-24T01:24:32.963Z","created_at":"February 24, 2016"},{"id":9,"content":"We talked with the family.","educator_id":1,"educator_email":"demo@example.com","created_at_timestamp":"2016-02-24T01:24:32.967Z","created_at":"February 24, 2016"},{"id":10,"content":"We talked with an outside therapist.","educator_id":1,"educator_email":"demo@example.com","created_at_timestamp":"2016-02-24T01:24:32.970Z","created_at":"February 24, 2016"},{"id":11,"content":"We talked with the family.","educator_id":1,"educator_email":"demo@example.com","created_at_timestamp":"2016-02-24T01:24:32.974Z","created_at":"February 24, 2016"},{"id":12,"content":"We talked with an outside therapist.","educator_id":1,"educator_email":"demo@example.com","created_at_timestamp":"2016-02-24T01:24:32.978Z","created_at":"February 24, 2016"}],"interventions":[{"id":1,"name":"Behavior Plan","intervention_type_id":24,"comment":"bar","goal":"increase growth percentile","start_date":"October 27, 2010","start_date_timestamp":"2010-10-27","end_date":"November 10, 2010","educator_email":"demo@example.com","educator_id":1,"progress_notes":[]},{"id":2,"name":"Attendance Officer","intervention_type_id":21,"comment":"whatever","goal":"increase growth percentile","start_date":"December 11, 2010","start_date_timestamp":"2010-12-11","end_date":"December 25, 2010","educator_email":"demo@example.com","educator_id":1,"progress_notes":[]}]}};

  var helpers = { 
    renderInto: function(el, props) {
      var mergedProps = merge(props || {}, {
        feed: feed,
        educatorsIndex: Fixtures.studentProfile.educatorsIndex
      });
      return ReactDOM.render(createEl(NotesList, mergedProps), el);
    },

    noteTimestamps: function(el) {
      return $(el).find('.NoteCard .date').toArray().map(function(dateEl) {
        return moment.parseZone($(dateEl).text(), 'MMM DD, YYYY').toDate().getTime();
      });
    }
  };

  SpecSugar.withTestEl('high-level integration tests', function() {
    it('renders everything on the happy path', function() {
      var el = this.testEl;
      helpers.renderInto(el);

      var noteTimestamps = helpers.noteTimestamps(el);
      expect(_.first(noteTimestamps)).toBeGreaterThan(_.last(noteTimestamps));
      expect(_.sortBy(noteTimestamps).reverse()).toEqual(noteTimestamps);
      expect($(el).find('.NoteCard').length).toEqual(12);
      expect(el).toContainText('Behavior Plan');
      expect(el).toContainText('Attendance Officer');
      expect(el).toContainText('MTSS meeting');
      expect(el).not.toContainText('SST meeting');
      expect(el).toContainText('Old note');
    });
  });
});