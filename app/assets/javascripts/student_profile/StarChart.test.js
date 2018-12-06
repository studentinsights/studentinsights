import {starChartTooltip} from './StarChart';

describe('#starChartTooltip', () => {
  it('works when time is in minutes', () => {
    const data = {
      y: 90,             // Percentile rank
      x: 1463961600000,  // Time
      points: [
        {
          point: {
            gradeLevelEquivalent: '8.00',
            totalTime: 1420,
          }
        }
      ]
    };

    expect(starChartTooltip().formatter.bind(data)()).toEqual(
      'May 22nd 2016, 8:00:00 pm<br/>'
       + 'Percentile Rank: <b>90</b><br>'
       + 'Time Taking Test: <b>23 minutes and 40 seconds</b><br>'
       + 'Grade Level Equivalent: <b>8.00</b>'
    );
  });

  it('works when time is less than a minute', () => {
    const data = {
      y: 90,             // Percentile rank
      x: 1463961600000,  // Time
      points: [
        {
          point: {
            gradeLevelEquivalent: '8.00',
            totalTime: 24,
          }
        }
      ]
    };

    expect(starChartTooltip().formatter.bind(data)()).toEqual(
      'May 22nd 2016, 8:00:00 pm<br/>'
       + 'Percentile Rank: <b>90</b><br>'
       + 'Time Taking Test: <b>24 seconds</b><br>'
       + 'Grade Level Equivalent: <b>8.00</b>'
    );
  });
});
