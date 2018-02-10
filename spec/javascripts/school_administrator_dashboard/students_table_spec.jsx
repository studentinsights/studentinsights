import React from 'react';
import { shallow } from 'enzyme';

import StudentsTable from '../../../app/assets/javascripts/school_administrator_dashboard/dashboard_components/students_table.jsx';
import * as Data from './DashboardTestData.js';

describe('Dashboard Students Table', () => {
  const table = shallow(<StudentsTable rows={Data.Students}/>);

  it('renders the students list', () => {
    expect(table.find("div").hasClass("StudentsList")).toEqual(true);
  });

  it('tallies the total events', () => {
    expect(table.instance().totalEvents()).toEqual(12);
  });

  it('orders the students by total events by default', () => {
    expect(table.instance().orderedRows()[5].first_name).toEqual("Arlecchino");
  });

  it('orders students by name when Name is clicked', () => {
    table.find('.sort-header').first().simulate('click');
    expect(table.state().sortBy).toEqual("last_name");
  });

  it('orders students by events when Incidents is clicked', () => {
    table.find('.sort-header').last().simulate('click');
    expect(table.state().sortBy).toEqual("events");
  });
});
