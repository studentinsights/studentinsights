(function(root) {

  var StarChart = function initializeStarChart (series, categories) {
    this.title = 'STAR';
    this.series = series;
    this.categories = categories;
  };

  StarChart.fromChartData = function mcasScaledChartFromChartData(chartData) {
    var datums = [
      new ProfileChartData("Math percentile rank", chartData.data('star-series-math-percentile')).toDateChart(),
      new ProfileChartData("English percentile rank", chartData.data('star-series-math-percentile')).toDateChart()
    ];
    return new StarChart(datums);
  };

  StarChart.prototype.toHighChart = function mcasChartToHighChart () {
    return $.extend({}, ChartSettings.base_options, {
      xAxis: ChartSettings.x_axis_datetime,
      yAxis: $.extend({}, ChartSettings.percentile_yaxis, {
        plotLines: ChartSettings.star_plotline
      }),
      series: this.series
    });
  };

  StarChart.prototype.render = function renderStarChart (controller) {
    controller.renderChartOrEmptyView(this);
  };

  root.StarChart = StarChart;

})(window)
