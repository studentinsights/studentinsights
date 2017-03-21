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

  // A function that grabs a monthKey from an event that is passed in.  Should return
  // a string in the format YYYYMMDD for the first day of the month.
  // Used for grouping events on the chart.
  function defaultMonthKey(event) {
    return moment.utc(event.occurred_at).date(1).format('YYYYMMDD');
  };

  // Given a list of monthKeys, map over that to return a list of all events that fall within
  // that month.
  function eventsToMonthBuckets(monthKeys, events){
    var eventsByMonth = _.groupBy(events, defaultMonthKey);
    return monthKeys.map(function(monthKey) {
      return eventsByMonth[monthKey] || [];
    });
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

  function yearAxisCaption(monthKey) {
    return moment.utc(monthKey).format('YYYY');
  };

  function monthAxisCaption(monthKey) {
    return moment.utc(monthKey).format('MMM');
  };

  function dateTitle(endDate, monthsBack) {
    var startDate = endDate.clone().subtract(monthsBack,'months');
    return "(" + startDate.format("MM/YYYY") + " to " + endDate.format("MM/YYYY") + ")";
  }

  function generateGraph(containerSelector, yAxisLabel, xAxisSettings, title, dataSeries){
    
    var stacking ="";

    if(dataSeries.length > 1) {
      stacking = "normal";
    }

    $(containerSelector).highcharts({
      chart: {
        type: 'column'
      },
      title: {
        text: title
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
    });

  };

  window.shared.StudentProfilePdf = {
    load: function() {

      var attendanceData = $('#serialized-data').data('attendance-data');
      var filterDateRange = $('#serialized-data').data('graph-date-range');

      var filterFromDate = moment.utc(filterDateRange.filter_from_date, "YYYY-MM-DD");
      var filterToDate = moment.utc(filterDateRange.filter_to_date, "YYYY-MM-DD");

      var monthsBack = filterToDate.diff(filterFromDate, 'months') <= 23 ? filterToDate.diff(filterFromDate, 'months') : 23;
      
      var allMonthKeys = monthKeys(filterToDate, monthsBack);
      var allYearCategories = yearCategories(allMonthKeys);

      var tardyMonthBuckets = eventsToMonthBuckets(allMonthKeys, attendanceData.tardies);
      var absenceMonthBuckets = eventsToMonthBuckets(allMonthKeys, attendanceData.absences);
      var disciplineMonthBuckets = eventsToMonthBuckets(allMonthKeys, attendanceData.discipline_incidents);
      

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

      
      if(_.flatten(absenceMonthBuckets).length + _.flatten(tardyMonthBuckets).length > 0) {
        generateGraph("#attendance-container", "Number of Absences / Tardies", xAxisSettings, "Absences & Tardies " + dateTitle(filterToDate, monthsBack), attendanceDataSeries);
      }

      if(_.flatten(disciplineMonthBuckets).length > 0) {
        generateGraph("#discipline-incident-container", "Number of Discipline Incidents", xAxisSettings, "Discipline Incidents " + dateTitle(filterToDate, monthsBack), disciplineDataSeries);
      }
    }
  };
})();