(function() {
  window.shared || (window.shared = {});

  // Returns a list of monthKeys that are within the time window for this chart.
  function monthKeys(nowMomentUTC, monthsBack) {
    var lastMonthMomentUTC = nowMomentUTC.clone().date(1);
    return _.range(monthsBack, -1, -1).map(function(monthsBack) {
      var monthMomentUTC = lastMonthMomentUTC.clone().subtract(monthsBack, 'months');
      var monthKey = monthMomentUTC.format('YYYYMMDD');
      return monthKey;
    }, this);
  };

  function defaultMonthKey(event) {
    return moment.utc(event.occurred_at).date(1).format('YYYYMMDD');
  };

  function eventsToMonthBuckets(monthKeys, events){
    var eventsByMonth = _.groupBy(events, defaultMonthKey);
    return monthKeys.map(function(monthKey) {
      return eventsByMonth[monthKey] || [];
    });
  };

  function yearAxisCaption(monthKey) {
    return moment.utc(monthKey).format('YYYY');
  };

  // Returns HighCharts categories map, which describes how to place year captions in relation
  // to the list of monthKeys.  Returns a map of (index into monthKeys array) -> (caption text)
  //
  // Example output: {3: '2014', 15: '2015'}
  function yearCategories(monthKeys) {
    var categories = {};

    monthKeys.forEach(function(monthKey, monthKeyIndex) {
      var monthMomentUTC = moment.utc(monthKey);
      var isFirstMonthOfYear = (monthMomentUTC.date() === 1 && monthMomentUTC.month() === 0);
      if (isFirstMonthOfYear) {
        categories[monthKeyIndex] = yearAxisCaption(monthKey);
      }
    }, this);

    return categories;
  };

  function monthAxisCaption(monthKey) {
    return moment.utc(monthKey).format('MMM');
  };


  function calculateMonths(nowMomentUTC) {
    return nowMomentUTC.month() < 8 ? nowMomentUTC.month() + 17 : nowMomentUTC.month() + 4;
  }

  function graphReady() {
    window.status = "READY";
  }

  function generateGraph(containerSelector, yAxisLabel, xAxisSettings, dataSeries, callback){
    
    var stacking ="";

    if(dataSeries.length > 1) {
      stacking = "normal";
    }

    $(containerSelector).highcharts({
      chart: {
        type: 'column'
      },
      title: {
        text: ''
      },
      credits: false,
      exporting: {
        enabled: false
      },
      plotOptions: {
        column: {
          stacking: stacking,
          dataLabels: {
            enabled: true,
            color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
            formatter: function(){
              var val = this.y;
              if (val < 1) {
                  return '';
              }
              return val;
            },
          }
        }
      },
      xAxis: xAxisSettings,
      yAxis: {
        title: {
          text: yAxisLabel
        },
        stackLabels: {
          enabled: true,
          style: {
              fontWeight: 'bold',
              color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
          },
          formatter: function(){
              var val = this.total;
              if (val < 1) {
                  return '';
              }
              return val;
          },
        },
        min: 0,
        max: 20,
      },
      series: dataSeries
    },callback);

  };

	window.shared.StudentProfilePdf = {
    	load: function() {
		    var attendanceData = $('#serialized-data').data('attendance-data');

		    var allMonthKeys = monthKeys(moment.utc(), calculateMonths(moment.utc()));
		    var allYearCategories = yearCategories(allMonthKeys);

		    var tardyMonthBuckets = eventsToMonthBuckets(allMonthKeys, attendanceData.tardies);
		    var absenceMonthBuckets = eventsToMonthBuckets(allMonthKeys, attendanceData.absences);
		    var disciplineMonthBuckets = eventsToMonthBuckets(allMonthKeys, attendanceData.discipline_incidents);

		    Highcharts.setOptions({
		      plotOptions: {
		        series: {
		          animation: false
		        }
		      }
		    });
		    
		    var xAxisSettings = [
		      {
		        categories: allMonthKeys.map(monthAxisCaption)
		      },
		      {
		        offset: 35,
		        linkedTo: 0,
		        categories: allYearCategories,
		        tickPositions: Object.keys(allYearCategories).map(Number),
		        tickmarkPlacement: "on"
		      }
		    ];

		    var attendanceDataSeries = [
		      {
		        name: "Tardies",
		        showInLegend: true,
		        color: "#0072b2",
		        data: _.map(tardyMonthBuckets, 'length')
		      },
		      {
		        name: "Absences",
		        showInLegend: true,
		        color: "#e69f00",
		        data: _.map(absenceMonthBuckets, 'length')
		      }
		    ];

		    var disciplineDataSeries = [
		      {
		        name: "Discipline Incidents",
		        showInLegend: true,
		        color: "#0072b2",
		        data: _.map(disciplineMonthBuckets, 'length')
		      }
		    ];

		    generateGraph("#attendance_container", "Number of Absences / Tardies", xAxisSettings, attendanceDataSeries);

		    generateGraph("#discipline_incident_container", "Number of Discipline Incidents", xAxisSettings, disciplineDataSeries, graphReady);

		}
	};
})();

