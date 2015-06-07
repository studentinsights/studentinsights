$(function() {

  if ($('body').hasClass('students') && $('body').hasClass('show')) {

    var profile_data = $("#profile-data")
    var attendance_events = profile_data.data('attendance-events')
    var discipline_incidents = profile_data.data('discipline-incidents')
    var student_name = $("#student-name").text()

    function isAbsence(event) { return event.absence }
    function isTardy(event) { return event.tardy }
    function countAbsences(attendanceEvents) {return attendanceEvents.filter(isAbsence).length }
    function countTardies(attendanceEvents) { return attendanceEvents.filter(isTardy).length }

    var attendance_school_years = Object.keys(attendance_events).reverse()
    var absences_by_year = attendance_school_years.map(function(key) { return countAbsences(attendance_events[key]) })
    var tardies_by_year = attendance_school_years.map(function(key) { return countTardies(attendance_events[key]) })

    function checkZero(options) {
      return options.series.every( function(element) {
        return element.data.every( function(el) {
          return el == 0
        });
      });
    }

    var discipline_school_years = Object.keys(discipline_incidents).reverse()
    var discipline_incidents_by_year = Object.keys(discipline_incidents).map(function(key) { return discipline_incidents[key].length })

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
        },]

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
    options.xAxis.categories = attendance_school_years

    options.title.text = 'absences or tardies'
    var chart;
    checkZero(options) ? zeroDraw() : chart = new Highcharts.Chart(options);

	  $("#chart-type").on('change', function(){
	    var selVal = $("#chart-type").val();
	    if(selVal == "attendance" || selVal == '') {
	        options.series = attendance_series
          options.title.text = 'absences or tardies'
	        options.xAxis.categories = attendance_school_years
	    }
	    else if(selVal == "behavior") {
	        options.series = behavior_series
          options.title.text = 'behavior incidents'
	        options.xAxis.categories = discipline_school_years
	    }
	    // else if(selVal == "mcas-growth") {
	    //     options.series = mcas_series
	    //     options.yAxis.plotLines[0].label.text = "MCAS Growth warning: Less than 40 points"
	    //     options.yAxis.plotLines[0].value = "40"
	    //     options.xAxis.categories = ["2010 - 11", "2011 - 12", "2013 - 14", "2014 - 15"]
	    // }
	    // else {
	    //     options.series = star_series
	    //     options.yAxis.plotLines[0].label.text = "STAR Percentile warning: Less than 40 points"
	    //     options.yAxis.plotLines[0].value = "40"
	    //     options.xAxis.categories = ["Sept. 2010 - 11", "Jan. 2010 - 11", "May 2011 - 12", "Sept. 2011 - 12", "Jan. 2011 - 12", "May 2011 - 12", "Sept. 2012 - 13", "Jan. 2012 - 13", "May 2012 - 13", "Sept. 2013 - 14", "Jan. 2013 - 14", "May 2013 - 14"]
	    // }
      checkZero(options) ? zeroDraw() : chart = new Highcharts.Chart(options);
	});
  }
});
