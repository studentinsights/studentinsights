(function(root) {
  var ProfileChart = function initializeProfileChart (name, data){
    this.name = name;
    this.data = data;
  };

  ProfileChart.prototype.highChartDates = function profileHighChartDates() {
    return this.data.map(function(element) {
      return [
        Date.UTC(element[0],
                 element[1] - 1,   // JavaScript months start with 0, Ruby months start with 1
                 element[2]),
        element[3]
      ]
    })
  }

  ProfileChart.prototype.toChart = function toChart() {
    return {
      name: this.name,
      data: this.data
    };
  }

  ProfileChart.prototype.toDateChart = function toDateChart() {
    return {
      name: this.name,
      data: this.highChartDates()
    }
  }

  var ProfileController = function initializeProfileController () {
    this.options = $.extend({}, ChartSettings.base_options);
  };

  ProfileController.prototype.checkZero = function profileCheckZero(options) {
    return options.series.every(function(element) {
      return element.data.every(function(el) {
        return el == 0
      })
    })
  };

  ProfileController.prototype.zeroDraw = function zeroDraw(student_name, data_type) {
    var view = {
      name: student_name,
      data_type: data_type
    }

    if (data_type === 'absences or tardies' || data_type === 'behavior incidents') {
      view.happy_message = true
    } else {
      view.happy_message = false
    }

    var zero_case_template = $('#zero-case-template').html()
    var zeroHtml = Mustache.render(zero_case_template, view)
    $('#chart').html(zeroHtml)
  }

  ProfileController.prototype.chartData = function profileChartData (data_type) {
    return $("#chart-data").data(data_type);
  }

  ProfileController.prototype.attendanceSeries = function profileAttendanceSeries() {
    return [
      new ProfileChart("Absences", this.chartData('attendance-series-absences')).toChart(),
      new ProfileChart("Tardies", this.chartData('attendance-series-tardies')).toChart()
    ];
  }

  ProfileController.prototype.behaviorSeries = function profileBehaviorSeries () {
    return [
      new ProfileChart("Behavior incidents", this.chartData('behavior-series')).toChart()
    ];
  }

  ProfileController.prototype.starSeries = function profileStarSeries () {
    return [
      new ProfileChart("Math percentile rank", this.chartData('star-series-math-percentile')).toDateChart(),
      new ProfileChart("Reading percentile rank", this.chartData('star-series-reading-percentile')).toDateChart()
    ];
  }

  ProfileController.prototype.mcasScaledSeries = function profileMcasScaledSeries () {
    return [
      new ProfileChart("Math score", this.chartData('mcas-series-math-scaled')).toDateChart(),
      new ProfileChart("English score", this.chartData('mcas-series-ela-scaled')).toDateChart()
    ];
  }

  ProfileController.prototype.mcasGrowthSeries = function profileMcasGrowthSeries () {
    return [
      new ProfileChart("Math growth score", this.chartData('mcas-series-math-growth')).toDateChart(),
      new ProfileChart("English growth score", this.chartData('mcas-series-ela-growth')).toDateChart()
    ];
  }

  ProfileController.prototype.onChartChange = function profileChartChange() {
    var student_name = $("#student-name").text()
    var chart_data = $("#chart-data")
    var selVal = $("#chart-type").val()

    if (selVal == "attendance" || selVal == '') {
        this.options.series = this.attendanceSeries()
        this.options.title.text = 'absences or tardies'
        this.options.xAxis = ChartSettings.x_axis_schoolyears
        this.options.xAxis.categories = this.chartData('attendance-events-school-years')
        this.options.yAxis = ChartSettings.default_yaxis
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

    if (this.checkZero(this.options)) {
      this.zeroDraw(student_name, this.options.title.text)
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
  root.ProfileChart = ProfileChart;
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
