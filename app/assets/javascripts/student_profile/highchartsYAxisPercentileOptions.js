export function yAxisPercentileOptions() {
  return {
    allowDecimals: false,
    min: 0,
    max: 100,
    plotLines: [{
      color: '#666',
      width: 1,
      zIndex: 3,
      value: 50,
      label: {
        text: '50th percentile',
        align: 'center',
        style: {
          color: '#999999'
        }
      }
    }]
  };
}
