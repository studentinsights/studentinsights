import _ from 'lodash';
import PropTypes from '../helpers/prop_types.jsx';
import {merge} from '../helpers/react_helpers.jsx';
import React from 'react';
import NotesDetails from '../student_profile/NotesDetails.js';
import Api from '../student_profile/Api.js';

/*
Holds page state, makes API calls to manipulate it.
*/
class RestrictedNotesPageContainer extends React.Component {

  constructor(props) {
    super(props);

    const serializedData = this.props.serializedData;

    this.state = {
      // context
      currentEducator: serializedData.currentEducator,

      // constants
      educatorsIndex: serializedData.educatorsIndex,
      eventNoteTypesIndex: serializedData.eventNoteTypesIndex,

      // data
      feed: serializedData.feed,
      student: serializedData.student,

      // ui
      noteInProgressText: '',
      noteInProgressType: null,

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

    this.onClickSaveNotes = this.onClickSaveNotes.bind(this);
    this.onSaveNotesDone = this.onSaveNotesDone.bind(this);
    this.onSaveNotesFail = this.onSaveNotesFail.bind(this);
    this.onClickNoteType = this.onClickNoteType.bind(this);
    this.onChangeNoteInProgressText = this.onChangeNoteInProgressText.bind(this);
  }

  componentWillMount(props, state) {
    this.api = this.props.api || new Api();
  }

  onClickSaveNotes(inputEventNoteParams) {
    // All notes taken on this page should be restricted.
    const eventNoteParams = merge(inputEventNoteParams, {is_restricted: true});
    this.setState({ requests: merge(this.state.requests, { saveNote: 'pending'}) });
    this.api.saveNotes(this.state.student.id, eventNoteParams)
      .done(this.onSaveNotesDone)
      .fail(this.onSaveNotesFail);
  }

  // TODO(kr) suspect bug here with merging in notes.  Should factor out this
  // code from `PageContainer` and re-use here.
  onSaveNotesDone(response) {
    const updatedEventNotes = this.state.feed.event_notes.concat([response]);
    const updatedFeed = merge(this.state.feed, { event_notes: updatedEventNotes });
    this.setState({
      feed: updatedFeed,
      requests: merge(this.state.requests, { saveNote: null }),
      noteInProgressText: '',
      noteInProgressType: null,
    });
  }

  onSaveNotesFail(request, status, message) {
    this.setState({
      requests: merge(this.state.requests, { saveNote: 'error' })
    });
  }

  onClickNoteType(event) {
    const noteInProgressType = parseInt(event.target.name);

    this.setState({ noteInProgressType });
  }

  onChangeNoteInProgressText(event) {
    this.setState({ noteInProgressText: event.target.value });
  }

  render() {
    return (
      <div className="RestrictedNotesPageContainer">
        <div className="RestrictedNotesDetails" style={{display: 'flex', width: '50%', padding: 10}}>
          <NotesDetails
            {...merge(_.pick(this.state,
              'currentEducator',
              'educatorsIndex',
              'eventNoteTypesIndex',
              'feed',
              'student',
              'requests',
              'noteInProgressText',
              'noteInProgressType',
            ), {
              nowMomentFn: this.props.nowMomentFn,
              actions: this.props.actions || {
                onClickSaveNotes: this.onClickSaveNotes,
                onClickNoteType: this.onClickNoteType,
                onChangeNoteInProgressText: this.onChangeNoteInProgressText,
              },
              showingRestrictedNotes: true,
              helpContent: this.renderNotesHelpContent(),
              helpTitle: 'What is a Restricted Note?',
              title: 'Restricted Notes'
            })} />
        </div>
      </div>
    );
  }

  renderNotesHelpContent(){
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
}

RestrictedNotesPageContainer.propTypes = {
  nowMomentFn: React.PropTypes.func.isRequired,
  serializedData: React.PropTypes.object.isRequired,

  actions: React.PropTypes.shape({
    onClickSaveNotes: React.PropTypes.func
  }),
  api: PropTypes.api
};

export default RestrictedNotesPageContainer;



