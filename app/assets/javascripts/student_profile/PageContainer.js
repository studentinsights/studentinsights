import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import * as InsightsPropTypes from '../helpers/InsightsPropTypes';
import {merge} from '../helpers/merge';
import Api from './Api';
import * as Routes from '../helpers/Routes';
import {PENDING, IDLE, ERROR} from '../helpers/requestStates';
import LightProfilePage from './LightProfilePage';


/*
Holds page state, makes API calls to manipulate it.
*/
export default class PageContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = initialState(props);

    this.onColumnClicked = this.onColumnClicked.bind(this);
    this.onCreateNewNote = this.onCreateNewNote.bind(this);
    this.onCreateNewNoteDone = this.onCreateNewNoteDone.bind(this);
    this.onCreateNewNoteFail = this.onCreateNewNoteFail.bind(this);
    this.onUpdateExistingNote = this.onUpdateExistingNote.bind(this);
    this.onUpdateExistingNoteDone = this.onUpdateExistingNoteDone.bind(this);
    this.onUpdateExistingNoteFail = this.onUpdateExistingNoteFail.bind(this);
    this.onDeleteEventNoteAttachment = this.onDeleteEventNoteAttachment.bind(this);

    this.onSaveService = this.onSaveService.bind(this);
    this.onSaveServiceDone = this.onSaveServiceDone.bind(this);
    this.onSaveServiceFail = this.onSaveServiceFail.bind(this);
    this.onDiscontinueService = this.onDiscontinueService.bind(this);
    this.onDiscontinueServiceDone = this.onDiscontinueServiceDone.bind(this);
    this.onDiscontinueServiceFail = this.onDiscontinueServiceFail.bind(this);
  }

  componentWillMount(props, state) {
    this.api = this.props.api || new Api();
  }

  componentDidUpdate(props, state) {
    const {student} = this.props.profileJson;
    const {selectedColumnKey} = this.state;
    const queryParams = { column: selectedColumnKey };
    const path = Routes.studentProfile(student.id, queryParams);

    this.props.history.replaceState({}, null, path);
  }

  // Update eventNotes list
  setEventNotes(fn) {
    this.setState({
      feed: {
        ...this.state.feed,
        event_notes: fn(this.state.feed.event_notes)
      }
    });
  }

  // Sugar for updating request state
  setRequestState(requests) {
    this.setState({
      requests: {
        ...this.state.requests,
        ...requests
      }
    });
  }

  // Update request state for  updating a note
  setUpdateNoteRequest(fn) {
    this.setRequestState({
      updateNote: fn(this.state.requests.updateNote)
    });
  }

  // Returns an updated state, adding serviceId and requestState, or removing
  // the `serviceId` from the map if `requestState` is null.
  mergedDiscontinueService(state, serviceId, requestState) {
    const updatedDiscontinueService = (requestState === null)
      ? _.omit(state.requests.discontinueService, serviceId)
      : merge(state.requests.discontinueService, {[serviceId]: requestState});

    return merge(state, {
      requests: merge(state.requests, {
        discontinueService: updatedDiscontinueService
      })
    });
  }

  onColumnClicked(columnKey) {
    this.setState({ selectedColumnKey: columnKey });
  }

  // single request at a time
  onCreateNewNote(eventNoteParams) {
    this.setRequestState({createNote: PENDING});
    
    const {student} = this.props.profileJson;
    this.api.saveNotes(student.id, eventNoteParams)
      .then(this.onCreateNewNoteDone)
      .catch(this.onCreateNewNoteFail);
  }

  onCreateNewNoteDone(response) {
    this.setEventNotes(eventNotes => eventNotes.concat([response]));
    this.setRequestState({createNote: IDLE});
  }

  onCreateNewNoteFail(request, status, message) {
    this.setRequestState({createNote: ERROR});
  }

  // multiple parallel requests possible
  onUpdateExistingNote(eventNoteParams) {    
    this.setUpdateNoteRequest(updateNote => _.merge(updateNote, {
      [eventNoteParams.id]: PENDING
    }));

    const {student} = this.props.profileJson;
    this.api.saveNotes(student.id, eventNoteParams)
      .then(this.onUpdateExistingNoteDone.bind(this, eventNoteParams))
      .catch(this.onUpdateExistingNoteFail.bind(this, eventNoteParams));
  }

  onUpdateExistingNoteDone(eventNoteParams, response) {
    this.setEventNotes(eventNotes => {
      return eventNotes.map(eventNote => {
        return (eventNote.id === eventNoteParams.id)
          ? {...eventNote, ...response}
          : eventNote;
      });
    });

    this.setUpdateNoteRequest(updateNote => _.omit(updateNote, [eventNoteParams.id]));
  }

  onUpdateExistingNoteFail(eventNoteParams, request, status, message) {
    this.setUpdateNoteRequest(updateNote => _.merge(updateNote, {
      [eventNoteParams.id]: ERROR
    }));
  }

  // TODO(kr) does this work for not-yet-created notes?
  onDeleteEventNoteAttachment(eventNoteAttachmentId) {
    // optimistically update the UI
    // essentially, find the eventNote that has eventNoteAttachmentId in attachments
    // remove it
    const eventNoteToUpdate = _.find(this.state.feed.event_notes, function(eventNote) {
      return _.find(eventNote.attachments, { id: eventNoteAttachmentId });
    });
    if (!eventNoteToUpdate) {
      window.Rollbar.error && window.Rollbar.error('PageContainer#onDeleteEventNoteAttachment, could not find eventNoteToUpdate', {eventNoteAttachmentId});
      return;
    }

    const updatedAttachments = eventNoteToUpdate.attachments.filter(attachment => {
      return attachment.id !== eventNoteAttachmentId;
    });
    this.setEventNotes(eventNotes => {
      return eventNotes.map(eventNote => {
        return (eventNote.id === eventNoteToUpdate.id)
          ? {...eventNote, attachments: updatedAttachments}
          : eventNote;
      });
    });

    // Server call, fire and forget
    this.api.deleteEventNoteAttachment(eventNoteAttachmentId);
  }

  onSaveService(serviceParams) {
    const {student} = this.props.profileJson;
    // Very quick name validation, just check for a comma between two words
    if ((/(\w+, \w|^$)/.test(serviceParams.providedByEducatorName))) {
      this.setRequestState({saveService: PENDING});
      this.api.saveService(student.id, serviceParams)
          .then(this.onSaveServiceDone)
          .catch(this.onSaveServiceFail);
    } else {
      this.setRequestState({saveService: 'Please use the form Last Name, First Name'});
    }
  }

  onSaveServiceDone(response) {
    const updatedActiveServices = this.state.feed.services.active.concat([response]);
    const updatedFeed = merge(this.state.feed, {
      services: merge(this.state.feed.services, {
        active: updatedActiveServices
      })
    });

    this.setState({
      feed: updatedFeed,
      requests: {
        ...this.state.requests,
        saveService: IDLE
      }
    });
  }

  onSaveServiceFail(request, status, message) {
    this.setRequestState({saveService: ERROR});
  }

  onDiscontinueService(serviceId) {
    this.setState(this.mergedDiscontinueService(this.state, serviceId, 'pending'));
    this.api.discontinueService(serviceId)
      .then(this.onDiscontinueServiceDone.bind(this, serviceId))
      .catch(this.onDiscontinueServiceFail.bind(this, serviceId));
  }

  onDiscontinueServiceDone(serviceId, response) {
    const updatedStateOfRequests = this.mergedDiscontinueService(this.state, serviceId, null);
    const updatedFeed = merge(this.state.feed, {
      services: merge(this.state.feed.services, {
        discontinued: this.state.feed.services.discontinued.concat([response]),
        active: this.state.feed.services.active.filter(service => service.id !== serviceId)
      })
    });
    this.setState({
      ...updatedStateOfRequests,
      feed: updatedFeed
    });
  }

  onDiscontinueServiceFail(serviceId, request, status, message) {
    this.setState(this.mergedDiscontinueService(this.state, serviceId, ERROR));
  }

  render() {
    const {
      profileJson
    } = this.props;
    
    const {
      feed,
      selectedColumnKey,
      requests
    } = this.state;

    const actions = {
      onColumnClicked: this.onColumnClicked,
      onUpdateExistingNote: this.onUpdateExistingNote,
      onCreateNewNote: this.onCreateNewNote,
      onDeleteEventNoteAttachment: this.onDeleteEventNoteAttachment,
      onSaveService: this.onSaveService,
      onDiscontinueService: this.onDiscontinueService,
      ...(this.props.actions || {}) // for test
    };

    return (
      <div className="PageContainer">
        <LightProfilePage
          profileJson={profileJson}
          feed={feed}
          actions={actions}
          selectedColumnKey={selectedColumnKey}
          requests={requests}
        />
      </div>
    );
  }
}
PageContainer.propTypes = {
  queryParams: PropTypes.object.isRequired,
  history: InsightsPropTypes.history.isRequired,

  profileJson: PropTypes.object.isRequired,
  defaultFeed: PropTypes.shape({
    event_notes: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      attachments: PropTypes.array.isRequired
    })).isRequired,
    services: PropTypes.shape({
      active: PropTypes.array.isRequired,
      discontinued: PropTypes.array.isRequired
    }).isRequired
  }).isRequired,

  // for testing
  actions: InsightsPropTypes.actions,
  api: InsightsPropTypes.api
};

// Exported for test and story
export function initialState(props) {
  const {defaultFeed, queryParams} = props;
  const defaultColumnKey = 'notes';

  return {
    // we'll mutate this over time
    feed: defaultFeed,

    // ui
    selectedColumnKey: queryParams.column || defaultColumnKey,

    // This map holds the state of network requests for various actions.  This allows UI components to branch on this
    // and show waiting messages or error messages.
    // The state of a network request is described with null (no requests in-flight),
    // 'pending' (a request is currently in-flight),
    // and 'error' or another value if the request failed.
    // The keys within `request` hold either a single value describing the state of the request, or a map that describes the
    // state of requests related to a particular object.
    // For example, `saveService` holds the state of that request, but `discontinueService` is a map that can track multiple active
    // requests, using `serviceId` as a key.
    requests: {
      updateNote: {},
      createNote: IDLE,
      saveService: IDLE,
      discontinueService: {}
    }
  };
}