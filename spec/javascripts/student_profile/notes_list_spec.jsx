import _ from 'lodash';
import {studentProfile, feedForTestingNotes} from './fixtures.jsx';
import SpecSugar from '../support/spec_sugar.jsx';


describe('NotesList', function() {
  const merge = window.shared.ReactHelpers.merge;
  const ReactDOM = window.ReactDOM;
  const NotesList = window.shared.NotesList;

  const helpers = {
    renderInto: function(el, props) {
      const mergedProps = merge(props || {}, {
        feed: feedForTestingNotes,
        educatorsIndex: studentProfile.educatorsIndex,
        eventNoteTypesIndex: studentProfile.eventNoteTypesIndex,
        onSaveNote: jest.fn(),
        onEventNoteAttachmentDeleted: jest.fn()
      });
      ReactDOM.render(<NotesList {...mergedProps} />, el);
    },

    noteTimestamps: function(el) {
      return $(el).find('.NoteCard .date').toArray().map(function(dateEl) {
        return moment.parseZone($(dateEl).text(), 'MMM DD, YYYY').toDate().getTime();
      });
    }
  };

  SpecSugar.withTestEl('high-level integration tests', function(container) {
    it('renders everything on the happy path', function() {
      const el = container.testEl;
      helpers.renderInto(el);

      const noteTimestamps = helpers.noteTimestamps(el);
      expect(_.first(noteTimestamps)).toBeGreaterThan(_.last(noteTimestamps));
      expect(_.sortBy(noteTimestamps).reverse()).toEqual(noteTimestamps);
      expect($(el).find('.NoteCard').length).toEqual(4);
      expect(el.innerHTML).toContain('Behavior Plan');
      expect(el.innerHTML).toContain('Attendance Officer');
      expect(el.innerHTML).toContain('MTSS Meeting');

      expect(el.innerHTML).not.toContain('SST Meeting');

      // Notes attachments expectations
      expect(el.innerHTML).toContain("https://www.example.com/morestudentwork");
      expect(el.innerHTML).toContain("https://www.example.com/studentwork");
      expect(el.innerHTML).toContain("(remove)");
    });
  });
});
