(function(root) {

  var StarChart = function initializeStarChart (series, intervention_plot_bands) {
    this.title = 'STAR';
    this.series = series;
    this.x_axis_bands = intervention_plot_bands;
  };

  StarChart.fromPureData = function fromPureData(pureData) {
    var datums = [];
    if (pureData.math_data !== null) {
      var math = new ProfileChartData("Math percentile rank", pureData.math_data).toDateChart();
      datums.push(math);
    }

    if (pureData.reading_data !== null) {
      var reading = new ProfileChartData("English percentile rank", pureData.reading_data).toDateChart();
      datums.push(reading);
    }

    if (pureData.interventions) {
      var intervention_plot_bands = pureData.interventions.map(function(i) {
        return new InterventionPlotBand(i).toHighCharts();
      });

      var interventions_label = new ProfileChartData("Interventions", [], '#FDFDC9');
      datums.push(interventions_label);
    }

    return new StarChart(datums, intervention_plot_bands);
  };

  StarChart.fromChartData = function fromChartData(chartData) {
    return this.fromPureData({
      math_data: chartData.data('star-series-math-percentile'),
      reading_data: chartData.data('star-series-reading-percentile'),
      interventions: chartData.data('interventions')
    });
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
