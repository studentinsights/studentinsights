(function(root) {

  var PieChartSettings = {

    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: 'pie'
    },
    colors: ['#F15A3D', '#EEEEEE'],
    tooltip: {
      pointFormat: '<b>{point.percentage:.1f}%</b>'
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f} %',
        }
      }
    },
    credits: {
      enabled: false
    }
  }

  root.PieChartSettings = PieChartSettings

})(window)
