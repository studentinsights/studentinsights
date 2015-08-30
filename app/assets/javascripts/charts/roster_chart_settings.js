(function(root) {

  root.RosterChartSettings = {
    chart: {
      spacingBottom: 0,
      spacingTop: 0,
      spacingLeft: 0,
      spacingRight: 0,
      marginBottom: 0,
      marginTop: 0,
      marginLeft: 0,
      marginRight: 0,
      renderTo: 'chart',
            type: 'bar'
        },
        title: {
        text: '',
        style: {
            display: 'none'
        },
    },
    subtitle: {
        text: '',
          style: {
            display: 'none'
          }
        },
    legend: {
      reversed: true,
      layout: 'horizontal',
      align: 'right',
      verticalAlign: 'top',
      itemStyle: {
        font: '12px "Open Sans", sans-serif !important;',
        color: '#555555'
      }
    },
    xAxis: {
        categories: ['Risk levels'],
        lineWidth: 0,
        minorGridLineWidth: 0,
        lineColor: 'transparent',
        gridLineColor: 'transparent',
        labels: {
          enabled: false
        },
        minorTickLength: 0,
        tickLength: 0
    },
    yAxis: {
        lineWidth: 0,
        minorGridLineWidth: 0,
        lineColor: 'transparent',
        gridLineColor: 'transparent',
        labels: {
          enabled: false
        },
        minorTickLength: 0,
        tickLength: 0,
        style: {
          display: 'none'
        },
        categories: [''],
        title: {
            text: null
        },
        labels: {
         enabled:false
        }
    },
    credits: {
        enabled: false
    },
    plotOptions: {
        bar: {
            stacking: 'percent'
        }
    },
    tooltip: {
        pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
        shared: true,
        followPointer: true,
        headerFormat: ''
    },
    colors: ['#BBD86B', '#62C186', '#FFCB08', '#F15A3D']
  }

})(window)
