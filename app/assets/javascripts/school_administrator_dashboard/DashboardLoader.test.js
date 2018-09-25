import React from 'react';
import { shallow } from 'enzyme';
import DashboardLoader from './DashboardLoader';

it('renders tardies', ()=> {
  const loader = shallow(<DashboardLoader schoolId={'School1'} dashboardTarget={'tardies'}/>);
  expect(loader.find('GenericLoader').length).toEqual(1);
});

it('renders discipline', ()=> {
  const loader = shallow(<DashboardLoader schoolId={'School1'} dashboardTarget={'discipline'}/>);
  expect(loader.find('GenericLoader').length).toEqual(1);
});
