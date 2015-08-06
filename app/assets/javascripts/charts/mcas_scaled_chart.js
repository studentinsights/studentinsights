(function(root) {

  var McasScaledChart = function initializeMcasScaledChart (series) {
    this.title = 'MCAS score';
    this.series = series;
  };

  McasScaledChart.fromChartData = function mcasScaledChartFromChartData(chartData) {
    var datums = [];
    var math_scaled_data = chartData.data('mcas-series-math-scaled');
    var ela_scaled_data = chartData.data('mcas-series-ela-scaled')

    if (math_scaled_data !== null) {
      var math_scaled = new ProfileChartData("Math scale score", math_scaled_data).toDateChart();
      datums.push(math_scaled);
    }

    if (ela_scaled_data !== null) {
      var ela_scaled = new ProfileChartData("English scale score", ela_scaled_data).toDateChart();
      datums.push(ela_scaled);
    }
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
