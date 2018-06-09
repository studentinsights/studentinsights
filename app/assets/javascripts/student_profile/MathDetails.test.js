import React from 'react';
import ReactDOM from 'react-dom';
import MathDetails from './MathDetails';

describe('data', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');

    const chartData = {
      star_series_math_percentile: [0, 0, 0],
      mcas_series_math_scaled: [0, 0, 0],
      next_gen_mcas_mathematics_scaled: [0, 0, 0],
      mcas_series_math_growth: [0, 0, 0],
    };

    ReactDOM.render(
      <MathDetails
        chartData={chartData}
        student={{}}
      />, div);
  });
});
