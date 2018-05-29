import ReactDOM from 'react-dom';
import ElaDetails from './ElaDetails';

describe('data', function () {
  it('renders without crashing', () => {
    const div = document.createElement('div');

    const chartData = {
      star_series_reading_percentile: [0, 0, 0],
      mcas_series_ela_scaled: [0, 0, 0],
      next_gen_mcas_ela_scaled: [0, 0, 0],
      mcas_series_ela_growth: [0, 0, 0],
    };

    ReactDOM.render(
      <ElaDetails
        chartData={chartData}
        student={{}}
      />, div);
  });
});
