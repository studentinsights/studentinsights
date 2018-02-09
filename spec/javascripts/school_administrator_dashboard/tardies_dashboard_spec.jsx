import ReactDom from 'react-dom';
import SchoolTardiesDashboard from '../../../app/assets/javascripts/school_administrator_dashboard/dashboard_components/tardies_dashboard/school_tardies_dashboard.jsx';

describe('with no data', () => {
  it('renders successfully', () => {
    const div = document.createElement('div');

    //This can be made into a functional test once the data flow through the dashboards are finalized
    const schoolTardyEvents = {};
    const homeroomTardyEvents = {};
    const dashboardStudents = [];

    ReactDom.render(
      <SchoolTardiesDashboard
        schoolTardyEvents = {schoolTardyEvents}
        homeroomTardyEvents = {homeroomTardyEvents}
        dashboardStudents = {dashboardStudents}
      />, div);
  });
});
