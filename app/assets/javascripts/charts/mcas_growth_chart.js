(function(root) {

  var McasGrowthChart = function initializeMcasGrowthChart (series) {
    this.title = 'MCAS growth';
    this.series = series;
  };

  McasGrowthChart.fromChartData = function mcasGrowthChartFromChartData(chartData) {
    var datums = [];
    var math_growth_data = chartData.data('mcas-series-math-growth');
    var ela_growth_data = chartData.data('mcas-series-ela-growth');

    if (math_growth_data !== null) {
      var math_growth = new ProfileChartData("Math growth score", math_growth_data).toDateChart();
      datums.push(math_growth);
    }

    if (ela_growth_data !== null) {
      var ela_growth = new ProfileChartData("English growth score", ela_growth_data).toDateChart();
      datums.push(ela_growth);
    }
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
