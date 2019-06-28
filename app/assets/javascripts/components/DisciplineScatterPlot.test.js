import React from 'react';
import { shallow } from 'enzyme';
import DisciplineScatterPlot from './DisciplineScatterPlot';
import HighchartsWrapper from '../components/HighchartsWrapper';

describe('DisciplineScatterPlot', () => {
  const chart = shallow(<DisciplineScatterPlot
    id="1" categories={{}} seriesData={[]} titleText="Title" measureText="Measure" toolTipFormatter={()=>{}}
  />);

  it('should render a highcharts wrapper', () => {
    expect(chart.find(HighchartsWrapper).length).toEqual(1);
  });
});
