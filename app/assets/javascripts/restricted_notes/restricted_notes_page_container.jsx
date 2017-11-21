import _ from 'lodash';
import PropTypes from '../helpers/prop_types.jsx';
import {merge} from '../helpers/react_helpers.jsx';

(function() {
  window.shared || (window.shared = {});
  const NotesDetails = window.shared.NotesDetails;
  const Api = window.shared.Api;

  /*
  Holds page state, makes API calls to manipulate it.
  */
  window.shared.RestrictedNotesPageContainer = React.createClass({
    displayName: 'RestrictedNotesPageContainer',

    propTypes: {
      nowMomentFn: React.PropTypes.func.isRequired,
      serializedData: React.PropTypes.object.isRequired,

      // for testing
      actions: React.PropTypes.shape({
        onClickSaveNotes: React.PropTypes.func
      }),
      api: PropTypes.api
    },

    getInitialState: function() {
      const serializedData = this.props.serializedData;

      return {
        // context
        currentEducator: serializedData.currentEducator,
        // constants
        educatorsIndex: serializedData.educatorsIndex,
        eventNoteTypesIndex: serializedData.eventNoteTypesIndex,
        // data
        feed: serializedData.feed,
        student: serializedData.student,
        // ui
        // This map holds the state of network requests for various actions.  This allows UI components to branch on this
        // and show waiting messages or error messages.
        // The state of a network request is described with null (no requests in-flight),
        // 'pending' (a request is currently in-flight),
        // and 'error' or another value if the request failed.
        // The keys within `request` hold either a single value describing the state of the request, or a map that describes the
        // state of requests related to a particular object.
        requests: {
          saveNote: null,
          saveService: null,
          discontinueService: {}
        }
      };
    },

    componentWillMount: function(props, state) {
      this.api = this.props.api || new Api();
    },

    onClickSaveNotes: function(inputEventNoteParams) {
      // All notes taken on this page should be restricted.
      const eventNoteParams = merge(inputEventNoteParams, {is_restricted: true});
      this.setState({ requests: merge(this.state.requests, { saveNote: 'pending'}) });
      this.api.saveNotes(this.state.student.id, eventNoteParams)
        .done(this.onSaveNotesDone)
        .fail(this.onSaveNotesFail);
    },

    // TODO(kr) suspect bug here with merging in notes.  Should factor out this
    // code from `PageContainer` and re-use here.
    onSaveNotesDone: function(response) {
      const updatedEventNotes = this.state.feed.event_notes.concat([response]);
      const updatedFeed = merge(this.state.feed, { event_notes: updatedEventNotes });
      this.setState({
        feed: updatedFeed,
        requests: merge(this.state.requests, { saveNote: null })
      });
    },

    onSaveNotesFail: function(request, status, message) {
      this.setState({
        requests: merge(this.state.requests, { saveNote: 'error' })
      });
    },

    render: function() {
      return (
        <div className="RestrictedNotesPageContainer">
          <div className="RestrictedNotesDetails" style={{display: 'flex'}}>
            <NotesDetails
              {...merge(_.pick(this.state,
                'currentEducator',
                'educatorsIndex',
                'eventNoteTypesIndex',
                'feed',
                'student',
                'requests'
              ), {
                nowMomentFn: this.props.nowMomentFn,
                actions: this.props.actions || {
                  onClickSaveNotes: this.onClickSaveNotes,
                },
                showingRestrictedNotes: true,
                helpContent: this.renderNotesHelpContent(),
                helpTitle: 'What is a Restricted Note?',
                title: 'Restricted Notes'
              })} />
          </div>
        </div>
      );
    },

    renderNotesHelpContent: function(){
      return (
        <div>
          <p>
            Restricted Notes are only visible to the principal, AP, and guidance counselors.         If a note contains sensitive information about healthcare, courts, or child abuse, consider using a Restricted Note.         This feature is currently in development.
          </p>
          <br />
          <br />
          <p>
            Examples include:
          </p>
          <ul>
            <li>
              "Medicine change for Uri on 4/10. So far slight increase in focus."
            </li>
            <li>
              "51a filed on 3/21. Waiting determination and follow-up from DCF."
            </li>
          </ul>
        </div>
      );
    }
  });
})();
