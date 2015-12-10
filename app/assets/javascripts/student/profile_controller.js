(function(root) {
  // This takes over the parts of the page related to the Profile tab on the student page.
  var ProfileController = function initializeProfileController () {
    this.options = $.extend({}, ProfileChartSettings.base_options);
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

  ProfileController.prototype.setChart = function profileSetChart (value) {
    var chart_data = $("#chart-data");
    if (value == "attendance") {
      AttendanceChart.fromChartData(chart_data).render(this);
      return;
    } else if (value == "behavior") {
      BehaviorChart.fromChartData(chart_data).render(this);
      return;
    } else if (value == "mcas-growth") {
      McasGrowthChart.fromChartData(chart_data).render(this);
      return;
    } else if (value == "mcas-scaled") {
      McasScaledChart.fromChartData(chart_data).render(this);
      return;
    } else if (value == "star") {
      StarChart.fromChartData(chart_data).render(this);
      return;
    }
  }

  ProfileController.prototype.onChartChange = function profileChartDataChange() {
    var selVal = $("#chart-type").val();
    this.setChart(selVal);
  }

  ProfileController.prototype.show = function renderProfileController() {
    var chart_start = $("#chart-start").data('start');
    var chart_options = ["attendance", "behavior", "mcas-growth", "mcas-scaled", "star"];
    if (chart_options.indexOf(chart_start) !== -1) {
      this.setChart(chart_start);
    } else {
      this.setChart("mcas-growth");
    }

    // Bind onChartChange to this instance of ProfileController
    var self = this;
    $("#chart-type").on('change', function() {
      self.onChartChange();
    });
  }

  root.ProfileController = ProfileController;

})(window);