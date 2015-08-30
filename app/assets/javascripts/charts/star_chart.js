(function(root) {

  var StarChart = function initializeStarChart (series, intervention_plot_bands) {
    this.title = 'STAR';
    this.series = series;
    this.x_axis_bands = intervention_plot_bands;
  };

  StarChart.fromChartData = function mcasScaledChartFromChartData(chartData) {
    var datums = [];
    var math_data = chartData.data('star-series-math-percentile');
    var reading_data = chartData.data('star-series-reading-percentile');
    var interventions = chartData.data('interventions');

    if (math_data !== null) {
      var math = new ProfileChartData("Math percentile rank", math_data).toDateChart();
      datums.push(math);
    }

    if (reading_data !== null) {
      var reading = new ProfileChartData("English percentile rank", reading_data).toDateChart();
      datums.push(reading);
    }

    if (interventions) {
      var intervention_plot_bands = interventions.map(function(i) {
        return new InterventionPlotBand(i).toHighCharts();
      });

      var interventions_label = new ProfileChartData("Interventions", [], '#FDFDC9');
      datums.push(interventions_label);
    }

    return new StarChart(datums, intervention_plot_bands);
  };

  StarChart.prototype.toHighChart = function mcasChartToHighChart () {
    return $.extend({}, ProfileChartSettings.base_options, {
      xAxis: $.extend({}, ProfileChartSettings.x_axis_datetime, {
        plotLines: this.x_axis_bands
      }),
      yAxis: $.extend({}, ProfileChartSettings.percentile_yaxis, {
        plotLines: ProfileChartSettings.benchmark_plotline
      }),
      series: this.series
    });
  };

  StarChart.prototype.render = function renderStarChart (controller) {
    controller.renderChartOrEmptyView(this);
  };

  root.StarChart = StarChart;

})(window)
