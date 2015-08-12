(function(root) {

  var StarChart = function initializeStarChart (series) {
    this.title = 'STAR';
    this.series = series;
  };

  StarChart.fromChartData = function mcasScaledChartFromChartData(chartData) {
    var datums = [];
    var math_data = chartData.data('star-series-math-percentile');
    var reading_data = chartData.data('star-series-math-percentile');

    if (math_data !== null) {
      var math = new ProfileChartData("Math percentile rank", math_data).toDateChart();
      datums.push(math);
    }

    if (reading_data !== null) {
      var reading = new ProfileChartData("English percentile rank", reading_data).toDateChart();
      datums.push(reading);
    }
    return new StarChart(datums);
  };

  StarChart.prototype.toHighChart = function mcasChartToHighChart () {
    return $.extend({}, ChartSettings.base_options, {
      xAxis: ChartSettings.x_axis_datetime,
      yAxis: $.extend({}, ChartSettings.percentile_yaxis, {
        plotLines: ChartSettings.benchmark_plotline
      }),
      series: this.series
    });
  };

  StarChart.prototype.render = function renderStarChart (controller) {
    controller.renderChartOrEmptyView(this);
  };

  root.StarChart = StarChart;

})(window)
