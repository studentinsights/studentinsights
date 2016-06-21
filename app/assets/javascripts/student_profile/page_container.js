(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var Routes = window.shared.Routes;
  var StudentProfilePage = window.shared.StudentProfilePage;
  var PropTypes = window.shared.PropTypes;
  var Api = window.shared.Api;
  var fromPair = window.shared.fromPair;

  /*
  Holds page state, makes API calls to manipulate it.
  */
  var PageContainer = window.shared.PageContainer = React.createClass({
    displayName: 'PageContainer',

    propTypes: {
      nowMomentFn: React.PropTypes.func.isRequired,
      serializedData: React.PropTypes.object.isRequired,
      queryParams: React.PropTypes.object.isRequired,

      // for testing
      actions: PropTypes.actions,
      api: PropTypes.api
    },

    componentWillMount: function(props, state) {
      this.api = this.props.api || new Api();
    },

    getInitialState: function() {
      var serializedData = this.props.serializedData;
      var queryParams = this.props.queryParams;

      return {
        // context
        currentEducator: serializedData.currentEducator,

        // constants
        interventionTypesIndex: serializedData.interventionTypesIndex,
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

        // ui
        selectedColumnKey: queryParams.column || 'interventions',

        // This map holds the state of network requests for various actions.  This allows UI components to branch on this
        // and show waiting messages or error messages.
        // The state of a network request is described with null (no requests in-flight),
        // 'pending' (a request is currently in-flight),
        // and 'error' or another value if the request failed.
        // The keys within `request` hold either a single value describing the state of the request, or a map that describes the
        // state of requests related to a particular object.
        // For example, `saveService` holds the state of that request, but `saveNotes` is a map that can track multiple active
        // requests, using `serviceId` as a key.
        requests: {
          saveNotes: {},
          saveService: null,
          discontinueService: {}
        }
      };
    },

    componentDidUpdate: function(props, state) {
      var path = Routes.studentProfile(this.state.student.id, {
        column: this.state.selectedColumnKey
      });
      window.history.replaceState({}, null, path);
    },

    onColumnClicked: function(columnKey) {
      this.setState({ selectedColumnKey: columnKey });
    },

    onClickSaveNotes: function(eventNoteParams) {
      var saveNotes = {};
      saveNotes[eventNoteParams.id] = 'pending';
      this.setState({ requests: merge(this.state.requests, { saveNotes: saveNotes }) });
      this.api.saveNotes(this.state.student.id, eventNoteParams)
        .done(this.onSaveNotesDone)
        .fail(this.onSaveNotesFail);
    },

    onSaveNotesDone: function(response) {
      var updatedEventNotes;
      var foundEventNote = false;

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

      var updatedFeed = merge(this.state.feed, { event_notes: updatedEventNotes });
      this.setState({
        feed: updatedFeed,
        requests: merge(this.state.requests, { saveNotes: {} })
      });
    },

    onSaveNotesFail: function(request, status, message) {
      var saveNotes = {};
      saveNotes[request.event_note.id] = 'error';
      this.setState({ requests: merge(this.state.requests, saveNotes) });
    },

    onClickSaveService: function(serviceParams) {
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

    onSaveServiceDone: function(response) {
      var updatedActiveServices = this.state.feed.services.active.concat([response]);
      var updatedFeed = merge(this.state.feed, {
        services: merge(this.state.feed.services, {
          active: updatedActiveServices
        })
      });

      this.setState({
        feed: updatedFeed,
        requests: merge(this.state.requests, { saveService: null })
      });
    },

    onSaveServiceFail: function(request, status, message) {
      this.setState({ requests: merge(this.state.requests, { saveService: 'error' }) });
    },

    onClickDiscontinueService: function(serviceId) {
      this.setState(this.mergedDiscontinueService(this.state, serviceId, 'pending'));
      this.api.discontinueService(serviceId)
        .done(this.onDiscontinueServiceDone.bind(this, serviceId))
        .fail(this.onDiscontinueServiceFail.bind(this, serviceId));
    },

    onDiscontinueServiceDone: function(serviceId, response) {
      var updatedStateOfRequests = this.mergedDiscontinueService(this.state, serviceId, null);
      var updatedFeed = merge(this.state.feed, {
        services: merge(this.state.feed.services, {
          discontinued: this.state.feed.services.discontinued.concat([response]),
          active: this.state.feed.services.active.filter(function(service) {
            return service.id !== serviceId;
          }),
        })
      });
      this.setState(merge(updatedStateOfRequests, { feed: updatedFeed }));
    },

    onDiscontinueServiceFail: function(serviceId, request, status, message) {
      this.setState(this.mergedDiscontinueService(this.state, serviceId, 'error'));
    },

    // Returns an updated state, adding serviceId and requestState, or removing
    // the `serviceId` from the map if `requestState` is null.
    mergedDiscontinueService: function(state, serviceId, requestState) {
      var updatedDiscontinueService = (requestState === null)
        ? _.omit(state.requests.discontinueService, serviceId)
        : merge(state.requests.discontinueService, fromPair(serviceId, requestState));

      return merge(state, {
        requests: merge(state.requests, {
          discontinueService: updatedDiscontinueService
        })
      });
    },

    dateRange: function() {
      var nowMoment = this.props.nowMomentFn();
      return [nowMoment.clone().subtract(1, 'year').toDate(), nowMoment.toDate()];
    },

    render: function() {
      return dom.div({ className: 'PageContainer' },
        createEl(StudentProfilePage, merge(_.pick(this.state,
          'currentEducator',
          'interventionTypesIndex',
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
          'requests'
        ), {
          nowMomentFn: this.props.nowMomentFn,
          actions: this.props.actions || {
            onColumnClicked: this.onColumnClicked,
            onClickSaveNotes: this.onClickSaveNotes,
            onClickSaveService: this.onClickSaveService,
            onClickDiscontinueService: this.onClickDiscontinueService
          }
        }))
      );
    }
  });
})();
