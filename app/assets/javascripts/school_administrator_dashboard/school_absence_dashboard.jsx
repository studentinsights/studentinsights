import ProfileBarChart from './profile_bar_chart.jsx';

export default React.createClass({
  displayName: 'SchoolAbsenceDashboard',

  propTypes: {
    absenceData: React.PropTypes.object.isRequired
  },

  render: function() {
    return (
      <div className="DashboardSnapshotsPage">
        <ProfileBarChart
          id = {'string'}
          events = {this.props.absenceData.absences}
          monthsBack = {12}
          titleText = {'Absences'}/>
      </div>);
  }

});
