(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var Routes = window.shared.Routes;
  var StudentProfileV2Page = window.shared.StudentProfileV2Page;
  var PropTypes = window.shared.PropTypes;
  var Api = window.shared.Api;

  /*
  Holds page state, makes API calls to manipulate it.
  */
  var PageContainer = window.shared.PageContainer = React.createClass({
    displayName: 'PageContainer',

    propTypes: {
      nowMomentFn: React.PropTypes.func.isRequired,
      serializedData: React.PropTypes.object.isRequired, // TODO(kr) shape PropType
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

        // data
        student: serializedData.student,
        feed: serializedData.feed,
        chartData: serializedData.chartData,
        attendanceData: serializedData.attendanceData,

        // ui
        selectedColumnKey: queryParams.column || 'interventions',
        requests: {
          saveNotes: null,
          saveService: null
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
      var updatedServices = this.state.feed.services.concat([response]);
      var updatedFeed = merge(this.state.feed, { services: updatedServices });
      this.setState({
        feed: updatedFeed,
        requests: merge(this.state.requests, { saveService: null })
      });
    },

    onSaveServiceFail: function(request, status, message) {
      this.setState({ requests: merge(this.state.requests, { saveService: 'error' }) });
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
            onClickSaveService: this.onClickSaveService
          }
        }))
      );
    }
  });
})();
