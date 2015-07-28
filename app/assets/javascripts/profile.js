(function(root) {
  var ProfileChartData = function initializeProfileChartData (name, data){
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
      ]
    })
  }

  ProfileChartData.prototype.toChart = function toChart() {
    return {
      name: this.name,
      data: this.data
    };
  }

  ProfileChartData.prototype.toDateChart = function toDateChart() {
    return {
      name: this.name,
      data: this.highChartDates()
    }
  }

  var EmptyView = function initializeEmptyView(studentName, dataType) {
    this.studentName = studentName;
    this.dataType = dataType;
  };

  EmptyView.canRender = function(data) {
    return data.series.every(function(element) {
      return element.data.every(function(el) {
        return el == 0
      });
    });
  };

  EmptyView.prototype.render = function(){
    var view = {
      name: this.studentName,
      data_type: this.dataType
    }

    view.happy_message = this.dataType === 'absences or tardies' || this.dataType === 'behavior incidents';

    var zero_case_template = $('#zero-case-template').html()
    var zeroHtml = Mustache.render(zero_case_template, view)
    $('#chart').html(zeroHtml)
  }

  var ProfileController = function initializeProfileController () {
    this.options = $.extend({}, ChartSettings.base_options);
  };

  ProfileController.prototype.chartData = function profileChartDataData (data_type) {
    return $("#chart-data").data(data_type);
  }

  ProfileController.prototype.behaviorSeries = function profileBehaviorSeries () {
    return [
      new ProfileChartData("Behavior incidents", this.chartData('behavior-series')).toChart()
    ];
  }

  ProfileController.prototype.starSeries = function profileStarSeries () {
    return [
      new ProfileChartData("Math percentile rank", this.chartData('star-series-math-percentile')).toDateChart(),
      new ProfileChartData("Reading percentile rank", this.chartData('star-series-reading-percentile')).toDateChart()
    ];
  }

  ProfileController.prototype.mcasScaledSeries = function profileMcasScaledSeries () {
    return [
      new ProfileChartData("Math score", this.chartData('mcas-series-math-scaled')).toDateChart(),
      new ProfileChartData("English score", this.chartData('mcas-series-ela-scaled')).toDateChart()
    ];
  }

  ProfileController.prototype.mcasGrowthSeries = function profileMcasGrowthSeries () {
    return [
      new ProfileChartData("Math growth score", this.chartData('mcas-series-math-growth')).toDateChart(),
      new ProfileChartData("English growth score", this.chartData('mcas-series-ela-growth')).toDateChart()
    ];
  }

  var AttendanceChart = function initializeAttendanceChart (series, categories) {
    this.title = 'absences or tardies';
    this.series = series;
    this.categories = categories;
  }

  AttendanceChart.fromChartData = function attendanceChartFromChartData(chartData) {
    var datums = [
      new ProfileChartData("Absences", chartData.data('attendance-series-absences')).toChart(),
      new ProfileChartData("Tardies", chartData.data('attendance-series-tardies')).toChart()
    ];
    return new AttendanceChart(datums, chartData.data('attendance-events-school-years'));
  }

  AttendanceChart.prototype.toHighChart = function attendanceChartToHighChart () {
    return $.extend({}, ChartSettings.base_options, {
      xAxis: $.extend({}, ChartSettings.x_axis_schoolyears, {
        categories: this.categories
      }),
      yAxis: ChartSettings.default_yaxis,
      series: this.series
    });
  }

  AttendanceChart.prototype.render = function renderAttendanceChart () {
    if (EmptyView.canRender(this)) {
      new EmptyView(this.title).render();
    } else {
      new Highcharts.Chart(this.toHighChart());
    }
  }

  ProfileController.prototype.onChartChange = function profileChartDataChange() {
    var student_name = $("#student-name").text()
    var chart_data = $("#chart-data")
    var selVal = $("#chart-type").val()

    if (selVal == "attendance" || selVal == '') {
      AttendanceChart.fromChartData($("#chart-data")).render();
      return;
    } else if (selVal == "behavior") {
        this.options.series = this.behaviorSeries()
        this.options.title.text = 'behavior incidents'
        this.options.xAxis = ChartSettings.x_axis_schoolyears
        this.options.xAxis.categories = this.chartData('behavior-series-school-years')
        this.options.yAxis = ChartSettings.default_yaxis
    } else if (selVal == "mcas-growth") {
        this.options.series = this.mcasGrowthSeries()
        this.options.title.text = 'MCAS Growth'
        this.options.xAxis = ChartSettings.x_axis_datetime
        this.options.yAxis = ChartSettings.percentile_yaxis
        this.options.yAxis.plotLines = []
        this.options.yAxis.plotLines.push(ChartSettings.mcas_growth_plotline)
    } else if (selVal == "mcas-scaled") {
        this.options.series = this.mcasScaledSeries()
        this.options.title.text = 'MCAS Score'
        this.options.xAxis = ChartSettings.x_axis_datetime
        this.options.yAxis = ChartSettings.default_yaxis
    } else if (selVal == "star") {
        this.options.series = this.starSeries()
        this.options.title.text = 'STAR'
        this.options.xAxis = ChartSettings.x_axis_datetime
        this.options.yAxis = ChartSettings.percentile_yaxis
        this.options.yAxis.plotLines = []
        this.options.yAxis.plotLines.push(ChartSettings.star_plotline)
    }

    if (EmptyView.canRender(this.options)) {
      new EmptyView(student_name, this.options.title.text).render()
    } else {
      new Highcharts.Chart(this.options)
    }
  }

  ProfileController.prototype.show = function renderProfileController() {
    this.onChartChange();

    // Bind onChartChange to this instance of ProfileController
    var self = this;
    $("#chart-type").on('change', function(){
      self.onChartChange();
    })
  }

  root.ProfileController = ProfileController
  root.ProfileChartData = ProfileChartData;
  root.AttendanceChart = AttendanceChart;
  root.EmptyView = EmptyView;
})(window)

$(function() {
  if ($('body').hasClass('students') && $('body').hasClass('show')) {
    new window.ProfileController().show()

    // Risk level tooltip
    var risk_level_tooltip = $('#risk-level-tooltip-template').html()
    var rendered = Mustache.render(risk_level_tooltip)

    $('#risk-pill').tooltipster({
      content: rendered,
      position: 'bottom-right',
      contentAsHTML: true
    })
  }
})
