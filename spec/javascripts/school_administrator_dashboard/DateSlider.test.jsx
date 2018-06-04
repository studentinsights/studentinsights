import React from 'react';
import { shallow } from 'enzyme';

import DateSlider from '../../../app/assets/javascripts/school_administrator_dashboard/dashboard_components/DateSlider';

describe('Dashboard Date Slider', () => {
  const slider = shallow(<DateSlider
                         setDate={(value) => null}
                         rangeStart={parseInt(moment.utc().subtract(1, 'months').format('X'))}
                         rangeEnd={parseInt(moment.utc().format('X'))} />);

  it('renders a Range slider', () => {
    expect(slider.find('ComponentWrapper').length).toEqual(1);
  });

  it('renders two Datepickers', () => {
    expect(slider.find('Datepicker').length).toEqual(2);
  });

  it('changes the range when the beginning date is changed', () => {
    slider.instance().onBeginningDateInput("2018-01-01");
    expect(slider.state().value[0]).toEqual(parseInt(moment.utc("2018-01-01").format("X")));
  });

  it('changes the range when the ending date is changed', () => {
    slider.instance().onEndingDateInput("2018-02-01");
    expect(slider.state().value[1]).toEqual(parseInt(moment.utc("2018-02-01").format("X")));
  });
});
