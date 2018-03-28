import {studentProfile} from './fixtures.jsx';
import SpecSugar from '../support/spec_sugar.jsx';
import {merge} from '../../../app/assets/javascripts/helpers/react_helpers.jsx';
import NotesDetails from '../../../app/assets/javascripts/student_profile/NotesDetails.js';

describe('NotesDetails', function() {
  const ReactDOM = window.ReactDOM;

  const helpers = {
    renderInto: function(el, props) {
      const mergedProps = merge(props || {}, {
        eventNoteTypesIndex: studentProfile.eventNoteTypesIndex,
        educatorsIndex: {},
        noteInProgressText: '',
        noteInProgressType: null,
        actions: {
          onClickSaveNotes: function () {},
          onEventNoteAttachmentDeleted: function () {},
          onChangeNoteInProgressText: function () {},
          onClickNoteType: function () {}
        },
        feed: {
          event_notes: [],
          services: {
            active: [], discontinued: []
          },
          deprecated: {
            interventions: []
          }
        },
        requests: {},
        showingRestrictedNotes: false,
        title: '',
        helpContent: {},
        helpTitle: '',
      });

      ReactDOM.render(<NotesDetails {...mergedProps} />, el);
    }
  };

  SpecSugar.withTestEl('high-level integration tests', function(container) {
    describe('educator can view restricted notes', function() {
      it('renders restricted notes button with zero notes', function() {
        const el = container.testEl;
        helpers.renderInto(el, {
          currentEducator: { can_view_restricted_notes: true },
          student: { restricted_notes_count: 0 },
        });

        expect(el.innerHTML).toContain('Restricted (0)');
      });

      it('renders restricted notes button with 7 notes', function() {
        const el = container.testEl;
        helpers.renderInto(el, {
          currentEducator: { can_view_restricted_notes: true },
          student: { restricted_notes_count: 7 },
        });

        expect(el.innerHTML).toContain('Restricted (7)');
      });
    });

    describe('educator can not view restricted notes', function() {
      it('does not render restricted notes button', function() {
        const el = container.testEl;
        helpers.renderInto(el, {
          currentEducator: { can_view_restricted_notes: false },
          student: { restricted_notes_count: 0 },
        });

        expect(el.innerHTML).not.toContain('Restricted (0)');
      });
    });
  });
});
