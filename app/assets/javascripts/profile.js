(function(root) {

  var ProfileChartData = function initializeProfileChartData (name, data) {
    this.name = name;
    this.data = data;
  };

  ProfileChartData.prototype.highChartDates = function profileHighChartDates() {
    return this.data.map(function(element) {
      return [
        Date.UTC(element[0],
                 element[1] - 1,   // JavaScript months start with 0, Ruby months start with 1
                 element[2]),
        element[3]
      ];
    });
  }

  ProfileChartData.prototype.toChart = function toChart() {
    return {
      name: this.name,
      data: this.data
    };
  };

  ProfileChartData.prototype.toDateChart = function toDateChart() {
    return {
      name: this.name,
      data: this.highChartDates()
    };
  }

  var ProfileController = function initializeProfileController () {
    this.options = $.extend({}, ChartSettings.base_options);
  };

  ProfileController.prototype.chartData = function profileChartDataData (data_type) {
    return $("#chart-data").data(data_type);
  };

  ProfileController.prototype.studentName = function storeStudentName () {
    return $("#student-name").text();
  };

  ProfileController.prototype.renderChartOrEmptyView = function profileRenderChartOrEmptyView (chart) {
    if (EmptyView.canRender(chart)) {
      new EmptyView(this.studentName, chart.title).render();
    } else {
      new Highcharts.Chart(chart.toHighChart());
    }
  }

  ProfileController.prototype.onChartChange = function profileChartDataChange() {
    var chart_data = $("#chart-data");
    var selVal = $("#chart-type").val();

    if (selVal == "attendance") {
      AttendanceChart.fromChartData(chart_data).render(this);
      return;
    } else if (selVal == "behavior") {
      BehaviorChart.fromChartData(chart_data).render(this);
      return;
    } else if (selVal == "mcas-growth") {
      McasGrowthChart.fromChartData(chart_data).render(this);
      return;
    } else if (selVal == "mcas-scaled") {
      McasScaledChart.fromChartData(chart_data).render(this);
      return;
    } else if (selVal == "star") {
      StarChart.fromChartData(chart_data).render(this);
      return;
    }
  }

  ProfileController.prototype.show = function renderProfileController() {
    this.onChartChange();

    // Bind onChartChange to this instance of ProfileController
    var self = this;
    $("#chart-type").on('change', function() {
      self.onChartChange();
    });
  }

  root.ProfileController = ProfileController;
  root.ProfileChartData = ProfileChartData;

})(window)

$(function() {
  if ($('body').hasClass('students') && $('body').hasClass('show')) {
    new window.ProfileController().show();

    // Risk level tooltip
    var risk_level_tooltip = $('#risk-level-tooltip-template').html();
    var rendered = Mustache.render(risk_level_tooltip);

    $('#profile-risk-level').tooltipster({
      content: rendered,
      position: 'bottom-right',
      contentAsHTML: true
    });
  }
});
