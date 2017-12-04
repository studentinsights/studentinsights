import React from 'react';
import { Link } from 'react-router-dom';

//Temporary navigation page. This will eventually provide both navigation and
//snapshots of data contained in each dashboard
export default React.createClass({
  displayName: 'DashboardOverview',

  render: function() {
    console.log("I got to the overview");
    return(
      <div className="School Overview">
        <ul>
          <li><Link to='/absences_dashboard'>Absences Dashboard</Link></li>
          <li><Link to='/tardies_dashboard'>Tardies Dashboard</Link></li>
        </ul>
      </div>);
  }
});
