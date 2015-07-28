(function(root) {
  var ProfileController = function initializeProfileController () {}

  ProfileController.prototype.show = function renderProfileController() {

    var chart_data = $("#chart-data")
    var student_name = $("#student-name").text()

    // Attendance events, behavior shown as aggregated counts by school year
    var attendance_series = [{
        name: 'Absences',
        data: chart_data.data('attendance-series-absences')
      }, {
        name: 'Tardies',
        data: chart_data.data('attendance-series-tardies')
      }
    ]

    var behavior_series = [{
      name: 'Behavior incidents',
      data: chart_data.data('behavior-series')
    }]

    // STAR and MCAS results shown by date taken, not aggregated by school year
    // http://www.highcharts.com/demo/spline-irregular-time
    var star_series = [{
        name: 'Math percentile rank',
        data: convertRubyDatesToJsDates(chart_data.data('star-series-math-percentile'))
      }, {
        name: 'Reading percentile rank',
        data: convertRubyDatesToJsDates(chart_data.data('star-series-reading-percentile'))
      }
    ]

    var mcas_scaled_series = [{
      name: 'Math score',
      data: convertRubyDatesToJsDates(chart_data.data('mcas-series-math-scaled'))
        }, {
      name: 'English score',
      data: convertRubyDatesToJsDates(chart_data.data('mcas-series-ela-scaled'))
    }]

    var mcas_growth_series = [{
      name: 'Math growth score',
      data: convertRubyDatesToJsDates(chart_data.data('mcas-series-math-growth'))
        }, {
      name: 'English growth score',
      data: convertRubyDatesToJsDates(chart_data.data('mcas-series-ela-growth'))
    }]

    // Default view is attendance series
    var options = ChartSettings.base_options
    var default_yaxis = ChartSettings.default_yaxis
    var x_axis_datetime = ChartSettings.x_axis_datetime
    var x_axis_schoolyears = ChartSettings.x_axis_schoolyears
    var percentile_yaxis = ChartSettings.percentile_yaxis
    var mcas_growth_plotline = ChartSettings.mcas_growth_plotline
    var star_plotline = ChartSettings.star_plotline

    options.series = attendance_series
    options.yAxis = default_yaxis
    options.xAxis.categories = chart_data.data('attendance-events-school-years')

    options.title.text = 'absences or tardies'
    var chart

    function zeroDraw(draw_type) {
      $('#chart').empty()

      var view = {
        name: student_name,
        data_type: options.title.text
      }

      if (draw_type === 'attendance' || draw_type === 'behavior') {
        view.happy_message = true
      } else {
        view.happy_message = false
      }

      var zero_case_template = $('#zero-case-template').html()
      var zeroHtml = Mustache.render(zero_case_template, view)
      $('#chart').html(zeroHtml)
    }

    checkZero(options) ? zeroDraw('attendance') : chart = new Highcharts.Chart(options)

    $("#chart-type").on('change', function(){
      var selVal = $("#chart-type").val()
      if (selVal == "attendance" || selVal == '') {
          options.series = attendance_series
          options.title.text = 'absences or tardies'
          options.xAxis = x_axis_schoolyears
          options.xAxis.categories = chart_data.data('attendance-events-school-years')
          options.yAxis = default_yaxis
      } else if (selVal == "behavior") {
          options.series = behavior_series
          options.title.text = 'behavior incidents'
          options.xAxis = x_axis_schoolyears
          options.xAxis.categories = chart_data.data('behavior-series-school-years')
          options.yAxis = default_yaxis
      } else if (selVal == "mcas-growth") {
          options.series = mcas_growth_series
          options.title.text = 'MCAS Growth'
          options.xAxis = x_axis_datetime
          options.yAxis = percentile_yaxis
          options.yAxis.plotLines = []
          options.yAxis.plotLines.push(mcas_growth_plotline)
      } else if (selVal == "mcas-scaled") {
          options.series = mcas_scaled_series
          options.title.text = 'MCAS Score'
          options.xAxis = x_axis_datetime
          options.yAxis = default_yaxis
      } else if (selVal == "star") {
          options.series = star_series
          options.title.text = 'STAR'
          options.xAxis = x_axis_datetime
          options.yAxis = percentile_yaxis
          options.yAxis.plotLines = []
          options.yAxis.plotLines.push(star_plotline)
      }
      checkZero(options) ? zeroDraw(selVal) : chart = new Highcharts.Chart(options)
    })
  }

  root.ProfileController = ProfileController
})(window)

$(function() {
  if ($('body').hasClass('students') && $('body').hasClass('show')) {
    new window.ProfileController().show()

    // Risk level tooltip
    var risk_level_tooltip = $('#risk-level-tooltip-template').html()
    var rendered = Mustache.render(risk_level_tooltip)

    $('#profile-risk-level').tooltipster({
      content: rendered,
      position: 'bottom-right',
      contentAsHTML: true
    })
  }
})
