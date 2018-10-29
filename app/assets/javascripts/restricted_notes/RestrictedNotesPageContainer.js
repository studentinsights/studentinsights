import _ from 'lodash';
import * as InsightsPropTypes from '../helpers/InsightsPropTypes';
import {merge} from '../helpers/merge';
import PropTypes from 'prop-types';
import React from 'react';
import NotesDetails from '../student_profile/NotesDetails';
import Api from '../student_profile/Api';

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

      // data
      feed: serializedData.feed,
      student: serializedData.student,

      // ui
      noteInProgressText: '',
      noteInProgressType: null,
      noteInProgressAttachmentUrls: [],

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
    this.onChangeAttachmentUrl = this.onChangeAttachmentUrl.bind(this);
  }

  componentWillMount(props, state) {
    this.api = this.props.api || new Api();
  }

  onClickSaveNotes(inputEventNoteParams) {
    // All notes taken on this page should be restricted.
    const eventNoteParams = merge(inputEventNoteParams, {isRestricted: true});
    this.setState({ requests: merge(this.state.requests, { saveNote: 'pending'}) });
    this.api.saveNotes(this.state.student.id, eventNoteParams)
      .then(this.onSaveNotesDone)
      .catch(this.onSaveNotesFail);
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
      noteInProgressAttachmentUrls: []
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

  onChangeAttachmentUrl(event) {
    const newValue = event.target.value;
    const changedIndex = parseInt(event.target.name);
    const {noteInProgressAttachmentUrls} = this.state;

    const updatedAttachmentUrls = (noteInProgressAttachmentUrls.length === changedIndex)
      ? noteInProgressAttachmentUrls.concat(newValue)
      : noteInProgressAttachmentUrls.map((attachmentUrl, index) => {
        return (changedIndex === index) ? newValue : attachmentUrl;
      });

    const filteredAttachments = updatedAttachmentUrls.filter((urlString) => {
      return urlString.length !== 0;
    });

    this.setState({ noteInProgressAttachmentUrls: filteredAttachments });
  }

  render() {
    return (
      <div className="RestrictedNotesPageContainer" style={{fontSize: 14}}>
        <div className="RestrictedNotesDetails" style={{display: 'flex', padding: 10}}>
          <NotesDetails
            {...merge(_.pick(this.state,
              'currentEducator',
              'educatorsIndex',
              'feed',
              'student',
              'requests',
              'noteInProgressText',
              'noteInProgressType',
              'noteInProgressAttachmentUrls'
            ), {
              showRestrictedNoteContent: true,
              allowDirectEditingOfRestrictedNoteText: true,
              nowMomentFn: this.props.nowMomentFn,
              actions: {
                onClickSaveNotes: this.onClickSaveNotes,
                onClickNoteType: this.onClickNoteType,
                onChangeNoteInProgressText: this.onChangeNoteInProgressText,
                onChangeAttachmentUrl: this.onChangeAttachmentUrl,
                ...this.props.actions
              },
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
  nowMomentFn: PropTypes.func.isRequired,
  serializedData: PropTypes.object.isRequired,

  actions: PropTypes.shape({
    onClickSaveNotes: PropTypes.func
  }),
  api: InsightsPropTypes.api
};

export default RestrictedNotesPageContainer;



