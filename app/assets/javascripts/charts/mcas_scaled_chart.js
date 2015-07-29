(function(root) {

  var McasScaledChart = function initializeMcasScaledChart (series, categories) {
    this.title = 'MCAS score';
    this.series = series;
    this.categories = categories;
  };

  McasScaledChart.fromChartData = function mcasScaledChartFromChartData(chartData) {
    var datums = [
      new ProfileChartData("Math scale score", chartData.data('mcas-series-math-scaled')).toDateChart(),
      new ProfileChartData("English scale score", chartData.data('mcas-series-ela-scaled')).toDateChart()
    ];
    return new McasScaledChart(datums);
  };

  McasScaledChart.prototype.toHighChart = function mcasChartToHighChart () {
    return $.extend({}, ChartSettings.base_options, {
      xAxis: ChartSettings.x_axis_datetime,
      yAxis: ChartSettings.default_yaxis,
      series: this.series
    });
  };

  McasScaledChart.prototype.render = function renderMcasScaledChart (controller) {
    controller.renderChartOrEmptyView(this);
  };

  root.McasScaledChart = McasScaledChart;

})(window)
