import React from 'react';
import { shallow } from 'enzyme';
import DashboardScatterPlot from './DashboardBarChart';
import HighchartsWrapper from '../components/HighchartsWrapper';

describe('DashboardScatterPlot', () => {
  const chart = shallow(<DashboardScatterPlot
                        id="1" categories={{}} seriesData={[]} titleText="Title" measureText="Measure" tooltip={{}}
                        />);

  it('should render a highcharts wrapper', () => {
    expect(chart.find(HighchartsWrapper).length).toEqual(1);
  });
});
