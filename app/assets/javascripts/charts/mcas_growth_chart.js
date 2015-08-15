(function(root) {

  var McasGrowthChart = function initializeMcasGrowthChart (series, intervention_plot_bands) {
    this.title = 'MCAS growth';
    this.series = series;
    this.x_axis_bands = intervention_plot_bands;
  };

  McasGrowthChart.fromChartData = function mcasGrowthChartFromChartData(chartData) {
    var datums = [];
    var math_growth_data = chartData.data('mcas-series-math-growth');
    var ela_growth_data = chartData.data('mcas-series-ela-growth');
    var interventions = chartData.data('interventions');

    if (math_growth_data !== null) {
      var math_growth = new ProfileChartData("Math growth score", math_growth_data).toDateChart();
      datums.push(math_growth);
    }

    if (ela_growth_data !== null) {
      var ela_growth = new ProfileChartData("English growth score", ela_growth_data).toDateChart();
      datums.push(ela_growth);
    }

    if (interventions !== null) {
      var intervention_plot_bands = interventions.map(function(i) {
        return new InterventionPlotBand(i).toHighCharts();
      });
    }

    return new McasGrowthChart(datums, intervention_plot_bands);
  };

  McasGrowthChart.prototype.toHighChart = function mcasChartToHighChart () {
    return $.extend({}, ChartSettings.base_options, {
      xAxis: $.extend({}, ChartSettings.x_axis_datetime, {
        plotLines: this.x_axis_bands
      }),
      yAxis: $.extend({}, ChartSettings.percentile_yaxis, {
        plotLines: ChartSettings.benchmark_plotline
      }),
      series: this.series
    });
  };

  McasGrowthChart.prototype.render = function renderMcasGrowthChart (controller) {
    controller.renderChartOrEmptyView(this);
  };

  root.McasGrowthChart = McasGrowthChart;

})(window)
