import _ from 'lodash';
import Highcharts from 'highcharts';
import * as GraphHelpers from '../../helpers/GraphHelpers';

(function() {
  window.shared || (window.shared = {});

  function generateGraph(containerSelector, yAxisLabel, xAxisSettings, title, dataSeries){

    const stacking = (dataSeries.length > 1)
      ? "normal"
      : "";

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
              const val = this.y;
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
            const val = this.total;
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

      const attendanceData = $('#serialized-data').data('attendance-data');
      const filterDateRange = $('#serialized-data').data('graph-date-range');

      const filterFromDate = moment.utc(filterDateRange.filter_from_date, "YYYY-MM-DD");
      const filterToDate = moment.utc(filterDateRange.filter_to_date, "YYYY-MM-DD");

      const monthsBack = filterToDate.diff(filterFromDate, 'months') <= 23 ? filterToDate.diff(filterFromDate, 'months') : 23;

      const allMonthKeys = GraphHelpers.monthKeys(filterToDate, monthsBack);
      const allYearCategories = GraphHelpers.yearCategories(allMonthKeys);

      const tardyMonthBuckets = GraphHelpers.eventsToMonthBuckets(allMonthKeys, attendanceData.tardies);
      const absenceMonthBuckets = GraphHelpers.eventsToMonthBuckets(allMonthKeys, attendanceData.absences);
      const disciplineMonthBuckets = GraphHelpers.eventsToMonthBuckets(allMonthKeys, attendanceData.discipline_incidents);


      const xAxisSettings = [
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

      const attendanceDataSeries = [
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

      const disciplineDataSeries = [
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
