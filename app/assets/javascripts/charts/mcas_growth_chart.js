(function(root) {

  var McasGrowthChart = function initializeMcasGrowthChart (series) {
    this.title = 'MCAS growth';
    this.series = series;
  };

  McasGrowthChart.fromChartData = function mcasGrowthChartFromChartData(chartData) {
    var datums = [
      new ProfileChartData("Math growth score", chartData.data('mcas-series-math-growth')).toDateChart(),
      new ProfileChartData("English growth score", chartData.data('mcas-series-ela-growth')).toDateChart()
    ];
    return new McasGrowthChart(datums);
  };

  McasGrowthChart.prototype.toHighChart = function mcasChartToHighChart () {
    return $.extend({}, ChartSettings.base_options, {
      xAxis: ChartSettings.x_axis_datetime,
      yAxis: $.extend({}, ChartSettings.percentile_yaxis, {
        plotLines: ChartSettings.mcas_growth_plotline
      }),
      series: this.series
    });
  };

  McasGrowthChart.prototype.render = function renderMcasGrowthChart (controller) {
    controller.renderChartOrEmptyView(this);
  };

  root.McasGrowthChart = McasGrowthChart;

})(window)
