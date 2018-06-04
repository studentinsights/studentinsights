import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import MixpanelUtils from '../helpers/mixpanel_utils.jsx';
import * as InsightsPropTypes from '../helpers/InsightsPropTypes';
import {merge} from '../helpers/merge';
import Api from './Api';
import * as Routes from '../helpers/Routes';
import StudentProfilePage from './StudentProfilePage';


// in place of updating lodash to v4
function fromPair(key, value) {
  const obj = {};
  obj[key] = value;
  return obj;
}

/*
Holds page state, makes API calls to manipulate it.
*/
export default class PageContainer extends React.Component {
  constructor(props) {
    super(props);

    const {serializedData, queryParams} = props;
    this.state = {
      // context
      currentEducator: serializedData.currentEducator,

      // constants
      educatorsIndex: serializedData.educatorsIndex,
      serviceTypesIndex: serializedData.serviceTypesIndex,
      eventNoteTypesIndex: serializedData.eventNoteTypesIndex,

      // data
      student: serializedData.student,
      feed: serializedData.feed,
      transitionNotes: serializedData.transitionNotes,
      chartData: serializedData.chartData,
      attendanceData: serializedData.attendanceData,
      access: serializedData.access,
      dibels: serializedData.dibels,
      iepDocument: serializedData.iepDocument,
      sections: serializedData.sections,
      currentEducatorAllowedSections: serializedData.currentEducatorAllowedSections,

      // ui
      noteInProgressText: '',
      noteInProgressType: null,
      noteInProgressAttachmentUrls: [],
      selectedColumnKey: queryParams.column || 'interventions',

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
        saveNote: null,
        saveService: null,
        discontinueService: {}
      }
    };

