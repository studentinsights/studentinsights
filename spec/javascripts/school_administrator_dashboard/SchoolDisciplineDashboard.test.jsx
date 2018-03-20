import React from 'react';
import { shallow } from 'enzyme';

import SchoolDisciplineDashboard from '../../../app/assets/javascripts/school_administrator_dashboard/dashboard_components/discipline_dashboard/SchoolDisciplineDashboard';
import * as Data from './DashboardTestData.js';

  const dash = shallow(<SchoolDisciplineDashboard
                        dashboardStudents={Data.Students}
                        totalDisciplineIncidents={[]}
                        disciplineIncidentsByLocation={{}}
                        disciplineIncidentsByTime={{}}
                        disciplineIncidentsByClassroomn={{}}
                        disciplineIncidentsByGrade={{}}
                        disciplineIncidentsByDay={{}}
                        disciplineIncidentsByOffense={{}}
                        disciplineIncidentsByRace={{}}/>);

  it('renders at least one bar chart', () => {
    expect(dash.find('DashboardBarChart').length > 0).toEqual(true);
  });

  it('renders a student list', () => {
    expect(dash.find('StudentsTable').length).toEqual(1);
  });

  it('renders a date slider', () => {
    expect(dash.find('DateSlider').length).toEqual(1);
  });
