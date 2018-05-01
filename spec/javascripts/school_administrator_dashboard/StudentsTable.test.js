import React from 'react';
import {mount} from 'enzyme';
import StudentsTable from '../../../app/assets/javascripts/school_administrator_dashboard/dashboard_components/StudentsTable.js';
import {createStudents} from './DashboardTestData.js';

function testRender(options = {}) {
  const nowMoment = options.nowMoment || moment.utc();
  const table = mount(<StudentsTable rows={createStudents(nowMoment)} incidentType={"Test Incidents"} resetFn={(value) => null}/>);
  return table;
}

describe('Dashboard Students Table', () => {
  it('renders the students list', () => {
    const table = testRender();
    expect(table.find("div").first().hasClass("StudentsTable")).toEqual(true);
  });

  it('renders headers for name, incident count and last SST', () => {
    const table = testRender();
    const headerTexts = table.find('.ReactVirtualized__Table__headerColumn').map(node => node.text());
    expect(headerTexts).toEqual(['Name', 'Grade', 'Test Incidents', 'Last SST']);
  });

  it('renders the first row', () => {
    const nowMoment = moment.utc();
    const table = testRender({nowMoment});
    const cellTexts = table.find('.ReactVirtualized__Table__row').first().find('.ReactVirtualized__Table__rowColumn').map(node => node.text());
    expect(cellTexts).toEqual([
      "Pierrot Zanni",
      "4",
      "3",
      nowMoment.clone().subtract(3, 'months').format('M/D/YY'),
    ]);
  });

  it('tallies the total events', () => {
    const table = testRender();
    expect(table.instance().renderTotalEvents()).toEqual(12);
  });

  it('orders the students by total events by default', () => {
    const table = testRender();
    expect(table.instance().orderedRows()[5].first_name).toEqual("Arlecchino");
  });

  it('orders students by name when Name is clicked', () => {
    const table = testRender();
    table.find('.ReactVirtualized__Table__headerColumn').first().simulate('click');
    expect(table.state().sortBy).toEqual("name");
    expect(table.find('.ReactVirtualized__Table__rowColumn').first().text()).toEqual('Scaramuccia Avecchi');
  });

  it('reorders in reverse alphabetical order', () => {
    const table = testRender();
    table.find('.ReactVirtualized__Table__headerColumn').first().simulate('click');
    table.find('.ReactVirtualized__Table__headerColumn').first().simulate('click');
    expect(table.state().sortBy).toEqual("name");
    expect(table.find('.ReactVirtualized__Table__rowColumn').first().text()).toEqual('Arlecchino ZZanni');
  });

  it('orders students by events when Grades is clicked', () => {
    const table = testRender();
    table.find('.ReactVirtualized__Table__headerColumn').at(1).simulate('click');
    expect(table.state().sortBy).toEqual("grade");
  });

  it('orders students by events when Incidents is clicked', () => {
    const table = testRender();
    table.find('.ReactVirtualized__Table__headerColumn').at(2).simulate('click');
    expect(table.state().sortBy).toEqual("events");
  });

  it('orders students by events when Last SST is clicked', () => {
    const table = testRender();
    table.find('.ReactVirtualized__Table__headerColumn').at(3).simulate('click');
    expect(table.state().sortBy).toEqual("last_sst_date_text");
  });
});
