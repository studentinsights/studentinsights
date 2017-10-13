import _ from 'lodash';

(function() {
  window.shared || (window.shared = {});
  let GraphHelpers = window.shared.GraphHelpers;

  function generateGraph(containerSelector, yAxisLabel, xAxisSettings, title, dataSeries){

    let stacking ="";

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
        // This sets charts to render immediately, so we can
        // synchronously set window.status and pass control back
        // to wkhtmltopdf to render the PDF.
        series: { animation: false },
        column: {
          stacking: stacking,
          dataLabels: {
            enabled: true,
            color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
            formatter: function(){
              let val = this.y;
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
            let val = this.total;
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

  }

  window.shared.StudentProfilePdf = {
    load: function() {

      let attendanceData = $('#serialized-data').data('attendance-data');
      let filterDateRange = $('#serialized-data').data('graph-date-range');

      let filterFromDate = moment.utc(filterDateRange.filter_from_date, "YYYY-MM-DD");
      let filterToDate = moment.utc(filterDateRange.filter_to_date, "YYYY-MM-DD");

      let monthsBack = filterToDate.diff(filterFromDate, 'months') <= 23 ? filterToDate.diff(filterFromDate, 'months') : 23;

      let allMonthKeys = GraphHelpers.monthKeys(filterToDate, monthsBack);
      let allYearCategories = GraphHelpers.yearCategories(allMonthKeys);

      let tardyMonthBuckets = GraphHelpers.eventsToMonthBuckets(allMonthKeys, attendanceData.tardies);
      let absenceMonthBuckets = GraphHelpers.eventsToMonthBuckets(allMonthKeys, attendanceData.absences);
      let disciplineMonthBuckets = GraphHelpers.eventsToMonthBuckets(allMonthKeys, attendanceData.discipline_incidents);


      let xAxisSettings = [
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

      let attendanceDataSeries = [
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

      let disciplineDataSeries = [
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


      // Set a special value that wicked_pdf can check for to know JS rendering
      // is done.
      window.status = 'READY';
    }
  };
})();
