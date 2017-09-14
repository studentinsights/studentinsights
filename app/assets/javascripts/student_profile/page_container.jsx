import MixpanelUtils from '../helpers/mixpanel_utils.jsx';

(function () {
  window.shared || (window.shared = {});
  const merge = window.shared.ReactHelpers.merge;

  const Routes = window.shared.Routes;
  const StudentProfilePage = window.shared.StudentProfilePage;
  const PropTypes = window.shared.PropTypes;
  const Api = window.shared.Api;
  const fromPair = window.shared.fromPair;

  /*
  Holds page state, makes API calls to manipulate it.
  */
  window.shared.PageContainer = React.createClass({
    displayName: 'PageContainer',

    propTypes: {
      nowMomentFn: React.PropTypes.func.isRequired,
      serializedData: React.PropTypes.object.isRequired,
      queryParams: React.PropTypes.object.isRequired,
      history: PropTypes.history.isRequired,

      // for testing
      actions: PropTypes.actions,
      api: PropTypes.api
    },

    getInitialState() {
      const serializedData = this.props.serializedData;
      const queryParams = this.props.queryParams;

      return {
        // context
        currentEducator: serializedData.currentEducator,

        // constants
        educatorsIndex: serializedData.educatorsIndex,
        serviceTypesIndex: serializedData.serviceTypesIndex,
        eventNoteTypesIndex: serializedData.eventNoteTypesIndex,

        // data
        student: serializedData.student,
        feed: serializedData.feed,
        chartData: serializedData.chartData,
        attendanceData: serializedData.attendanceData,
        access: serializedData.access,
        dibels: serializedData.dibels,
        iepDocuments: serializedData.iepDocuments,

        // ui
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
    },

    componentWillMount(props, state) {
      this.api = this.props.api || new Api();
    },

    componentDidUpdate(props, state) {
      const path = Routes.studentProfile(this.state.student.id, {
        column: this.state.selectedColumnKey
      });
      this.props.history.replaceState({}, null, path);
    },

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
    },

    dateRange() {
      const nowMoment = this.props.nowMomentFn();
      return [nowMoment.clone().subtract(1, 'year').toDate(), nowMoment.toDate()];
    },

    onColumnClicked(columnKey) {
      MixpanelUtils.track('STUDENT_PROFILE_CLICKED_COLUMN', {
        page_key: 'STUDENT_PROFILE',
        column_key: columnKey
      });
      this.setState({ selectedColumnKey: columnKey });
    },

    onClickSaveNotes(eventNoteParams) {
      this.setState({ requests: merge(this.state.requests, { saveNote: 'pending' }) });
      this.api.saveNotes(this.state.student.id, eventNoteParams)
        .done(this.onSaveNotesDone)
        .fail(this.onSaveNotesFail);
    },

    onSaveNotesDone(response) {
      let updatedEventNotes;
      let foundEventNote = false;

      updatedEventNotes = this.state.feed.event_notes.map((eventNote) => {
        if (eventNote.id === response.id) {
          foundEventNote = true;
          return merge(eventNote, response);
        }
        return eventNote;
      });

      if (!foundEventNote) {
        updatedEventNotes = this.state.feed.event_notes.concat([response]);
      }

      const updatedFeed = merge(this.state.feed, { event_notes: updatedEventNotes });
      this.setState({
        feed: updatedFeed,
        requests: merge(this.state.requests, { saveNote: null })
      });
    },

    onSaveNotesFail(request, status, message) {
      this.setState({ requests: merge(this.state.requests, { saveNote: 'error' }) });
    },

    onDeleteEventNoteAttachment(eventNoteAttachmentId) {
      // optimistically update the UI
      // essentially, find the eventNote that has eventNoteAttachmentId in attachments
      // remove it
      const eventNoteToUpdate = _.find(this.state.feed.event_notes, eventNote => _.findWhere(eventNote.attachments, { id: eventNoteAttachmentId }));
      const updatedAttachments = eventNoteToUpdate.attachments.filter(attachment => attachment.id !== eventNoteAttachmentId);
      const updatedEventNotes = this.state.feed.event_notes.map(eventNote => (eventNote.id !== eventNoteToUpdate.id)
          ? eventNote
          : merge(eventNote, { attachments: updatedAttachments }));
      this.setState({
        feed: merge(this.state.feed, { event_notes: updatedEventNotes })
      });

      // Server call, fire and forget
      this.api.deleteEventNoteAttachment(eventNoteAttachmentId);
    },

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
    },

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
    },

    onSaveServiceFail(request, status, message) {
      this.setState({ requests: merge(this.state.requests, { saveService: 'error' }) });
    },

    onClickDiscontinueService(serviceId) {
      this.setState(this.mergedDiscontinueService(this.state, serviceId, 'pending'));
      this.api.discontinueService(serviceId)
        .done(this.onDiscontinueServiceDone.bind(this, serviceId))
        .fail(this.onDiscontinueServiceFail.bind(this, serviceId));
    },

    onDiscontinueServiceDone(serviceId, response) {
      const updatedStateOfRequests = this.mergedDiscontinueService(this.state, serviceId, null);
      const updatedFeed = merge(this.state.feed, {
        services: merge(this.state.feed.services, {
          discontinued: this.state.feed.services.discontinued.concat([response]),
          active: this.state.feed.services.active.filter(service => service.id !== serviceId),
        })
      });
      this.setState(merge(updatedStateOfRequests, { feed: updatedFeed }));
    },

    onDiscontinueServiceFail(serviceId, request, status, message) {
      this.setState(this.mergedDiscontinueService(this.state, serviceId, 'error'));
    },

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
              'access',
              'chartData',
              'dibels',
              'attendanceData',
              'selectedColumnKey',
              'iepDocuments',
              'requests'
            ), {
              nowMomentFn: this.props.nowMomentFn,
              actions: this.props.actions || {
                onColumnClicked: this.onColumnClicked,
                onClickSaveNotes: this.onClickSaveNotes,
                onDeleteEventNoteAttachment: this.onDeleteEventNoteAttachment,
                onClickSaveService: this.onClickSaveService,
                onClickDiscontinueService: this.onClickDiscontinueService
              }
            })}
          />
        </div>
      );
    }

  });
}());
