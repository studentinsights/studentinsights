import { studentProfile } from './fixtures.jsx';
import SpecSugar from '../support/spec_sugar.jsx';

describe('NotesDetails', () => {
  const merge = window.shared.ReactHelpers.merge;
  const ReactDOM = window.ReactDOM;
  const NotesDetails = window.shared.NotesDetails;

  const helpers = {
    renderInto(el, props) {
      const mergedProps = merge(props || {}, {
        eventNoteTypesIndex: studentProfile.eventNoteTypesIndex,
        educatorsIndex: {},
        actions: {
          onClickSaveNotes() {},
          onEventNoteAttachmentDeleted() {}
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

  SpecSugar.withTestEl('high-level integration tests', () => {
    describe('educator can view restricted notes', () => {
      it('renders restricted notes button with zero notes', function () {
        const el = this.testEl;
        helpers.renderInto(el, {
          currentEducator: { can_view_restricted_notes: true },
          student: { restricted_notes_count: 0 },
        });

        expect(el).toContainText('Restricted Notes (0)');
      });

      it('renders restricted notes button with 7 notes', function () {
        const el = this.testEl;
        helpers.renderInto(el, {
          currentEducator: { can_view_restricted_notes: true },
          student: { restricted_notes_count: 7 },
        });

        expect(el).toContainText('Restricted Notes (7)');
      });
    });

    describe('educator can not view restricted notes', () => {
      it('does not render restricted notes button', function () {
        const el = this.testEl;
        helpers.renderInto(el, {
          currentEducator: { can_view_restricted_notes: false },
          student: { restricted_notes_count: 0 },
        });

        expect(el).not.toContainText('Restricted Notes (0)');
      });
    });
  });
});
