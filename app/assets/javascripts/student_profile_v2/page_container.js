(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var Routes = window.shared.Routes;
  var StudentProfileV2Page = window.shared.StudentProfileV2Page;
  var PropTypes = window.shared.PropTypes;

  /*
  Holds page state, makes API calls to manipulate it.
  */
  var PageContainer = window.shared.PageContainer = React.createClass({
    displayName: 'PageContainer',

    propTypes: {
      nowMomentFn: React.PropTypes.func.isRequired,
      serializedData: React.PropTypes.object.isRequired, // TODO(kr) shape PropType
      queryParams: React.PropTypes.object.isRequired,

      actions: PropTypes.actions // for testing
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

        // data
        student: serializedData.student,
        feed: serializedData.feed,
        chartData: serializedData.chartData,
        attendanceData: serializedData.attendanceData,

        // ui
        selectedColumnKey: queryParams.column || 'interventions',
        requests: {
          saveNotes: null
        }
      };
    },

    componentDidUpdate: function(props, state) {
      var path = Routes.studentProfile(this.state.student.id, {
        column: this.state.selectedColumnKey
      });
      window.history.replaceState({}, null, path);
    },

    // Sugar for updating request state through setState.
    setRequestState: function(map) {
      var requests = merge(this.state.requests, map);
      this.setState({ requests: requests });
    },

    onColumnClicked: function(columnKey) {
      this.setState({ selectedColumnKey: columnKey });
    },

    onClickSaveNotes: function(eventNoteParams) {
      this.setRequestState({ saveNotes: 'pending' });
      window.setTimeout(this.onSaveNotesError, 1000);
    },

    onSaveNotesSucceeded: function(response) {
      this.setRequestState({ saveNotes: null });
    },

    onSaveNotesError: function(response) {
      this.setRequestState({ saveNotes: 'error' });
    },

    dateRange: function() {
      var nowMoment = this.props.nowMomentFn();
      return [nowMoment.clone().subtract(1, 'year').toDate(), nowMoment.toDate()];
    },

    cumulativeCountQuads: function(attendanceEvents) {
      return QuadConverter.convert(attendanceEvents, this.props.nowMomentFn().toDate(), this.dateRange());
    }, 

    render: function() {
      return dom.div({ className: 'PageContainer' },
        createEl(StudentProfileV2Page, merge(_.pick(this.state,
          'currentEducator',
          'interventionTypesIndex',
          'educatorsIndex',
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
            onClickSaveNotes: this.onClickSaveNotes
          }
        }))
      );
    }
  });
})();
