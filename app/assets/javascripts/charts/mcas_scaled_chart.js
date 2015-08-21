(function(root) {

  var McasScaledChart = function initializeMcasScaledChart (series, intervention_plot_bands) {
    this.title = 'MCAS score';
    this.series = series;
    this.x_axis_bands = intervention_plot_bands;
  };

  McasScaledChart.fromChartData = function mcasScaledChartFromChartData(chartData) {
    var datums = [];
    var math_scaled_data = chartData.data('mcas-series-math-scaled');
    var ela_scaled_data = chartData.data('mcas-series-ela-scaled');
    var interventions = chartData.data('interventions');

    if (math_scaled_data !== null) {
      var math_scaled = new ProfileChartData("Math scale score", math_scaled_data).toDateChart();
      datums.push(math_scaled);
    }

    if (ela_scaled_data !== null) {
      var ela_scaled = new ProfileChartData("English scale score", ela_scaled_data).toDateChart();
      datums.push(ela_scaled);
    }

    if (interventions !== null && interventions !== undefined) {
      var intervention_plot_bands = interventions.map(function(i) {
        return new InterventionPlotBand(i).toHighCharts();
      })

      var interventions_label = new ProfileChartData("Interventions", []);
      datums.push(interventions_label);
    }

    return new McasScaledChart(datums, intervention_plot_bands);
  };

  McasScaledChart.prototype.toHighChart = function mcasChartToHighChart () {
    return $.extend({}, ChartSettings.base_options, {
      xAxis: $.extend({}, ChartSettings.x_axis_datetime, {
        plotLines: this.x_axis_bands
      }),
      yAxis: $.extend({}, ChartSettings.default_mcas_score_yaxis, {
        plotLines: ChartSettings.mcas_level_bands
      }),
      series: this.series
    });
  };

  McasScaledChart.prototype.render = function renderMcasScaledChart (controller) {
    controller.renderChartOrEmptyView(this);
  };

  root.McasScaledChart = McasScaledChart;

})(window)
