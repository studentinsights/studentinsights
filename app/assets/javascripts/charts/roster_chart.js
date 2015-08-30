(function(root) {

  var RosterChart = function initializeRosterChart (series) {
    this.series = series;
  }

  RosterChart.fromChartData = function (chartData) {

    var risk_level_null = {
      name: 'Risk level N/A',
      data: [chartData.data('null')],
      color: '#999'
    };

    var risk_level_zero = {
      name: 'Risk level 0',
      data: [chartData.data('0')],
      color: '#BBD86B'
    };

    var risk_level_one = {
      name: 'Risk level 1',
      data: [chartData.data('1')],
      color: '#62C186'
    };

    var risk_level_two = {
      name: 'Risk level 2',
      data: [chartData.data('2')],
      color: '#FFCB08'
    };

    var risk_level_three = {
      name: 'Risk level 3',
      data: [chartData.data('3')],
      color: '#F15A3D'
    };

    var risk_levels = [ risk_level_null, risk_level_zero,
      risk_level_one, risk_level_two, risk_level_three ];
    var series = [];

    for(i = 0; i < risk_levels.length; i++) {
      var risk_level = risk_levels[i];
      if (risk_level.data[0] > 0) {
        series.push(risk_level);
      }
    }

    return new RosterChart(series)
  };

  RosterChart.prototype.toHighChart = function rosterChartToHighChart () {
    var risk_levels_with_students = this.series.filter(function(risk_level) {
      return risk_level.data[0] > 0
    });

    risk_levels_with_students[0].borderRadiusTopLeft = 8;
    risk_levels_with_students[0].borderRadiusTopRight = 8;
    risk_levels_with_students[risk_levels_with_students.length - 1].borderRadiusBottomRight = 8;
    risk_levels_with_students[risk_levels_with_students.length - 1].borderRadiusBottomLeft = 8;

    var options = RosterChartSettings;
    options.series = this.series;
    return options;
  }

  RosterChart.prototype.render = function renderRosterChart () {
    return new Highcharts.Chart(this.toHighChart());
  }

  root.RosterChart = RosterChart;

})(window)
