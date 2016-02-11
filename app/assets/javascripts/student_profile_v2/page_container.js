(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var Routes = window.shared.Routes;
  var StudentProfileV2Page = window.shared.StudentProfileV2Page;

  /*
  Holds page state, makes API calls to manipulate it.
  */
  var PageContainer = window.shared.PageContainer = React.createClass({
    displayName: 'PageContainer',

    propTypes: {
      nowMomentFn: React.PropTypes.func.isRequired,
      serializedData: React.PropTypes.object.isRequired, // TODO(kr) shape PropType
      queryParams: React.PropTypes.object.isRequired
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
        selectedColumnKey: queryParams.column || 'interventions'
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
          'selectedColumnKey'
        ), {
          nowMomentFn: this.props.nowMomentFn,
          onColumnClicked: this.onColumnClicked
        }))
      );
    }
  });
})();
