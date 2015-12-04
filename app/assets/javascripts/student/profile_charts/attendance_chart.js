(function(root) {

  var AttendanceChart = function initializeAttendanceChart (series, categories) {
    this.title = 'absences or tardies';
    this.series = series;
    this.categories = categories;
  };

  AttendanceChart.fromChartData = function attendanceChartFromChartData(chartData) {
    var datums = [
      new ProfileChartData("Absences", chartData.data('attendance-series-absences')).toChart(),
      new ProfileChartData("Tardies", chartData.data('attendance-series-tardies')).toChart()
    ];
    return new AttendanceChart(datums, chartData.data('attendance-events-school-years'));
  };

  AttendanceChart.prototype.toHighChart = function attendanceChartToHighChart () {
    return $.extend({}, ProfileChartSettings.base_options, {
      xAxis: $.extend({}, ProfileChartSettings.x_axis_schoolyears, {
        categories: this.categories
      }),
      yAxis: ProfileChartSettings.default_yaxis,
      series: this.series
    });
  };

  AttendanceChart.prototype.render = function renderAttendanceChart (controller) {
    controller.renderChartOrEmptyView(this);
  };

  root.AttendanceChart = AttendanceChart;

})(window)
