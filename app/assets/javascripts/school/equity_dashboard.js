(function(root) {

  var EquityDashboard = function(data) {
    this.data = data;
  };

  EquityDashboard.prototype.charts = function () {
    return [
      new DashboardPieChart(
        this.data['math']['percent_low_income_warning'],
        this.data['math']['percent_low_income_warning'] + '% of Low Income students are at Warning level in MCAS Math.',
        'mcas-math-low-income'
      ),
      new DashboardPieChart(
        this.data['math']['percent_not_low_income_warning'],
        this.data['math']['percent_not_low_income_warning'] + '% of non-Low Income students are at Warning level in MCAS Math.',
        'mcas-math-not-low-income'
      )
    ];
  };

  EquityDashboard.prototype.render = function () {
    this.charts().map(function(chart) {
      new Highcharts.Chart(chart.toHighChart());
    });
  }

  root.EquityDashboard = EquityDashboard

})(window)

$(function() {

  if ($('body').hasClass('schools') && $('body').hasClass('show')) {
    (new EquityDashboard($('#data').data('mcas'))).render();
  }

});
