import React from 'react';
import { shallow } from 'enzyme';

import StudentsTable from '../../../app/assets/javascripts/school_administrator_dashboard/dashboard_components/StudentsTable.js';
import {createStudents} from './DashboardTestData.js';

describe('Dashboard Students Table', () => {
  const nowMoment = moment.utc();
  const table = shallow(<StudentsTable rows={createStudents(nowMoment)} incidentType={"Test Incidents"} resetFn={(value) => null}/>);

  it('renders the students list', () => {
    expect(table.find("div").hasClass("StudentsList")).toEqual(true);
  });

  it('renders headers for name, incident count and last SST', () => {
    const headerTexts = table.find('thead th').map(node => node.text());
    expect(headerTexts).toEqual(['Name', 'Test Incidents', 'Last SST']);
  });

  it('renders the first row', () => {
    const cellTexts = table.find('tbody tr').first().find('td').map(node => node.text());
    expect(cellTexts).toEqual([
      "Pierrot Zanni",
      "3",
      nowMoment.clone().subtract(3, 'months').format('M/D/YY'),
    ]);
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
    expect(table.find('tbody').find('tr').first().find('td').first().text()).toEqual('Scaramuccia Avecchi');
  });

  it('reorders in reverse alphabetical order', () => {
    table.find('.sort-header').first().simulate('click');
    expect(table.state().sortBy).toEqual("last_name");
    expect(table.find('tbody').find('tr').first().find('td').first().text()).toEqual('Arlecchino ZZanni');
  });

  it('orders students by events when Incidents is clicked', () => {
    table.find('.sort-header').at(1).simulate('click');
    expect(table.state().sortBy).toEqual("events");
  });

  it('orders students by events when Incidents is clicked', () => {
    table.find('.sort-header').at(2).simulate('click');
    expect(table.state().sortBy).toEqual("last_sst_date_text");
  });

});