    this.onColumnClicked = this.onColumnClicked.bind(this);
    this.onClickSaveNotes = this.onClickSaveNotes.bind(this);
    this.onDeleteEventNoteAttachment = this.onDeleteEventNoteAttachment.bind(this);
    this.onClickSaveService = this.onClickSaveService.bind(this);
    this.onClickDiscontinueService = this.onClickDiscontinueService.bind(this);
    this.onChangeNoteInProgressText = this.onChangeNoteInProgressText.bind(this);
    this.onClickNoteType = this.onClickNoteType.bind(this);
    this.onChangeAttachmentUrl = this.onChangeAttachmentUrl.bind(this);
  }

  componentWillMount(props, state) {
    this.api = this.props.api || new Api();
  }

  componentDidUpdate(props, state) {
    const path = Routes.studentProfile(this.state.student.id, {
      column: this.state.selectedColumnKey
    });
    this.props.history.replaceState({}, null, path);
  }

  // Returns an updated state, adding serviceId and requestState, or removing
  // the `serviceId` from the map if `requestState` is null.
  mergedDiscontinueService(state, serviceId, requestState) {
    const updatedDiscontinueService = (requestState === null)
      ? _.omit(state.requests.discontinueService, serviceId)
      : merge(state.requests.discontinueService, fromPair(serviceId, requestState));

    return merge(state, {
      requests: merge(state.requests, {
        discontinueService: updatedDiscontinueService
      })
    });
  }

  dateRange() {
    const nowMoment = this.props.nowMomentFn();
    return [nowMoment.clone().subtract(1, 'year').toDate(), nowMoment.toDate()];
  }

  onColumnClicked(columnKey) {
    MixpanelUtils.track('STUDENT_PROFILE_CLICKED_COLUMN', {
      page_key: 'STUDENT_PROFILE',
      column_key: columnKey
    });
    this.setState({ selectedColumnKey: columnKey });
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

  onClickSaveNotes(eventNoteParams) {
    this.setState({ requests: merge(this.state.requests, { saveNote: 'pending' }) });
    this.api.saveNotes(this.state.student.id, eventNoteParams)
      .done(this.onSaveNotesDone)
      .fail(this.onSaveNotesFail);
  }

  onClickSaveTransitionNote(noteParams) {
    const requestState = (noteParams.is_restricted)
      ? { saveRestrictedTransitionNote: 'pending' }
      : { saveTransitionNote: 'pending' };

    this.setState({ requests: merge(this.state.requests, requestState) });
    this.api.saveTransitionNote(this.state.student.id, noteParams)
      .done(this.onSaveTransitionNoteDone)
      .fail(this.onSaveTransitionNoteFail);
  }

  onSaveTransitionNoteDone(response) {
    const requestState = (response.is_restricted)
      ? { saveRestrictedTransitionNote: 'saved' }
      : { saveTransitionNote: 'saved' };

    this.setState({
      requests: merge(this.state.requests, requestState),
      transitionNotes: response.transition_notes
    });
  }

  onSaveTransitionNoteFail(request, status, message) {
    const requestState = (request.is_restricted)
      ? { saveRestrictedTransitionNote: 'error' }
      : { saveTransitionNote: 'error' };

    this.setState({ requests: merge(this.state.requests, requestState) });
  }

  onSaveNotesDone(response) {
    let updatedEventNotes;
    let foundEventNote = false;

    updatedEventNotes = this.state.feed.event_notes.map(function(eventNote) {
      if (eventNote.id === response.id) {
        foundEventNote = true;
        return merge(eventNote, response);
      }
      else {
        return eventNote;
      }
    });

    if (!foundEventNote) {
      updatedEventNotes = this.state.feed.event_notes.concat([response]);
    }

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
    this.setState({ requests: merge(this.state.requests, { saveNote: 'error' }) });
  }

  onDeleteEventNoteAttachment(eventNoteAttachmentId) {
    // optimistically update the UI
    // essentially, find the eventNote that has eventNoteAttachmentId in attachments
    // remove it
    const eventNoteToUpdate = _.find(this.state.feed.event_notes, function(eventNote) {
      return _.findWhere(eventNote.attachments, { id: eventNoteAttachmentId });
    });
    const updatedAttachments = eventNoteToUpdate.attachments.filter(function(attachment) {
      return attachment.id !== eventNoteAttachmentId;
    });
    const updatedEventNotes = this.state.feed.event_notes.map(function(eventNote) {
      return (eventNote.id !== eventNoteToUpdate.id)
        ? eventNote
        : merge(eventNote, { attachments: updatedAttachments });
    });
    this.setState({
      feed: merge(this.state.feed, { event_notes: updatedEventNotes })
    });

    // Server call, fire and forget
    this.api.deleteEventNoteAttachment(eventNoteAttachmentId);
  }

  onClickSaveService(serviceParams) {
    // Very quick name validation, just check for a comma between two words
    if ((/(\w+, \w|^$)/.test(serviceParams.providedByEducatorName))) {
      this.setState({ requests: merge(this.state.requests, { saveService: 'pending' }) });
      this.api.saveService(this.state.student.id, serviceParams)
          .done(this.onSaveServiceDone)
          .fail(this.onSaveServiceFail);
    } else {
      this.setState({ requests: merge(this.state.requests, { saveService: 'Please use the form Last Name, First Name' }) });
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
      requests: merge(this.state.requests, { saveService: null })
    });
  }

  onSaveServiceFail(request, status, message) {
    this.setState({ requests: merge(this.state.requests, { saveService: 'error' }) });
  }

  onClickDiscontinueService(serviceId) {
    this.setState(this.mergedDiscontinueService(this.state, serviceId, 'pending'));
    this.api.discontinueService(serviceId)
      .done(this.onDiscontinueServiceDone.bind(this, serviceId))
      .fail(this.onDiscontinueServiceFail.bind(this, serviceId));
  }

  onDiscontinueServiceDone(serviceId, response) {
    const updatedStateOfRequests = this.mergedDiscontinueService(this.state, serviceId, null);
    const updatedFeed = merge(this.state.feed, {
      services: merge(this.state.feed.services, {
        discontinued: this.state.feed.services.discontinued.concat([response]),
        active: this.state.feed.services.active.filter(function(service) {
          return service.id !== serviceId;
        }),
      })
    });
    this.setState(merge(updatedStateOfRequests, { feed: updatedFeed }));
  }

  onDiscontinueServiceFail(serviceId, request, status, message) {
    this.setState(this.mergedDiscontinueService(this.state, serviceId, 'error'));
  }

  render() {
    return (
      <div className="PageContainer">
        <StudentProfilePage
          {...merge(_.pick(this.state,
            'currentEducator',
            'educatorsIndex',
            'serviceTypesIndex',
            'eventNoteTypesIndex',
            'student',
            'feed',
            'transitionNotes',
            'access',
            'chartData',
            'dibels',
            'attendanceData',
            'selectedColumnKey',
            'iepDocument',
            'sections',
            'currentEducatorAllowedSections',
            'requests',
            'noteInProgressText',
            'noteInProgressType',
            'noteInProgressAttachmentUrls'
          ), {
            nowMomentFn: this.props.nowMomentFn,
            actions: {
              onColumnClicked: this.onColumnClicked,
              onClickSaveNotes: this.onClickSaveNotes,
              onClickSaveTransitionNote: this.onClickSaveTransitionNote,
              onDeleteEventNoteAttachment: this.onDeleteEventNoteAttachment,
              onClickSaveService: this.onClickSaveService,
              onClickDiscontinueService: this.onClickDiscontinueService,
              onChangeNoteInProgressText: this.onChangeNoteInProgressText,
              onClickNoteType: this.onClickNoteType,
              onChangeAttachmentUrl: this.onChangeAttachmentUrl,
              ...this.props.actions,
            }
          })} />
      </div>
    );
  }

}
PageContainer.propTypes = {
  nowMomentFn: PropTypes.func.isRequired,
  serializedData: PropTypes.object.isRequired,
  queryParams: PropTypes.object.isRequired,
  history: InsightsPropTypes.history.isRequired,

  // for testing
  actions: InsightsPropTypes.actions,
  api: InsightsPropTypes.api
};