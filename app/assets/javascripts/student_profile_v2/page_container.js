(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var Routes = window.shared.Routes;
  var StudentProfileV2Page = window.shared.StudentProfileV2Page;
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

        // ui
        selectedColumnKey: queryParams.column || 'interventions',
        requests: {
          saveNotes: null,
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
      this.setState({ requests: merge(this.state.requests, { saveNotes: 'pending' }) });
      this.api.saveNotes(this.state.student.id, eventNoteParams)
        .done(this.onSaveNotesDone)
        .fail(this.onSaveNotesFail);
    },

    onSaveNotesDone: function(response) {
      var updatedEventNotes = this.state.feed.event_notes.concat([response]);
      var updatedFeed = merge(this.state.feed, { event_notes: updatedEventNotes });
      this.setState({
        feed: updatedFeed,
        requests: merge(this.state.requests, { saveNotes: null })
      });
    },

    onSaveNotesFail: function(request, status, message) {
      this.setState({ requests: merge(this.state.requests, { saveNotes: 'error' }) });
    },

    onClickSaveService: function(serviceParams) {
      this.setState({ requests: merge(this.state.requests, { saveService: 'pending' }) });
      this.api.saveService(this.state.student.id, serviceParams)
        .done(this.onSaveServiceDone)
        .fail(this.onSaveServiceFail);
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
        createEl(StudentProfileV2Page, merge(_.pick(this.state,
          'currentEducator',
          'interventionTypesIndex',
          'educatorsIndex',
          'serviceTypesIndex',
          'eventNoteTypesIndex',
          'student',
          'feed',
          'chartData',
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
