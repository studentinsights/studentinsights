import React from 'react';
import { Link } from 'react-router-dom';

//Temporary navigation page. This will eventually provide both navigation and
//snapshots of data contained in each dashboard
export default function DashboardOverview () {
  return(
    <div className="School Overview">
      <ul>
        <li><Link to='/absences_dashboard'>Absences Dashboard</Link></li>
        <li><Link to='/tardies_dashboard'>Tardies Dashboard</Link></li>
        <li><Link to='/discipline_dashboard'>Discipline Dashboard</Link></li>
      </ul>
    </div>);
}
