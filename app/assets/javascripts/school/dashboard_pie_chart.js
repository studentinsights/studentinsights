(function(root) {

  var DashboardPieChart = function (percentage, title, target) {
    this.percentage = percentage;
    this.title = title;
    this.target = target;
  }

  DashboardPieChart.prototype.toHighChart = function () {
    return $.extend({}, PieChartSettings, {
      chart: $.extend({}, PieChartSettings.chart, { renderTo: this.target }),
      title: {
        text: this.title
      },
      series: [
        {
          colorByPoint: true,
          data: [
            {
              name: "Warning",
              y: this.percentage,
              sliced: true,
              selected: true
            }, {
              name: "Not Warning",
              y: 100 - this.percentage
            }
          ]
        }
      ]
    });
  };

  root.DashboardPieChart = DashboardPieChart;

})(window)
