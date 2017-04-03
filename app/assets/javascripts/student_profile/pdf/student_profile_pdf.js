(function() {
  window.shared || (window.shared = {});
  var GraphHelpers = window.shared.GraphHelpers;

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
      
      var allMonthKeys = GraphHelpers.monthKeys(filterToDate, monthsBack);
      var allYearCategories = GraphHelpers.yearCategories(allMonthKeys);

      var tardyMonthBuckets = GraphHelpers.eventsToMonthBuckets(allMonthKeys, attendanceData.tardies);
      var absenceMonthBuckets = GraphHelpers.eventsToMonthBuckets(allMonthKeys, attendanceData.absences);
      var disciplineMonthBuckets = GraphHelpers.eventsToMonthBuckets(allMonthKeys, attendanceData.discipline_incidents);
      

      var xAxisSettings = [
        {
          categories: allMonthKeys.map(GraphHelpers.monthAxisCaption)
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
        generateGraph("#attendance-container", "Number of Absences / Tardies", xAxisSettings, "Absences & Tardies " + GraphHelpers.dateTitle(filterToDate, monthsBack), attendanceDataSeries);
      }

      if(_.flatten(disciplineMonthBuckets).length > 0) {
        generateGraph("#discipline-incident-container", "Number of Discipline Incidents", xAxisSettings, "Discipline Incidents " + GraphHelpers.dateTitle(filterToDate, monthsBack), disciplineDataSeries);
      }
    }
  };
})();