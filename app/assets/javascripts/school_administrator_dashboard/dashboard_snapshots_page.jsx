import SchoolAbsenceDashboard from './school_absence_dashboard.jsx';
//const serializedData = this.props.serializedData;

export default React.createClass({
  displayName: 'DashboardSnapshotsPage',

  PropTypes: {
    attendanceData: React.PropTypes.object.isRequired
  },

  render: function() {
    return (
      <div className="DashboardSnapshotsPage">
        <SchoolAbsenceDashboard
          attendanceData={this.props.attendanceData}/>
      </div>);
  }
});

//Renders snapshots
//Click on snapshot gets to specific view

