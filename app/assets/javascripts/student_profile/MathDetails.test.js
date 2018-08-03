import React from 'react';
import ReactDOM from 'react-dom';
import MathDetails from './MathDetails';

describe('data', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');

    const chartData = {
      star_series_math_percentile: [
        {id: 1, date_taken: '2018-02-13T22:17:30.338Z', percentile_rank: 10, grade_equivalent: '1.00'},
        {id: 2, date_taken: '2018-02-13T22:17:30.338Z', percentile_rank: 20, grade_equivalent: '2.00'},
        {id: 3, date_taken: '2018-02-13T22:17:30.338Z', percentile_rank: 30, grade_equivalent: '3.00'},
      ],
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
