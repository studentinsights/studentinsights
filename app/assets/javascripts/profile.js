$(function() {

  if ($('body').hasClass('students') && $('body').hasClass('show')) {

    var profile_data = $("#profile-data")
    var attendance_events = profile_data.data('attendance-events')
    var discipline_incidents = profile_data.data('discipline-incidents')
    var mcas_results = profile_data.data('mcas-results')
    var star_results = profile_data.data('star-results')
    var student_name = $("#student-name").text()

    // Functions for adding absences, tardies, and behavior issues to the chart
    function isAbsence (event) { return event.absence }
    function isTardy (event) { return event.tardy }
    function countAbsences (attendanceEvents) { return attendanceEvents.filter(isAbsence).length }
    function countTardies (attendanceEvents) { return attendanceEvents.filter(isTardy).length }
    function countSize (events) { return events.length }

    // Functions for adding assessments to the chart
    // function getStarMathPercentile (star_result) {}
    // function getStarReadingPercentile (star_result) {}
    // function getMcasMathScaled (mcas_result) {}
    // function getMcasEnglishScaled (mcas_result) {}
    // Functions to help the other functions to their jobs well

    function schoolYears(events) { return Object.keys(events).reverse() }
    function prepareEventsForChart(events, prepare_function) {
      return schoolYears(events).map(function(key) { return prepare_function(events[key]) })
    }

    function checkZero(options) {
      return options.series.every(function(element) {
        return element.data.every(function(el) {
          return el == 0
        });
      });
    }

    var absences_by_year = prepareEventsForChart(attendance_events, countAbsences)
    var tardies_by_year = prepareEventsForChart(attendance_events, countTardies)
    var discipline_incidents_by_year = prepareEventsForChart(discipline_incidents, countSize)
    // var star_math_percentile_by_year
    // var star_reading_percentile_by_year
    // var mcas_math_scaled_by_year
    // var mcas_english_scaled_by_year

    var attendance_series = [{
            name: 'Absences',
            data: absences_by_year
        }, {
            name: 'Tardies',
            data: tardies_by_year
        }]

    var behavior_series = [{
        name: 'Behavior incidents',
        data: discipline_incidents_by_year
    }]

    // var star_series = [{
    //         name: 'Math percentile',
    //         data: star_math_percentile_by_year
    //     }, {
    //         name: 'Reading percentile',
    //         data: star_reading_percentile_by_year
    //     }]

    // var mcas_series = [{
    //         name: 'Math scaled score',
    //         data: mcas_math_scaled_by_year
    //     }, {
    //         name: 'English scaled score',
    //         data: mcas_english_scaled_by_year
    //     }]

    var options = {
      chart: {
        renderTo: 'chart',
        type: 'areaspline'
      },
      title: {
        text: '',
        style: {
          display: 'none'
        }
      },
      subtitle: {
        text: '',
        style: {
          display: 'none'
        }
      },
      legend: {
        layout: 'horizontal',
        align: 'right',
        verticalAlign: 'top',
        itemStyle: {
          font: '12px "Open Sans", sans-serif !important;',
          color: '#555555'

        }
      },
      xAxis: {
        categories: [],
      },
      yAxis: {
        allowDecimals: false,
        title: {
          text: '',
          style: {
            display: 'none'
          }
        },
        plotLines: [{
          color: '#B90504',
          width: 1,
          zIndex: 3,
          label: {
            text: '',
            align: 'center',
            style: {
              color: '#999999'
            }
          }
        }],
      },
      tooltip: {
        shared: true
      },
      credits: {
        enabled: false
      },
      plotOptions: {
        areaspline: {
          fillOpacity: 0
        }
      }
    }

    function zeroDraw(){
      $('#chart').empty();
      var zeroHtml =  '<div class="zero-case">' +
                        '<img src="/assets/placeholder.svg"/>' +
                        '<h2>Looks Great!</h2>' +
                        '<div>'+ student_name + ' has no ' +
                              options.title.text + ' on record</div>' +
                      '</div>';
      $('#chart').html(zeroHtml);
    }

    // Default view is attendance series graph
    options.series = attendance_series
    options.xAxis.categories = schoolYears(attendance_events)

    options.title.text = 'absences or tardies'
    var chart;
    checkZero(options) ? zeroDraw() : chart = new Highcharts.Chart(options);

	  $("#chart-type").on('change', function(){
	    var selVal = $("#chart-type").val();
	    if (selVal == "attendance" || selVal == '') {
	        options.series = attendance_series
          options.title.text = 'absences or tardies'
	        options.xAxis.categories = schoolYears(attendance_events)
	    } else if (selVal == "behavior") {
	        options.series = behavior_series
          options.title.text = 'behavior incidents'
          options.xAxis.categories = schoolYears(discipline_incidents)
     //  } else if (selVal == "mcas") {
     //      console.log('mcas!')
     //      console.log(mcas_series)
     //      options.series = mcas_series
     //      options.title.text = 'MCAS results'
     //      options.xAxis.categories = schoolYears(mcas_results)
	    //     // options.yAxis.plotLines[0].label.text = "MCAS Growth warning: Less than 40 points"
	    //     // options.yAxis.plotLines[0].value = "40"
	    // } else if (selVal == "star") {
	    //     options.series = star_series
     //      options.xAxis.categories = schoolYears(star_results)
	    //     // options.yAxis.plotLines[0].label.text = "STAR Percentile warning: Less than 40 points"
	    //     // options.yAxis.plotLines[0].value = "40"
	    }
      checkZero(options) ? zeroDraw() : chart = new Highcharts.Chart(options);
	});
  }
});
