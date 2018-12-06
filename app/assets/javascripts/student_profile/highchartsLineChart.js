export function lineChartOptions() {
  return {
    chart: {
      renderTo: 'chart',
      type: 'areaspline',
      spacingBottom: 0,
      spacingTop: 0,
      spacingLeft: 0,
      spacingRight: 0,
      marginTop: 10
    },
    title: {
      text: '',
      style: {
        display: 'none'
      }
    },
    legend: {
      enabled: false,
      layout: 'horizontal',
      align: 'right',
      verticalAlign: 'top',
      itemStyle: {
        font: '12px "Open Sans", sans-serif !important;',
        color: '#555555'
      }
    },
    tooltip: {
      shared: true
    },
    credits: {
      enabled: false
    },
    plotOptions: {
      areaspline: {
        fillOpacity: 0
      }
    }
  };
}
